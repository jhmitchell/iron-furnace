from fastapi import APIRouter, Depends
from app.internal.models.users import UserSchema  # Import the Pydantic model
from app.internal.token import get_current_active_user

router = APIRouter()

@router.get("/users/me/", response_model=UserSchema)  # Use the Pydantic model here
async def read_users_me(current_user: UserSchema = Depends(get_current_active_user)):
    return current_user

@router.get("/users/me/items/")
async def read_own_items(current_user: UserSchema = Depends(get_current_active_user)):
    # Note: I'm assuming here that your User model has a 'member_id' field. Replace it accordingly.
    return [{"item_id": "Foo", "owner": current_user.member_id}]
