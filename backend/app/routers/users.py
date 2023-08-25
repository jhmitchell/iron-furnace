'''
from fastapi import APIRouter, Depends
from ..internal.models import User
from ..internal.token import get_current_active_user
from typing_extensions import Annotated

router = APIRouter()

@router.get("/users/me/", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    return current_user

@router.get("/users/me/items/")
async def read_own_items(current_user: Annotated[User, Depends(get_current_active_user)]):
    return [{"item_id": "Foo", "owner": current_user.username}]
'''