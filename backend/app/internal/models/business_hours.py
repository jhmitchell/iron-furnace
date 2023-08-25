# internal/models/models.py

from sqlalchemy import Column, Integer, Enum, Time, Date, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class OperatingHours(Base):
    __tablename__ = "operating_hours"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    day_of_week = Column(Enum("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"), index=True)
    open_time = Column(Time, nullable=False)
    close_time = Column(Time, nullable=False)


class Holidays(Base):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    holiday_date = Column(Date, nullable=False)
    description = Column(String(255), nullable=False)
