# internal/db/session.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.internal.models import Base
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv("app/.env")
DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"

# Create engine and session, set pool_recycle to 3600 to avoid MySQL has gone away error
# This means that the connection will be refreshed every hour (default mysql connection
# is closed after 8 hours)
engine = create_engine(DATABASE_URL,
                       pool_recycle=3600,
                       )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# To create tables
Base.metadata.create_all(bind=engine)

# Dependency to get the database session


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
