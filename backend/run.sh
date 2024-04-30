#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

source .venv/bin/activate

# Run the application with Gunicorn in production mode
gunicorn app.main:app --bind 0.0.0.0:$PORT --workers 4 --daemon
