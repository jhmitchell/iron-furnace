"""Telling people apart from bots, and phones from computers, by user agent and request path.

Used both for the site's own visit tracking (where bots are dropped) and for the server log
analysis (where they are counted, to show how much of the traffic is automated).
"""
import re
from functools import lru_cache
from typing import Optional

# Named crawlers, most specific first: (display name, group, pattern). Groups:
#   search  search engines indexing the site (good: they bring visitors)
#   ai      AI companies collecting training data or answering questions
#   seo     SEO / marketing data companies
#   preview link previews when someone shares a link (Facebook, iMessage, Slack, ...)
#   monitor uptime checks, our own deploy health check, feed readers
#   tool    scripts and libraries (curl, Python, ...): usually scrapers
KNOWN_BOTS = [
    ("Googlebot", "search", r"googlebot|google-inspectiontool|storebot-google|googleother|google-extended|adsbot-google|mediapartners-google|apis-google|feedfetcher-google"),
    ("Bingbot", "search", r"bingbot|bingpreview|msnbot|adidxbot"),
    ("Applebot", "search", r"applebot"),
    ("DuckDuckBot", "search", r"duckduckbot|duckassistbot"),
    ("Yandex", "search", r"yandex"),
    ("Baidu", "search", r"baiduspider"),
    ("Yahoo", "search", r"slurp"),
    ("Seznam", "search", r"seznambot"),
    ("Qwant", "search", r"qwantbot|qwant"),
    ("Mojeek", "search", r"mojeekbot"),
    ("Brave", "search", r"bravebot"),
    ("Sogou", "search", r"sogou"),
    ("Other search engine", "search", r"yisouspider|petalsearch|coccocbot|naver|daum|exabot"),
    ("GPTBot (OpenAI)", "ai", r"gptbot|chatgpt-user|oai-searchbot"),
    ("ClaudeBot (Anthropic)", "ai", r"claudebot|claude-user|claude-searchbot|claude-web|anthropic-ai"),
    ("Bytespider (ByteDance)", "ai", r"bytespider|tiktokspider"),
    ("PerplexityBot", "ai", r"perplexitybot|perplexity-user"),
    ("Meta AI", "ai", r"meta-externalagent|meta-externalfetcher|facebookbot"),
    ("Amazonbot", "ai", r"amazonbot"),
    ("Common Crawl", "ai", r"ccbot"),
    ("Other AI crawler", "ai", r"cohere-ai|diffbot|youbot|ai2bot|timpibot|imagesiftbot|omgili|webzio|petalbot|img2dataset|scrapy|exasearchbot|exabot-ai|reflectionbot|shapbot|mistralai|firecrawl|jina"),
    ("AhrefsBot", "seo", r"ahrefs"),
    ("SemrushBot", "seo", r"semrush"),
    ("MJ12bot (Majestic)", "seo", r"mj12bot"),
    ("DotBot (Moz)", "seo", r"dotbot|rogerbot"),
    ("DataForSEO", "seo", r"dataforseo"),
    ("Other SEO crawler", "seo", r"blexbot|serpstat|seekport|barkrowler|screaming frog|sitebulb|siteauditbot|linkdex|megaindex|serendeputy|awario|brandverity|seranking|sitemapfetcher|emailfinder|contactbot|marketqwik"),
    ("Facebook link preview", "preview", r"facebookexternalhit|facebookcatalog"),
    ("Apple link preview", "preview", r"^networkingextension/|iphone.*facebookexternalhit|applenews"),
    ("Link preview (other)", "preview", r"privacy preserving prefetch|twitterbot|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|skypeuripreview|pinterest|redditbot|iframely|embedly|snapchat|outbrain|vkshare|bitlybot|google-pagerenderer|apple-mail|mastodon"),
    ("Uptime / health check", "monitor", r"broken link checker|uptime|pingdom|statuscake|site24x7|betteruptime|freshping|newrelic|datadog|monitor|check_http|nagios|zabbix|healthcheck"),
    ("Feed reader", "monitor", r"feedly|feedbin|inoreader|newsblur|rss|feed"),
    ("Security scanner", "scanner", r"securityscanner|security scanner|censys|expanse|zgrab|masscan|nmap|nuclei|nikto|sqlmap|wpscan|internet-measurement|internetmeasurement|paloalto|shodan|leakix|netcraft|onyphe|binaryedge|stretchoid|criminalip|modat"),
    ("Script or tool", "tool", r"curl|wget|python|aiohttp|httpx|go-http-client|okhttp|java/|apache-httpclient|libwww|lwp-|axios|node-fetch|undici|got \(|ruby|php/|guzzle|postman|insomnia|httpie|powershell|wininet|reqwest|colly|headlesschrome|phantomjs|puppeteer|playwright|selenium|electron/.*(?:crawl|bot)"),
    ("Other bot", "other", r"bot\b|bot/|crawl|spider|scraper|fetcher|archiver|ia_archiver|heritrix|preview|checker|validator|analyzer|indexer"),
]
_KNOWN = [(name, group, re.compile(pattern, re.I)) for name, group, pattern in KNOWN_BOTS]

# Requests no browser on this site would ever make: attackers' scanners looking for
# WordPress, PHP, config files, admin panels and leaked credentials.
PROBE_PATH = re.compile(
    r"\.php\d?\b|\.aspx?\b|\.jsp\b|\.cgi\b|/wp-|/wordpress|/xmlrpc|/\.env|/\.git|/\.svn|/\.aws|/\.ssh|"
    r"/\.vscode|/\.ds_store|/cgi-bin|/vendor/|/phpmyadmin|/pma/|/myadmin|/boaform|/actuator|/owa/|"
    r"/hnap1|/solr|/console|/manager/html|/config\.|/web\.config|/server-status|/telescope|/debug/|"
    r"/autodiscover|/ecp/|/remote/|/sdk|/setup\.|/install\.|/backup|\.sql\b|\.bak\b|\.zip\b|\.tar\b|"
    r"\.gz\b|\.rar\b|\.7z\b|/shell|/cmd|/eval|/druid|/geoserver|/jenkins|/api/v\d/(?:users|auth/register)\b(?!/me)|"
    r"/login\.action|/stalker_portal|/\.well-known/(?!acme-challenge|security\.txt)",
    re.I,
)

# Real browsers all send a user agent that starts like this.
BROWSER_LIKE = re.compile(r"^Mozilla/5\.0 \(", re.I)

PHONE = re.compile(r"iphone|ipod|android.+mobile|mobile safari|windows phone|blackberry|opera mini|iemobile|mobile;", re.I)
TABLET = re.compile(r"ipad|tablet|android(?!.*mobile)|kindle|silk/|playbook", re.I)


@lru_cache(maxsize=4096)
def bot_name(user_agent: Optional[str]) -> Optional[tuple]:
    """(name, group) of the bot a user agent belongs to, or None if it looks like a person's browser."""
    ua = (user_agent or "").strip()
    if not ua or ua == "-":
        return ("No user agent", "tool")
    for name, group, pattern in _KNOWN:
        if pattern.search(ua):
            return (name, group)
    if not BROWSER_LIKE.search(ua):
        return ("Other bot", "other")
    return None


def is_bot(user_agent: Optional[str]) -> bool:
    return bot_name(user_agent) is not None


@lru_cache(maxsize=8192)
def is_probe(path: str) -> bool:
    """True for paths only attack scanners ask for."""
    return bool(PROBE_PATH.search(path or ""))


def device(user_agent: Optional[str], screen_width: Optional[int] = None) -> str:
    """'phone', 'tablet' or 'desktop'. The user agent decides; screen width breaks ties
    (iPads that pretend to be Macs report a desktop user agent but a touch-sized screen)."""
    ua = user_agent or ""
    if PHONE.search(ua):
        return "phone"
    if TABLET.search(ua):
        return "tablet"
    if screen_width:
        if screen_width < 600:
            return "phone"
        if screen_width <= 1024 and "Macintosh" in ua:
            return "tablet"
    return "desktop"
