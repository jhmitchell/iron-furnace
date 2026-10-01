from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.internal.db.session import get_db
from app.internal.models.users import UserSchema, PublicUserSchema
from app.internal.token import authorize
from typing import Dict, Union

router = APIRouter()

@router.get("/users/me", response_model=PublicUserSchema)
async def read_users_me(current_user: UserSchema = Depends(authorize)):
    """
    This endpoint authenticates the user using the provided access token,
    and returns the user's information if authentication is successful.
    """
    
    # authorize() has already rejected missing, invalid, expired and disabled-account
    # tokens with a 401; current_user is {'status': 'success', 'user': {...}}.
    user = current_user.get('user') if current_user.get('status') == 'success' else None
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Could not validate credentials',
            headers={"WWW-Authenticate": "Bearer"},
        )

    return PublicUserSchema(
        member_id=user['member_id'],
        email=user['email'],
        first_name=user['first_name'],
        last_name=user['last_name']
    )
