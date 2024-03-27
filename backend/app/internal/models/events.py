from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventModel(BaseModel):
    id: Optional[int] = None
    event_start: datetime
    image: Optional[str] = None
    title: str
    category: str
    description: Optional[str] = None
    link_text: Optional[str] = None
    link_url: Optional[str] = None
    