"""Hosting health for the admin Stats page, from sources the host provides for this account:
cPanel's own usage report (`uapi ResourceUsage get_usages`, the numbers cPanel shows under
"Statistics"), the HTTPS certificate, the deploy history and the app's own log.

Every source is optional: anything that can't be read (e.g. in local development) is
reported as unavailable instead of failing the page. Results are cached for a few minutes.
"""
import json
import logging
import os
import re
import socket
import ssl
import subprocess
import threading
import time
from datetime import datetime, timedelta, timezone
from typing import Optional
from urllib.parse import urlsplit

logger = logging.getLogger(__name__)

CACHE_SECONDS = 10 * 60
_cache = {"at": 0.0, "value": None}
_lock = threading.Lock()

# cPanel usage ids -> (label, unit). Shown in this order.
RESOURCES = [
    ("disk_usage", "Disk space", "bytes"),
    ("filesusage", "Files", "count"),
    ("cachedmysqldiskusage", "Database size", "bytes"),
    ("lvememphy", "Memory in use", "bytes"),
    ("lvecpu", "CPU", "percent"),
    ("lveep", "Simultaneous requests", "count"),
    ("lvenproc", "Processes", "count"),
    ("bandwidth", "Data sent this month", "bytes"),
]


def _level(used, limit, warn=0.7, bad=0.9) -> str:
    if not limit:
        return "ok"
    share = used / limit
    return "bad" if share >= bad else "warn" if share >= warn else "ok"


def resources() -> Optional[list]:
    try:
        output = subprocess.run(["uapi", "--output=json", "ResourceUsage", "get_usages"],
                                capture_output=True, text=True, timeout=15, check=True).stdout
        data = {row["id"]: row for row in json.loads(output)["result"]["data"]}
    except (OSError, subprocess.SubprocessError, ValueError, KeyError, TypeError):
        return None
    result = []
    for key, label, unit in RESOURCES:
        row = data.get(key)
        if not row:
            continue
        try:
            used = float(row.get("usage") or 0)
            limit = float(row["maximum"]) if row.get("maximum") not in (None, "", "0", 0) else None
        except (TypeError, ValueError):
            continue
        result.append({"id": key, "label": label, "unit": unit, "used": used, "limit": limit,
                       "level": _level(used, limit)})
    return result


def folder_size(path: str) -> Optional[int]:
    if not os.path.isdir(path):
        return None
    total = 0
    for root, _dirs, files in os.walk(path, followlinks=True):
        for name in files:
            try:
                total += os.path.getsize(os.path.join(root, name))
            except OSError:
                pass
    return total


def certificate(host: Optional[str]) -> Optional[dict]:
    """When the site's HTTPS certificate expires."""
    if not host or host in ("localhost", "127.0.0.1"):
        return None
    try:
        context = ssl.create_default_context()
        with socket.create_connection((host, 443), timeout=8) as sock:
            with context.wrap_socket(sock, server_hostname=host) as tls:
                not_after = tls.getpeercert()["notAfter"]
        expires = datetime.fromtimestamp(ssl.cert_time_to_seconds(not_after), tz=timezone.utc)
    except (OSError, ssl.SSLError, KeyError, ValueError):
        return None
    days = (expires - datetime.now(timezone.utc)).days
    return {"expires": expires.isoformat(), "days_left": days,
            "level": "bad" if days < 7 else "warn" if days < 21 else "ok"}


def deploys(path: str, limit: int = 5) -> Optional[list]:
    """Recent deploys from deploy/remote.sh's history log: '<time>  <mode>  <commit>  <result>'."""
    try:
        with open(path, encoding="utf-8", errors="replace") as handle:
            lines = handle.readlines()[-limit:]
    except OSError:
        return None
    result = []
    for line in reversed(lines):
        parts = line.split(None, 3)
        if len(parts) == 4:
            when, mode, commit, outcome = parts
            result.append({"at": when, "mode": mode, "commit": commit[:7], "result": outcome.strip(),
                           "ok": outcome.strip().startswith("OK")})
    return result


ERROR_LINE = re.compile(r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}),\d+ (ERROR|CRITICAL) (\S+): (.*)")


def app_errors(path: Optional[str]) -> Optional[dict]:
    """Errors the backend logged in the last 7 days (app.log uses the server's local time)."""
    if not path:
        return None
    since = datetime.now() - timedelta(days=7)
    day_ago = datetime.now() - timedelta(days=1)
    week = day = 0
    recent = []
    try:
        with open(path, encoding="utf-8", errors="replace") as handle:
            for line in handle:
                m = ERROR_LINE.match(line)
                if not m:
                    continue
                at = datetime.strptime(m.group(1), "%Y-%m-%d %H:%M:%S")
                if at < since:
                    continue
                week += 1
                day += at >= day_ago
                recent.append({"at": m.group(1), "message": m.group(4)[:200]})
    except OSError:
        return None
    return {"last_24h": day, "last_7d": week, "recent": recent[-5:][::-1],
            "level": "warn" if day else "ok"}


def collect(site_host: Optional[str]) -> dict:
    home = os.path.expanduser("~")
    site = urlsplit(os.getenv("CLIENT_URL") or "").hostname or site_host
    uploads = os.getenv("STATS_UPLOADS_DIR") or os.path.join(os.getcwd(), "static")
    return {
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "resources": resources(),
        "uploads_bytes": folder_size(uploads),
        "certificate": certificate(site),
        "deploys": deploys(os.getenv("STATS_DEPLOY_HISTORY") or os.path.join(home, "deploy", "history.log")),
        "errors": app_errors(os.getenv("LOG_FILE")),
    }


def health(site_host: Optional[str] = None, refresh: bool = False) -> dict:
    """site_host: the site's host name (for the certificate check) when CLIENT_URL isn't set."""
    with _lock:
        if refresh or _cache["value"] is None or time.monotonic() - _cache["at"] > CACHE_SECONDS:
            _cache["value"] = collect(site_host)
            _cache["at"] = time.monotonic()
        return _cache["value"]
