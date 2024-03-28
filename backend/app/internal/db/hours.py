from sqlalchemy.orm import Session
from typing import Optional
from app.internal.models.business_hours import OperatingHours, Holidays
import datetime


def get_operating_hours(db: Session):
    # Query operating hours
    hours = db.query(OperatingHours.day_of_week,
                     OperatingHours.open_time, OperatingHours.close_time).all()

    # Query holidays
    holidays = db.query(Holidays.holiday_date, Holidays.description).all()

    # Convert MySQL TIME objects to datetime.time objects
    # NOTE: sqlalchemy automatically does this now - this is just for reference
    # def to_time(value): return (datetime.datetime.min + value).time()

    # Define hours and holidays as dictionaries
    hours_dict = [{"day_of_week": day, "open_time": open_time,
                   "close_time": close_time} for day, open_time, close_time in hours]
    holidays_dict = [{"holiday_date": date, "description": desc}
                     for date, desc in holidays]

    return hours_dict, holidays_dict


def set_operating_hours(db: Session, day: str, start_time: Optional[datetime.time] = None, end_time: Optional[datetime.time] = None):
    # Find the record for the specified day
    record = db.query(OperatingHours).filter(
        OperatingHours.day_of_week == day).first()

    # If both start and end times are None, delete the record
    if start_time is None and end_time is None:
        if record:
            db.delete(record)
            db.commit()
        return

    # If the record exists, update it
    if record:
        record.open_time = start_time
        record.close_time = end_time
    else:
        # If the record does not exist (it should always exist), create a new one
        new_hours = OperatingHours(
            day_of_week=day, open_time=start_time, close_time=end_time)
        db.add(new_hours)

    db.commit()


def get_holidays(db: Session):
    # Query holidays
    holidays = db.query(Holidays.holiday_date, Holidays.description).all()

    # Define holidays as a dictionary
    holidays_dict = [{"holiday_date": date, "description": desc}
                     for date, desc in holidays]

    return holidays_dict


def set_holiday(db: Session, date: datetime.date, description: str = None):
    # Find the record for the specified date
    holiday_record = db.query(Holidays).filter(
        Holidays.holiday_date == date).first()

    if description:
        # If a description is provided, update or create the holiday record
        if holiday_record:
            holiday_record.description = description
        else:
            new_holiday = Holidays(holiday_date=date, description=description)
            db.add(new_holiday)
    else:
        # If the description is None and the record exists, delete it
        if holiday_record:
            db.delete(holiday_record)

    # Commit the changes to the database
    db.commit()
