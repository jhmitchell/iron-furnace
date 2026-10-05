"""Where a visit came from, in plain categories: Search, Social, AI assistants, QR code,
Email, Campaign, Other websites, or Direct."""
import re
from typing import Optional, Tuple
from urllib.parse import urlsplit

SEARCH = re.compile(
    r"(^|\.)(google\.[a-z.]+|bing\.com|duckduckgo\.com|search\.yahoo\.com|yahoo\.com|ecosia\.org|"
    r"yandex\.[a-z.]+|baidu\.com|search\.brave\.com|startpage\.com|qwant\.com|aol\.com|ask\.com|"
    r"mojeek\.com|kagi\.com|so\.com|naver\.com|seznam\.cz)$")
SOCIAL = re.compile(
    r"(^|\.)(facebook\.com|fb\.com|fb\.me|instagram\.com|t\.co|twitter\.com|x\.com|pinterest\.[a-z.]+|"
    r"pin\.it|reddit\.com|linkedin\.com|lnkd\.in|tiktok\.com|snapchat\.com|youtube\.com|youtu\.be|"
    r"threads\.net|nextdoor\.com|bsky\.app|mastodon\.social|tumblr\.com|messenger\.com|whatsapp\.com)$")
AI = re.compile(
    r"(^|\.)(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|claude\.ai|gemini\.google\.com|"
    r"copilot\.microsoft\.com|bard\.google\.com|you\.com|phind\.com|meta\.ai|grok\.com|deepseek\.com)$")
EMAIL = re.compile(r"(^|\.)(mail\.google\.com|outlook\.live\.com|outlook\.office\.com|mail\.yahoo\.com|mail\.aol\.com)$")

# Android apps send "android-app://<package>" as the referrer.
ANDROID_APPS = {
    "com.google.android.googlequicksearchbox": ("Search", "google.com"),
    "com.google.android.gm": ("Email", "Gmail app"),
    "com.facebook.katana": ("Social", "facebook.com"),
    "com.facebook.orca": ("Social", "messenger.com"),
    "com.instagram.android": ("Social", "instagram.com"),
    "com.snapchat.android": ("Social", "snapchat.com"),
    "com.twitter.android": ("Social", "x.com"),
    "com.pinterest": ("Social", "pinterest.com"),
    "com.reddit.frontpage": ("Social", "reddit.com"),
    "com.linkedin.android": ("Social", "linkedin.com"),
    "com.openai.chatgpt": ("AI assistants", "chatgpt.com"),
}

QR_PATH = re.compile(r"^/signs(/|$)")

SOURCES = ("Search", "Direct", "Social", "QR code", "Other websites", "AI assistants", "Email", "Campaign")


def referrer_host(referrer: Optional[str]) -> Optional[str]:
    """Host name of a referrer URL without "www." (or "android-app:<package>"), or None."""
    if not referrer:
        return None
    referrer = referrer.strip()
    if referrer.startswith("android-app://"):
        return "android-app:" + referrer[len("android-app://"):].split("/")[0][:200]
    try:
        host = (urlsplit(referrer).hostname or "").lower()
    except ValueError:
        return None
    return re.sub(r"^(www\.|m\.|l\.|lm\.|mobile\.)", "", host)[:255] or None


def classify(path: str, referrer: Optional[str], own_host: Optional[str],
             utm_source: Optional[str] = None, utm_medium: Optional[str] = None,
             utm_campaign: Optional[str] = None) -> Tuple[str, Optional[str], Optional[str]]:
    """
    (source, referrer host to show, campaign) for the first page of a visit.

    Order matters: an explicit campaign tag wins, then QR sign pages (phones that scan a code
    send no referrer), then the referrer itself.
    """
    medium = (utm_medium or "").lower()
    source_tag = (utm_source or "").lower()
    campaign = (utm_campaign or utm_source or "").strip()[:100] or None
    host = referrer_host(referrer)

    if "qr" in (medium, source_tag) or QR_PATH.match(path or ""):
        return "QR code", None, campaign
    if medium in ("email", "newsletter") or source_tag in ("newsletter", "email"):
        return "Email", host, campaign
    if campaign:
        return "Campaign", host or source_tag or None, campaign

    if host is None or (own_host and host == re.sub(r"^www\.", "", own_host.lower())):
        return "Direct", None, None
    if host.startswith("android-app:"):
        source, name = ANDROID_APPS.get(host.split(":", 1)[1], ("Other websites", host))
        return source, name, None
    if AI.search(host):
        return "AI assistants", host, None
    if EMAIL.search(host):
        return "Email", host, None
    if SEARCH.search(host):
        return "Search", host, None
    if SOCIAL.search(host):
        return "Social", host, None
    return "Other websites", host, None
