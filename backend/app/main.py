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
if LOG_FILE:
    log_handler = logging.FileHandler(LOG_FILE)
    log_handler.setLevel(logging.INFO)
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(log_handler)
    print(f'Logging to {LOG_FILE}')
else:
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(logging.StreamHandler())
    print('Logging to console')

logger = logging.getLogger(__name__)

# Interactive API docs are only exposed in local development
IS_DEV = env == "dev"
app = FastAPI(
    docs_url="/docs" if IS_DEV else None,
    redoc_url="/redoc" if IS_DEV else None,
    openapi_url="/openapi.json" if IS_DEV else None,
)

# Define CORS settings based on the environment
origins = [client_url] if client_url else []
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routers and initialize them
from .routers import authentication, users, hours, events, sponsors, board_members, banner
from .internal.db.session import get_db
from .internal.db.init import create_users_table, create_hours_table, create_holidays_table, create_events_table, create_sponsors_table, create_board_members_table, create_banner_table, create_root_users
from .internal.db.jobs import delete_expired_events

app.include_router(authentication.router, prefix=f'{API_V1_PREFIX}{AUTH_PREFIX}')
app.include_router(users.router, prefix=f'{API_V1_PREFIX}')
app.include_router(hours.router, prefix=f'{API_V1_PREFIX}')
app.include_router(events.router, prefix=f'{API_V1_PREFIX}')
app.include_router(sponsors.router, prefix=f'{API_V1_PREFIX}')
app.include_router(board_members.router, prefix=f'{API_V1_PREFIX}')
app.include_router(banner.router, prefix=f'{API_V1_PREFIX}')

app.mount("/static", StaticFiles(directory="static"), name="static")

scheduler = AsyncIOScheduler()
eastern = timezone('US/Eastern')

logger.info("Setting up scheduled jobs...")

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
        create_sponsors_table(db)
        create_board_members_table(db)
        create_banner_table(db)
        create_root_users(db)
    finally:
        db.close()
    scheduler.start()
    logger.info(f'Initialized server in {env} mode')
