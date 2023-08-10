from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from ..internal.models import Token
from ..internal.token import authenticate_user, create_access_token
from ..internal.db import fake_users_db
from datetime import timedelta
from dotenv import load_dotenv
import os

# Load the .env file
load_dotenv()

# Read the values from the .env file
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

router = APIRouter()

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Token:
    """
    Endpoint to authenticate a user and provide an access token.

    :param form_data: OAuth2 password request form data
    :return: Access token
    :raises HTTPException: If authentication fails
    """
    # Authenticate the user using the provided username and password
    user = authenticate_user(fake_users_db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create an access token with a specified expiration time
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
