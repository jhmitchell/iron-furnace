from sqlalchemy import Column, Integer, String
from pydantic import BaseModel
from typing import List, Optional
from .base import Base

class BoardMemberModel(Base):
    __tablename__ = 'board_members'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=True)
    display_order = Column(Integer, nullable=False, default=0)

class BoardMember(BaseModel):
    name: str
    title: Optional[str] = None

class BoardMemberReorder(BaseModel):
    ordered_ids: List[int]
