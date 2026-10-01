import os
from dotenv import load_dotenv
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Load the .env file
load_dotenv()

# Read the environment variables
env = os.getenv("ENV")
client_url = os.getenv("CLIENT_URL")
API_V1_PREFIX = os.getenv("API_V1_PREFIX")
AUTH_PREFIX = os.getenv("AUTH_PREFIX")
LOG_FILE = os.getenv("LOG_FILE")

# Initialize logging. In production LOG_FILE is set (app.log); it is rotated nightly by
# backend/scripts/rotate_logs.sh (cron), which is safe with several Passenger processes.
log_handler = logging.FileHandler(LOG_FILE) if LOG_FILE else logging.StreamHandler()
log_handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(log_handler)

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

app.include_router(authentication.router, prefix=f'{API_V1_PREFIX}{AUTH_PREFIX}')
app.include_router(users.router, prefix=f'{API_V1_PREFIX}')
app.include_router(hours.router, prefix=f'{API_V1_PREFIX}')
app.include_router(events.router, prefix=f'{API_V1_PREFIX}')
app.include_router(sponsors.router, prefix=f'{API_V1_PREFIX}')
app.include_router(board_members.router, prefix=f'{API_V1_PREFIX}')
app.include_router(banner.router, prefix=f'{API_V1_PREFIX}')

app.mount("/static", StaticFiles(directory="static"), name="static")

# Note: there is no scheduled cleanup of expired events. FastAPI startup events never run
# under Passenger (a2wsgi), so the old in-process scheduler never started. Past events are
# deliberately kept for now; app.internal.db.jobs.delete_expired_events() exists if a
# cPanel cron job is ever wanted.

# Runs under uvicorn (local development) only; production tables already exist.
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
    logger.info(f'Initialized server in {env} mode')
