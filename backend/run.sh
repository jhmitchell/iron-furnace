#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

source .venv/bin/activate

# Run the application with Uvicorn in production mode
nohup uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4 &