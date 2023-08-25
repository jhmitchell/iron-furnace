from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse
from fastapi import Cookie
from ..internal.models import Token, UserCreate
from ..internal.token import (
    create_token,
    verify_refresh_token,
    hash_password,
)
from ..internal.db import (
    authenticate_user,
    create_user,
    get_user,
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

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
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
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create an access token with a specified expiration time
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    # Create a refresh token with a specified expiration time
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token_expires_at = datetime.utcnow() + refresh_token_expires
    refresh_token_expires_at = refresh_token_expires_at.replace(tzinfo=timezone.utc)
    refresh_token = create_token(
        data={"sub": user.username}, expires_delta=refresh_token_expires
    )

    # Store the refresh token in the database
    # TODO: Replace with database function
    user_data = fake_users_db[form_data.username]
    user_data["refresh_token"] = refresh_token
    user_data["refresh_token_expires_at"] = refresh_token_expires_at

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

@router.post("/token/refresh", response_model=Token)
async def refresh_access_token(refresh_token: str = Cookie(None)) -> Token:
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
    refresh_token_expires_at = refresh_token_expires_at.replace(tzinfo=timezone.utc)
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

@router.post("/register", response_model=Token)
async def register_and_login(user: UserCreate, form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    """
    This endpoint registers a new user with the provided username, password, 
    email, and first and last names. If registration is successful, the user 
    is also logged in using the login endpoint, which returns an access token
    and sets a refresh token as an HttpOnly cookie.

    :param user: User creation object containing username, email, and password
    :return: JSON response containing the access token and token type
    :raises HTTPException: If registration fails or if other errors occur
    """
    # Create the user in the database
    # We will use a hashed password for storage
    password_hash = hash_password(user.password)
    created_user = create_user(username=user.username, email=user.email, hashed_password=password_hash)
    
    if not created_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. Username or email might be already taken.",
        )

    return await login_for_access_token(form_data)
