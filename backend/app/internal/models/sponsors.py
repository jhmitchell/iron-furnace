from sqlalchemy import Column, Integer, String
from pydantic import BaseModel
from typing import List
from .base import Base

class SponsorModel(Base):
    __tablename__ = 'sponsors'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    display_order = Column(Integer, nullable=False, default=0)

class Sponsor(BaseModel):
    name: str

class SponsorReorder(BaseModel):
    ordered_ids: List[int]
