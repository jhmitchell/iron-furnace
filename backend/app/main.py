import os
from dotenv import load_dotenv
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from .routers import authentication, users, hours, events
from .internal.db.session import get_db
from .internal.db.init import (create_users_table, 
                               create_hours_table, 
                               create_holidays_table, 
                               create_events_table, 
                               create_root_user)

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


@app.on_event("startup")
async def startup_event():
    logger.info("Initializing server...")

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

    logger.info(f'Initialized server in {env} mode')
