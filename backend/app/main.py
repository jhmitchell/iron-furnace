import os
from dotenv import load_dotenv
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import authentication, users, hours
from .internal.token import hash_password
from .internal.db.session import get_db
from .internal.db.users import create_user

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
origins = [client_url] if client_url else []  # Use an empty list if CLIENT_URL is not defined
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication.router, prefix=f'{API_V1_PREFIX}{AUTH_PREFIX}')
app.include_router(users.router, prefix=f'{API_V1_PREFIX}')
app.include_router(hours.router, prefix=f'{API_V1_PREFIX}')


@app.on_event("startup")
async def startup_event():
    logger.info("Initializing server...")
    # Get root user information from environment variables
    root_username = os.getenv("ROOT_USERNAME")
    root_first_name = os.getenv("ROOT_FIRST_NAME")
    root_last_name = os.getenv("ROOT_LAST_NAME")
    root_email = os.getenv("ROOT_EMAIL")
    root_password = os.getenv("ROOT_PASSWORD")

    hashed_password = hash_password(root_password)

    db = next(get_db())
    result = create_user(
        db,
        root_username,
        root_email,
        hashed_password,
        root_first_name,
        root_last_name,
        True
    )

    # Check the result and print the status
    if result['status'] == 'success':
        logger.info(f'Created root user {root_username}')
    
    logger.info(f'Initialized server in {env} mode')
