from fastapi import FastAPI
from .routers import authentication, users

app = FastAPI()

app.include_router(authentication.router)
app.include_router(users.router)
