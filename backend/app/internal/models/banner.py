from sqlalchemy import Column, Integer, String, Text, DateTime
from pydantic import BaseModel
from typing import Optional
from .base import Base


class BannerModel(Base):
    """
    Announcement banner displayed at the top of the home page.

    The site only ever has one banner, so a single row (id = 1) is stored.
    Deleting the banner removes the row entirely.
    """
    __tablename__ = 'banner'

    id = Column(Integer, primary_key=True)
    message = Column(Text, nullable=False)
    link_text = Column(String(255), nullable=True)
    link_url = Column(String(255), nullable=True)
    updated_at = Column(DateTime, nullable=False)


class Banner(BaseModel):
    message: str
    link_text: Optional[str] = None
    link_url: Optional[str] = None
