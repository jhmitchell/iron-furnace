import json
import logging
import os
from datetime import datetime, timedelta
from typing import Optional
from urllib.parse import urlsplit

from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session

from app.internal.db.session import get_db
from app.internal.stats import collect, logs, report, server
from app.internal.token import authorize

logger = logging.getLogger(__name__)

router = APIRouter()

MAX_BODY_BYTES = 4096
RANGES = {"7d": 7, "30d": 30, "90d": 90, "12m": 365}


def _client_ip(request: Request) -> Optional[str]:
    # Under Passenger, a2wsgi fills request.client from REMOTE_ADDR
    return request.client.host if request.client else None


def _same_site(request: Request) -> bool:
    """Only count events sent by pages of this site (browsers always send these headers
    with sendBeacon/fetch; requests forged from elsewhere or by scripts usually don't match)."""
    if request.headers.get("sec-fetch-site", "same-origin") not in ("same-origin", "same-site"):
        return False
    origin = request.headers.get("origin")
    if origin:
        # The site's own address; in development the Vite proxy changes Host, so the
        # configured CLIENT_URL is accepted too
        allowed = {request.headers.get("host", ""), urlsplit(os.getenv("CLIENT_URL") or "").netloc}
        return urlsplit(origin).netloc in allowed - {""}
    return True


def _opted_out(request: Request) -> bool:
    """Do Not Track and Global Privacy Control are respected: nothing is recorded."""
    return request.headers.get("dnt") == "1" or request.headers.get("sec-gpc") == "1"


async def _payload(request: Request) -> Optional[dict]:
    body = await request.body()
    if not body or len(body) > MAX_BODY_BYTES:
        return None
    try:
        data = json.loads(body)
    except ValueError:
        return None
    return data if isinstance(data, dict) else None


# Public: the site's tracker. The body is sent as text/plain JSON (navigator.sendBeacon), and
# the answer is always 204, so the response says nothing about what was counted.
@router.post("/stats/hit", status_code=204, include_in_schema=False)
async def stats_hit(request: Request, db: Session = Depends(get_db)):
    payload = await _payload(request)
    if payload and _same_site(request) and not _opted_out(request):
        # Database work runs in a worker thread, like the plain `def` endpoints
        await run_in_threadpool(collect.record, db, payload, _client_ip(request),
                                request.headers.get("user-agent"), request.headers.get("host", "").split(":")[0])
    return Response(status_code=204)


@router.post("/stats/engage", status_code=204, include_in_schema=False)
async def stats_engage(request: Request, db: Session = Depends(get_db)):
    payload = await _payload(request)
    if payload and _same_site(request) and not _opted_out(request):
        await run_in_threadpool(collect.record_engagement, db, payload.get("id"), payload.get("ms"),
                                payload.get("interacted"))
    return Response(status_code=204)


def _range(range_: str, today):
    if range_ not in RANGES:
        raise HTTPException(status_code=400, detail=f"range must be one of {', '.join(RANGES)}")
    days = RANGES[range_]
    return today - timedelta(days=days - 1), today


@router.get("/stats/report")
def stats_report(range: str = "30d", filter: Optional[str] = None,
                 db: Session = Depends(get_db), current_user: dict = Depends(authorize)):
    """
    Everything the admin Stats page shows for the last `range` (7d, 30d, 90d or 12m, ending
    today), compared with the period before. `filter` limits the visit numbers to visits
    that viewed a page, came from a source, or used a device: "page:/visit",
    "source:Search", "device:phone".
    """
    today = datetime.now(collect.LOCAL_TZ).date()
    start, end = _range(range, today)
    key = value = None
    if filter:
        key, _, value = filter.partition(":")
        if key not in report.FILTERS or not value:
            raise HTTPException(status_code=400, detail="filter must look like page:/path, source:Name or device:phone")
    # Count any finished days of server logs that aren't in the database yet (fast when
    # there are none; at most every 15 minutes)
    logs.update(db, today)
    return report.build(db, start, end, key, value, today)


@router.get("/stats/health")
def stats_health(request: Request, refresh: bool = False, current_user: dict = Depends(authorize)):
    """Hosting health: disk, memory and other limits, HTTPS certificate, deploys, errors."""
    return server.health(request.headers.get("host", "").split(":")[0] or None, refresh)
