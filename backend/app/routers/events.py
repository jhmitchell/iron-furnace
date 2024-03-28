import pytz
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.internal.models.events import Event
from app.internal.db.events import get_events, create_event
from app.internal.db.session import get_db

router = APIRouter()

# Define the EST timezone
est_timezone = pytz.timezone('US/Eastern')

@router.get("/events")
def get_hours(db: Session = Depends(get_db)):
    """
    Fetches and returns all events

    Returns:
        A JSON object with 
    """
    events = get_events(db)
    return events

@router.post("/events", response_model=Event)
def set_operating_hours(event: Event, db: Session = Depends(get_db)):
    try:
        new_event = create_event(db, event)
        return new_event
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while creating the event.")