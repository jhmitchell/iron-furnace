from sqlalchemy import Column, Integer, String, DateTime
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from .base import Base

class EventModel(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, index=True)
    event_start = Column(DateTime, nullable=False)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=True)
    link_text = Column(String, nullable=True)
    link_url = Column(String, nullable=True)

class Event(BaseModel):
    event_start: datetime
    title: str
    category: str
    description: Optional[str] = None
    link_text: Optional[str] = None
    link_url: Optional[str] = None
    