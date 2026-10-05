import { useEffect, useMemo, useState } from 'react';
import {
  MdArrowDownward, MdArrowUpward, MdCheckCircle, MdClose, MdErrorOutline, MdInfoOutline,
  MdLightbulbOutline, MdRemove, MdWarningAmber,
} from 'react-icons/md';
import { isBrowserIgnored, setIgnoreThisBrowser } from '/src/features/stats';
import { AdminPage, AdminCard, EmptyState, ui } from '../ui';
import { getStatsHealth, getStatsReport } from './statsService';
import { ColumnChart, InlineBar, ShareBar, Sparkline, StackedColumns } from './charts';
import { bucketLabel, formatNumber, parseDay, shortDate } from './format';
import styles from './AdminStats.module.css';

const RANGES = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: '12m', label: 'Last 12 months' },
];

const METRICS = [
  { id: 'visitors', label: 'Visitors', unit: 'visitors', hint: 'Counted once per day' },
  { id: 'engaged_visits', label: 'Engaged visits', unit: 'engaged visits', hint: 'Looked at 2+ pages, stayed 10+ seconds, or clicked something important' },
  { id: 'planned_visits', label: 'Planned a visit', unit: 'visits', hint: 'Looked at hours, tours or directions, or called' },
  { id: 'action_visits', label: 'Took action', unit: 'visits', hint: 'Clicked Donate, Membership, Sponsorship, an event link, directions, call or email' },
];

const SOURCE_HELP = {
  Direct: 'No referring website: bookmarks, typed addresses, and many links opened from the Facebook or Instagram apps or from texts.',
  'QR code': 'Visits that started on a sign page (/signs/…).',
  'AI assistants': 'ChatGPT, Perplexity, Gemini, Copilot and similar.',
  Campaign: 'Links tagged with ?utm_source=… or ?utm_campaign=…',
};

const TRAFFIC_SERIES = [
  { key: 'human', label: 'People', color: '#bf8045' },
  { key: 'bot', label: 'Bots that say so', color: '#3987e5' },
  { key: 'scanner', label: 'Hacking attempts', color: '#199e70' },
  { key: 'scraper', label: 'Disguised bots', color: '#9085e9' },
];

const BOT_GROUPS = {
  search: 'Search engines',
  ai: 'AI companies',
  seo: 'Marketing / SEO tools',
  preview: 'Link previews',
  monitor: 'Monitors & feed readers',
  tool: 'Scripts & tools',
  scanner: 'Security scanners',
  other: 'Other bots',
};

const DEVICE_COLORS = { phone: '#bf8045', desktop: '#3987e5', tablet: '#199e70' };
const DEVICE_LABELS = { phone: 'Phone', desktop: 'Computer', tablet: 'Tablet' };

const timeAgo = (iso) => {
  if (!iso) return null;
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
};

const duration = (seconds) => {
  if (seconds === null || seconds === undefined) return '—';
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, '0')}s`;
};

const bytes = (n) => {
  if (n === null || n === undefined) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  let value = n;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
};

const pct = (part, whole) => (whole ? `${Math.round((100 * part) / whole)}%` : '—');

/** "+12" / "−3" with an arrow that is only colored when the change is more than noise. */
const Change = ({ now, before, z, goodWhenUp = true }) => {
  if (now === null || before === null || now === undefined || before === undefined) return null;
  const diff = now - before;
  const real = Math.abs(z ?? 0) >= 2;
  const tone = !real || diff === 0 ? 'neutral' : (diff > 0) === goodWhenUp ? 'good' : 'bad';
  const Icon = diff > 0 ? MdArrowUpward : diff < 0 ? MdArrowDownward : MdRemove;
  return (
    <span className={`${styles.change} ${styles[`change_${tone}`]}`}>
      <Icon aria-hidden="true" />
      {diff > 0 ? '+' : diff < 0 ? '−' : ''}
      {formatNumber(Math.abs(diff))}
      <span className={styles.srOnly}>{real ? '' : ' (within normal variation)'}</span>
    </span>
  );
};

const Status = ({ level }) => {
  const map = {
    ok: [MdCheckCircle, 'Fine', styles.statusOk],
    warn: [MdWarningAmber, 'Watch', styles.statusWarn],
    bad: [MdErrorOutline, 'Act now', styles.statusBad],
  };
  const [Icon, word, cls] = map[level] || [MdInfoOutline, 'Unknown', styles.statusUnknown];
  return (
    <span className={`${styles.status} ${cls}`}>
      <Icon aria-hidden="true" /> {word}
    </span>
  );
};

const Section = ({ id, title, description, aside, children }) => (
  <section id={`stats-${id}`} className={styles.section}>
    <AdminCard title={title} description={description} aside={aside}>
      {children}
    </AdminCard>
  </section>
);

const TableToggle = ({ shown, onToggle }) => (
  <button type="button" className={styles.linkButton} onClick={onToggle} aria-expanded={shown}>
    {shown ? 'Hide table' : 'Show as table'}
  </button>
);

// --- Page -------------------------------------------------------------------------------

const AdminStats = () => {
  const [range, setRange] = useState('30d');
  const [filter, setFilter] = useState(null);
  const [metric, setMetric] = useState('visitors');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [ignored, setIgnored] = useState(isBrowserIgnored());

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    getStatsReport(range, filter, controller.signal)
      .then((report) => {
        setData(report);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setError('The stats could not be loaded. Refresh the page to try again.');
        setLoading(false);
      });
    return () => controller.abort();
  }, [range, filter]);

  useEffect(() => {
    const controller = new AbortController();
    getStatsHealth(controller.signal).then(setHealth).catch(() => {});
    return () => controller.abort();
  }, []);

  const applyFilter = (key, value) => {
    setFilter({ key, value });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleIgnored = () => {
    setIgnoreThisBrowser(!ignored);
    setIgnored(!ignored);
  };

  const rangeLabel = RANGES.find((r) => r.id === range).label.toLowerCase();

  return (
    <AdminPage title="Stats" description="How people use the website, counted without cookies.">
      {/* Controls: one row above everything they affect */}
      <div className={styles.controls}>
        <nav aria-label="Period" className={styles.ranges}>
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`${styles.rangeLink} ${range === r.id ? styles.rangeActive : ''}`}
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </nav>
        {data?.last_visit && (
          <span className={styles.lastVisit}>Last visit {timeAgo(data.last_visit)}</span>
        )}
      </div>
      {filter && (
        <div className={styles.filterRow}>
          <span className={styles.filterChip}>
            {filter.key === 'page' ? 'Visits that viewed' : filter.key === 'source' ? 'Visits from' : 'Visits on'}{' '}
            <strong>{filter.key === 'device' ? DEVICE_LABELS[filter.value] : filter.value}</strong>
            <button type="button" onClick={() => setFilter(null)} aria-label="Remove filter">
              <MdClose aria-hidden="true" />
            </button>
          </span>
        </div>
      )}

      {error && <p className={`${ui.status} ${ui.statusError}`}>{error}</p>}
      {!data && loading && <p className={styles.loading} role="status">Loading stats…</p>}

      {data && (
        <div className={`${styles.body} ${loading ? styles.refreshing : ''}`} aria-busy={loading}>
          <StatsBody
            data={data}
            metric={metric}
            setMetric={setMetric}
            rangeLabel={rangeLabel}
            showTable={showTable}
            setShowTable={setShowTable}
            applyFilter={applyFilter}
            health={health}
          />
          <footer className={styles.about}>
            <h3>How we count</h3>
            <p>
              The website counts visits itself: no cookies, no outside companies, and no IP addresses are
              stored. A visitor is recognized only within one day, so someone who visits on three days
              counts three times. Visits are only counted when they show a sign of a person (a tap,
              scroll, click or a second page); programs that load pages without doing anything are left
              out ({formatNumber(data.suspect_visits)} in this period). Browsers with “Do Not Track” or
              “Global Privacy Control” turned on are never counted. Changes are only highlighted when they
              are larger than normal day-to-day variation.
            </p>
            <label className={styles.ignoreToggle}>
              <input type="checkbox" checked={!ignored} onChange={toggleIgnored} />
              Count my own visits from this browser{' '}
              <span className={styles.muted}>
                (off automatically after signing in, so staff don’t inflate the numbers)
              </span>
            </label>
          </footer>
        </div>
      )}
    </AdminPage>
  );
};

const StatsBody = ({ data, metric, setMetric, rangeLabel, showTable, setShowTable, applyFilter, health }) => {
  const { summary: s, previous_summary: p, change, chart } = data;
  const todayIndex = data.range.bucket === 'day' ? chart.buckets.indexOf(data.range.today)
    : chart.buckets.length - 1;
  const days = data.range.days;
  const trackingStarted = data.tracking_since && parseDay(data.tracking_since) > parseDay(data.previous.start);
  const metricInfo = METRICS.find((m) => m.id === metric);

  return (
    <>
      {trackingStarted && (
        <p className={styles.notice}>
          <MdInfoOutline aria-hidden="true" /> Visit counting started on {shortDate(data.tracking_since)}.
          Comparisons with earlier days aren’t meaningful yet.
        </p>
      )}
      {!data.tracking_since && (
        <EmptyState>No visits have been counted yet. Numbers appear here as soon as people visit the website.</EmptyState>
      )}

      {/* What we're seeing */}
      {data.insights.length > 0 && (
        <section className={styles.insights} aria-labelledby="insights-heading">
          <h3 id="insights-heading" className={styles.insightsTitle}>
            <MdLightbulbOutline aria-hidden="true" /> What we’re seeing
          </h3>
          <ul>
            {data.insights.map((item) => {
              const Icon = item.tone === 'warn' ? MdWarningAmber : item.tone === 'good' ? MdCheckCircle : MdInfoOutline;
              return (
                <li key={item.title} className={styles[`insight_${item.tone}`]}>
                  <Icon className={styles.insightIcon} aria-hidden="true" />
                  <div>
                    <p className={styles.insightTitle}>{item.title}</p>
                    {item.detail && <p className={styles.insightDetail}>{item.detail}</p>}
                    <p className={styles.insightLinks}>
                      {item.filter && (
                        <button type="button" className={styles.linkButton}
                          onClick={() => applyFilter(item.filter.key, item.filter.value)}>
                          Show only these visits
                        </button>
                      )}
                      {item.section && item.section !== 'overview' && (
                        <a href={`#stats-${item.section}`} className={styles.linkButton}>Details</a>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Headline numbers: each one switches the chart */}
      <section id="stats-overview" className={`${ui.card} ${styles.overview}`} aria-label="Overview">
        <div className={styles.tiles} role="tablist" aria-label="Chart shows">
          {METRICS.map((m) => {
            const value = s[m.id];
            const rate = m.id === 'engaged_visits' && s.visits ? ` (${pct(value, s.visits)} of visits)` : '';
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={metric === m.id}
                className={`${styles.tile} ${metric === m.id ? styles.tileActive : ''}`}
                onClick={() => setMetric(m.id)}
                title={m.hint}
              >
                <span className={styles.tileLabel}>{m.label}</span>
                <span className={styles.tileValue}>{formatNumber(value)}</span>
                <span className={styles.tileMeta}>
                  <Change now={value} before={p[m.id]} z={change[m.id]} />
                  <span className={styles.muted}>
                    {rate || ` vs ${formatNumber(p[m.id])} before`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        <div className={styles.chartHeader}>
          <p className={styles.chartCaption}>
            {metricInfo.label} per {data.range.bucket}, {rangeLabel}.{' '}
            <span className={styles.muted}>
              Faint line: the {days} days before. Hollow {data.range.bucket}: not over yet.
              {chart.events.length > 0 && ' Triangles: events.'}
            </span>
          </p>
          <TableToggle shown={showTable} onToggle={() => setShowTable(!showTable)} />
        </div>
        <ColumnChart
          buckets={chart.buckets}
          values={chart.current[metric]}
          previous={chart.previous[metric]}
          bucket={data.range.bucket}
          todayIndex={todayIndex}
          markers={chart.events}
          label={`${metricInfo.label} per ${data.range.bucket}, ${rangeLabel}`}
          unit={metricInfo.unit}
        />
        {showTable && (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr><th>{data.range.bucket === 'week' ? 'Week' : 'Day'}</th>{METRICS.map((m) => <th key={m.id} className={styles.num}>{m.label}</th>)}</tr>
              </thead>
              <tbody>
                {chart.buckets.map((b, i) => (
                  <tr key={b}>
                    <td>{bucketLabel(b, data.range.bucket)}</td>
                    {METRICS.map((m) => <td key={m.id} className={styles.num}>{formatNumber(chart.current[m.id][i])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className={styles.summaryLine}>
          {formatNumber(s.visits)} visits and {formatNumber(s.pageviews)} page views. A typical visit lasts{' '}
          {duration(s.median_visit_seconds)} of active time.
        </p>
      </section>

      <Actions data={data} />
      <div className={styles.twoUp}>
        <Signs data={data} applyFilter={applyFilter} />
        <Events data={data} applyFilter={applyFilter} />
      </div>
      <Pages data={data} applyFilter={applyFilter} />
      <Sources data={data} applyFilter={applyFilter} />
      <div className={styles.twoUp}>
        <Devices data={data} applyFilter={applyFilter} />
        <Weekdays data={data} />
      </div>
      <NotFound data={data} />
      <BehindTheScenes data={data} health={health} />
    </>
  );
};

// --- Sections -------------------------------------------------------------------------------

const Actions = ({ data }) => {
  const visits = data.summary.visits;
  const rows = data.actions;
  return (
    <Section id="actions" title="What people did"
      description="Clicks on links that matter. “Visits” counts each visit once, however many times it clicked.">
      {rows.length === 0 ? (
        <EmptyState>No clicks on outside links in this period.</EmptyState>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Action</th>
                <th className={styles.num}>Visits</th>
                <th className={styles.num}>Change</th>
                <th className={styles.hideSmall}>Trend</th>
                <th className={styles.hideSmall}>Mostly clicked on</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.action} className={row.key ? '' : styles.secondaryRow}>
                  <td>{row.action}</td>
                  <td className={styles.num}>
                    {formatNumber(row.visits)} <span className={styles.muted}>of {formatNumber(visits)}</span>
                  </td>
                  <td className={styles.num}><Change now={row.visits} before={row.previous_visits} z={row.z} /></td>
                  <td className={styles.hideSmall}><Sparkline values={row.series} /></td>
                  <td className={styles.hideSmall}>
                    {row.top_pages[0]?.name}
                    {row.zones.navbar ? <span className={styles.muted}> · {row.zones.navbar} from the menu</span> : null}
                    {row.zones.banner ? <span className={styles.muted}> · {row.zones.banner} from the banner</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className={styles.footnote}>
        Donations and memberships are completed on Givebutter, so this shows interest (clicks), not
        gifts. Givebutter’s own reports show what was given.
      </p>
    </Section>
  );
};

const Signs = ({ data, applyFilter }) => (
  <Section id="signs" title="Signs on the grounds"
    description="QR codes on the signs. A scan is a visit that started on the sign’s page."
    aside={data.signs.length > 0 && (
      <button type="button" className={styles.linkButton} onClick={() => applyFilter('source', 'QR code')}>
        QR visits only
      </button>
    )}>
    {data.signs.length === 0 ? (
      <EmptyState>No sign scans in this period.</EmptyState>
    ) : (
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sign</th>
              <th className={styles.num}>Scans</th>
              <th className={styles.hideSmall}>Trend</th>
              <th className={styles.num} title="Opened the sign as a PDF">PDF</th>
              <th className={styles.num} title="Went on to look at other pages of the website">Kept browsing</th>
            </tr>
          </thead>
          <tbody>
            {data.signs.map((row) => (
              <tr key={row.sign}>
                <td>
                  <span className={styles.capitalize}>{row.sign.replace(/-/g, ' ')}</span>
                  <span className={styles.subline}>
                    {row.last_scan ? `Last scan ${shortDate(row.last_scan)}` : 'No scans yet'}
                    {row.days_since_scan > 30 && <span className={styles.flag}> · none in {row.days_since_scan} days</span>}
                  </span>
                </td>
                <td className={styles.num}>{formatNumber(row.scans)}</td>
                <td className={styles.hideSmall}><Sparkline values={row.series} /></td>
                <td className={styles.num}>{formatNumber(row.pdf_opens)}</td>
                <td className={styles.num}>{formatNumber(row.explored)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Section>
);

const Events = ({ data, applyFilter }) => (
  <Section id="events" title="Events" description="Interest in each event’s page. Upcoming events first.">
    {data.events.length === 0 ? (
      <EmptyState>No event pages were viewed in this period.</EmptyState>
    ) : (
      <ul className={styles.eventList}>
        {data.events.map((event) => {
          const d = event.days_until;
          const when = d === null ? '' : d === 0 ? 'today' : d > 0 ? `in ${d} day${d === 1 ? '' : 's'}` : `${-d} day${d === -1 ? '' : 's'} ago`;
          return (
            <li key={event.id}>
              <button type="button" className={styles.eventButton} onClick={() => applyFilter('page', `/events/${event.id}`)}>
                <span className={styles.eventTitle}>{event.title}</span>
                <span className={styles.muted}>{event.start ? `${shortDate(event.start.slice(0, 10))} · ${when}` : ''}</span>
              </button>
              {event.visitors === 0 ? (
                <span className={`${styles.eventNumbers} ${styles.muted}`}>No views yet</span>
              ) : (
                <span className={styles.eventNumbers}>
                  <strong>{formatNumber(event.visitors)}</strong> viewed
                  {event.has_link && <> · <strong>{formatNumber(event.link_clicks)}</strong> clicked the link</>}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    )}
  </Section>
);

const Pages = ({ data, applyFilter }) => {
  const [all, setAll] = useState(false);
  const max = Math.max(1, ...data.pages.map((r) => r.visitors));
  return (
    <Section id="pages" title="Pages" description="Select a page to see only the visits that viewed it.">
      {data.pages.length === 0 ? (
        <EmptyState>No page views in this period.</EmptyState>
      ) : (
        <div className={styles.twoUpInner}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.caption}>Most viewed</caption>
              <thead>
                <tr>
                  <th>Page</th>
                  <th className={styles.num}>Visitors</th>
                  <th className={`${styles.num} ${styles.hideSmall}`}>Typical time</th>
                  <th className={styles.hideSmall}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {data.pages.slice(0, all ? undefined : 10).map((row) => (
                  <tr key={row.path}>
                    <td>
                      <button type="button" className={styles.rowButton} onClick={() => applyFilter('page', row.path)}>
                        {row.name}
                      </button>
                      <InlineBar value={row.visitors} max={max} />
                    </td>
                    <td className={styles.num}>{formatNumber(row.visitors)}</td>
                    <td className={`${styles.num} ${styles.hideSmall}`}>{duration(row.median_seconds)}</td>
                    <td className={styles.hideSmall}><Sparkline values={row.series} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.pages.length > 10 && (
              <p className={styles.footnoteLinks}>
                <button type="button" className={styles.linkButton} onClick={() => setAll(!all)}>
                  {all ? 'Show top 10' : `Show all ${data.pages.length} pages`}
                </button>
              </p>
            )}
          </div>
          <div id="stats-landing" className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.caption}>Where visits start</caption>
              <thead>
                <tr>
                  <th>First page</th>
                  <th className={styles.num}>Visits</th>
                  <th className={styles.num}>Engaged</th>
                </tr>
              </thead>
              <tbody>
                {data.landing_pages.slice(0, 10).map((row) => (
                  <tr key={row.path}>
                    <td>{row.name}</td>
                    <td className={styles.num}>{formatNumber(row.visits)}</td>
                    <td className={styles.num}>{pct(row.engaged, row.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Section>
  );
};

const Sources = ({ data, applyFilter }) => {
  const max = Math.max(1, ...data.sources.map((r) => r.visits));
  return (
    <Section id="sources" title="How people found the website">
      {data.sources.length === 0 ? (
        <EmptyState>No visits in this period.</EmptyState>
      ) : (
        <div className={styles.twoUpInner}>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Source</th>
                  <th className={styles.num}>Visits</th>
                  <th className={styles.num}>Change</th>
                  <th className={`${styles.num} ${styles.hideSmall}`}>Engaged</th>
                </tr>
              </thead>
              <tbody>
                {data.sources.map((row) => (
                  <tr key={row.source}>
                    <td>
                      <button type="button" className={styles.rowButton} onClick={() => applyFilter('source', row.source)}
                        title={SOURCE_HELP[row.source]}>
                        {row.source}
                      </button>
                      <InlineBar value={row.visits} max={max} />
                    </td>
                    <td className={styles.num}>{formatNumber(row.visits)}</td>
                    <td className={styles.num}><Change now={row.visits} before={row.previous_visits} z={row.z} /></td>
                    <td className={`${styles.num} ${styles.hideSmall}`}>{pct(row.engaged, row.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.footnote}>
              “Direct” also includes most visits from the Facebook and Instagram apps and from text messages,
              which hide where they came from. Adding <code>?utm_source=facebook</code> to links you post
              makes them show up as a campaign.
            </p>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <caption className={styles.caption}>Websites that sent visits</caption>
              <thead>
                <tr><th>Website</th><th className={styles.num}>Visits</th></tr>
              </thead>
              <tbody>
                {data.referrers.length === 0 && (
                  <tr><td colSpan={2} className={styles.muted}>None in this period.</td></tr>
                )}
                {data.referrers.map((row) => (
                  <tr key={row.referrer}>
                    <td>
                      {row.referrer}{' '}
                      <span className={styles.muted}>{row.source}</span>
                      {row.new && row.source === 'Other websites' && <span className={styles.newBadge}>New</span>}
                    </td>
                    <td className={styles.num}>{formatNumber(row.visits)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.campaigns.length > 0 && (
              <table className={styles.table}>
                <caption className={styles.caption}>Campaigns</caption>
                <tbody>
                  {data.campaigns.map((row) => (
                    <tr key={row.campaign}><td>{row.campaign}</td><td className={styles.num}>{formatNumber(row.visits)}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </Section>
  );
};

const Devices = ({ data, applyFilter }) => (
  <Section id="devices" title="Devices">
    {data.devices.length === 0 ? (
      <EmptyState>No visits in this period.</EmptyState>
    ) : (
      <>
        <ShareBar parts={data.devices.map((d) => ({ label: DEVICE_LABELS[d.device], value: d.visits, color: DEVICE_COLORS[d.device] }))} />
        <p className={styles.footnoteLinks}>
          {data.devices.map((d) => (
            <button key={d.device} type="button" className={styles.linkButton} onClick={() => applyFilter('device', d.device)}>
              Only {DEVICE_LABELS[d.device].toLowerCase()} visits
            </button>
          ))}
        </p>
      </>
    )}
  </Section>
);

const Weekdays = ({ data }) => {
  const max = Math.max(1, ...data.weekdays.map((d) => d.visits));
  return (
    <Section id="when" title="Busiest days" description="Visits by day of the week, museum time.">
      <table className={styles.table}>
        <tbody>
          {data.weekdays.map((d) => (
            <tr key={d.day}>
              <td className={styles.dayCell}>{d.day}</td>
              <td className={styles.barCell}><InlineBar value={d.visits} max={max} /></td>
              <td className={styles.num}>{formatNumber(d.visits)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Section>
  );
};

const NotFound = ({ data }) => (
  <Section id="not-found" title="Broken links people hit"
    description="Addresses on this site that don't exist. Fix the link where it came from, or ask for a redirect.">
    {data.not_found.length === 0 ? (
      <EmptyState>None in this period. 🎉</EmptyState>
    ) : (
      <table className={styles.table}>
        <thead><tr><th>Address</th><th className={styles.num}>Times</th><th>Came from</th></tr></thead>
        <tbody>
          {data.not_found.map((row) => (
            <tr key={row.path}>
              <td><code>{row.path}</code></td>
              <td className={styles.num}>{formatNumber(row.views)}</td>
              <td>{row.came_from}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </Section>
);

const BehindTheScenes = ({ data, health }) => {
  const t = data.traffic;
  const total = Object.values(t.visitors).reduce((a, b) => a + b, 0);
  const daily = t.daily;
  const groups = Object.entries(t.bot_groups).sort((a, b) => b[1] - a[1]);
  const errorRate = t.all_requests ? t.server_errors / t.all_requests : null;
  const [table, setTable] = useState(false);
  const series = useMemo(() => TRAFFIC_SERIES.map((s) => ({ ...s, values: daily.map((d) => d[s.key]) })), [daily]);

  return (
    <details id="stats-bots" className={`${ui.card} ${styles.behind}`}>
      <summary>
        <span className={styles.behindTitle}>Behind the scenes</span>
        <span className={styles.muted}>Bots and automated traffic, and the server’s health</span>
      </summary>

      <h4 className={styles.subheading}>Who else visits the server</h4>
      {total === 0 ? (
        <EmptyState>Server log totals appear here after the first full day.</EmptyState>
      ) : (
        <>
          <p className={styles.behindLead}>
            Of {formatNumber(total)} different addresses that contacted the server in this period, about{' '}
            <strong>{pct(t.visitors.human || 0, total)}</strong> were people using a browser. The rest were
            programs. That’s normal for every website today, and none of them are counted anywhere else on
            this page.{t.through && <span className={styles.muted}> Server logs counted through {shortDate(t.through)}.</span>}
          </p>
          <ul className={styles.legend}>
            {TRAFFIC_SERIES.map((s) => (
              <li key={s.key}>
                <span className={styles.swatch} style={{ background: s.color }} aria-hidden="true" />
                {s.label} <strong>{formatNumber(t.visitors[s.key] || 0)}</strong>
              </li>
            ))}
          </ul>
          <div className={styles.chartHeader}>
            <p className={styles.chartCaption}>
              Different addresses per day. <span className={styles.muted}>Hacking attempts: programs looking for
              WordPress or password files this site doesn’t have. Disguised bots: claim to be a browser but never
              run the website.</span>
            </p>
            <TableToggle shown={table} onToggle={() => setTable(!table)} />
          </div>
          <StackedColumns buckets={daily.map((d) => d.date)} series={series} label="People and bots per day" />
          {table && (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>Day</th>{TRAFFIC_SERIES.map((s) => <th key={s.key} className={styles.num}>{s.label}</th>)}</tr></thead>
                <tbody>
                  {daily.map((d) => (
                    <tr key={d.date}><td>{shortDate(d.date)}</td>{TRAFFIC_SERIES.map((s) => <td key={s.key} className={styles.num}>{formatNumber(d[s.key])}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className={styles.twoUpInner}>
            <table className={styles.table}>
              <caption className={styles.caption}>Bots that say who they are</caption>
              <thead><tr><th>Bot</th><th className={styles.num}>Requests</th></tr></thead>
              <tbody>
                {t.bots.map((b) => (
                  <tr key={b.name}>
                    <td>{b.name} <span className={styles.muted}>{BOT_GROUPS[b.group] || ''}</span></td>
                    <td className={styles.num}>{formatNumber(b.requests)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className={styles.table}>
              <caption className={styles.caption}>By kind</caption>
              <tbody>
                {groups.map(([group, requests]) => (
                  <tr key={group}><td>{BOT_GROUPS[group] || group}</td><td className={styles.num}>{formatNumber(requests)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4 className={styles.subheading}>Server health</h4>
      {!health ? (
        <p className={styles.muted}>Checking…</p>
      ) : (
        <Health health={health} errorRate={errorRate} requests={t.all_requests} errors={t.server_errors} />
      )}
    </details>
  );
};

const Health = ({ health, errorRate, requests, errors }) => {
  const rows = [];
  (health.resources || []).forEach((r) => {
    const value = r.unit === 'bytes' ? bytes(r.used) : r.unit === 'percent' ? `${Math.round(r.used)}%` : formatNumber(r.used);
    const limit = r.limit ? (r.unit === 'bytes' ? bytes(r.limit) : r.unit === 'percent' ? '100%' : formatNumber(r.limit)) : null;
    rows.push({ label: r.label, level: r.level, text: limit ? `${value} of ${limit}` : value });
  });
  if (health.uploads_bytes !== null && health.uploads_bytes !== undefined) {
    rows.push({ label: 'Uploaded files (images, PDFs)', level: 'ok', text: bytes(health.uploads_bytes) });
  }
  if (health.certificate) {
    rows.push({
      label: 'HTTPS certificate', level: health.certificate.days_left < 7 ? 'bad' : health.certificate.days_left < 20 ? 'warn' : 'ok',
      text: `Renews automatically; current one valid for ${health.certificate.days_left} more days`,
    });
  }
  if (errorRate !== null) {
    rows.push({
      label: 'Server errors', level: errorRate > 0.02 ? 'bad' : errorRate > 0.005 ? 'warn' : 'ok',
      text: `${formatNumber(errors)} of ${formatNumber(requests)} requests (${(100 * errorRate).toFixed(2)}%)`,
    });
  }
  if (health.errors) {
    rows.push({
      label: 'Problems logged by the website', level: health.errors.level,
      text: `${health.errors.last_24h} in the last 24 hours, ${health.errors.last_7d} in 7 days`,
    });
  }
  if (health.deploys?.length) {
    const last = health.deploys[0];
    rows.push({
      label: 'Last website update', level: last.ok ? 'ok' : 'bad',
      text: `${new Date(last.at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })} · ${last.result}`,
    });
  }

  if (rows.length === 0) {
    return <p className={styles.muted}>Server details aren’t available here (for example in local development).</p>;
  }
  return (
    <>
      <table className={styles.table}>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td>{row.text}</td>
              <td className={styles.statusCell}><Status level={row.level} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {health.errors?.recent?.length > 0 && (
        <details className={styles.errorDetails}>
          <summary>Recent problems</summary>
          <ul>
            {health.errors.recent.map((e) => <li key={e.at + e.message}><code>{e.at}</code> {e.message}</li>)}
          </ul>
        </details>
      )}
      <p className={styles.footnote}>
        From cPanel’s own usage report, checked every 10 minutes. “Watch” means getting close to a limit;
        “Act now” means something needs fixing.
      </p>
    </>
  );
};

export default AdminStats;
