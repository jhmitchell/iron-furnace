from sqlalchemy.orm import Session
from datetime import datetime, date
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
    print(event.event_start)
    event_start_datetime = datetime.strptime(event.event_start, "%Y-%m-%dT%H:%M:%S")
    print(event_start_datetime)
    new_event = EventModel(
        event_start=event_start_datetime,
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


def get_upcoming_events_db(db: Session, number_of_events: int):
    """
    Retrieve a specified number of upcoming events, sorted by start datetime.

    Parameters:
    - db (Session): The database session object.
    - number_of_events (int): The number of events to retrieve.

    Returns:
    - List[Optional[Dict]]: A list of dictionaries representing the events, or None for unfilled entries.
    """
    # today marks the start of the day, so that all events today are included
    # regardless of the current time
    today = datetime.combine(date.today(), datetime.min.time())

    # Query upcoming events, sorted by start datetime
    events = db.query(EventModel).filter(EventModel.event_start >= today)\
        .order_by(EventModel.event_start.asc())\
        .limit(number_of_events).all()

    # Convert events to dictionaries
    events_dict = [
        {
            "id": event.id,
            "title": event.title,
            "category": event.category,
            "description": event.description,
            "start_date": event.event_start,
            "link_text": event.link_text,
            "link_url": event.link_url
        } for event in events
    ]

    # If there are fewer events than requested, fill in the remaining with None
    events_dict += [None] * (number_of_events - len(events_dict))

    return events_dict
