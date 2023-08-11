import os
from dotenv import load_dotenv

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Union
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing_extensions import Annotated

from .models import TokenData, UserInDB
from .db import get_user

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
API_V1_PREFIX = os.getenv("API_V1_PREFIX")
AUTH_PREFIX = os.getenv("AUTH_PREFIX")

# Password context for hashing and verifying passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f'{API_V1_PREFIX}{AUTH_PREFIX}/token')

def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    :param password: Plain text password
    :return: Hashed password
    """
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password using its hashed version.

    :param plain_password: Plain text password
    :param hashed_password: Hashed password
    :return: True if passwords match, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_user_refresh_token(username: str) -> Union[str, None]:
    """
    Get the refresh token for a given user.

    :param username: Username
    :return: Refresh token if it exists, None otherwise
    """
    user = get_user(username)
    if user:
        return user.refresh_token
    return None

def verify_refresh_token(refresh_token: str) -> str:
    """
    Verifies the provided refresh token, checks if it's expired, and returns the username.
    
    :param refresh_token: Refresh token to verify
    :return: Username if the token is valid, None otherwise
    """
    try:
        # Decode the JWT to get the payload
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        
        # Verify if the token exists in the database
        stored_refresh_token = get_user_refresh_token(username)
        if refresh_token != stored_refresh_token:
            return None

        return username
    except JWTError:
        return None

def get_password_hash(password: str) -> str:
    """
    Hash a password.

    :param password: Plain text password
    :return: Hashed password
    """
    return pwd_context.hash(password)

def create_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    """
    Create a jwt token.

    :param data: Data to include in the token
    :param expires_delta: Expiration time for the token
    :return: Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserInDB:
    """
    Get the current user from a token.

    :param token: Access token
    :return: User object
    :raises HTTPException: If token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: Annotated[UserInDB, Depends(get_current_user)]) -> UserInDB:
    """
    Get the current active user.

    :param current_user: Current user object
    :return: User object if active
    :raises HTTPException: If user is inactive
    """
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
