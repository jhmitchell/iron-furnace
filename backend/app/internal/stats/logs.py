"""Daily totals from the web server's access logs: how much of the traffic is people, and
which bots make up the rest.

cPanel writes Apache's logs to ~/access-logs/<domain>[-ssl_log] (recent requests) and moves
them into monthly archives, ~/logs/<domain>[-ssl_log]-<Mon>-<YYYY>.gz. Every finished day
that isn't stored yet is counted once and saved in stats_log_daily; the raw logs are never
copied or kept by this code.

How each request is classified (per day, per IP address and kind of user agent):

  scanner  asked for attack paths (.php, /.env, /wp-admin, ...) or is a known security scanner
  bot      says it is a bot / script in its user agent (Googlebot, GPTBot, curl, ...)
  human    likely a person: a browser that loaded a page, ran the site's JavaScript (which
           calls /api/v1/ on every page), and stayed 5+ seconds or opened a second page
  scraper  "unverified": claims to be a browser but doesn't meet that bar (never ran the
           site, only called the API, or left within seconds, as headless bots do)

Logs can't prove a visitor is a person; the site's own tracker (collect.py) can, and is
what the rest of the Stats page uses. When these rules change, bump CLASSIFIER_VERSION and
every stored day is counted again from the logs that are still available.
"""
import gzip
import logging
import os
import re
import threading
import time
from functools import lru_cache
from collections import Counter, defaultdict
from datetime import date, datetime, timedelta
from glob import glob
from typing import Dict, Iterable, List, Optional, Set

from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.internal.models.stats import StatsHit, StatsLogDaily
from . import bots
from .collect import LOCAL_TZ

logger = logging.getLogger(__name__)

LINE = re.compile(r'^(\S+) \S+ \S+ \[([^\]]+)\] "(?:(\S+) (\S+)[^"]*|[^"]*)" (\d{3}) (\S+) "[^"]*" "([^"]*)"')
MONTHS = {m: i for i, m in enumerate(
    ("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"), start=1)}
# A page of the site (not the API, a built asset, an upload, or a file)
PAGE_PATH = re.compile(r"^/(?!api/|assets/|static/)[^.]*$")
ARCHIVE_NAME = re.compile(r"-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{4})\.gz$")

CLASSES = ("human", "bot", "scanner", "scraper")
HITS_RETENTION = timedelta(days=760)   # raw tracker events: a little over two years
MIN_INTERVAL_SECONDS = 15 * 60          # don't re-check the logs more often than this
CLASSIFIER_VERSION = 2                  # bump when the classification rules change
HUMAN_MIN_SECONDS = 5
META_DAY = date(1970, 1, 1)             # stats_log_daily row holding CLASSIFIER_VERSION
RETRY_DAYS = 400                        # missing days older than this are given up on
_lock = threading.Lock()
_last_run = 0.0


def log_dirs() -> List[str]:
    configured = os.getenv("STATS_LOG_DIRS")
    dirs = configured.split(os.pathsep) if configured else ["~/logs", "~/access-logs"]
    return [os.path.expanduser(d) for d in dirs if d]


def log_files(months: Set[tuple]) -> List[str]:
    """Monthly archives (<domain>[-ssl_log]-<Mon>-<YYYY>.gz) for the given (year, month)s,
    plus the current logs: every plain file in a directory named access-logs."""
    files = []
    for directory in log_dirs():
        live = os.path.basename(os.path.normpath(directory)) == "access-logs"
        for path in sorted(glob(os.path.join(directory, "*"))):
            name = os.path.basename(path)
            if not os.path.isfile(path) or name.startswith(".") or name.endswith((".bkup", ".offset")):
                continue
            match = ARCHIVE_NAME.search(name)
            if match:
                if (int(match.group(2)), MONTHS[match.group(1)]) in months:
                    files.append(path)
            elif live and not re.search(r"\.(gz|bz2|zip|log|\d+)$", name):
                files.append(path)
    return files


def parse_time(value: str) -> Optional[date]:
    """Local (museum) day of an Apache timestamp like 04/Oct/2026:16:13:01 -0700."""
    # The day only depends on the date, the hour and the offset: cache on those
    return _local_day(value[:14], value[-5:])


@lru_cache(maxsize=4096)
def _local_day(date_hour: str, offset: str) -> Optional[date]:
    try:
        return datetime.strptime(f"{date_hour}:30:00 {offset}", "%d/%b/%Y:%H:%M:%S %z").astimezone(LOCAL_TZ).date()
    except ValueError:
        return None


def summarize(lines: Iterable[str], days: Set[date]) -> Dict[date, list]:
    """Count requests per day (only `days`) into StatsLogDaily rows (not yet saved)."""
    # (day, ip, bot name or "") -> [requests, bytes, probed, ran_js, pages, first, last]
    # (first/last: seconds since midnight server time, for how long a browser stayed)
    seen: Dict[tuple, list] = {}
    bot_info: Dict[str, str] = {}
    statuses: Dict[date, Counter] = defaultdict(Counter)   # day -> {"all": n, "5xx": n}
    for line in lines:
        m = LINE.match(line)
        if not m:
            continue
        ip, stamp, _method, url, status, size, ua = m.groups()
        day = parse_time(stamp)
        if day not in days:
            continue
        statuses[day]["all"] += 1
        if status.startswith("5"):
            statuses[day]["5xx"] += 1
        path = (url or "").split("?")[0]
        found = bots.bot_name(ua)
        name = found[0] if found else ""
        if found:
            bot_info[name] = found[1]
        try:
            second = int(stamp[12:14]) * 3600 + int(stamp[15:17]) * 60 + int(stamp[18:20])
        except ValueError:
            second = 0
        entry = seen.get((day, ip, name))
        if entry is None:
            entry = seen[(day, ip, name)] = [0, 0, False, False, set(), second, second]
        entry[0] += 1
        entry[1] += int(size) if size.isdigit() else 0
        entry[5] = min(entry[5], second)
        entry[6] = max(entry[6], second)
        if bots.is_probe(path):
            entry[2] = True
        elif path.startswith("/api/v1/"):
            entry[3] = True
        elif PAGE_PATH.match(path) and len(entry[4]) < 3:
            entry[4].add(path)

    # day -> {(kind, name): [set of ips, requests, bytes, group]}
    totals: Dict[date, dict] = defaultdict(dict)

    def add(day, kind, name, ip, requests, size, group=None):
        row = totals[day].setdefault((kind, name), [set(), 0, 0, group])
        row[0].add(ip)
        row[1] += requests
        row[2] += size

    for (day, ip, name), (requests, size, probed, ran_js, pages, first, last) in seen.items():
        group = bot_info.get(name)
        if probed or group == "scanner":
            cls = "scanner"
        elif name:
            cls = "bot"
        elif ran_js and pages and (last - first >= HUMAN_MIN_SECONDS or len(pages) >= 2):
            cls = "human"
        else:
            cls = "scraper"
        add(day, "class", cls, ip, requests, size)
        if cls == "bot":
            add(day, "bot", name, ip, requests, size, group)

    result = {}
    for day in days:
        if day not in totals:
            continue   # not in the logs (never a real day: bots alone visit every day)
        rows = [StatsLogDaily(day=day, kind=kind, name=name, grp=group, visitors=len(ips),
                              requests=requests, bytes=size)
                for (kind, name), (ips, requests, size, group) in totals[day].items()]
        rows += [StatsLogDaily(day=day, kind="status", name=name, visitors=0,
                               requests=statuses[day][name], bytes=0) for name in ("all", "5xx")]
        # Always store all four classes, so a day with no traffic still counts as done
        present = {row.name for row in rows if row.kind == "class"}
        rows += [StatsLogDaily(day=day, kind="class", name=cls, visitors=0, requests=0, bytes=0)
                 for cls in CLASSES if cls not in present]
        result[day] = rows
    return result


def read_lines(paths: List[str]) -> Iterable[str]:
    for path in paths:
        try:
            opener = gzip.open if path.endswith(".gz") else open
            with opener(path, "rt", encoding="utf-8", errors="replace") as handle:
                yield from handle
        except OSError as error:
            logger.warning("Could not read %s: %s", path, error)


def update(db: Session, today: Optional[date] = None, force: bool = False) -> int:
    """
    Count every finished day that the logs cover and the database doesn't have yet.
    Returns the number of days added. Cheap when there is nothing to do; safe to call from
    several processes (rows are written with merge, so a race just writes the same numbers).
    """
    global _last_run
    with _lock:
        if not force and time.monotonic() - _last_run < MIN_INTERVAL_SECONDS:
            return 0
        _last_run = time.monotonic()

    today = today or datetime.now(LOCAL_TZ).date()
    try:
        purge_old_hits(db)
        recount_if_rules_changed(db)
        stored = {row[0] for row in db.query(StatsLogDaily.day).filter(StatsLogDaily.kind == "class").distinct()}

        # Days the logs can cover: from the oldest archive month up to yesterday
        months = set()
        for directory in log_dirs():
            for path in glob(os.path.join(directory, "*.gz")):
                match = ARCHIVE_NAME.search(path)
                if match:
                    months.add((int(match.group(2)), MONTHS[match.group(1)]))
        if not months:
            return 0
        # Before anything is stored, try every day the archives could hold. After that, only
        # recent missing days (a day the logs never had isn't retried forever), and always the
        # last two days: cPanel may not have archived all of yesterday yet.
        first = date(*min(months), 1)
        if stored:
            first = max(min(stored), today - timedelta(days=RETRY_DAYS))
        candidates = {first + timedelta(days=i) for i in range((today - first).days)}
        wanted = (candidates - stored) | {today - timedelta(days=1), today - timedelta(days=2)}

        # Read only the archives of the months we need (a day near a month boundary can be
        # in the next month's file, depending on the server's time zone)
        need = set()
        for day in wanted:
            for d in (day - timedelta(days=1), day, day + timedelta(days=1)):
                need.add((d.year, d.month))
        started = time.monotonic()
        results = summarize(read_lines(log_files(need)), wanted)
        for rows in results.values():
            for row in rows:
                db.merge(row)
        db.commit()
        logger.info("Stats: counted %d day(s) of server logs in %.1fs", len(results), time.monotonic() - started)
        return len(results)
    except SQLAlchemyError:
        db.rollback()
        logger.exception("Could not update server log stats")
        return 0


def recount_if_rules_changed(db: Session) -> None:
    """Days counted with older rules are deleted, so they are counted again (from the logs
    cPanel still has) with the current ones."""
    meta = db.get(StatsLogDaily, (META_DAY, "meta", "version"))
    if meta is not None and meta.visitors == CLASSIFIER_VERSION:
        return
    db.query(StatsLogDaily).delete(synchronize_session=False)
    db.add(StatsLogDaily(day=META_DAY, kind="meta", name="version", visitors=CLASSIFIER_VERSION,
                         requests=0, bytes=0))
    db.commit()
    logger.info("Stats: log classification rules changed (v%d); recounting", CLASSIFIER_VERSION)


def purge_old_hits(db: Session) -> None:
    """Delete tracker events older than the retention period (daily totals are kept)."""
    cutoff = datetime.utcnow() - HITS_RETENTION
    oldest = db.query(func.min(StatsHit.created_at)).scalar()
    if oldest is not None and oldest < cutoff:
        db.query(StatsHit).filter(StatsHit.created_at < cutoff).delete(synchronize_session=False)
        db.commit()
