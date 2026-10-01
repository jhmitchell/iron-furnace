# Deployment

Production runs on GoDaddy cPanel shared hosting:

| What | Where on the server | Managed by |
|---|---|---|
| Built frontend (React) | `~/public_html/` | this deploy |
| Backend code (FastAPI) | `~/backend/` (Passenger app root) | this deploy |
| Python packages | `~/virtualenv/backend/3.9/` | cPanel *Setup Python App* |
| Backend settings and secrets | cPanel *Setup Python App* → environment variables (written into `~/public_html/.htaccess`) | cPanel, by hand |
| Uploaded files (event images, PDFs, QR PDFs) | `~/backend/static/` | the admin dashboard; **production data** |
| Database | MariaDB `cornwall` | the app; cPanel *MySQL Databases* |

How Passenger runs the backend: it loads `backend/passenger_wsgi.py` (the startup file set in
cPanel *Setup Python App*), which wraps the FastAPI app (`app/main.py`) with `a2wsgi`, because
FastAPI is an ASGI app and Passenger only speaks WSGI.

## How a deploy works

The [GitHub Actions workflow](../.github/workflows/deploy.yml) runs on every push and PR:

1. **Build frontend** on Node 22 (`npm ci && npm run build`).
2. **Smoke-test backend** on Python 3.9 + MariaDB 10.11: loads the app exactly like Passenger
   does and requests a few API endpoints ([`smoke_test.py`](smoke_test.py)).
3. **Deploy** (pushes to `main` and manual runs only), only if 1 and 2 pass:
   uploads the release to `~/deploy/releases/<commit>/` on the server (not live), then runs
   [`remote.sh`](remote.sh) there.

`remote.sh` refuses to run unless the release and server look as expected — including
checking that Passenger really serves the backend from `~/backend`.

### Modes

| Mode | Effect |
|---|---|
| `dry-run` | Reports what would be added/changed in `public_html` and `backend`, which files exist only on the server, and which Python packages would change. **Changes nothing live.** |
| `deploy` | 1. Snapshots everything a deploy may change into `~/deploy/snapshots/` and verifies the copy. 2. Installs Python packages only if `requirements.txt` changed. 3. Copies the backend, then the frontend assets, then `index.html` last (never deletes files). 4. Restarts Passenger. 5. Health check (up to ~2 min): the homepage must serve the new build and the API must respond. **If anything fails, the snapshot is restored automatically** and re-checked. |
| `rollback` | Restores a snapshot (default: the newest, i.e. the version before the last deploy). The current state is snapshotted first, so a rollback can itself be undone. |

The last 5 snapshots and 5 uploaded releases are kept. Only one deploy/rollback can run at a time.

### Never touched by a deploy or rollback

- `public_html/.htaccess` (cPanel-managed: Passenger config, environment variables, HTTPS redirect)
- `public_html/.well-known/`, `cgi-bin/`, `404.shtml`, `static`
- `backend/static/` (uploads), `backend/tmp/`, `backend/public/`, `backend/.env`, `*.log`
- the database, and the Python virtualenv (except installing pinned requirements)

### Running it manually

GitHub → **Actions** → **Build and deploy** → **Run workflow** → choose the branch (`main`)
and the mode. To roll back, choose `rollback` and optionally a snapshot name from
`~/deploy/snapshots/` (empty = the version before the last deploy).

## Where to see what happened

| Where | What |
|---|---|
| GitHub → **Actions** tab → a run → **Summary** | The full **server report** for that run (what changed, health check, rollback if any) and the exit code. A red ❌ on a commit or in the Actions list means something failed; the error message says whether the site was left unchanged/restored. |
| GitHub email | Failed runs email whoever pushed/triggered them (GitHub → *Settings* → *Notifications* → *Actions*). |
| `README.md` badge | Green/red status of the latest run on `main`. |
| Server `~/deploy/history.log` | One line per deploy/rollback: time, mode, commit, result. |
| Server `~/deploy/last-report.txt` | The latest server report (same text as in GitHub). |
| Server `~/deploy/snapshots/` | The previous versions you can roll back to. |

Exit codes: `0` success · `1` didn't go through, live site unchanged or restored ·
`2` **automatic rollback failed** (run `rollback`, or restore the off-server backup) ·
`255` SSH connection lost (the deploy still finishes on the server; check the files above).

## Rehearsing changes to `remote.sh`

Before changing how deploys work, rehearse against scratch copies on the server. These
overrides make `remote.sh` operate on copies (Python packages are never touched in a
rehearsal, and `FORCE_HEALTH_FAIL=1` simulates a failed health check to exercise the rollback):

```bash
R=~/deploy/rehearsal
rsync -a --exclude=/.htaccess ~/public_html/ $R/public_html/ && rsync -a ~/backend/ $R/backend/
LIVE_WEB=$R/public_html LIVE_API=$R/backend SNAPSHOTS=$R/snapshots HISTORY=$R/history.log \
  APP_ROOT_EXPECTED=$HOME/backend bash <release>/deploy/remote.sh deploy
rm -rf $R
```

## One-time setup

The workflow connects with a dedicated SSH key:

1. **cPanel** → *Security* → *SSH Access* → *Manage SSH Keys* → *Import Key*: paste the
   **public** key into *Public Key* (leave *Private Key* and *Passphrase* empty), then
   *Manage* → *Authorize*.
2. **GitHub** → repo *Settings* → *Secrets and variables* → *Actions* → *New repository secret*:
   name `DEPLOY_SSH_KEY`, value = the **private** key (the whole file, including the
   `-----BEGIN`/`END` lines).

To revoke: delete or deauthorize the key in cPanel and delete the GitHub secret.
