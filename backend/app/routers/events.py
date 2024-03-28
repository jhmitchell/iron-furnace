import pytz
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.internal.models.events import Event
from app.internal.db.events import get_events_db, create_event_db, delete_event_db
from app.internal.db.session import get_db

router = APIRouter()

# Define the EST timezone
est_timezone = pytz.timezone('US/Eastern')


@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    """
    Fetches and returns all events

    Returns:
        A JSON object with 
    """
    events = get_events_db(db)
    return events


@router.post("/events", response_model=Event)
def create_event(event: Event, db: Session = Depends(get_db)):
    try:
        new_event = create_event_db(db, event)
        return new_event
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="An error occurred while creating the event.")


@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """
    Deletes an event from the database.

    Args:
        event_id (int): The ID of the event to be deleted.
        db (Session): The database session.

    Returns:
        A message indicating the success or failure of the deletion.
    """
    try:
        delete_event_db(db, event_id)
        return {"message": "Event deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="An error occurred while deleting the event.")
