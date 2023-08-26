import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import authentication, users, hours

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
