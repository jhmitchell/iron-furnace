from sqlalchemy import BigInteger, Boolean, Column, Date, DateTime, Index, Integer, SmallInteger, String

from .base import Base


class StatsHit(Base):
    """
    One thing a visitor did on the public site, sent by the site's own tracker: a page view,
    or a click on a link that leaves the site / opens a file / starts a call or email.

    No cookies and no IP addresses are stored. `visitor` is a hash of the IP address and
    browser with a random salt that changes every day and is then deleted (see StatsSalt),
    so the same person gets a new, unlinkable id each day.
    """
    __tablename__ = 'stats_hits'

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, nullable=False)                # UTC
    kind = Column(String(16), nullable=False)                    # pageview | outbound | download | contact
    visitor = Column(String(16), nullable=False)                 # daily visitor hash
    # Page views only: the id the browser gave this page view, so it can report later how
    # long the page was actually looked at (engaged_ms).
    view_id = Column(String(16), nullable=True, unique=True)
    path = Column(String(255), nullable=False)                   # page the visitor was on
    # First page view of a visit (no activity from this visitor in the previous 30 minutes).
    # Where the visit came from is only recorded on these.
    entry = Column(Boolean, nullable=False, default=False)
    source = Column(String(32), nullable=True)                   # Search, Social, Direct, ...
    referrer = Column(String(255), nullable=True)                # referring site's host name
    campaign = Column(String(100), nullable=True)                # utm_campaign / utm_source
    device = Column(String(8), nullable=True)                    # phone | tablet | desktop
    viewport_w = Column(SmallInteger, nullable=True)             # browser window size (bot hints)
    viewport_h = Column(SmallInteger, nullable=True)
    # The visitor touched, clicked, scrolled or typed on this page: a person, not a program
    # that merely loads pages (reported with engaged_ms; see report.is_human).
    interacted = Column(Boolean, nullable=False, default=False)
    not_found = Column(Boolean, nullable=False, default=False)   # the 404 page was shown
    engaged_ms = Column(Integer, nullable=False, default=0)      # time the page was visible and in use
    # Clicks only
    target = Column(String(255), nullable=True)                  # link address (no query string)
    label = Column(String(100), nullable=True)                   # link text
    zone = Column(String(16), nullable=True)                     # navbar | footer | banner | page

    __table_args__ = (
        Index('ix_stats_hits_created', 'created_at'),
        Index('ix_stats_hits_visitor_created', 'visitor', 'created_at'),
    )


class StatsSalt(Base):
    """Random salt for one day's visitor hashes. Deleted after the day ends."""
    __tablename__ = 'stats_salts'

    day = Column(Date, primary_key=True)
    salt = Column(String(64), nullable=False)


class StatsLogDaily(Base):
    """
    Daily totals from the web server's access logs (every request, including bots), filled
    in by app.internal.stats.logs. One row per (day, kind, name):

      kind 'class': name is human | bot | scanner | scraper
      kind 'bot':   name is a crawler's display name (Googlebot, GPTBot, ...); group in `grp`
      kind 'status': name is 'all' or '5xx' (server errors); requests = number of requests
    """
    __tablename__ = 'stats_log_daily'

    day = Column(Date, primary_key=True)
    kind = Column(String(8), primary_key=True)
    name = Column(String(64), primary_key=True)
    grp = Column(String(16), nullable=True)
    visitors = Column(Integer, nullable=False, default=0)        # distinct IP addresses
    requests = Column(Integer, nullable=False, default=0)
    bytes = Column(BigInteger, nullable=False, default=0)
