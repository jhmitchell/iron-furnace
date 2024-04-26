import os
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler
from pytz import timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler

# Load the .env file
load_dotenv()

# Read the environment variables
env = os.getenv("ENV")
client_url = os.getenv("CLIENT_URL")
API_V1_PREFIX = os.getenv("API_V1_PREFIX")
AUTH_PREFIX = os.getenv("AUTH_PREFIX")
LOG_FILE = os.getenv("LOG_FILE")

# Initialize logging
if LOG_FILE:  # Check if LOG_FILE is defined
    log_handler = RotatingFileHandler(LOG_FILE, maxBytes=10000, backupCount=10)
    logging.basicConfig(handlers=[log_handler], level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    print(f'Logging to {LOG_FILE}')
else:
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    print('No LOG_FILE environment variable defined. Logging to console.')
logger = logging.getLogger(__name__)

app = FastAPI()

# Define CORS settings based on the environment
origins = [client_url] if client_url else []
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Assume the following routers are configured correctly in your project structure
from .routers import authentication, users, hours, events
from .internal.db.session import get_db
from .internal.db.init import create_users_table, create_hours_table, create_holidays_table, create_events_table, create_root_user
from .internal.db.jobs import delete_expired_events

app.include_router(authentication.router, prefix=f'{API_V1_PREFIX}{AUTH_PREFIX}')
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

