# internal/db/session.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.internal.models import Base
from dotenv import load_dotenv
import os

# Load variables from .env
load_dotenv("app/.env")
DATABASE_URL = f"mysql+pymysql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}/{os.getenv('DB_NAME')}"

engine = create_engine(DATABASE_URL)
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
        