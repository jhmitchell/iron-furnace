#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

source /home/p6qv8hi06h6k/virtualenv/pythonapp/3.9/bin/activate

# Run the application with Uvicorn in production mode
nohup uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 4 &