#!/usr/bin/env bash
# Runs once after the dev container is created.
set -euo pipefail
cd /workspace

# Frontend config (non-secret; same values production uses)
[ -f furnace-react/.env ] || cp furnace-react/.env.example furnace-react/.env

# Frontend dependencies go into the node_modules volume
(cd furnace-react && npm ci --no-audit --no-fund)

# The backend serves uploads from backend/static (gitignored)
mkdir -p backend/static/event_images backend/static/event_info backend/static/qr

echo
echo "Dev container ready. Start the app with the VS Code task 'Start: frontend + backend',"
echo "or in two terminals:  backend/run.sh   and   cd furnace-react && npm run dev"
