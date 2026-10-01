#!/usr/bin/env bash
# Rotates the backend's log files. Runs nightly from cron on the server:
#
#   17 3 * * * bash $HOME/backend/scripts/rotate_logs.sh
#
# Uses "copy + truncate": the running Python/Passenger processes keep their log files
# open in append mode, so compressing a copy and then emptying the file in place is safe
# with any number of processes and needs no restart. Archives go to ~/logs/archive/
# (outside the folders that deploys manage).
set -euo pipefail

MAX_BYTES=$((1024 * 1024)) # rotate files larger than 1 MB
KEEP=4                     # compressed copies to keep per log
ARCHIVE="$HOME/logs/archive"

rotate() {
  local file="$1" name i
  [ -f "$file" ] || return 0
  [ "$(stat -c %s "$file")" -ge "$MAX_BYTES" ] || return 0
  name="$(basename "$file")"
  mkdir -p "$ARCHIVE"
  rm -f "$ARCHIVE/$name.$KEEP.gz"
  for ((i = KEEP - 1; i >= 1; i--)); do
    if [ -f "$ARCHIVE/$name.$i.gz" ]; then mv -f "$ARCHIVE/$name.$i.gz" "$ARCHIVE/$name.$((i + 1)).gz"; fi
  done
  gzip -c "$file" > "$ARCHIVE/$name.1.gz"
  : > "$file"
}

rotate "$HOME/backend/app.log"   # the app's own log (LOG_FILE)
rotate "$HOME/logs/backend.log"  # Passenger's log for the app (stdout/stderr)
