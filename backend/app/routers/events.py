import logging
import pytz
import os
import traceback
from io import BytesIO
from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form, Path
from PIL import Image, ImageOps
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool
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
from app.internal.token import authorize

router = APIRouter()
logger = logging.getLogger(__name__)

# Uploaded event photos are resized to at most this width (wider than any layout on the site)
MAX_IMAGE_WIDTH = 1920
WEBP_QUALITY = 82

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
    current_user: dict = Depends(authorize),
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


@router.patch("/events/{event_id}")
async def edit_event(
    event_id: int = Path(..., description="The ID of the event to edit"),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    link_text: Optional[str] = Form(None),
    link_url: Optional[str] = Form(None),
    event_start: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    pdf: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(authorize),
):
    """
    Edits an existing event with the provided data.

    Args:
        event_id (int): The ID of the event to edit.
        All parameters are optional and will update the corresponding fields if provided.
        db (Session): The database session.

    Returns:
        Event: The edited event.

    Raises:
        HTTPException: If an error occurs while editing the event.
    """
    try:
        # Build the updated_event dictionary
        updated_event = {
            "title": title,
            "description": description,
            "link_text": link_text,
            "link_url": link_url,
            "event_start": event_start,
            "category": category,
        }

        updated_event = {k: v for k, v in updated_event.items() if v is not None}

        # Call the edit_event_db function
        existing_event = edit_event_db(db, event_id, updated_event)

        # Handle file uploads
        if pdf and pdf.filename != '':
            await save_pdf(pdf, event_id)
        if image and image.filename != '':
            await save_image(image, event_id)

        return existing_event
    except ValueError as ve:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail="An internal error occurred while editing the event."
        )


@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
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
    content = await image.read()
    # Image processing is CPU-heavy; keep it off the event loop
    content = await run_in_threadpool(shrink_image, content)
    with open(file_path, "wb") as file_object:
        file_object.write(content)
    return f"/static/event_images/{event_id}"


def shrink_image(content: bytes) -> bytes:
    """
    Makes uploaded photos web-sized: applies the camera's rotation, resizes anything wider
    than MAX_IMAGE_WIDTH, and re-encodes as WebP. Returns the original bytes unchanged if
    the file can't be read as an image, is animated, or wouldn't get smaller, so an upload
    never fails because of this step.

    The file keeps its extensionless name (/static/event_images/<id>); browsers detect the
    image format from its contents.
    """
    try:
        with Image.open(BytesIO(content)) as img:
            if getattr(img, "is_animated", False):
                return content
            img = ImageOps.exif_transpose(img)
            if img.width > MAX_IMAGE_WIDTH:
                height = round(img.height * MAX_IMAGE_WIDTH / img.width)
                img = img.resize((MAX_IMAGE_WIDTH, height), Image.LANCZOS)
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGBA" if "A" in img.getbands() else "RGB")
            out = BytesIO()
            img.save(out, "WEBP", quality=WEBP_QUALITY, method=6)
    except Exception:
        logger.warning("Could not process uploaded image; saving it unchanged", exc_info=True)
        return content

    result = out.getvalue()
    if len(result) >= len(content):
        return content
    logger.info("Uploaded image reduced from %d to %d bytes", len(content), len(result))
    return result


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
