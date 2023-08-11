import os
from dotenv import load_dotenv

from fastapi import FastAPI
from .routers import authentication, users

app = FastAPI()

load_dotenv()
API_V1_PREFIX = os.getenv("API_V1_PREFIX")
AUTH_PREFIX = os.getenv("AUTH_PREFIX")

app.include_router(authentication.router, prefix=f'{API_V1_PREFIX}{AUTH_PREFIX}')
app.include_router(users.router, prefix=f'{API_V1_PREFIX}')
