#!/bin/bash
set -euo pipefail

# Load environment variables from .env file if present
if [ -f .env ]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' .env | xargs)
fi

# Default VENV_PATH to local .venv if not provided
VENV_PATH=${VENV_PATH:-"$(pwd)/.venv"}

# Ensure virtual environment exists
if [ ! -d "$VENV_PATH" ]; then
  python3 -m venv "$VENV_PATH"
fi

# Activate virtual environment
source "$VENV_PATH/bin/activate"

# Ensure dependencies are installed if uvicorn is missing
if ! command -v uvicorn >/dev/null 2>&1; then
  pip install --upgrade pip
  if [ -f requirements.txt ]; then
    pip install -r requirements.txt
  fi
fi

# Run the application with Uvicorn in development mode with reloading
uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-3001}" --reload
