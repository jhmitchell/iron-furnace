from fastapi import APIRouter, Depends
from app.internal.models.users import UserSchema  # Import the Pydantic model
from app.internal.token import get_current_active_user

router = APIRouter()

@router.get("/users/me/")
def get_current_user(current_user: str):
    """
    This endpoint returns the currently authenticated user.
    """
    return current_user
