from sqlalchemy.orm import Session
from app.internal.models.events import Event, EventModel


def get_events_db(db: Session):
    """
    Retrieve all events from the database.

    Parameters:
    - db (Session): The database session object.

    Returns:
    - List[dict]: A list of dictionaries representing the events, with each dictionary containing the 'id' and 'title' of an event.
    """
    # Query all events
    events = db.query(EventModel).all()
    events_dict = [
        {
            "id": event.id,
            "title": event.title,
            "category": event.category,
            "description": event.description,
            "start_date": event.event_start,
            "image": event.image,
            "link_text": event.link_text,
            "link_url": event.link_url
        } for event in events
    ]

    return events_dict


def create_event_db(db: Session, event: Event):
    """
    Creates a new event in the database.

    Args:
        db (Session): The database session.
        event (Event): The event data validated by the Pydantic model.

    Returns:
        An instance of EventModel with the created event data.
    """
    new_event = EventModel(
        event_start=event.event_start,
        image=event.image,
        title=event.title,
        category=event.category,
        description=event.description,
        link_text=event.link_text,
        link_url=event.link_url
    )

    db.add(new_event)
    db.commit()

    db.refresh(new_event)

    return new_event


def delete_event_db(db: Session, event_id: int):
    """
    Deletes an event from the database.

    Args:
        db (Session): The database session.
        event_id (int): The ID of the event to delete.
    """
    event = db.query(EventModel).filter(EventModel.id == event_id).first()

    if event:
        db.delete(event)
        db.commit()
    else:
        raise ValueError(f"Event with ID {event_id} does not exist.")
