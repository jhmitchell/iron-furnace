from pydantic import BaseModel
from typing import Union, Dict
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from datetime import datetime
from passlib.context import CryptContext

from app.internal.models.users import User, UserSchema

# Initialize CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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
    try:
        result = get_user(db, member_id)
        if result['status'] != 'success':
            return result

        user_dict = result['user']
        if not pwd_context.verify(password, user_dict['hashed_password']):
            return {'status': 'fail', 'detail': 'Authentication failed.'}

        return {'status': 'success', 'user': user_dict}
    except Exception as e:
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