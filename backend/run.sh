#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
