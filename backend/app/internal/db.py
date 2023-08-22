"""
This is a fake database for development purposes. Do not place real user data in this file.
This database demonstrates how a user's data is stored and retrieved for authentication.
"""

from typing import Union
from .models import UserInDB
from passlib.context import CryptContext

fake_users_db = {
    "john": {
        "username": "john",
        "full_name": "John Mitchell",
        "email": "john@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    },
    "tyler": {
        "username": "tyler",
        "full_name": "Tyler Greer",
        "email": "tyler@example.com",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
        "disabled": False,
    },
    "brad": {
        "username": "brad",
        "full_name": "Bradley Powell",
        "email": "brad@example.com",
        "hashed_password": "plaintextpassword",
    }
}

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_user(username: str, email: str, hashed_password: str, first_name: str, last_name: str, disabled: bool = False):
    """Creates a new user in the fake database."""
    if username in fake_users_db:
        return None  # Username already exists

    fake_users_db[username] = {
        "username": username,
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "hashed_password": hashed_password,
        "disabled": disabled,
    }
    return fake_users_db[username]

def get_user(username: str) -> Union[UserInDB, None]:
    """Retrieves a user by username from the fake database."""
    if username in fake_users_db:
        user_dict = fake_users_db[username]
        return UserInDB(**user_dict)

def update_user(username: str, email=None, first_name=None, last_name=None, hashed_password=None, disabled=None):
    """Updates an existing user's information in the fake database."""
    user = fake_users_db.get(username, None)
    if not user:
        return None  # User not found

    if email:
        user["email"] = email
    if first_name:
        user["first_name"] = first_name
    if last_name:
        user["last_name"] = last_name
    if hashed_password:
        user["hashed_password"] = hashed_password
    if disabled is not None:
        user["disabled"] = disabled

    return user

def delete_user(username: str):
    """Deletes a user from the fake database."""
    return fake_users_db.pop(username, None)

def authenticate_user(username: str, password: str) -> Union[UserInDB, None]:
    """Authenticates a user using the username and password. Returns user data if successful, None otherwise."""
    user = get_user(username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user
