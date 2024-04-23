import os
from dotenv import load_dotenv
from pytz import timezone
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from .routers import authentication, users, hours, events
from .internal.db.session import get_db
from .internal.db.init import (create_users_table,
                               create_hours_table,
                               create_holidays_table,
                               create_events_table,
                               create_root_user)
from .internal.db.jobs import delete_expired_events

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load the .env file
load_dotenv()

# Read the environment variables
env = os.getenv("ENV")
client_url = os.getenv("CLIENT_URL")
API_V1_PREFIX = os.getenv("API_V1_PREFIX")
AUTH_PREFIX = os.getenv("AUTH_PREFIX")

app = FastAPI()

# Define CORS settings based on the environment
# Use an empty list if CLIENT_URL is not defined
origins = [client_url] if client_url else []
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router,
                   prefix=f'{API_V1_PREFIX}{AUTH_PREFIX}')
app.include_router(users.router, prefix=f'{API_V1_PREFIX}')
app.include_router(hours.router, prefix=f'{API_V1_PREFIX}')
app.include_router(events.router, prefix=f'{API_V1_PREFIX}')

app.mount("/static", StaticFiles(directory="static"), name="static")

scheduler = AsyncIOScheduler()
eastern = timezone('US/Eastern')

@scheduler.scheduled_job("cron", hour=3, minute=0, timezone=eastern)
async def scheduled_delete_expired_events():
    '''
    Scheduled job to delete expired events every day at midnight ET.
    '''
    db = next(get_db())
    try:
        delete_expired_events(db)
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    logger.info("Initializing FastAPI server...")

    # Create tables and root user if they do not exist
    db = next(get_db())
    try:
        create_users_table(db)
        create_hours_table(db)
        create_holidays_table(db)
        create_events_table(db)
        create_root_user(db)
    finally:
        db.close()

    scheduler.start()
    logger.info(f'Initialized server in {env} mode')
