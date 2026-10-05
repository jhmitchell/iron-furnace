"""Plain-language observations for the top of the Stats page: what's working, and what could
be improved.

Small sites have small numbers, and small numbers jump around. So every rule has a minimum
amount of data before it says anything; a change between periods is only called a change
when it passes a simple significance test (report.zscore, |z| >= 2); numbers are given as
counts ("12 of 340 visits"), never as a percentage change of a small base; and nothing is
reported just because it's there: each insight suggests something to keep doing or to fix.
Problems come first, then the most valuable things (donations, visit planning, events, signs).
"""
from typing import List, Optional

MAX_INSIGHTS = 5
UNFINISHED_PAGES = {"/membership": "Membership", "/donate": "Donate", "/shop": "Shop"}
DAY_NAMES = {"Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday", "Thu": "Thursday",
             "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"}


def in_ten(part: int, whole: int) -> str:
    """'7 in 10' style share; easier to read than percentages."""
    n = round(10 * part / whole) if whole else 0
    if n >= 10:
        return "nearly all"
    if n <= 0:
        return "fewer than 1 in 10"
    return f"{n} in 10"


def plural(n: int, word: str, many: Optional[str] = None) -> str:
    return f"{n} {word if n == 1 else (many or word + 's')}"


def item(tone: str, title: str, detail: str = "", section: Optional[str] = None, **link) -> dict:
    """tone: good | info | warn. section: id of the part of the page with the details.
    link: optional filter to apply when the insight is clicked (key, value)."""
    return {"tone": tone, "title": title, "detail": detail, "section": section,
            "filter": link or None}


def generate(r: dict) -> List[dict]:
    s, p, z = r["summary"], r["previous_summary"], r["change"]
    visits, days = s["visits"], r["range"]["days"]
    problems: List[dict] = []
    good: List[dict] = []

    # --- Things to fix ---------------------------------------------------------------
    for row in r["not_found"]:
        if row["views"] >= 3:
            source = row["came_from"]
            where = {"this website": "The broken link is on this website.",
                     "direct / unknown": "It may be a mistyped or old printed address."}.get(
                source, f"Most came from {source}, so the old link is probably there.")
            problems.append(item("warn", f"{plural(row['views'], 'visit')} hit a page that doesn't exist: {row['path']}",
                                 f"{where} Fixing the link, or a redirect to the right page, would help.",
                                 "not-found"))
            break

    pages = {row["path"]: row for row in r["pages"]}
    for path, name in UNFINISHED_PAGES.items():
        row = pages.get(path)
        if row and row["visitors"] >= 3:
            problems.append(item("warn", f"{plural(row['visitors'], 'visitor')} landed on the unfinished {name} page",
                                 f"{path} still says it's under construction. Pointing it to the real "
                                 f"{name.lower()} page would help.", "pages", key="page", value=path))

    for event in r["events"]:
        d = event["days_until"]
        if d is not None and 0 <= d <= 21 and event["visitors"] < 10 and visits >= 100:
            seen = (f"only {plural(event['visitors'], 'person', 'people')} viewed its page"
                    if event["visitors"] else "nobody has viewed its page yet")
            soon = "today" if d == 0 else f"in {plural(d, 'day')}"
            problems.append(item("warn", f"“{event['title']}” is {soon}, but {seen}",
                                 "Sharing it on Facebook or in the banner could help.", "events",
                                 key="page", value=f"/events/{event['id']}"))
            break
    for event in r["events"]:
        if event["has_link"] and event["visitors"] >= 10 and event["link_clicks"] == 0:
            problems.append(item("warn", f"Nobody clicked the link on “{event['title']}”",
                                 f"{plural(event['visitors'], 'person', 'people')} viewed the event page but "
                                 f"none clicked its link. A clearer or higher link may help.", "events"))
            break

    scanned_recently = any((sg["days_since_scan"] or 999) <= 30 for sg in r["signs"])
    for sg in r["signs"]:
        if scanned_recently and (sg["days_since_scan"] or 0) > 30 and sg["previous_scans"] >= 5:
            problems.append(item("warn", f"The {sg['sign'].replace('-', ' ')} sign hasn't been scanned in "
                                 f"{sg['days_since_scan']} days",
                                 "Other signs are being scanned. It may be damaged, hidden or out of season.",
                                 "signs"))
            break

    for row in r["landing_pages"]:
        if row["visits"] >= 20 and row["engaged"] / row["visits"] < 0.25 and row["path"] != "/":
            problems.append(item("warn", f"Visitors often leave “{row['name']}” right away",
                                 f"{row['visits'] - row['engaged']} of {row['visits']} visits that started there "
                                 f"ended within seconds. Check that it answers what people came for and "
                                 f"links onward.", "landing", key="page", value=row["path"]))
            break

    # --- How it's going ----------------------------------------------------------------
    if visits < 10:
        return (problems + [item("info", "Not enough visits yet to spot patterns",
                                 "Try a longer period, or check back in a week or two.")])[:MAX_INSIGHTS]

    before = p["visits"]
    if max(visits, before) >= 30 and abs(z["visits"]) >= 2:
        trend = "more" if visits > before else "fewer"
        good.append(item("good" if trend == "more" else "info",
                         f"{plural(visits, 'visit')} — {trend} than the {days} days before ({before})",
                         "Look at the chart for the days that made the difference.", "overview"))
    else:
        good.append(item("info", f"{plural(visits, 'visit')} in the last {plural(days, 'day')}",
                         f"About the same as the {days} days before ({before})." if before else "",
                         "overview"))

    actions = {row["action"]: row for row in r["actions"]}
    donate = actions.get("Donate")
    if donate and donate["visits"] >= 3:
        where = donate["top_pages"][0]["name"] if donate["top_pages"] else None
        good.append(item("good", f"{plural(donate['visits'], 'visit')} clicked Donate ({donate['visits']} of {visits})",
                         f"Most clicks came from {where}." if where else "", "actions"))
    for name in ("Membership", "Sponsorship"):
        row = actions.get(name)
        if row and row["visits"] >= 3:
            good.append(item("good", f"{plural(row['visits'], 'visit')} clicked {name}", "", "actions"))

    if s["planned_visits"] >= 10:
        good.append(item("good", f"{plural(s['planned_visits'], 'visit')} looked up hours, tours or directions",
                         f"A good sign of people planning a trip ({s['planned_visits']} of {visits} visits).",
                         "actions"))

    for event in r["events"]:
        d = event["days_until"]
        if d is not None and d >= 0 and event["visitors"] >= 10:
            good.append(item("good", f"“{event['title']}” is getting attention",
                             f"{plural(event['visitors'], 'person', 'people')} viewed its page.", "events",
                             key="page", value=f"/events/{event['id']}"))
            break

    scans = sum(sg["scans"] for sg in r["signs"])
    if scans >= 5:
        signs = r["signs"]
        lead = (signs[0]["scans"] >= 3 and (len(signs) == 1 or signs[0]["scans"] - signs[1]["scans"] >= 2))
        good.append(item("good", f"Signs on the grounds were scanned {plural(scans, 'time')}",
                         f"Most popular: {signs[0]['sign'].replace('-', ' ')} ({signs[0]['scans']})." if lead else "",
                         "signs", key="source", value="QR code"))

    for ref in r["referrers"]:
        if ref["source"] == "Other websites" and ref["new"] and ref["visits"] >= 3:
            good.append(item("good", f"A new website linked to you: {ref['referrer']} sent {plural(ref['visits'], 'visit')}",
                             "Worth a thank-you, and a check that the information there is current.", "sources"))
            break
    for src in r["sources"]:
        if src["source"] not in ("Direct",) and src["visits"] >= 10 and src["z"] >= 2:
            good.append(item("good", f"{src['source']} sent more visits than usual ({src['visits']}, "
                             f"up from {src['previous_visits']})", "", "sources", key="source", value=src["source"]))
            break

    sources = {row["source"]: row for row in r["sources"]}
    ai = sources.get("AI assistants")
    if ai and ai["visits"] >= 3:
        good.append(item("info", f"{plural(ai['visits'], 'visit')} came from AI assistants such as ChatGPT",
                         "Accurate hours and event details on the site help them answer correctly.",
                         "sources", key="source", value="AI assistants"))

    direct = sources.get("Direct")
    if direct and visits >= 50 and direct["visits"] / visits >= 0.5:
        good.append(item("info", "Half or more of visits show up as “Direct”",
                         "Instagram and Facebook apps often hide where a visit came from. Adding a tag to "
                         "links you post (for example ?utm_source=facebook) shows which posts work.", "sources"))

    devices = {row["device"]: row["visits"] for row in r["devices"]}
    phones = devices.get("phone", 0) + devices.get("tablet", 0)
    if visits >= 50 and phones / visits >= 0.6:
        good.append(item("info", f"About {in_ten(phones, visits)} visits are on a phone or tablet",
                         "Check new events and banners on a phone first.", "devices"))

    if visits >= 200 and days >= 56:
        ranked = sorted(r["weekdays"], key=lambda d: -d["visits"])
        if ranked[0]["visits"] >= 1.2 * ranked[1]["visits"]:
            good.append(item("info", f"Most visits happen on {DAY_NAMES[ranked[0]['day']]}",
                             "Posting news or reminders a day before can reach more people.", "when"))

    # Up to 3 problems, so there is always room for what is going well
    return (problems[:3] + good)[:MAX_INSIGHTS]
