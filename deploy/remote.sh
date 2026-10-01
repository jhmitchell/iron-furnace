#!/usr/bin/env bash
# Runs ON THE PRODUCTION SERVER from inside an uploaded release:
#
#   bash ~/deploy/releases/<commit>/deploy/remote.sh dry-run
#
# A release directory contains:
#   frontend/   the built site (furnace-react/dist)  -> ~/public_html
#   backend/    the backend code                     -> ~/backend   (Passenger app root)
#   deploy/     these scripts
#   RELEASE     commit/build info
#
# Modes:
#   dry-run   Report exactly what a deploy would change. Changes nothing.
set -euo pipefail

MODE="${1:-}"
RELEASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LIVE_WEB="$HOME/public_html"
LIVE_API="$HOME/backend"
VENV="$HOME/virtualenv/backend/3.9"

# Paths deploys must never overwrite or delete. Excluded paths are neither
# transferred nor deleted by rsync.
WEB_EXCLUDES=(
  --exclude='/.htaccess'    # managed by cPanel: Passenger config, env vars, HTTPS redirect
  --exclude='/.well-known/' # SSL certificate validation
  --exclude='/cgi-bin/'     # cPanel default
  --exclude='/404.shtml'    # cPanel default error page
  --exclude='/static'       # reserved for serving uploads directly (future)
)
API_EXCLUDES=(
  --exclude='/static/'      # uploaded files: PRODUCTION DATA
  --exclude='/tmp/'         # Passenger (tmp/restart.txt)
  --exclude='/public/'      # cPanel Python app directory
  --exclude='/.env'
  --exclude='*.log'
  --exclude='__pycache__/'
)

die() { echo "ERROR: $*" >&2; exit 1; }

case "$MODE" in
  dry-run) ;;
  *) die "usage: remote.sh dry-run" ;;
esac

echo "Release: $(cat "$RELEASE/RELEASE" 2>/dev/null || echo unknown)"
echo "Mode:    $MODE"
echo

# --- Safety checks: refuse to run if anything looks unexpected ---------------
[ -f "$RELEASE/frontend/index.html" ]       || die "release has no frontend/index.html"
[ -f "$RELEASE/backend/app/main.py" ]       || die "release has no backend/app/main.py"
[ -f "$RELEASE/backend/passenger_wsgi.py" ] || die "release has no backend/passenger_wsgi.py"
[ -d "$LIVE_WEB" ] || die "$LIVE_WEB not found"
[ -d "$LIVE_API" ] || die "$LIVE_API not found"
[ -x "$VENV/bin/python" ] || die "Python virtualenv $VENV not found"
# Make sure Passenger really serves the backend from $LIVE_API (guards against
# deploying into a folder nothing uses).
grep -q "^PassengerAppRoot \"$LIVE_API\"" "$LIVE_WEB/.htaccess" \
  || die "PassengerAppRoot in $LIVE_WEB/.htaccess is not $LIVE_API"

# --- Report helpers -----------------------------------------------------------
# rsync itemized output: ">f+++++++++" = new file, ">fc........" = changed
# content, "*deleting" = would be deleted.
report_sync() {
  local label="$1" src="$2" dest="$3"; shift 3
  local out new changed deleted
  out="$(rsync -rlc --dry-run --itemize-changes --delete "$@" "$src" "$dest")"
  new="$(grep -E '^>f\+' <<<"$out" | awk '{print $2}' || true)"
  changed="$(grep -E '^>f[^+]' <<<"$out" | awk '{print $2}' || true)"
  deleted="$(grep -E '^\*deleting' <<<"$out" | awk '{print $2}' || true)"
  count() { [ -n "$1" ] && wc -l <<<"$1" || echo 0; }

  echo "=== $label: $dest"
  echo "  new files:            $(count "$new")"
  echo "  changed files:        $(count "$changed")"
  echo "  only on server:       $(count "$deleted")  (left in place; listed for later cleanup)"
  [ -n "$changed" ] && { echo "  -- changed:"; sed 's/^/     /' <<<"$changed"; }
  [ -n "$new" ]     && { echo "  -- new:";     sed 's/^/     /' <<<"$new"; }
  [ -n "$deleted" ] && { echo "  -- only on server:"; sed 's/^/     /' <<<"$deleted"; }
  echo
}

report_requirements() {
  echo "=== Python packages: $VENV"
  local installed missing=0
  installed="$("$VENV/bin/pip" freeze 2>/dev/null | tr 'A-Z_' 'a-z-')"
  while IFS= read -r req; do
    req="${req%%#*}"; req="$(tr -d '[:space:]' <<<"$req")"
    [ -z "$req" ] && continue
    if ! grep -qxF "$(tr 'A-Z_' 'a-z-' <<<"$req")" <<<"$installed"; then
      echo "  would install/change: $req"; missing=$((missing + 1))
    fi
  done < "$RELEASE/backend/requirements.txt"
  [ "$missing" -eq 0 ] && echo "  all requirements already installed at the pinned versions"
  echo
}

# --- Dry run ------------------------------------------------------------------
report_sync "Frontend" "$RELEASE/frontend/" "$LIVE_WEB/" "${WEB_EXCLUDES[@]}"
report_sync "Backend"  "$RELEASE/backend/"  "$LIVE_API/" "${API_EXCLUDES[@]}"
report_requirements
echo "Dry run complete. Nothing on the server was changed."
