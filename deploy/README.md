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

How Passenger runs the backend: `passenger_wsgi.py` → `wsgi.py` → `app/main.py`.
FastAPI is an ASGI app and Passenger only speaks WSGI, so `wsgi.py` wraps it with `a2wsgi`.

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

Real deploys (with a pre-deploy snapshot, health check and automatic rollback) will be
added as a separate mode after the dry runs have been reviewed.

### Never touched by a deploy

- `public_html/.htaccess` (cPanel-managed: Passenger config, environment variables, HTTPS redirect)
- `public_html/.well-known/`, `cgi-bin/`, `404.shtml`, `static`
- `backend/static/` (uploads), `backend/tmp/`, `backend/public/`, `backend/.env`, `*.log`

### Running it manually

GitHub → **Actions** → **Build and deploy** → **Run workflow** → choose the mode.
The server report appears in the run's summary page.

## One-time setup

The workflow connects with a dedicated SSH key:

1. **cPanel** → *Security* → *SSH Access* → *Manage SSH Keys* → *Import Key*: paste the
   **public** key into *Public Key* (leave *Private Key* and *Passphrase* empty), then
   *Manage* → *Authorize*.
2. **GitHub** → repo *Settings* → *Secrets and variables* → *Actions* → *New repository secret*:
   name `DEPLOY_SSH_KEY`, value = the **private** key (the whole file, including the
   `-----BEGIN`/`END` lines).

To revoke: delete or deauthorize the key in cPanel and delete the GitHub secret.
