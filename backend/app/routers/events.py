import pytz
import os
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from sqlalchemy.orm import Session
from typing import Optional
from app.internal.models.events import Event
from app.internal.db.session import get_db
from app.internal.db.events import (
    get_events_db,
    create_event_db,
    delete_event_db,
    get_upcoming_events_db,
    edit_event_db,
)

router = APIRouter()

# Define the EST timezone
est_timezone = pytz.timezone('US/Eastern')

@router.get("/events")
def get_events(db: Session = Depends(get_db)):
    """
    Fetches and returns all events.

    Args:
        db (Session): The database session.

    Returns:
        list: A list of all events.
    """
    events = get_events_db(db)
    return events

@router.get("/events/{num_events}")
def get_upcoming_events(num_events: int, db: Session = Depends(get_db)):
    """
    Fetches and returns a specified number of upcoming events, ordered by their upcoming dates.

    Args:
        num_events (int): The number of upcoming events to retrieve.
        db (Session): The database session.

    Returns:
        list: A list of upcoming events or an empty list if no upcoming events are found.

    Raises:
        HTTPException: If num_events is less than 1.
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
    db: Session = Depends(get_db),
):
    """
    Creates a new event with the provided data.

    Args:
        event_start (str): The start date and time of the event.
        title (str): The title of the event.
        category (str): The category of the event.
        description (Optional[str]): The description of the event.
        link_text (Optional[str]): The text for the event link.
        link_url (Optional[str]): The URL for the event link.
        image (UploadFile): The image file for the event.
        db (Session): The database session.

    Returns:
        Event: The created event.

    Raises:
        HTTPException: If an error occurs while creating the event.
    """
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
        raise HTTPException(
            status_code=500, detail="An error occurred while creating the event.")

@router.put("/events/{event_id}")
async def edit_event(
    event_id: int,
    title: str = Form(...),
    description: Optional[str] = Form(None),
    link_text: Optional[str] = Form(None),
    pdf: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    """
    Edits an existing event with the provided data.

    Args:
        event_id (int): The ID of the event to edit.
        title (str): The title of the event.
        description (Optional[str]): The description of the event.
        link_text (Optional[str]): The text for the event link.
        pdf (Optional[UploadFile]): The PDF file for the event.
        db (Session): The database session.

    Returns:
        Event: The edited event.

    Raises:
        HTTPException: If an error occurs while editing the event.
    """
    event_data = {
        "title": title,
        "description": description,
        "link_text": link_text,
    }
    try:
        edited_event = edit_event_db(db, event_id, event_data)
        if pdf:
            await save_pdf(pdf, event_id)
        return edited_event
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred while editing the event: {str(e)}"
        )

@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    """
    Deletes an event identified by its ID from the database, along with its associated image and PDF.

    Args:
        event_id (int): The ID of the event to be deleted.
        db (Session): The database session.

    Returns:
        dict: A status message.

    Raises:
        HTTPException: If an error occurs while deleting the event.
    """
    try:
        delete_event_db(db, event_id)
        image_path = f"static/event_images/{event_id}"
        if os.path.exists(image_path):
            os.remove(image_path)
        pdf_path = f"static/event_info/{event_id}.pdf"
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        return {"message": "Event deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred while deleting the event: {str(e)}")

async def save_image(image: UploadFile, event_id: int):
    """
    Saves an uploaded image file to the server.

    Args:
        image (UploadFile): The image file to save.
        event_id (int): The ID of the event associated with the image.

    Returns:
        str: The path to the saved image.
    """
    directory = "static/event_images"
    if not os.path.exists(directory):
        os.makedirs(directory)
    file_path = os.path.join(directory, f"{event_id}")
    with open(file_path, "wb") as file_object:
        content = await image.read()
        file_object.write(content)
    return f"/static/event_images/{event_id}"

async def save_pdf(pdf: UploadFile, event_id: int):
    """
    Saves an uploaded PDF file to the server.

    Args:
        pdf (UploadFile): The PDF file to save.
        event_id (int): The ID of the event associated with the PDF.

    Returns:
        str: The path to the saved PDF.
    """
    directory = "static/event_info"
    if not os.path.exists(directory):
        os.makedirs(directory)
    file_path = os.path.join(directory, f"{event_id}.pdf")
    with open(file_path, "wb") as file_object:
        content = await pdf.read()
        file_object.write(content)
    return f"/static/event_info/{event_id}.pdf"
