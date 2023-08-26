from pydantic import BaseModel
from sqlalchemy import Boolean, Column, String, DateTime
from .base import Base

# SqlAlchemy User model
class User(Base):
    __tablename__ = 'users'

    member_id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    first_name = Column(String)
    last_name = Column(String)
    disabled = Column(Boolean, default=False)
    refresh_token = Column(String, nullable=True)
    refresh_token_expires_at = Column(DateTime, nullable=True)

# Pydantic User Schema
class UserSchema(BaseModel):
    member_id: str
    email: str
    first_name: str
    last_name: str
    disabled: bool

    class Config:
        from_attributes = True

# Pydantic User Creation Schema
class UserCreateSchema(BaseModel):
    member_id: str
    email: str
    password: str  # Plain-text password, will be hashed before storing
    first_name: str
    last_name: str
    disabled: bool = False  # Optional; default to False
