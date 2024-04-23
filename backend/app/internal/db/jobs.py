from sqlalchemy.orm import Session
from app.internal.models.events import EventModel
from datetime import datetime

def delete_expired_events(db: Session):
    current_date = datetime.now()
    expired_events = db.query(EventModel).filter(EventModel.event_start < current_date).all()
    for event in expired_events:
        db.delete(event)
    db.commit()
    
    #print(f"Deleted {len(expired_events)} expired events.")
