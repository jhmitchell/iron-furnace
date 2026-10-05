"""Recording what visitors do on the public site (sent by the site's tracker, see
furnace-react/src/features/stats/tracker.js).

Privacy: no cookies, nothing stored in the visitor's browser, no IP addresses kept. A visitor
is identified only within one day, by a hash of (daily random salt + IP address + browser).
The salt is deleted once the day is over, so hashes can't be linked across days or back to
an address.
"""
import hashlib
import logging
import re
import secrets
import threading
import time
from collections import deque
from datetime import datetime, timedelta
from typing import Deque, Dict, Optional

import pytz
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.internal.models.stats import StatsHit, StatsSalt
from . import bots, sources

logger = logging.getLogger(__name__)

LOCAL_TZ = pytz.timezone("US/Eastern")    # the museum's time zone: days start at local midnight
VISIT_GAP = timedelta(minutes=30)          # a new visit starts after 30 minutes without activity
MAX_ENGAGED_MS = 30 * 60 * 1000            # longer than 30 minutes on one page is not credible
KINDS = ("pageview", "outbound", "download", "contact")
ZONES = ("navbar", "footer", "banner", "page")

# Pages never counted: the admin dashboard and sign-in page (staff, not visitors).
EXCLUDED_PATH = re.compile(r"^/(admin|login|test)(/|$)")
VIEW_ID = re.compile(r"^[A-Za-z0-9_-]{8,16}$")

# Per-IP flood protection (in memory, per process): plenty for a person, cheap to enforce.
RATE_WINDOW_SECONDS = 10 * 60
RATE_MAX_HITS = 200
_rate_lock = threading.Lock()
_rate: Dict[str, Deque[float]] = {}


def local_day(when_utc: datetime):
    return pytz.utc.localize(when_utc).astimezone(LOCAL_TZ).date()


def allow(ip: Optional[str]) -> bool:
    """False when this IP address sent more than RATE_MAX_HITS in the last 10 minutes."""
    if not ip:
        return True
    now = time.monotonic()
    with _rate_lock:
        if len(_rate) > 20000:
            _rate.clear()
        hits = _rate.setdefault(ip, deque())
        while hits and hits[0] < now - RATE_WINDOW_SECONDS:
            hits.popleft()
        if len(hits) >= RATE_MAX_HITS:
            return False
        hits.append(now)
        return True


def clean_path(value: Optional[str]) -> Optional[str]:
    """Site path without query string, fragment or trailing slash; None if not a site path."""
    if not value or not value.startswith("/") or value.startswith("//"):
        return None
    path = re.split(r"[?#]", value, maxsplit=1)[0]
    path = re.sub(r"/{2,}", "/", path)
    if len(path) > 1:
        path = path.rstrip("/")
    return path[:255]


def clean_target(value: Optional[str]) -> Optional[str]:
    """Link address without query string or fragment (those can carry personal data)."""
    if not value:
        return None
    value = value.strip()
    if value.startswith(("mailto:", "tel:")):
        # Keep only the kind of link, not the address or number
        return value.split(":", 1)[0] + ":"
    return re.split(r"[?#]", value, maxsplit=1)[0][:255] or None


def clean_text(value: Optional[str], limit: int) -> Optional[str]:
    if not value:
        return None
    text = re.sub(r"\s+", " ", str(value)).strip()
    return text[:limit] or None


def daily_salt(db: Session, day) -> str:
    """The salt for `day`, created on first use. Salts of earlier days are deleted."""
    row = db.get(StatsSalt, day)
    if row:
        return row.salt
    try:
        db.query(StatsSalt).filter(StatsSalt.day < day).delete()
        db.add(StatsSalt(day=day, salt=secrets.token_hex(32)))
        db.commit()
    except IntegrityError:
        # Another process created it at the same moment
        db.rollback()
    return db.get(StatsSalt, day).salt


def visitor_hash(salt: str, ip: str, user_agent: str) -> str:
    return hashlib.sha256(f"{salt}|{ip}|{user_agent}".encode()).hexdigest()[:16]


def record(db: Session, payload: dict, ip: Optional[str], user_agent: Optional[str],
           own_host: Optional[str], now: Optional[datetime] = None) -> bool:
    """
    Store one tracker event. Returns False (and stores nothing) for bots, staff pages,
    malformed input, or floods. Never raises for bad input: the tracker ignores the answer.
    """
    if bots.is_bot(user_agent) or payload.get("bot"):
        return False
    kind = payload.get("kind")
    path = clean_path(payload.get("path"))
    if kind not in KINDS or path is None or EXCLUDED_PATH.match(path):
        return False
    if not allow(ip):
        return False

    now = now or datetime.utcnow()
    try:
        salt = daily_salt(db, local_day(now))
        visitor = visitor_hash(salt, ip or "", user_agent or "")
        hit = StatsHit(created_at=now, kind=kind, visitor=visitor, path=path, entry=False,
                       not_found=False, engaged_ms=0, interacted=False)

        if kind == "pageview":
            view_id = payload.get("id")
            hit.view_id = view_id if isinstance(view_id, str) and VIEW_ID.match(view_id) else None
            hit.not_found = bool(payload.get("notFound"))
            hit.viewport_w = _small(payload.get("width"))
            hit.viewport_h = _small(payload.get("height"))
            hit.device = bots.device(user_agent, hit.viewport_w)
            # The same page twice within 2 seconds is a double send, not a second view
            if (db.query(StatsHit.id)
                    .filter(StatsHit.visitor == visitor, StatsHit.kind == "pageview",
                            StatsHit.path == path, StatsHit.created_at > now - timedelta(seconds=2))
                    .first()):
                return False
            recent = (db.query(StatsHit.id)
                      .filter(StatsHit.visitor == visitor, StatsHit.created_at > now - VISIT_GAP)
                      .first())
            if recent is None:
                hit.entry = True
                utm = payload.get("utm") if isinstance(payload.get("utm"), dict) else {}
                hit.source, hit.referrer, hit.campaign = sources.classify(
                    path, clean_text(payload.get("referrer"), 1000), own_host,
                    clean_text(utm.get("source"), 100), clean_text(utm.get("medium"), 100),
                    clean_text(utm.get("campaign"), 100))
        else:
            hit.target = clean_target(payload.get("target"))
            if not hit.target:
                return False
            hit.label = clean_text(payload.get("label"), 100)
            zone = payload.get("zone")
            hit.zone = zone if zone in ZONES else "page"

        db.add(hit)
        db.commit()
        return True
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Could not record a stats hit")
        return False


def record_engagement(db: Session, view_id: Optional[str], engaged_ms, interacted=False) -> bool:
    """The browser reports how long a page view was actually in use, and whether the visitor
    touched, clicked, scrolled or typed (sent again, updated, each time the visitor switches
    away or moves on). Keeps the largest time reported; `interacted` never goes back to false."""
    ms = _int(engaged_ms)
    if not isinstance(view_id, str) or not VIEW_ID.match(view_id) or ms is None:
        return False
    ms = min(ms, MAX_ENGAGED_MS)
    values = {StatsHit.engaged_ms: func.greatest(StatsHit.engaged_ms, ms)}
    if interacted is True:
        values[StatsHit.interacted] = True
    try:
        updated = (db.query(StatsHit)
                   .filter(StatsHit.view_id == view_id,
                           StatsHit.created_at > datetime.utcnow() - timedelta(hours=12))
                   .update(values, synchronize_session=False))
        db.commit()
        return bool(updated)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Could not record engagement")
        return False


def _small(value) -> Optional[int]:
    number = _int(value)
    return number if number is not None and number < 32768 else None


def _int(value) -> Optional[int]:
    try:
        number = int(value)
    except (TypeError, ValueError):
        return None
    return number if 0 <= number < 10**9 else None
