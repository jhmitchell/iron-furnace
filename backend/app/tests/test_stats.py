from datetime import date, datetime, timedelta
from types import SimpleNamespace

from app.internal.stats import bots, collect, insights, logs, report, sources

CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36"
IPHONE = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
          "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
ANDROID = ("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) "
           "Chrome/129.0 Mobile Safari/537.36")


# --- bots -----------------------------------------------------------------------------------

def test_browsers_are_not_bots():
    for ua in (CHROME, IPHONE, ANDROID):
        assert bots.bot_name(ua) is None


def test_named_bots():
    assert bots.bot_name("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)") == ("Googlebot", "search")
    assert bots.bot_name("Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2)")[1] == "ai"
    assert bots.bot_name("Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)")[0] == "ClaudeBot (Anthropic)"
    assert bots.bot_name("facebookexternalhit/1.1")[1] == "preview"
    assert bots.bot_name("curl/8.5.0")[1] == "tool"
    assert bots.bot_name("python-requests/2.31")[1] == "tool"
    assert bots.bot_name(CHROME.replace("Chrome/", "HeadlessChrome/"))[1] == "tool"
    assert bots.bot_name("") == ("No user agent", "tool")
    assert bots.bot_name("Some-Random-Agent/1.0")[0] == "Other bot"


def test_probe_paths():
    for path in ("/wp-login.php", "/.env", "/.git/config", "/xmlrpc.php", "/phpmyadmin/"):
        assert bots.is_probe(path), path
    for path in ("/", "/visit/hours", "/api/v1/hours/status", "/api/v1/users/me", "/static/qr/furnaces.pdf"):
        assert not bots.is_probe(path), path


def test_devices():
    assert bots.device(IPHONE) == "phone"
    assert bots.device(ANDROID) == "phone"
    assert bots.device("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)") == "tablet"
    assert bots.device(CHROME, 1440) == "desktop"
    # iPads asking for the desktop site report a Mac user agent
    assert bots.device("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15", 820) == "tablet"


# --- sources ----------------------------------------------------------------------------------

def test_sources():
    own = "cornwallironfurnace.org"
    assert sources.classify("/", None, own)[0] == "Direct"
    assert sources.classify("/", "https://cornwallironfurnace.org/visit", own)[0] == "Direct"
    assert sources.classify("/", "https://www.google.com/", own) == ("Search", "google.com", None)
    assert sources.classify("/", "https://l.facebook.com/l.php?u=x", own) == ("Social", "facebook.com", None)
    assert sources.classify("/", "https://chatgpt.com/", own)[0] == "AI assistants"
    assert sources.classify("/", "https://gemini.google.com/app", own)[0] == "AI assistants"
    assert sources.classify("/", "android-app://com.google.android.googlequicksearchbox/", own) == ("Search", "google.com", None)
    assert sources.classify("/", "https://www.discoverlancaster.com/things", own) == ("Other websites", "discoverlancaster.com", None)
    assert sources.classify("/signs/furnaces", None, own)[0] == "QR code"
    assert sources.classify("/", None, own, utm_source="newsletter")[0] == "Email"
    assert sources.classify("/", "https://www.google.com/", own, utm_source="fb", utm_campaign="spring")[0:3:2] == ("Campaign", "spring")


# --- collect ------------------------------------------------------------------------------------

def test_clean_path_and_target():
    assert collect.clean_path("/visit/hours/?a=1#x") == "/visit/hours"
    assert collect.clean_path("/") == "/"
    assert collect.clean_path("https://evil.example/") is None
    assert collect.clean_path("//evil.example") is None
    assert collect.clean_target("mailto:someone@example.org?subject=hi") == "mailto:"
    assert collect.clean_target("tel:+17175551234") == "tel:"
    assert collect.clean_target("https://givebutter.com/supportcifa?email=a@b.c") == "https://givebutter.com/supportcifa"


def test_record_drops_bots_staff_pages_and_junk():
    # These are rejected before the database is touched (db=None would fail otherwise)
    assert not collect.record(None, {"kind": "pageview", "path": "/"}, "1.2.3.4", "curl/8", "x")
    assert not collect.record(None, {"kind": "pageview", "path": "/admin/stats"}, "1.2.3.4", CHROME, "x")
    assert not collect.record(None, {"kind": "pageview", "path": "/login"}, "1.2.3.4", CHROME, "x")
    assert not collect.record(None, {"kind": "nonsense", "path": "/"}, "1.2.3.4", CHROME, "x")
    assert not collect.record(None, {"kind": "pageview", "path": "/", "bot": True}, "1.2.3.4", CHROME, "x")


# --- server logs ------------------------------------------------------------------------------------

def log_line(ip, path, ua, when="04/Oct/2026:12:00:00 -0400", status=200):
    return f'{ip} - - [{when}] "GET {path} HTTP/1.1" {status} 100 "-" "{ua}"\n'


def test_log_summary_classes():
    day = date(2026, 10, 4)
    lines = [
        log_line("1.1.1.1", "/", CHROME), log_line("1.1.1.1", "/api/v1/hours/status", CHROME),  # human
        log_line("2.2.2.2", "/", CHROME),                                                        # scraper
        log_line("3.3.3.3", "/wp-login.php", CHROME), log_line("3.3.3.3", "/.env", CHROME),      # scanner
        log_line("4.4.4.4", "/", "Mozilla/5.0 (compatible; Googlebot/2.1)"),                     # bot
        log_line("4.4.4.4", "/visit", "Mozilla/5.0 (compatible; Googlebot/2.1)", status=503),
        log_line("5.5.5.5", "/", CHROME, when="05/Oct/2026:12:00:00 -0400"),                     # other day
    ]
    rows = logs.summarize(lines, {day})[day]
    classes = {r.name: r.visitors for r in rows if r.kind == "class"}
    assert classes == {"human": 1, "scraper": 1, "scanner": 1, "bot": 1}
    bot_rows = [r for r in rows if r.kind == "bot"]
    assert [(r.name, r.requests, r.grp) for r in bot_rows] == [("Googlebot", 2, "search")]
    status = {r.name: r.requests for r in rows if r.kind == "status"}
    assert status == {"all": 7, "5xx": 1}


def test_log_days_use_museum_time():
    # 03:00 UTC on Oct 5 is still Oct 4 in Pennsylvania
    assert logs.parse_time("05/Oct/2026:03:00:00 +0000") == date(2026, 10, 4)


# --- report -------------------------------------------------------------------------------------------

T0 = datetime(2026, 10, 4, 16, 0)


def hit(visitor="v1", minutes=0, kind="pageview", path="/", **fields):
    defaults = dict(visitor=visitor, created_at=T0 + timedelta(minutes=minutes), kind=kind, path=path,
                    entry=False, source=None, referrer=None, campaign=None, device="desktop",
                    viewport_w=1440, viewport_h=900, interacted=False, not_found=False, engaged_ms=0,
                    target=None, label=None, zone=None)
    defaults.update(fields)
    return SimpleNamespace(**defaults)


def test_visits_split_on_gap_visitor_and_entry():
    hits = [hit(minutes=0, entry=True), hit(minutes=5, path="/visit"), hit(minutes=50, entry=True),
            hit(visitor="v2", minutes=1, entry=True)]
    visits = report.split_visits(hits)
    assert [len(v.views) for v in visits] == [2, 1, 1]


def test_human_rules():
    one = lambda **f: report.Visit([hit(entry=True, **f)])
    assert one(interacted=True).human()
    assert one(device="phone", viewport_w=390, viewport_h=844).human()        # quick look on a phone
    assert not one().human()                                                  # desktop, nothing touched
    assert not one(viewport_w=800, viewport_h=600, engaged_ms=60000).human()  # headless default size
    assert one(engaged_ms=20000).human()                                      # read for 20s
    two = report.Visit([hit(entry=True), hit(minutes=1, path="/visit")])
    assert two.human()
    fast = report.Visit([hit(minutes=i / 120, path=f"/p{i}", entry=i == 0) for i in range(8)])
    assert not fast.human()                                                   # 8 pages in 30 seconds


def test_engaged_and_actions():
    quick = report.Visit([hit(entry=True, interacted=True, engaged_ms=4000)])
    assert not quick.engaged()
    donate = report.Visit([hit(entry=True, interacted=True),
                           hit(minutes=1, kind="outbound", target="https://givebutter.com/supportcifa")])
    assert donate.engaged() and donate.has_key_action() and donate.actions == ["Donate"]
    plan = report.Visit([hit(entry=True, path="/visit/hours", interacted=True)])
    assert plan.planned()


def test_zscore():
    assert abs(report.zscore(7, 3)) < 2      # 3 -> 7 is noise
    assert report.zscore(60, 30) >= 2        # doubling at 30 is a real change


def test_buckets():
    assert len(report.buckets(date(2026, 9, 5), date(2026, 10, 4))) == 30
    weeks = report.buckets(date(2025, 10, 5), date(2026, 10, 4))
    assert (weeks[1] - weeks[0]).days == 7 and weeks[0].weekday() == 0


# --- insights -------------------------------------------------------------------------------------------

def base_report(visits=40, previous=38):
    summary = {"visits": visits, "visitors": visits, "pageviews": visits * 2, "engaged_visits": 0,
               "engaged_rate": None, "median_visit_seconds": None, "action_visits": 0, "planned_visits": 0}
    return {"summary": summary, "previous_summary": {**summary, "visits": previous},
            "change": {"visits": report.zscore(visits, previous)}, "range": {"days": 30},
            "not_found": [], "pages": [], "events": [], "signs": [], "landing_pages": [], "actions": [],
            "referrers": [], "sources": [], "devices": [], "weekdays": []}


def test_small_changes_are_not_called_trends():
    titles = [i["title"] for i in insights.generate(base_report(40, 30))]
    assert any("40 visits in the last 30 days" in t for t in titles)
    titles = [i["title"] for i in insights.generate(base_report(120, 60))]
    assert any("more than the 30 days before" in t for t in titles)


def test_problems_come_first():
    r = base_report()
    r["not_found"] = [{"path": "/old-page", "views": 4, "came_from": "facebook.com"}]
    first = insights.generate(r)[0]
    assert first["tone"] == "warn" and "/old-page" in first["title"]


def test_too_few_visits():
    assert insights.generate(base_report(4, 2))[-1]["title"].startswith("Not enough visits")
