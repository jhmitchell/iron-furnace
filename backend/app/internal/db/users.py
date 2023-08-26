from typing import Dict, Union
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from datetime import datetime
from passlib.context import CryptContext
from app.internal.models.users import User

# Initialize CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_user(db: Session, member_id: str, email: str, hashed_password: str, first_name: str, last_name: str, disabled: bool = False) -> Dict[str, Union[User, str]]:
    try:
        new_user = User(
            member_id=member_id,
            email=email,
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            disabled=disabled
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return {'status': 'success', 'user': new_user}
    except IntegrityError:
        db.rollback()
        return {'status': 'fail', 'detail': 'User with this member ID or email already exists.'}
    except Exception as e:
        db.rollback()
        return {'status': 'error', 'detail': str(e)}


def get_user(db: Session, member_id: str) -> Dict[str, Union[User, str]]:
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'fail', 'detail': 'User not found.'}
        return {'status': 'success', 'user': user}
    except Exception as e:
        return {'status': 'error', 'detail': str(e)}


def update_user(db: Session, member_id: str, email=None, first_name=None, last_name=None, hashed_password=None, disabled=None) -> Dict[str, Union[User, str]]:
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'fail', 'detail': 'User not found.'}

        if email:
            user.email = email
        if first_name:
            user.first_name = first_name
        if last_name:
            user.last_name = last_name
        if hashed_password:
            user.hashed_password = hashed_password
        if disabled is not None:
            user.disabled = disabled

        db.commit()
        db.refresh(user)
        return {'status': 'success', 'user': user}
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


def authenticate_user(db: Session, member_id: str, password: str) -> Dict[str, Union[User, str]]:
    try:
        result = get_user(db, member_id)
        if result['status'] != 'success':
            return result

        user = result['user']
        if not pwd_context.verify(password, user.hashed_password):
            return {'status': 'fail', 'detail': 'Authentication failed.'}

        return {'status': 'success', 'user': user}
    except Exception as e:
        return {'status': 'error', 'detail': str(e)}


def store_refresh_token(db: Session, member_id: str, refresh_token: str, expires_at: datetime) -> Dict[str, Union[User, str]]:
    try:
        user = db.query(User).filter(User.member_id == member_id).first()
        if not user:
            return {'status': 'fail', 'detail': 'User not found.'}

        user.refresh_token = refresh_token
        user.refresh_token_expires_at = expires_at

        db.commit()
        db.refresh(user)
        return {'status': 'success', 'user': user}
    except Exception as e:
        db.rollback()
        return {'status': 'error', 'detail': str(e)}
