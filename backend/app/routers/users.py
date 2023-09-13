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
    
    try:
        # current_user is a dict containing the user's information
        # construct a PublicUserSchema object from the dict
        status = current_user['status']
        if status != 'success' or not current_user['user']:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=current_user['detail']
            )
        
        user = current_user['user']
        UserResponse = PublicUserSchema(
            member_id=user['member_id'],
            email=user['email'],
            first_name=user['first_name'],
            last_name=user['last_name']
        )

        return UserResponse
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Could not validate credentials'
        )
