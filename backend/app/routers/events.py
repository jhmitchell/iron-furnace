import pytz
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from typing import Optional

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
        A JSON object with a list of all events.
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


@router.post("/events")
async def create_event(
    event_start: str = Form(...),
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(None),
    link_text: Optional[str] = Form(None),
    link_url: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    event_data = {
        "event_start": event_start,
        "title": title,
        "category": category,
        "description": description,
        "link_text": link_text,
        "link_url": link_url,
    }
    event = Event(**event_data)

    try:
        new_event = create_event_db(db, event)
        await save_image(image, new_event.id)
        return new_event
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An error occurred while creating the event.")


@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """
    Deletes an event identified by its ID from the database, along with its associated image.

    Parameters:
    - event_id (int): The unique identifier of the event to be deleted.
    - db (Session): the database session.

    Returns:
    - JSON: A status message.
    """
    try:
        delete_event_db(db, event_id)

        image_path = f"static/event_images/{event_id}"
        if os.path.exists(image_path):
            os.remove(image_path)
            
        return {"message": "Event deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred while deleting the event: {str(e)}")


async def save_image(image: UploadFile, event_id: int):
    """
    Saves an uploaded image file to the server.

    Parameters:
    - image (UploadFile): The image file to save.

    Returns:
    - str: The path to the saved image.
    """
    directory = "static/event_images" 
    if not os.path.exists(directory):
        os.makedirs(directory)

    file_path = os.path.join(directory, f"{event_id}")
    with open(file_path, "wb") as file_object:
        content = await image.read()
        file_object.write(content)

    # Return a path or URL that can be accessed by clients
    return f"/static/event_images/{event_id}"
