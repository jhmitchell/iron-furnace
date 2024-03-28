import pytz
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.internal.models.events import Event
from app.internal.db.session import get_db
from app.internal.db.events import (get_events_db,
                                    create_event_db,
                                    delete_event_db,
                                    get_upcoming_events_db)

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


@router.get("/events/{num_events}")
def get_upcoming_events(num_events: int, db: Session = Depends(get_db)):
    """
    Fetches and returns a specified number of upcoming events, ordered 
    by their upcoming dates.

    Args:
        num_events (int): The number of upcoming events to retrieve.
        db (Session): The database session.

    Returns:
        A list of Event objects in JSON format or an empty list if no 
        upcoming events are found.
    """
    if num_events < 1:
        raise HTTPException(
            status_code=400, detail="Number of events must be at least 1")

    upcoming_events = get_upcoming_events_db(db, num_events)
    return upcoming_events


@router.post("/events", response_model=Event)
def create_event(event: Event, db: Session = Depends(get_db)):
    """
    Creates a new event in the database.

    Parameters:
    - event (Event): An Event object representing the new event to be added.
    - db (Session, auto-injected): Database session dependency injected by FastAPI.

    Returns:
    - Event: The newly created Event object as a JSON response.
    """
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
    Deletes an event identified by its ID from the database.

    Parameters:
    - event_id (int): The unique identifier of the event to be deleted.
    - db (Session, auto-injected): Database session dependency injected by FastAPI.

    Returns:
    - JSON: A message indicating the success or failure of the event deletion.
    """
    try:
        delete_event_db(db, event_id)
        return {"message": "Event deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail="An error occurred while deleting the event.")
