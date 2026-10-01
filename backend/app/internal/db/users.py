import logging
from pydantic import BaseModel
from typing import Union, Dict
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from datetime import datetime
from passlib.context import CryptContext

from app.internal.models.users import User, UserSchema

logger = logging.getLogger(__name__)

# Initialize CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Checked against when the username doesn't exist, so that an unknown username takes as
# long to reject as a wrong password (no timing difference to probe usernames with).
# It is the bcrypt hash (same cost as real ones) of a random value nobody knows.
_DUMMY_HASH = "$2b$12$d7yri/yP997MzqGKwAGzOepmS7eUABMmyUe111g9EJtsMP4T7Pvm6"


# Helper function to map User attributes to a Python dictionary
def user_to_dict(user):
    return {
        'member_id': user.member_id,
        'email': user.email,
        'hashed_password': user.hashed_password,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'disabled': user.disabled,
        'refresh_token': user.refresh_token,
        'refresh_token_expires_at': user.refresh_token_expires_at
    }


def create_user(db: Session, member_id: str, email: str, hashed_password: str, first_name: str, last_name: str, disabled: bool = False) -> Dict[str, Union[Dict, str]]:
    try:
        new_user = {
            'member_id': member_id,
            'email': email,
            'hashed_password': hashed_password,
            'first_name': first_name,
            'last_name': last_name,
            'disabled': disabled
        }

        # Unpack the new_user dict into a User object
        user = User(**new_user)
        db.add(user)
        db.commit()
        db.refresh(user)
        return {'status': 'success', 'user': new_user}
    except IntegrityError:
        db.rollback()
        return {'status': 'error', 'detail': 'User with this member ID or email already exists.'}
    except Exception as e:
        db.rollback()
        return {'status': 'error', 'detail': str(e)}

def get_user(db: Session, member_id: str) -> Dict[str, Union[Dict, str]]:
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'error', 'detail': 'User not found.'}

        user_dict = user_to_dict(user)
        return {'status': 'success', 'user': user_dict}
    except Exception as e:
        return {'status': 'error', 'detail': str(e)}

def update_user(db: Session, member_id: str, email=None, first_name=None, last_name=None, hashed_password=None, disabled=None) -> Dict[str, Union[Dict, str]]:
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'error', 'detail': 'User not found.'}
        
        update_data = {'member_id': member_id}
        if email:
            user.email = email
            update_data['email'] = email
        if first_name:
            user.first_name = first_name
            update_data['first_name'] = first_name
        if last_name:
            user.last_name = last_name
            update_data['last_name'] = last_name
        if hashed_password:
            user.hashed_password = hashed_password
            update_data['hashed_password'] = hashed_password
        if disabled is not None:
            user.disabled = disabled
            update_data['disabled'] = disabled

        db.commit()
        db.refresh(user)

        return {'status': 'success', 'user': update_data}
    except Exception as e:
        db.rollback()
        return {'status': 'error', 'detail': str(e)}


def delete_user(db: Session, member_id: str) -> Dict[str, str]:
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'fail', 'detail': 'User not found.'}

        db.delete(user)
        db.commit()
        return {'status': 'success', 'detail': 'User deleted.'}
    except Exception as e:
        db.rollback()
        return {'status': 'error', 'detail': str(e)}

def authenticate_user(db: Session, member_id: str, password: str) -> Dict[str, Union[Dict, str]]:
    """
    Check a username and password.

    Returns {'status': 'success', 'user': ...} on a match, {'status': 'fail'} for an
    unknown user or a wrong password (indistinguishable to the caller, and both cost one
    bcrypt check so response times don't reveal which usernames exist), or
    {'status': 'error'} if the database could not be queried.
    """
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
    except Exception:
        logger.exception("Database error while looking up a user for sign-in")
        db.rollback()
        return {'status': 'error', 'detail': 'Authentication unavailable.'}

    hashed_password = user.hashed_password if user and user.hashed_password else _DUMMY_HASH
    try:
        password_ok = pwd_context.verify(password, hashed_password)
    except Exception:
        # e.g. a password longer than passlib accepts, or a malformed stored hash
        password_ok = False

    if not user or not password_ok:
        return {'status': 'fail', 'detail': 'Authentication failed.'}

    return {'status': 'success', 'user': user_to_dict(user)}

def clear_refresh_token(db: Session, member_id: str) -> Dict[str, str]:
    """Revokes the stored refresh token so it can no longer be exchanged for access tokens."""
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'fail', 'detail': 'User not found.'}

        user.refresh_token = None
        user.refresh_token_expires_at = None
        db.commit()
        return {'status': 'success', 'detail': 'Refresh token revoked.'}
    except Exception as e:
        db.rollback()
        return {'status': 'error', 'detail': str(e)}


def store_refresh_token(db: Session, member_id: str, refresh_token: str, expires_at: datetime) -> Dict[str, Union[Dict, str]]:
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'fail', 'detail': 'User not found.'}

        user.refresh_token = refresh_token
        user.refresh_token_expires_at = expires_at
        db.commit()
        db.refresh(user)

        return {'status': 'success', 'user': user_to_dict(user)}
    except Exception as e:
        db.rollback()
        return {'status': 'error', 'detail': str(e)}