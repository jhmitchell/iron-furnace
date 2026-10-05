"""The numbers behind the admin Stats page, computed from stats_hits (the site's own tracker)
and stats_log_daily (server log totals).

Definitions (also explained on the page under "How we count"):

  visitor   a browser, counted once per day. Daily hashes can't be linked across days, so
            someone who comes back on three days counts three times in a month.
  visit     page views (and clicks) with less than 30 minutes between them.
  person    only visits that show a sign of a person are counted: a touch, click, scroll or
            key press, a second page, or a click on a link. Programs that load pages without
            doing anything (headless browsers) are left out, and so are visits that are far
            too fast or too long to be a person.
  engaged   a visit that viewed 2+ pages, OR spent 10+ seconds actively on the site, OR took
            a key action. Used instead of "bounce rate": a quick look at the opening hours is
            a success for a museum, not a failure.
  time      active time: only while the page is visible. Medians, not averages.
  change    differences between periods are tested with a simple Poisson check,
            z = 2(sqrt(now) - sqrt(before)); |z| < 2 is treated as normal variation.
"""
import math
import re
from collections import Counter, defaultdict
from datetime import date, datetime, time, timedelta
from statistics import median
from typing import Dict, Iterable, List, Optional

import pytz
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.internal.models.stats import StatsHit, StatsLogDaily
from .collect import LOCAL_TZ
from .sources import SOURCES

ENGAGED_MS = 10_000
VISIT_GAP = timedelta(minutes=30)

# Friendly names for the site's pages (anything else shows its address)
PAGE_NAMES = {
    "/": "Home",
    "/visit": "Visit",
    "/visit/hours": "Visit: hours",
    "/visit/tours": "Visit: tours",
    "/visit/accessibility": "Visit: accessibility",
    "/about": "About",
    "/about/history": "About: history",
    "/about/holdings": "About: holdings",
    "/about/associates": "About: associates",
    "/about/gallery": "About: gallery",
    "/events": "Events",
    "/history": "History",
    "/history2": "History (new story page)",
    "/support": "Support",
    "/support/membership": "Support: membership",
    "/support/donate": "Support: donate",
    "/support/volunteer": "Support: volunteer",
    "/support/sponsorship": "Support: sponsorship",
    "/membership": "Membership (under construction)",
    "/donate": "Donate (under construction)",
    "/shop": "Shop (under construction)",
    "/associates": "Associates",
    "/map": "Site map",
    "/accessibility": "Accessibility",
    "/new-website-announcement": "New website announcement",
}

# What a click led to, by link address. First match wins.
ACTIONS = [
    ("Donate", r"givebutter\.com/supportcifa|paypal\.|donorbox|givebutter\.com/[^/]*donat"),
    ("Membership", r"givebutter\.com/cifamembership|membership"),
    ("Sponsorship", r"sponsorship"),
    ("Call", r"^tel:"),
    ("Email", r"^mailto:"),
    ("Directions", r"google\.[a-z.]+/maps|maps\.google|maps\.app\.goo\.gl|goo\.gl/maps|maps\.apple\.com|bing\.com/maps|waze\.com"),
    ("Social media", r"facebook\.com|instagram\.com|twitter\.com|x\.com/|youtube\.com|tiktok\.com"),
    ("Sign PDF", r"/static/qr/.*\.pdf$"),
]
_ACTIONS = [(name, re.compile(pattern, re.I)) for name, pattern in ACTIONS]
# Clicks that count as a visit "doing something that matters"
KEY_ACTIONS = ("Donate", "Membership", "Sponsorship", "Event link", "Directions", "Call", "Email")
# Visiting information: a visit that looked at it, or asked for directions / called, is
# probably planning to come to the furnace.
PLAN_PATH = re.compile(r"^/visit(/|$)")
PLAN_ACTIONS = ("Directions", "Call")

EVENT_PATH = re.compile(r"^/events/(\d+)$")
SIGN_PATH = re.compile(r"^/signs/([a-z0-9-]+)$")
# Window sizes that headless browsers use by default; with no interaction they're programs
HEADLESS_SIZES = {(800, 600), (1024, 1024), (1280, 720), (1920, 1080), (1366, 768)}


def action_name(hit) -> str:
    target = hit.target or ""
    for name, pattern in _ACTIONS:
        if pattern.search(target):
            return name
    if hit.kind == "outbound" and EVENT_PATH.match(hit.path):
        return "Event link"
    if hit.kind == "download":
        return "File download"
    return "Other website"


def page_name(path: str, events: Dict[int, dict]) -> str:
    if path in PAGE_NAMES:
        return PAGE_NAMES[path]
    m = EVENT_PATH.match(path)
    if m:
        event = events.get(int(m.group(1)))
        return f"Event: {event['title']}" if event else f"Event #{m.group(1)} (deleted)"
    m = SIGN_PATH.match(path)
    if m:
        return f"Sign: {m.group(1).replace('-', ' ')}"
    return path


def utc_bounds(start: date, end: date):
    """Naive UTC datetimes covering local days start..end (inclusive)."""
    lo = LOCAL_TZ.localize(datetime.combine(start, time.min)).astimezone(pytz.utc).replace(tzinfo=None)
    hi = LOCAL_TZ.localize(datetime.combine(end + timedelta(days=1), time.min)).astimezone(pytz.utc).replace(tzinfo=None)
    return lo, hi


def local(dt: datetime) -> datetime:
    return pytz.utc.localize(dt).astimezone(LOCAL_TZ)


def zscore(now: int, before: int) -> float:
    """Poisson square-root test: |z| >= 2 is a change worth mentioning, >= 3 a clear one."""
    return round(2 * (math.sqrt(now) - math.sqrt(before)), 2)


def load_events(db: Session) -> Dict[int, dict]:
    try:
        rows = db.execute(text("SELECT id, title, event_start, link_url FROM events")).fetchall()
    except Exception:  # the events table is optional for the report
        db.rollback()
        return {}
    return {row[0]: {"title": row[1], "start": row[2], "link": row[3]} for row in rows}


# --- Visits -----------------------------------------------------------------------------

class Visit:
    def __init__(self, hits: List[StatsHit]):
        self.hits = hits
        self.views = [h for h in hits if h.kind == "pageview"]
        self.clicks = [h for h in hits if h.kind != "pageview"]
        self.entry = self.views[0] if self.views else None
        self.start = local(hits[0].created_at)
        self.actions = [action_name(h) for h in self.clicks]

    @property
    def visitor_day(self):
        return (self.hits[0].visitor, self.start.date())

    @property
    def seconds(self) -> int:
        return sum(h.engaged_ms for h in self.views) // 1000

    def human(self) -> bool:
        """Shows a sign of a person, and nothing that only programs do."""
        if len(self.views) > 50:
            return False
        if len(self.views) >= 5:
            gaps = [(b.created_at - a.created_at).total_seconds() for a, b in zip(self.views, self.views[1:])]
            if median(gaps) < 1:
                return False
        if any(h.interacted for h in self.views) or self.clicks:
            return True
        if len(self.views) >= 2:
            return True
        # A single page and nothing touched (on a computer even moving the mouse counts as
        # touching). A quick glance at today's hours on a phone looks like this, and so does
        # a headless browser, usually at one of a few standard window sizes.
        view = self.views[0] if self.views else None
        if view is None or (view.viewport_w, view.viewport_h) in HEADLESS_SIZES:
            return False
        return view.device == "phone" or view.engaged_ms >= ENGAGED_MS

    def engaged(self) -> bool:
        return (len(self.views) >= 2 or self.seconds * 1000 >= ENGAGED_MS
                or any(a in KEY_ACTIONS for a in self.actions))

    def planned(self) -> bool:
        return (any(PLAN_PATH.match(h.path) for h in self.views)
                or any(a in PLAN_ACTIONS for a in self.actions))

    def has_key_action(self) -> bool:
        return any(a in KEY_ACTIONS for a in self.actions)


def split_visits(hits: Iterable[StatsHit]) -> List[Visit]:
    hits = sorted(hits, key=lambda h: (h.visitor, h.created_at))
    visits, current = [], []
    for hit in hits:
        if current and (hit.visitor != current[-1].visitor
                        or (hit.kind == "pageview" and hit.entry)
                        or hit.created_at - current[-1].created_at > VISIT_GAP):
            visits.append(Visit(current))
            current = []
        current.append(hit)
    if current:
        visits.append(Visit(current))
    return [v for v in visits if v.views]


FILTERS = ("page", "source", "device")


def apply_filter(visits: List[Visit], key: Optional[str], value: Optional[str]) -> List[Visit]:
    if not key or not value:
        return visits
    if key == "page":
        return [v for v in visits if any(h.path == value for h in v.views)]
    if key == "source":
        return [v for v in visits if (v.entry.source or "Direct") == value]
    if key == "device":
        return [v for v in visits if (v.entry.device or "desktop") == value]
    return visits


class Period:
    def __init__(self, visits: List[Visit], start: date, end: date):
        self.start, self.end = start, end
        self.visits = visits
        self.views = [h for v in visits for h in v.views]
        self.clicks = [h for v in visits for h in v.clicks]

    def summary(self) -> dict:
        n = len(self.visits)
        times = [v.seconds for v in self.visits]
        return {
            "visitors": len({v.visitor_day for v in self.visits}),
            "visits": n,
            "pageviews": len(self.views),
            "engaged_visits": sum(v.engaged() for v in self.visits),
            "engaged_rate": round(sum(v.engaged() for v in self.visits) / n, 3) if n else None,
            "median_visit_seconds": round(median(times)) if times else None,
            "action_visits": sum(v.has_key_action() for v in self.visits),
            "planned_visits": sum(v.planned() for v in self.visits),
        }


# --- Time buckets -------------------------------------------------------------------------

def buckets(start: date, end: date) -> List[date]:
    """Bucket start dates: days for up to ~3 months, weeks (from Monday) beyond that."""
    days = (end - start).days + 1
    if days <= 92:
        return [start + timedelta(days=i) for i in range(days)]
    first = start - timedelta(days=start.weekday())
    return [first + timedelta(weeks=i) for i in range((end - first).days // 7 + 1)]


def bucket_index(day: date, starts: List[date]) -> int:
    if len(starts) > 1 and (starts[1] - starts[0]).days == 7:
        return (day - starts[0]).days // 7
    return (day - starts[0]).days


def series(values: Iterable[date], starts: List[date]) -> List[int]:
    counts = [0] * len(starts)
    for day in values:
        i = bucket_index(day, starts)
        if 0 <= i < len(counts):
            counts[i] += 1
    return counts


# --- Report -------------------------------------------------------------------------------

def build(db: Session, start: date, end: date, filter_key: Optional[str] = None,
          filter_value: Optional[str] = None, today: Optional[date] = None) -> dict:
    today = today or datetime.now(LOCAL_TZ).date()
    span = (end - start).days + 1
    prev_start, prev_end = start - timedelta(days=span), start - timedelta(days=1)
    lo, _ = utc_bounds(prev_start, prev_end)
    cur_lo, hi = utc_bounds(start, end)
    rows = db.query(StatsHit).filter(StatsHit.created_at >= lo, StatsHit.created_at < hi).all()

    all_visits = split_visits(rows)
    human = [v for v in all_visits if v.human()]
    suspect = [v for v in all_visits if not v.human() and v.hits[0].created_at >= cur_lo]
    visits = apply_filter(human, filter_key, filter_value)
    current = Period([v for v in visits if v.hits[0].created_at >= cur_lo], start, end)
    previous = Period([v for v in visits if v.hits[0].created_at < cur_lo], prev_start, prev_end)
    events = load_events(db)
    starts = buckets(start, end)

    first_hit = db.query(StatsHit.created_at).order_by(StatsHit.created_at).first()
    summary, before = current.summary(), previous.summary()

    report = {
        "range": {"start": start.isoformat(), "end": end.isoformat(), "days": span, "today": today.isoformat(),
                  "bucket": "week" if len(starts) > 1 and (starts[1] - starts[0]).days == 7 else "day"},
        "previous": {"start": prev_start.isoformat(), "end": prev_end.isoformat()},
        "filter": {"key": filter_key, "value": filter_value} if filter_key and filter_value else None,
        "tracking_since": local(first_hit[0]).date().isoformat() if first_hit else None,
        "summary": summary,
        "previous_summary": before,
        "change": {k: zscore(summary[k] or 0, before[k] or 0)
                   for k in ("visitors", "visits", "pageviews", "engaged_visits", "action_visits", "planned_visits")},
        "suspect_visits": len(suspect),
        "chart": chart(current, previous, starts, events, start, end),
        "pages": pages(current, previous, events, starts),
        "landing_pages": landing_pages(current, events),
        "sources": sources_table(current, previous),
        "referrers": referrers(current, previous),
        "campaigns": campaigns(current),
        "devices": devices(current),
        "actions": actions(current, previous, events, starts),
        "events": events_table(current, events, today),
        "signs": signs(current, previous, starts, db, today),
        "not_found": not_found(current),
        "weekdays": weekdays(current),
        "last_visit": last_visit(db),
        "traffic": traffic(db, start, end),
    }
    return report


def chart(current: Period, previous: Period, starts, events, start: date, end: date) -> dict:
    """Main chart: each metric per bucket, the previous period aligned bucket by bucket,
    and event dates as markers."""
    shift = timedelta(days=(end - start).days + 1)

    def per_bucket(period, offset=timedelta(0)):
        out = {"visitors": [set() for _ in starts], "visits": [0] * len(starts),
               "pageviews": [0] * len(starts), "engaged_visits": [0] * len(starts),
               "action_visits": [0] * len(starts), "planned_visits": [0] * len(starts)}
        for v in period.visits:
            i = bucket_index(v.start.date() + offset, starts)
            if not 0 <= i < len(starts):
                continue
            out["visitors"][i].add(v.visitor_day)
            out["visits"][i] += 1
            out["pageviews"][i] += len(v.views)
            out["engaged_visits"][i] += v.engaged()
            out["action_visits"][i] += v.has_key_action()
            out["planned_visits"][i] += v.planned()
        out["visitors"] = [len(s) for s in out["visitors"]]
        return out

    markers = []
    for event_id, event in events.items():
        when = event["start"]
        if when and start <= when.date() <= end:
            markers.append({"date": when.date().isoformat(), "title": event["title"], "id": event_id})
    return {"buckets": [d.isoformat() for d in starts], "current": per_bucket(current),
            "previous": per_bucket(previous, shift), "events": sorted(markers, key=lambda m: m["date"])}


def pages(current: Period, previous: Period, events, starts) -> List[dict]:
    stats = defaultdict(lambda: {"views": 0, "visitors": set(), "times": [], "days": []})
    for v in current.visits:
        for h in v.views:
            s = stats[h.path]
            s["views"] += 1
            s["visitors"].add(v.visitor_day)
            s["days"].append(local(h.created_at).date())
            if h.engaged_ms:
                s["times"].append(h.engaged_ms)
    before = defaultdict(set)
    for v in previous.visits:
        for h in v.views:
            before[h.path].add(v.visitor_day)
    result = [{"path": path, "name": page_name(path, events), "views": s["views"],
               "visitors": len(s["visitors"]), "previous_visitors": len(before.get(path, ())),
               "median_seconds": round(median(s["times"]) / 1000) if len(s["times"]) >= 5 else None,
               "series": series(s["days"], starts)}
              for path, s in stats.items()]
    return sorted(result, key=lambda r: (-r["visitors"], -r["views"], r["path"]))[:40]


def landing_pages(period: Period, events) -> List[dict]:
    counts, engaged = Counter(), Counter()
    for v in period.visits:
        counts[v.entry.path] += 1
        engaged[v.entry.path] += v.engaged()
    return [{"path": p, "name": page_name(p, events), "visits": n, "engaged": engaged[p]}
            for p, n in counts.most_common(20)]


def sources_table(current: Period, previous: Period) -> List[dict]:
    def count(period):
        visits, engaged, actions = Counter(), Counter(), Counter()
        for v in period.visits:
            source = v.entry.source or "Direct"
            visits[source] += 1
            engaged[source] += v.engaged()
            actions[source] += v.has_key_action()
        return visits, engaged, actions
    visits, engaged, actions = count(current)
    before, _, _ = count(previous)
    rows = [{"source": s, "visits": visits[s], "previous_visits": before[s], "engaged": engaged[s],
             "action_visits": actions[s], "z": zscore(visits[s], before[s])}
            for s in SOURCES if visits[s] or before[s]]
    return sorted(rows, key=lambda r: (-r["visits"], -r["previous_visits"]))


def referrers(current: Period, previous: Period) -> List[dict]:
    counts, kinds = Counter(), {}
    for v in current.visits:
        if v.entry.referrer:
            counts[v.entry.referrer] += 1
            kinds[v.entry.referrer] = v.entry.source
    seen_before = {v.entry.referrer for v in previous.visits if v.entry.referrer}
    return [{"referrer": r, "source": kinds[r], "visits": n, "new": r not in seen_before}
            for r, n in counts.most_common(20)]


def campaigns(period: Period) -> List[dict]:
    counts = Counter(v.entry.campaign for v in period.visits if v.entry.campaign)
    return [{"campaign": c, "visits": n} for c, n in counts.most_common(10)]


def devices(period: Period) -> List[dict]:
    counts = Counter(v.entry.device or "desktop" for v in period.visits)
    return [{"device": d, "visits": counts[d]} for d in ("phone", "desktop", "tablet") if counts[d]]


def actions(current: Period, previous: Period, events, starts) -> List[dict]:
    rows = defaultdict(lambda: {"clicks": 0, "visits": set(), "pages": Counter(), "zones": Counter(), "days": []})
    for v in current.visits:
        for h, name in zip(v.clicks, v.actions):
            r = rows[name]
            r["clicks"] += 1
            r["visits"].add(id(v))
            r["pages"][page_name(h.path, events)] += 1
            r["zones"][h.zone or "page"] += 1
            r["days"].append(local(h.created_at).date())
    before = Counter()
    for v in previous.visits:
        for name in set(v.actions):
            before[name] += 1
    order = {name: i for i, name in enumerate(KEY_ACTIONS)}
    result = [{"action": name, "clicks": r["clicks"], "visits": len(r["visits"]),
               "previous_visits": before.get(name, 0), "key": name in KEY_ACTIONS,
               "z": zscore(len(r["visits"]), before.get(name, 0)),
               "top_pages": [{"name": p, "clicks": n} for p, n in r["pages"].most_common(3)],
               "zones": dict(r["zones"]), "series": series(r["days"], starts)}
              for name, r in rows.items()]
    return sorted(result, key=lambda r: (order.get(r["action"], 99), -r["clicks"]))


def events_table(period: Period, events, today: date) -> List[dict]:
    views, visitors, clicks = Counter(), defaultdict(set), Counter()
    for v in period.visits:
        for h in v.views:
            m = EVENT_PATH.match(h.path)
            if m:
                views[int(m.group(1))] += 1
                visitors[int(m.group(1))].add(v.visitor_day)
        for h, name in zip(v.clicks, v.actions):
            m = EVENT_PATH.match(h.path)
            if m and name == "Event link":
                clicks[int(m.group(1))] += 1
    result = []
    # Events in the next 60 days are listed even before anyone looks at them
    upcoming = {eid for eid, e in events.items()
                if e["start"] and today <= e["start"].date() <= today + timedelta(days=60)}
    for event_id in set(views) | set(clicks) | upcoming:
        event = events.get(event_id, {})
        when = event.get("start")
        result.append({
            "id": event_id, "title": event.get("title") or f"Event #{event_id} (deleted)",
            "start": when.isoformat() if when else None,
            "days_until": (when.date() - today).days if when else None,
            "has_link": bool(event.get("link")), "views": views[event_id],
            "visitors": len(visitors[event_id]), "link_clicks": clicks[event_id]})
    # Upcoming first (soonest first), then past events by interest
    return sorted(result, key=lambda r: (
        r["days_until"] is None or r["days_until"] < 0,
        r["days_until"] if r["days_until"] is not None and r["days_until"] >= 0 else 0,
        -r["visitors"]))[:8]


def signs(current: Period, previous: Period, starts, db: Session, today: date) -> List[dict]:
    rows = defaultdict(lambda: {"scans": 0, "views": 0, "pdf_opens": 0, "explored": 0, "days": [],
                                "previous_scans": 0})
    for v in current.visits:
        m = SIGN_PATH.match(v.entry.path)
        if m:
            r = rows[m.group(1)]
            r["scans"] += 1
            r["days"].append(v.start.date())
            # Went on to another part of the website after the sign
            if any(not SIGN_PATH.match(h.path) for h in v.views):
                r["explored"] += 1
        for h in v.views:
            m = SIGN_PATH.match(h.path)
            if m:
                rows[m.group(1)]["views"] += 1
        for h in v.clicks:
            m = re.search(r"/static/qr/([a-z0-9-]+)\.pdf$", h.target or "")
            if m:
                rows[m.group(1)]["pdf_opens"] += 1
    for v in previous.visits:
        m = SIGN_PATH.match(v.entry.path)
        if m:
            rows[m.group(1)]["previous_scans"] += 1
    # Last scan ever, per sign (not limited to the period)
    last = {}
    for path, at in db.execute(text(
            "SELECT path, MAX(created_at) FROM stats_hits WHERE entry = 1 AND path LIKE '/signs/%' GROUP BY path")):
        m = SIGN_PATH.match(path)
        if m:
            last[m.group(1)] = local(at).date()
            rows[m.group(1)]  # signs scanned before the period still get a row
    result = []
    for name, r in rows.items():
        days = r.pop("days")
        result.append({"sign": name, **r, "series": series(days, starts),
                       "last_scan": last[name].isoformat() if name in last else None,
                       "days_since_scan": (today - last[name]).days if name in last else None})
    return sorted(result, key=lambda r: (-r["scans"], r["sign"]))


def not_found(period: Period) -> List[dict]:
    counts, came_from = Counter(), defaultdict(Counter)
    for v in period.visits:
        for h in v.views:
            if h.not_found:
                counts[h.path] += 1
                if h is v.entry:
                    came_from[h.path][v.entry.referrer or "direct / unknown"] += 1
                else:
                    came_from[h.path]["this website"] += 1
    return [{"path": p, "views": n, "came_from": came_from[p].most_common(1)[0][0]}
            for p, n in counts.most_common(15)]


def weekdays(period: Period) -> List[dict]:
    counts = Counter(v.start.weekday() for v in period.visits)
    names = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
    return [{"day": names[i], "visits": counts[i]} for i in range(7)]


def last_visit(db: Session) -> Optional[str]:
    """When the last page view happened (a "current visitors" count is nearly always 0 on a
    small site, which looks broken)."""
    row = db.query(StatsHit.created_at).filter(StatsHit.kind == "pageview").order_by(
        StatsHit.created_at.desc()).first()
    return pytz.utc.localize(row[0]).isoformat() if row else None


def traffic(db: Session, start: date, end: date) -> dict:
    """Server log totals: people vs bots per day, which bots, and server errors."""
    rows = db.query(StatsLogDaily).filter(StatsLogDaily.day >= start, StatsLogDaily.day <= end).all()
    by_day = defaultdict(lambda: {c: 0 for c in ("human", "bot", "scanner", "scraper")})
    visitors, requests, status = Counter(), Counter(), Counter()
    bots = defaultdict(lambda: {"visitors": 0, "requests": 0, "group": None})
    for r in rows:
        if r.kind == "class":
            by_day[r.day][r.name] = r.visitors
            visitors[r.name] += r.visitors
            requests[r.name] += r.requests
        elif r.kind == "bot":
            b = bots[r.name]
            b["visitors"] += r.visitors
            b["requests"] += r.requests
            b["group"] = r.grp
        elif r.kind == "status":
            status[r.name] += r.requests
    groups = Counter()
    for b in bots.values():
        groups[b["group"] or "other"] += b["requests"]
    last = db.query(StatsLogDaily.day).order_by(StatsLogDaily.day.desc()).first()
    return {
        "through": last[0].isoformat() if last else None,
        "daily": [{"date": d.isoformat(), **v} for d, v in sorted(by_day.items())],
        "visitors": dict(visitors),
        "requests": dict(requests),
        "bots": sorted(({"name": n, **b} for n, b in bots.items()), key=lambda b: -b["requests"])[:15],
        "bot_groups": dict(groups),
        "server_errors": status.get("5xx", 0),
        "all_requests": status.get("all", 0),
    }
