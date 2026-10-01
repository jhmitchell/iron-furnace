import logging
from typing import Union

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from fastapi import Cookie

from sqlalchemy.orm import Session

from app.internal.db.session import get_db
from app.internal.models.users import UserSchema, UserCreateSchema
from app.internal.models.token import TokenSchema
from ..internal import login_throttle
from ..internal.token import (
    ACCESS_TOKEN_TYPE,
    REFRESH_TOKEN_TYPE,
    create_token,
    verify_refresh_token,
    hash_password,
)
from ..internal.db.users import (
    authenticate_user,
    create_user,
    get_user,
    store_refresh_token,
    clear_refresh_token,
)
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

# Load the .env file
load_dotenv()

logger = logging.getLogger(__name__)

# Read the values from the .env file
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

# Only send the refresh cookie over HTTPS outside local development
COOKIE_SECURE = os.getenv("ENV", "dev") != "dev"

# Anything longer is rejected without checking (bcrypt only uses the first 72 bytes anyway)
MAX_USERNAME_LENGTH = 255
MAX_PASSWORD_LENGTH = 1024

# One message for an unknown username and a wrong password, so the response doesn't
# reveal which usernames exist.
INVALID_CREDENTIALS = "Incorrect username or password."


def disabled_account_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="This account has been disabled",
        headers={"WWW-Authenticate": "Bearer"},
    )


def invalid_credentials_exception(detail: str = INVALID_CREDENTIALS) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail=detail,
        headers={"WWW-Authenticate": "Bearer"},
    )


def service_unavailable_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="Sign-in is temporarily unavailable. Please try again shortly.",
    )


def client_ip(request: Request) -> Union[str, None]:
    # Under Passenger, a2wsgi fills request.client from REMOTE_ADDR/REMOTE_PORT
    return request.client.host if request.client else None


def issue_tokens(db: Session, member_id: str) -> JSONResponse:
    """
    Create a new access token and a new (rotated) refresh token for member_id, store the
    refresh token, and build the response: the access token in the JSON body, the refresh
    token in an HttpOnly cookie. Token responses must never be cached.
    """
    access_token = create_token(
        data={"sub": member_id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        token_type=ACCESS_TOKEN_TYPE,
    )

    refresh_token_expires_at = (
        datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    ).replace(tzinfo=timezone.utc)
    refresh_token = create_token(
        data={"sub": member_id},
        expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        token_type=REFRESH_TOKEN_TYPE,
    )

    # Store the refresh token in the database (this replaces, i.e. revokes, the old one)
    result = store_refresh_token(db, member_id, refresh_token, refresh_token_expires_at)
    if result['status'] != 'success':
        logger.error("Could not store refresh token: %s", result.get('detail'))
        raise service_unavailable_exception()

    response = JSONResponse(
        content={"access_token": access_token, "token_type": "bearer"},
        headers={"Cache-Control": "no-store", "Pragma": "no-cache"},
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        expires=refresh_token_expires_at,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="Strict",
    )
    return response


router = APIRouter()


# These endpoints are plain `def` (not `async def`) on purpose: they do blocking work
# (bcrypt takes ~0.2 s, plus database queries), so FastAPI runs them in a worker thread
# instead of blocking every other request handled by the same process.

@router.post("/token", response_model=TokenSchema)
def login_for_access_token(
        request: Request,
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)):
    """
    This endpoint authenticates the user using the provided username and password.
    If authentication is successful, it generates an access token and a refresh token.
    The access token is returned in the JSON response body, and the refresh token
    is set as an HttpOnly cookie.

    Responses: 200 on success; 401 for a wrong username or password (one generic
    message) or a disabled account; 429 with Retry-After after too many failed
    attempts; 503 if the database is unavailable.

    :param form_data: OAuth2 password request form data
    :return: JSON response containing the access token and token type
    :raises HTTPException: If authentication fails or if other errors occur
    """
    # Usernames are matched without surrounding whitespace; passwords are used exactly as typed
    username = form_data.username.strip()
    password = form_data.password
    ip = client_ip(request)

    wait = login_throttle.retry_after(ip, username)
    if wait:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed sign-in attempts. Please wait a few minutes and try again.",
            headers={"Retry-After": str(wait)},
        )

    if (not username or not password or len(username) > MAX_USERNAME_LENGTH
            or len(password) > MAX_PASSWORD_LENGTH):
        result = {'status': 'fail'}
    else:
        result = authenticate_user(db, member_id=username, password=password)

    if result['status'] == 'error':
        raise service_unavailable_exception()
    if result['status'] != 'success':
        login_throttle.record_failure(ip, username)
        # Log the client address only: a username field sometimes contains a password.
        logger.warning("Failed sign-in attempt from %s", ip or "unknown address")
        raise invalid_credentials_exception()

    login_throttle.record_success(ip, username)

    user = result['user']
    if user.get('disabled'):
        raise disabled_account_exception()

    return issue_tokens(db, user['member_id'])


@router.post("/token/refresh", response_model=TokenSchema)
def refresh_access_token(refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    """
    This endpoint takes a refresh token from an HttpOnly cookie and uses it to
    generate a new access token. If the refresh token is valid and not expired,
    a new access token and a new refresh token are created. The new access token
    is returned in the JSON response body, and the new refresh token is set as an
    HttpOnly cookie. The old refresh token is invalidated as part of token rotation,
    enhancing security by limiting the potential misuse of a leaked refresh token.

    :param refresh_token: Refresh token from an HttpOnly cookie. Defaults to None.
    :return: JSON response containing the new access token and token type, and sets
        a new HttpOnly cookie with the refresh token.
    :raises HTTPException: 401 if the refresh token is missing, expired, invalid,
        revoked, or its user no longer exists or is disabled.
    """
    if refresh_token is None:
        raise invalid_credentials_exception("Refresh token is missing")

    # Verify the refresh token and get the username (member_id)
    username = verify_refresh_token(refresh_token, db)
    if not username:
        raise invalid_credentials_exception("Invalid refresh token")

    # Retrieve user from the database
    result = get_user(db, username)
    if result['status'] != 'success':
        raise invalid_credentials_exception("Invalid refresh token")

    user = result['user']
    if user.get('disabled'):
        raise disabled_account_exception()

    return issue_tokens(db, user['member_id'])


@router.post("/logout")
def logout(refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
    """
    Ends the session: revokes the stored refresh token (so the cookie can no
    longer be exchanged for new access tokens) and clears the cookie. Safe to
    call without a cookie or with an already-invalid one.
    """
    if refresh_token:
        username = verify_refresh_token(refresh_token, db)
        if username:
            clear_refresh_token(db, username)

    response = JSONResponse(content={"message": "Logged out."})
    response.delete_cookie(
        key="refresh_token",
        httponly=True,
        secure=COOKIE_SECURE,
        samesite="Strict",
    )
    return response


# TODO: Re-enable once admin panel UI for account creation is built.
#       When re-enabling, add Depends(authorize) to require admin auth,
#       and remove the auto-login behavior (the creating admin != the new user).
#
# @router.post("/register", response_model=TokenSchema)
# async def register_and_login(
#         user: UserCreateSchema,
#         db: Session = Depends(get_db)):
#     """
#     This endpoint registers a new user with the provided username, password,
#     email, first name, last name, and optional disabled flag. If registration
#     is successful, the user is also logged in using the login_for_access_token
#     function, which returns an access token.
#
#     :param user: User creation object containing member_id, email, password,
#                  first_name, last_name, and optional disabled flag.
#     :param form_data: OAuth2PasswordRequestForm object containing the user's
#                       username and password for the OAuth2 flow.
#     :param db: SQLAlchemy Session object for database interaction.
#     :return: JSON response containing the access token and token type.
#     :raises HTTPException: If registration fails or if other errors occur.
#     """
#     # Hash the user password
#     hashed_password = hash_password(user.password)
#
#     # Create the user in the database
#     created_user_result = create_user(
#         db,
#         member_id=user.member_id,
#         email=user.email,
#         hashed_password=hashed_password,
#         first_name=user.first_name,
#         last_name=user.last_name,
#         disabled=user.disabled
#     )
#
#     if created_user_result['status'] != 'success':
#         raise HTTPException(
#             status_code=status.HTTP_400_BAD_REQUEST,
#             detail=created_user_result.get(
#                 'detail', 'An error occurred during registration.')
#         )
#
#     # Construct the OAuth2PasswordRequestForm object
#     form_data = OAuth2PasswordRequestForm(
#         username=user.member_id, password=user.password, scope="", grant_type="password")
#
#     # Log the user in and return the access token
#     return await login_for_access_token(form_data=form_data, db=db)
