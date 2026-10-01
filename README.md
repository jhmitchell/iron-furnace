# Iron Furnace

[![Build and deploy](https://github.com/jhmitchell/iron-furnace/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/jhmitchell/iron-furnace/actions/workflows/deploy.yml)

Website for the [Cornwall Iron Furnace](https://cornwallironfurnace.org) in Cornwall, PA.

| Part | Tech | Folder |
|---|---|---|
| Frontend | React + Vite | `furnace-react/` |
| Backend API | Python FastAPI + SQLAlchemy | `backend/` |
| Database | MariaDB (MySQL) | — |
| Hosting | GoDaddy cPanel (Apache + Passenger) | — |

## Local development (dev container)

Everything runs in Docker, so the setup is the same on Windows, macOS and Linux and
matches production (Python 3.9, Node 22, MariaDB 10.11).

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/),
[VS Code](https://code.visualstudio.com/) and its
[Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

1. Clone the repo and open the folder in VS Code.
2. Click **Reopen in Container** when prompted (or run *Dev Containers: Reopen in Container*).
   The first build takes a few minutes.
3. Run the task **Start: frontend + backend** (*Terminal → Run Task…*), or in two terminals:
   ```bash
   backend/run.sh                     # API on http://localhost:3001
   cd furnace-react && npm run dev    # site on http://localhost:3000
   ```
4. Open http://localhost:3000. Sign in at `/login` (admin dashboard at `/admin`) with one of the local test accounts
   defined in [`.devcontainer/docker-compose.yml`](.devcontainer/docker-compose.yml).

Notes:
- Saving a file reloads the site automatically (backend changes take a few seconds to be picked up).
- After changing `backend/requirements.txt`, run *Dev Containers: Rebuild Container*.
- The local database lives in a Docker volume and persists between sessions. It is reachable
  from host tools at `127.0.0.1:3307` (credentials in `docker-compose.yml`).
- To load a production database dump into the local database (from the repo root, on the host):
  ```bash
  docker compose -f .devcontainer/docker-compose.yml exec -T db mariadb -u root -pdevroot cornwall < path/to/dump.sql
  ```
- Uploaded files are stored in `backend/static/` (gitignored).

## Deployment

Pushing to `main` builds, tests and deploys automatically via GitHub Actions, with a
snapshot, health check and automatic rollback. Never build or copy files on the server by
hand. Details, manual runs/rollbacks and where to see reports: [deploy/README.md](deploy/README.md).
