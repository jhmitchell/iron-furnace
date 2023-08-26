from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from fastapi import Cookie

from sqlalchemy.orm import Session

from app.internal.db.session import get_db
from app.internal.models.users import UserSchema, UserCreateSchema
from app.internal.models.token import TokenSchema
from ..internal.token import (
    create_token,
    verify_refresh_token,
    hash_password,
)
from ..internal.db.users import (
    authenticate_user,
    create_user,
    get_user,
    store_refresh_token,
)
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

# Load the .env file
load_dotenv()

# Read the values from the .env file
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS"))

router = APIRouter()


@router.post("/token", response_model=TokenSchema)
async def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)):
    """
    This endpoint authenticates the user using the provided username and password.
    If authentication is successful, it generates an access token and a refresh token.
    The access token is returned in the JSON response body, and the refresh token
    is set as an HttpOnly cookie.

    :param form_data: OAuth2 password request form data
    :return: JSON response containing the access token and token type
    :raises HTTPException: If authentication fails or if other errors occur
    """
    # Authenticate the user using the provided username and password
    result = authenticate_user(db, form_data.username, form_data.password)
    if result['status'] != 'success':
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result['detail'],
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = result['user']

    # Create an access token with a specified expiration time
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.member_id}, expires_delta=access_token_expires
    )

    # Create a refresh token with a specified expiration time
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_expires_at = datetime.utcnow() + refresh_token_expires
    refresh_token_expires_at = refresh_token_expires_at.replace(
        tzinfo=timezone.utc)
    refresh_token = create_token(
        data={"sub": user.member_id}, expires_delta=refresh_token_expires
    )

    # Store the refresh token in the database
    result = store_refresh_token(
        db, user.member_id, refresh_token, refresh_token_expires_at)
    if result['status'] != 'success':
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result['detail'],
        )

    # Create the response which includes the access token in the body
    # and the refresh token in an http-only cookie
    response = JSONResponse(
        content={"access_token": access_token, "token_type": "bearer"}
    )

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        expires=refresh_token_expires_at,
        httponly=True,
        samesite="Strict",
    )

    return response


@router.post("/token/refresh", response_model=TokenSchema)
async def refresh_access_token(refresh_token: str = Cookie(None), db: Session = Depends(get_db)):
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
    :raises HTTPException: If the refresh token is missing, expired, invalid, or
        if the user is not found.
    """
    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token is missing",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Verify the refresh token and get the username
    username = verify_refresh_token(refresh_token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Retrieve user from the database
    user = get_user(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Invalidate the old refresh token
    # TODO: Replace with database function
    user_data = fake_users_db[username]
    user_data["refresh_token"] = None

    # Create a new access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # Create a new refresh token
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_expires_at = datetime.utcnow() + refresh_token_expires
    refresh_token_expires_at = refresh_token_expires_at.replace(
        tzinfo=timezone.utc)
    new_refresh_token = create_token(
        data={"sub": user.username}, expires_delta=refresh_token_expires
    )

    # Update the new refresh token in the database
    # TODO: Replace with database function
    user_data["refresh_token"] = new_refresh_token
    user_data["refresh_token_expires_at"] = refresh_token_expires_at

    # Create the response
    response = JSONResponse(
        content={"access_token": access_token, "token_type": "bearer"}
    )

    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        expires=refresh_token_expires_at,
        httponly=True,
        samesite="Strict",
    )

    return response


@router.post("/register", response_model=TokenSchema)
async def register_and_login(
        user: UserCreateSchema,
        db: Session = Depends(get_db)):
    """
    This endpoint registers a new user with the provided username, password, 
    email, first name, last name, and optional disabled flag. If registration 
    is successful, the user is also logged in using the login_for_access_token 
    function, which returns an access token.

    :param user: User creation object containing member_id, email, password, 
                 first_name, last_name, and optional disabled flag.
    :param form_data: OAuth2PasswordRequestForm object containing the user's 
                      username and password for the OAuth2 flow.
    :param db: SQLAlchemy Session object for database interaction.
    :return: JSON response containing the access token and token type.
    :raises HTTPException: If registration fails or if other errors occur.
    """
    # Hash the user password
    hashed_password = hash_password(user.password)

    # Create the user in the database
    created_user_result = create_user(
        db,
        member_id=user.member_id,
        email=user.email,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        disabled=user.disabled
    )

    if created_user_result['status'] != 'success':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=created_user_result.get(
                'detail', 'An error occurred during registration.')
        )

    # Construct the OAuth2PasswordRequestForm object
    form_data = OAuth2PasswordRequestForm(
        username=user.member_id, password=user.password, scope="", grant_type="password")

    # Log the user in and return the access token
    return await login_for_access_token(form_data=form_data, db=db)
