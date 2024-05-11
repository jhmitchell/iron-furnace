#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Dynamically source the virtual environment based on the VENV_PATH environment variable
source "${VENV_PATH}/bin/activate"

# Run the application with Uvicorn in development mode with reloading
uvicorn app.main:app --host 0.0.0.0 --port $PORT --reload
