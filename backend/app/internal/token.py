import hmac
import os
import secrets
from dotenv import load_dotenv

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from typing import Union, Dict
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing_extensions import Annotated
from sqlalchemy.orm import Session

# Modify to import from app.internal.models
from app.internal.models.users import User
from app.internal.models.token import TokenData
from app.internal.db.session import get_db
from app.internal.db.users import get_user

# Load environment variables
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))
API_V1_PREFIX = os.getenv("API_V1_PREFIX")
AUTH_PREFIX = os.getenv("AUTH_PREFIX")

# Values of the "type" claim
ACCESS_TOKEN_TYPE = "access"
REFRESH_TOKEN_TYPE = "refresh"

# Password context for hashing and verifying passwords
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f'{API_V1_PREFIX}{AUTH_PREFIX}/token')


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


def get_user_refresh_token(username: str, db: Session) -> Union[str, None]:
    """
    Get the refresh token for a given user.

    :param username: Username
    :return: Refresh token if it exists, None otherwise
    """
    result = get_user(db, username)
    if result['status'] != 'success':
        return None

    user = result['user']
    return user['refresh_token']


def verify_refresh_token(refresh_token: str, db: Session) -> Union[str, None]:
    """
    Verifies the provided refresh token, checks if it's expired, and returns the username.

    The token must be a valid, unexpired JWT that is not an access token, and it must be
    the refresh token currently stored for that user (so rotated or revoked tokens fail).

    :param refresh_token: Refresh token to verify
    :return: Username if the token is valid, None otherwise
    """
    try:
        # Decode the JWT to get the payload (this also rejects expired tokens)
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM],
                             options={"require_exp": True})
    except JWTError:
        return None

    username = payload.get("sub")
    # Access tokens can never be used as refresh tokens. (Refresh tokens issued before
    # token types were added have no "type" claim; they are still accepted until they
    # rotate, because they must also match the copy stored in the database.)
    if not username or payload.get("type") == ACCESS_TOKEN_TYPE:
        return None

    # Verify the token is the one currently stored for this user
    stored_refresh_token = get_user_refresh_token(username=username, db=db)
    if not stored_refresh_token or not hmac.compare_digest(
            refresh_token.encode(), stored_refresh_token.encode()):
        return None

    return username


def get_password_hash(password: str) -> str:
    """
    Hash a password.

    :param password: Plain text password
    :return: Hashed password
    """
    return pwd_context.hash(password)


def create_token(data: dict, expires_delta: Union[timedelta, None] = None,
                 token_type: Union[str, None] = None) -> str:
    """
    Create a jwt token.

    :param data: Data to include in the token
    :param expires_delta: Expiration time for the token
    :param token_type: ACCESS_TOKEN_TYPE or REFRESH_TOKEN_TYPE, stored in the "type" claim
        so one kind of token can't be used as the other
    :return: Encoded JWT token
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    if token_type:
        to_encode["type"] = token_type
    # A short random ID makes every token unique, even two issued in the same second
    # (otherwise a refresh in the same second as sign-in would "rotate" to the same token).
    # Kept short because refresh tokens are stored in a VARCHAR(255) column.
    to_encode["jti"] = secrets.token_urlsafe(8)
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def authorize(db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
    """
    Authorize the user by extracting the token from the Authorization header and obtaining user information.
    """
    response = await get_current_user(token, db)
    
    if response['status'] == 'success':
        return response
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=response['detail'],
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session) -> Dict[str, Union[Dict, str]]:
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
        # jwt.decode verifies the signature and rejects expired tokens
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM],
                             options={"require_exp": True})
        username: str = payload.get("sub")

        # Check if the token has a username
        if username is None:
            raise credentials_exception

        # Refresh tokens (long-lived, meant only for the HttpOnly cookie) are not
        # accepted as access tokens.
        if payload.get("type") == REFRESH_TOKEN_TYPE:
            raise credentials_exception

        result = get_user(db, member_id=username)
        if result['status'] != 'success':
            raise credentials_exception

        if result['user'].get('disabled'):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account has been disabled",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return result

    except JWTError:
        raise credentials_exception


async def get_current_active_user(current_user: Annotated[User, Depends(get_current_user)]) -> Dict[str, Union[Dict, str]]:
    """
    Get the current active user.

    :param current_user: Current user object
    :return: User object if active
    :raises HTTPException: If user is inactive
    """
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
