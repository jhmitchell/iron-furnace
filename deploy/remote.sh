#!/usr/bin/env bash
# Runs ON THE PRODUCTION SERVER from inside an uploaded release:
#
#   bash ~/deploy/releases/<commit>/deploy/remote.sh <mode> [snapshot]
#
# A release directory contains:
#   frontend/   the built site (furnace-react/dist)  -> ~/public_html
#   backend/    the backend code                     -> ~/backend   (Passenger app root)
#   deploy/     these scripts
#   RELEASE     commit/build info
#
# Modes:
#   dry-run    Report exactly what a deploy would change. Changes nothing.
#   deploy     Snapshot the live site, copy the release in (never deleting files),
#              install Python packages if requirements changed, restart Passenger,
#              health-check, and automatically roll back if the health check fails.
#   rollback   Restore a snapshot (default: the newest). The current state is
#              snapshotted first, so a rollback can itself be undone.
#
# Exit codes: 0 success, 1 failed (live site unchanged or restored), 2 ROLLBACK FAILED.
set -euo pipefail

MODE="${1:-}"
RELEASE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_ID="$(basename "$RELEASE")"

# Live locations. LIVE_WEB/LIVE_API/SNAPSHOTS/HISTORY are overridden ONLY for
# rehearsals against a scratch copy (see deploy/README.md).
LIVE_WEB="${LIVE_WEB:-$HOME/public_html}"
LIVE_API="${LIVE_API:-$HOME/backend}"
SNAPSHOTS="${SNAPSHOTS:-$HOME/deploy/snapshots}"
HISTORY="${HISTORY:-$HOME/deploy/history.log}"
HTACCESS="$HOME/public_html/.htaccess" # cPanel-managed; only read, never written
# The Python environment Passenger actually uses (e.g. ~/virtualenv/backend/3.11), read from
# the PassengerPython line, so deploys follow Python version changes made in cPanel.
PASSENGER_PYTHON="$(sed -n 's/^PassengerPython "\(.*\)"$/\1/p' "$HTACCESS" | head -1)"
VENV="$(dirname "$(dirname "$PASSENGER_PYTHON")")"
APP_ROOT_EXPECTED="${APP_ROOT_EXPECTED:-$LIVE_API}"
SITE_URL="https://cornwallironfurnace.org"
KEEP_SNAPSHOTS=5
REHEARSAL=false
[ "$LIVE_API" != "$HOME/backend" ] && REHEARSAL=true

# Paths deploys must never overwrite or delete. Excluded paths are neither
# transferred nor deleted by rsync (also not by rollbacks, which use --delete).
WEB_EXCLUDES=(
  --exclude='/.htaccess'    # managed by cPanel: Passenger config, env vars, HTTPS redirect
  --exclude='/.well-known/' # SSL certificate validation
  --exclude='/cgi-bin/'     # cPanel default
  --exclude='/404.shtml'    # cPanel default error page
  --exclude='/static'       # reserved for serving uploads directly (future)
)
API_EXCLUDES=(
  --exclude='/static'       # uploaded files: PRODUCTION DATA (a folder or a link to ~/uploads)
  --exclude='/tmp/'         # Passenger (tmp/restart.txt)
  --exclude='/public/'      # cPanel Python app directory
  --exclude='/.env'
  --exclude='*.log'
  --exclude='__pycache__/'
)

log() { echo "[$(date -u +%H:%M:%S)] $*"; }
die() { echo "ERROR: $*" >&2; exit 1; }
record() { mkdir -p "$(dirname "$HISTORY")"; echo "$(date -u +%FT%TZ)  $MODE  ${RELEASE_ID:0:12}  $*" >> "$HISTORY"; }

case "$MODE" in
  dry-run|deploy|rollback) ;;
  *) die "usage: remote.sh dry-run|deploy|rollback [snapshot]" ;;
esac

echo "Release: $(cat "$RELEASE/RELEASE" 2>/dev/null || echo unknown)"
echo "Mode:    $MODE$($REHEARSAL && echo '  (REHEARSAL against scratch copies)')"
echo "Python:  $VENV"
echo

# --- Safety checks: refuse to run if anything looks unexpected ---------------
[ -d "$LIVE_WEB" ] || die "$LIVE_WEB not found"
[ -d "$LIVE_API" ] || die "$LIVE_API not found"
[ -n "$PASSENGER_PYTHON" ] || die "no PassengerPython line in $HTACCESS"
[ -x "$VENV/bin/python" ] || die "Python virtualenv $VENV not found"
# Make sure Passenger really serves the backend from where we deploy it
# (guards against deploying into a folder nothing uses).
grep -q "^PassengerAppRoot \"$APP_ROOT_EXPECTED\"" "$HTACCESS" \
  || die "PassengerAppRoot in $HTACCESS is not $APP_ROOT_EXPECTED"
if [ "$MODE" != rollback ]; then
  [ -f "$RELEASE/frontend/index.html" ]       || die "release has no frontend/index.html"
  [ -f "$RELEASE/backend/app/main.py" ]       || die "release has no backend/app/main.py"
  [ -f "$RELEASE/backend/passenger_wsgi.py" ] || die "release has no backend/passenger_wsgi.py"
fi

# The main JS bundle an index.html loads (used to confirm the right site is live)
main_js() { grep -o 'assets/index-[^"]*\.js' "$1" | head -1 || true; }

# --- Python packages ------------------------------------------------------------
# Every Python environment of the app (e.g. .../backend/3.9 and .../backend/3.11). Pinned
# packages are installed into all of them, so the app works whichever one Passenger runs:
# after a Python version change in cPanel, Passenger can keep using the old environment
# until the host reloads its web server configuration.
ALL_VENVS=()
for v in "$(dirname "$VENV")"/*/; do
  v="${v%/}"; [ -x "$v/bin/pip" ] && ALL_VENVS+=("$v")
done

# Prints requirement lines that aren't installed at exactly the pinned version in
# environment $2 (default: $VENV).
missing_requirements() {
  local installed req venv="${2:-$VENV}"
  installed="$("$venv/bin/pip" freeze 2>/dev/null | tr 'A-Z_' 'a-z-')"
  while IFS= read -r req; do
    req="${req%%#*}"; req="$(tr -d '[:space:]' <<<"$req")"
    [ -z "$req" ] && continue
    grep -qxF "$(tr 'A-Z_' 'a-z-' <<<"$req")" <<<"$installed" || echo "$req"
  done < "$1"
}

# --- Dry run report ---------------------------------------------------------------
# rsync itemized output: ">f+++++++++" = new file, ">fc........" = changed
# content, "*deleting" = only on the server.
report_sync() {
  local label="$1" src="$2" dest="$3"; shift 3
  local out new changed deleted
  out="$(rsync -rlc --dry-run --itemize-changes --delete "$@" "$src" "$dest")"
  new="$(grep -E '^>f\+' <<<"$out" | awk '{print $2}' || true)"
  changed="$(grep -E '^>f[^+]' <<<"$out" | awk '{print $2}' || true)"
  deleted="$(grep -E '^\*deleting' <<<"$out" | awk '{print $2}' || true)"
  count() { if [ -n "$1" ]; then wc -l <<<"$1"; else echo 0; fi; }

  echo "=== $label: $dest"
  echo "  new files:            $(count "$new")"
  echo "  changed files:        $(count "$changed")"
  echo "  only on server:       $(count "$deleted")  (left in place; listed for later cleanup)"
  if [ -n "$changed" ]; then echo "  -- changed:"; sed 's/^/     /' <<<"$changed"; fi
  if [ -n "$new" ]; then echo "  -- new:"; sed 's/^/     /' <<<"$new"; fi
  if [ -n "$deleted" ]; then echo "  -- only on server:"; sed 's/^/     /' <<<"$deleted"; fi
  echo
}

dry_run() {
  report_sync "Frontend" "$RELEASE/frontend/" "$LIVE_WEB/" "${WEB_EXCLUDES[@]}"
  report_sync "Backend"  "$RELEASE/backend/"  "$LIVE_API/" "${API_EXCLUDES[@]}"
  local v missing
  for v in "${ALL_VENVS[@]}"; do
    echo "=== Python packages: $v$([ "$v" = "$VENV" ] && echo '  (configured in .htaccess)')"
    missing="$(missing_requirements "$RELEASE/backend/requirements.txt" "$v")"
    if [ -n "$missing" ]; then sed 's/^/  would install: /' <<<"$missing"
    else echo "  all requirements already installed at the pinned versions"; fi
  done
  echo
  echo "Dry run complete. Nothing on the server was changed."
}

# --- Snapshots --------------------------------------------------------------------
# Copies everything a deploy may change (not the excluded paths) and verifies the copy.
take_snapshot() {
  local label="$1" dir
  dir="$SNAPSHOTS/$(date -u +%Y%m%dT%H%M%SZ)-$label"
  mkdir -p "$dir"
  rsync -a "${WEB_EXCLUDES[@]}" "$LIVE_WEB/" "$dir/public_html/"
  rsync -a "${API_EXCLUDES[@]}" "$LIVE_API/" "$dir/backend/"
  "$VENV/bin/pip" freeze > "$dir/pip-freeze.txt"
  # Verify: the snapshot must be identical to the live files
  if [ -n "$(rsync -rlcn --delete --itemize-changes "${WEB_EXCLUDES[@]}" "$LIVE_WEB/" "$dir/public_html/")" ] ||
     [ -n "$(rsync -rlcn --delete --itemize-changes "${API_EXCLUDES[@]}" "$LIVE_API/" "$dir/backend/")" ]; then
    die "snapshot $dir does not match the live files; aborting before any change"
  fi
  echo "$dir"
}

prune_snapshots() {
  local old
  old="$(find "$SNAPSHOTS" -mindepth 1 -maxdepth 1 -type d -name '20*' | sort | head -n -"$KEEP_SNAPSHOTS")"
  [ -n "$old" ] && xargs -r rm -rf -- <<<"$old"
  return 0
}

# Restores a snapshot exactly (files added since the snapshot are removed;
# excluded paths are never touched).
restore_snapshot() {
  local dir="$1"
  # Never restore from an incomplete snapshot: --delete would remove live files.
  [ -f "$dir/public_html/index.html" ] && [ -f "$dir/backend/app/main.py" ] \
    && [ -f "$dir/backend/passenger_wsgi.py" ] || { echo "snapshot $dir is incomplete; NOT restoring"; return 1; }
  rsync -a --delete "${API_EXCLUDES[@]}" "$dir/backend/" "$LIVE_API/" || return 1
  rsync -a --delete "${WEB_EXCLUDES[@]}" "$dir/public_html/" "$LIVE_WEB/" || return 1
  if $REHEARSAL; then
    log "rehearsal: skipping Python package restore"
    return 0
  fi
  # (No <(...) process substitution: CloudLinux CageFS has no /dev/fd.)
  local now; now="$(mktemp)"
  "$VENV/bin/pip" freeze > "$now"
  if ! cmp -s "$now" "$dir/pip-freeze.txt"; then
    log "restoring Python packages from snapshot"
    "$VENV/bin/pip" install --quiet -r "$dir/pip-freeze.txt" || { rm -f "$now"; return 1; }
  fi
  rm -f "$now"
}

# --- Deploy steps -----------------------------------------------------------------
restart_backend() {
  mkdir -p "$LIVE_API/tmp" && touch "$LIVE_API/tmp/restart.txt"
}

# Waits up to ~2 minutes for the site and API to respond, and checks that the
# homepage is the expected build.
health_check() {
  local expected_js="$1" i home
  if $REHEARSAL && [ "${FORCE_HEALTH_FAIL:-}" = 1 ]; then
    FORCE_HEALTH_FAIL=0 # only the first check fails, so the rollback's check is real
    log "rehearsal: simulating a failed health check"; return 1
  fi
  for i in $(seq 1 40); do
    if home="$(curl -fsS --max-time 15 "$SITE_URL/" 2>/dev/null)" &&
       grep -qF "$expected_js" <<<"$home" &&
       curl -fsS --max-time 15 -o /dev/null "$SITE_URL/$expected_js" &&
       curl -fsS --max-time 30 -o /dev/null "$SITE_URL/api/v1/hours/status" &&
       curl -fsS --max-time 30 -o /dev/null "$SITE_URL/api/v1/events"; then
      log "health check passed (attempt $i): homepage serves $expected_js; API responds"
      return 0
    fi
    sleep 3
  done
  log "health check FAILED after $i attempts"
  return 1
}

apply_release() {
  local v missing
  for v in "${ALL_VENVS[@]}"; do
    missing="$(missing_requirements "$RELEASE/backend/requirements.txt" "$v")"
    if [ -z "$missing" ]; then
      log "Python packages ($(basename "$v")): no changes"
    elif $REHEARSAL; then
      log "rehearsal: would install into $(basename "$v"): $(tr '\n' ' ' <<<"$missing")"
    else
      log "installing Python packages into $(basename "$v"): $(tr '\n' ' ' <<<"$missing")"
      "$v/bin/pip" install --quiet --disable-pip-version-check -r "$RELEASE/backend/requirements.txt" || return 1
    fi
  done

  log "copying backend (no deletions)"
  rsync -rlc --chmod=D755,F644 --delay-updates --itemize-changes "${API_EXCLUDES[@]}" \
    "$RELEASE/backend/" "$LIVE_API/" | sed 's/^/    /' || return 1
  log "copying frontend assets (no deletions)"
  rsync -rlc --chmod=D755,F644 --delay-updates --itemize-changes "${WEB_EXCLUDES[@]}" --exclude='/index.html' \
    "$RELEASE/frontend/" "$LIVE_WEB/" | sed 's/^/    /' || return 1
  # index.html last, so it only ever references assets that are already in place
  log "switching index.html"
  rsync -rlc --chmod=F644 --itemize-changes "$RELEASE/frontend/index.html" "$LIVE_WEB/index.html" \
    | sed 's/^/    /' || return 1
  log "restarting backend (Passenger)"
  restart_backend
}

# Restore a snapshot after a failed deploy/rollback and verify the site is healthy.
recover() {
  local snap="$1"
  log "RESTORING snapshot $(basename "$snap")"
  if restore_snapshot "$snap" && restart_backend && health_check "$(main_js "$snap/public_html/index.html")"; then
    log "restored: the site is back to the snapshot"
    record "FAILED, restored $(basename "$snap")"
    exit 1
  fi
  log "!!! ROLLBACK FAILED. Restore manually from $snap or the off-server backup."
  record "FAILED, ROLLBACK FAILED ($snap)"
  exit 2
}

# --- Main -------------------------------------------------------------------------
if [ "$MODE" = dry-run ]; then dry_run; exit 0; fi

# One deploy/rollback at a time
exec 9>"$HOME/deploy/.lock"
flock -n 9 || die "another deploy is running"

if [ "$MODE" = deploy ]; then
  expected_js="$(main_js "$RELEASE/frontend/index.html")"
  [ -n "$expected_js" ] && [ -f "$RELEASE/frontend/$expected_js" ] || die "release index.html has no main JS bundle"

  log "snapshotting the live site"
  snap="$(take_snapshot "before-${RELEASE_ID:0:7}")"
  log "snapshot: $snap (verified)"

  if apply_release && health_check "$expected_js"; then
    record "OK"
    prune_snapshots
    log "DEPLOYED ${RELEASE_ID:0:7}. Previous version kept in $(basename "$snap")"
    exit 0
  fi
  log "deploy failed"
  recover "$snap"
fi

if [ "$MODE" = rollback ]; then
  target="${2:-}"
  if [ -n "$target" ]; then target="$SNAPSHOTS/$target"
  else target="$(find "$SNAPSHOTS" -mindepth 1 -maxdepth 1 -type d -name '20*' | sort | tail -1)"; fi
  [ -n "$target" ] && [ -d "$target" ] || die "no snapshot to roll back to"

  log "snapshotting the current state first (so this rollback can be undone)"
  current="$(take_snapshot "before-rollback")"
  log "rolling back to $(basename "$target")"
  if restore_snapshot "$target" && restart_backend && health_check "$(main_js "$target/public_html/index.html")"; then
    record "OK, restored $(basename "$target")"
    log "ROLLED BACK to $(basename "$target"). Previous state kept in $(basename "$current")"
    exit 0
  fi
  log "rollback failed"
  recover "$current"
fi
