import { useEffect, useMemo, useState } from 'react';
import {
  MdArrowDownward, MdArrowUpward, MdCheckCircle, MdClose, MdErrorOutline, MdHelpOutline, MdRemove, MdWarningAmber,
} from 'react-icons/md';
import { isBrowserIgnored, setIgnoreThisBrowser } from '/src/features/stats';
import { AdminPage, AdminCard, ui } from '../ui';
import { getStatsHealth, getStatsReport } from './statsService';
import { ColumnChart, InlineBar, ShareBar, Sparkline, StackedColumns } from './charts';
import { bucketLabel, formatNumber, parseDay, shortDate } from './format';
import styles from './AdminStats.module.css';

const RANGES = [
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: '90d', label: '90 days' },
  { id: '12m', label: '12 months' },
];

const METRICS = [
  { id: 'visitors', label: 'Visitors', unit: 'visitors', hint: 'Counted once per day' },
  { id: 'engaged_visits', label: 'Engaged visits', unit: 'engaged visits', hint: '2+ pages, 10+ seconds active, or a key action' },
  { id: 'planned_visits', label: 'Planned a visit', unit: 'visits', hint: 'Viewed hours, tours or directions, or called' },
  { id: 'action_visits', label: 'Took action', unit: 'visits', hint: 'Donate, membership, sponsorship, event link, directions, call or email' },
];

const SOURCE_HINTS = {
  Direct: 'No referrer: bookmarks, typed addresses, app and text-message links',
  'QR code': 'Visits that started on a sign page',
  Campaign: 'Links tagged with utm_source or utm_campaign',
};

const VISIT_TYPES = [
  { key: 'human', label: 'People', color: '#bf8045', hint: 'Browsers that loaded and ran the website' },
  { key: 'bot', label: 'Declared bots', color: '#3987e5', hint: 'Identify themselves: search engines, AI crawlers, link previews' },
  { key: 'scanner', label: 'Attack scanners', color: '#199e70', hint: 'Probing for WordPress, PHP or password files' },
  { key: 'scraper', label: 'Disguised bots', color: '#9085e9', hint: 'Claim to be a browser but never run the website' },
];

const BOT_GROUPS = {
  search: 'Search',
  ai: 'AI',
  seo: 'SEO',
  preview: 'Link preview',
  monitor: 'Monitor',
  tool: 'Script',
  scanner: 'Scanner',
  other: 'Other',
};

const DEVICE_COLORS = { phone: '#bf8045', desktop: '#3987e5', tablet: '#199e70' };
const DEVICE_LABELS = { phone: 'Phone', desktop: 'Computer', tablet: 'Tablet' };

const timeAgo = (iso) => {
  if (!iso) return null;
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
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

/** "+12" / "−3"; the arrow is only colored when the change is larger than normal variation. */
const Change = ({ now, before, z, goodWhenUp = true }) => {
  if (now === null || before === null || now === undefined || before === undefined) return null;
  const diff = now - before;
  const real = Math.abs(z ?? 0) >= 2;
  const tone = !real || diff === 0 ? 'neutral' : (diff > 0) === goodWhenUp ? 'good' : 'bad';
  const Icon = diff > 0 ? MdArrowUpward : diff < 0 ? MdArrowDownward : MdRemove;
  return (
    <span className={`${styles.change} ${styles[`change_${tone}`]}`}
      title={real ? undefined : 'Within normal variation'}>
      <Icon aria-hidden="true" />
      {diff > 0 ? '+' : diff < 0 ? '−' : ''}
      {formatNumber(Math.abs(diff))}
    </span>
  );
};

const Status = ({ level }) => {
  const map = {
    ok: [MdCheckCircle, 'OK', styles.statusOk],
    warn: [MdWarningAmber, 'Watch', styles.statusWarn],
    bad: [MdErrorOutline, 'Action needed', styles.statusBad],
  };
  const [Icon, word, cls] = map[level] || [MdHelpOutline, 'Unknown', styles.statusUnknown];
  return (
    <span className={`${styles.status} ${cls}`}>
      <Icon aria-hidden="true" /> {word}
    </span>
  );
};

const Section = ({ id, title, aside, children }) => (
  <section id={`stats-${id}`} className={styles.section}>
    <AdminCard title={title} aside={aside}>
      {children}
    </AdminCard>
  </section>
);

const Empty = ({ children = 'No data for this period' }) => <p className={styles.empty}>{children}</p>;

const TableToggle = ({ shown, onToggle }) => (
  <button type="button" className={styles.linkButton} onClick={onToggle} aria-expanded={shown}>
    {shown ? 'Chart' : 'Table'}
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

  const applyFilter = (key, value) => setFilter({ key, value });

  const toggleIgnored = () => {
    setIgnoreThisBrowser(!ignored);
    setIgnored(!ignored);
  };

  const countingSince = data?.tracking_since && parseDay(data.tracking_since) > parseDay(data.previous.start)
    ? data.tracking_since : null;

  return (
    <AdminPage title="Stats">
      <div className={styles.controls}>
        <div className={styles.segmented} role="group" aria-label="Period">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              className={range === r.id ? styles.segmentActive : ''}
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
        {filter && (
          <span className={styles.filterChip}>
            {filter.key === 'device' ? DEVICE_LABELS[filter.value] : filter.value}
            <button type="button" onClick={() => setFilter(null)} aria-label="Remove filter">
              <MdClose aria-hidden="true" />
            </button>
          </span>
        )}
        <span className={styles.controlsMeta}>
          {countingSince && <span>Counting since {shortDate(countingSince)}</span>}
          {data?.last_visit && <span>Last visit {timeAgo(data.last_visit)}</span>}
        </span>
      </div>

      {error && <p className={`${ui.status} ${ui.statusError}`}>{error}</p>}
      {!data && loading && <p className={styles.loading} role="status">Loading…</p>}

      {data && (
        <div className={`${styles.body} ${loading ? styles.refreshing : ''}`} aria-busy={loading}>
          <Overview data={data} metric={metric} setMetric={setMetric} />
          <div className={styles.twoUp}>
            <Events data={data} applyFilter={applyFilter} />
            <Actions data={data} />
          </div>
          <div className={styles.twoUp}>
            <Pages data={data} applyFilter={applyFilter} />
            <Sources data={data} applyFilter={applyFilter} />
          </div>
          <div className={styles.threeUp}>
            <Signs data={data} applyFilter={applyFilter} />
            <Devices data={data} applyFilter={applyFilter} />
            <Weekdays data={data} />
          </div>
          {data.not_found.length > 0 && <NotFound data={data} />}
          <VisitTypes data={data} />
          <Server data={data} health={health} />
          <label className={styles.ignoreToggle}>
            <input type="checkbox" checked={!ignored} onChange={toggleIgnored} />
            Count visits from this browser
          </label>
        </div>
      )}
    </AdminPage>
  );
};

// --- Sections -------------------------------------------------------------------------------

const Overview = ({ data, metric, setMetric }) => {
  const [table, setTable] = useState(false);
  const { summary: s, previous_summary: p, change, chart } = data;
  const todayIndex = data.range.bucket === 'day' ? chart.buckets.indexOf(data.range.today) : chart.buckets.length - 1;
  const info = METRICS.find((m) => m.id === metric);

  return (
    <section id="stats-overview" className={`${ui.card} ${styles.overview}`} aria-label="Overview">
      <div className={styles.tiles} role="tablist" aria-label="Chart">
        {METRICS.map((m) => (
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
            <span className={styles.tileValue}>{formatNumber(s[m.id])}</span>
            <span className={styles.tileMeta}>
              <Change now={s[m.id]} before={p[m.id]} z={change[m.id]} />
              <span className={styles.muted}>vs {formatNumber(p[m.id])}</span>
            </span>
          </button>
        ))}
      </div>

      <div className={styles.chartHeader}>
        <ul className={styles.chartKey} aria-label="Chart key">
          <li><span className={styles.keyBar} aria-hidden="true" />{info.label}</li>
          <li><span className={styles.keyLine} aria-hidden="true" />Previous {data.range.days} days</li>
          {chart.events.length > 0 && <li><span className={styles.keyMarker} aria-hidden="true" />Event</li>}
        </ul>
        <TableToggle shown={table} onToggle={() => setTable(!table)} />
      </div>
      {table ? (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{data.range.bucket === 'week' ? 'Week' : 'Day'}</th>
                {METRICS.map((m) => <th key={m.id} className={styles.num}>{m.label}</th>)}
              </tr>
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
      ) : (
        <ColumnChart
          buckets={chart.buckets}
          values={chart.current[metric]}
          previous={chart.previous[metric]}
          bucket={data.range.bucket}
          todayIndex={todayIndex}
          markers={chart.events}
          label={`${info.label} per ${data.range.bucket}`}
          unit={info.unit}
        />
      )}

      <dl className={styles.secondary}>
        <div><dt>Visits</dt><dd>{formatNumber(s.visits)}</dd></div>
        <div><dt>Page views</dt><dd>{formatNumber(s.pageviews)}</dd></div>
        <div><dt>Engaged</dt><dd>{s.visits ? pct(s.engaged_visits, s.visits) : '—'}</dd></div>
        <div><dt>Typical visit</dt><dd>{duration(s.median_visit_seconds)}</dd></div>
      </dl>
    </section>
  );
};

const Events = ({ data, applyFilter }) => (
  <Section id="events" title="Events">
    {data.events.length === 0 ? <Empty /> : (
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Event</th>
              <th className={styles.num}>Viewers</th>
              <th className={styles.num}>Link clicks</th>
            </tr>
          </thead>
          <tbody>
            {data.events.map((event) => {
              const d = event.days_until;
              const when = d === null ? '' : d === 0 ? 'Today' : d > 0 ? `In ${d} day${d === 1 ? '' : 's'}` : `${-d} day${d === -1 ? '' : 's'} ago`;
              return (
                <tr key={event.id}>
                  <td>
                    <button type="button" className={styles.rowButton} onClick={() => applyFilter('page', `/events/${event.id}`)}>
                      {event.title}
                    </button>
                    <span className={styles.subline}>
                      {event.start ? `${shortDate(event.start.slice(0, 10))} · ${when}` : 'Deleted'}
                    </span>
                  </td>
                  <td className={styles.num}>{formatNumber(event.visitors)}</td>
                  <td className={styles.num}>{event.has_link ? formatNumber(event.link_clicks) : <span className={styles.muted}>—</span>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </Section>
);

const Actions = ({ data }) => {
  const visits = data.summary.visits;
  return (
    <Section id="actions" title="Actions">
      {data.actions.length === 0 ? <Empty /> : (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th className={styles.num}>Visits</th>
                  <th className={styles.num}>Change</th>
                  <th className={styles.hideSmall} aria-label="Trend" />
                </tr>
              </thead>
              <tbody>
                {data.actions.map((row) => (
                  <tr key={row.action} className={row.key ? '' : styles.secondaryRow}
                    title={row.top_pages[0] ? `Mostly from ${row.top_pages[0].name}` : undefined}>
                    <td>{row.action}</td>
                    <td className={styles.num}>
                      {formatNumber(row.visits)} <span className={styles.muted}>{pct(row.visits, visits)}</span>
                    </td>
                    <td className={styles.num}><Change now={row.visits} before={row.previous_visits} z={row.z} /></td>
                    <td className={styles.hideSmall}><Sparkline values={row.series} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.footnote}>Donate, Membership and Sponsorship are clicks to Givebutter, not completed gifts.</p>
        </>
      )}
    </Section>
  );
};

const Pages = ({ data, applyFilter }) => {
  const [view, setView] = useState('top');
  const [all, setAll] = useState(false);
  const rows = view === 'top' ? data.pages : data.landing_pages;
  const max = Math.max(1, ...rows.map((r) => (view === 'top' ? r.visitors : r.visits)));
  const shown = rows.slice(0, all ? undefined : 10);
  return (
    <Section id="pages" title="Pages" aside={(
      <div className={styles.miniTabs} role="group" aria-label="Pages view">
        <button type="button" aria-pressed={view === 'top'} onClick={() => setView('top')}>Top</button>
        <button type="button" aria-pressed={view === 'entry'} onClick={() => setView('entry')}>Entry</button>
      </div>
    )}>
      {rows.length === 0 ? <Empty /> : (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Page</th>
                  <th className={styles.num}>{view === 'top' ? 'Visitors' : 'Visits'}</th>
                  <th className={styles.num}>{view === 'top' ? 'Time' : 'Engaged'}</th>
                  {view === 'top' && <th className={styles.hideSmall} aria-label="Trend" />}
                </tr>
              </thead>
              <tbody>
                {shown.map((row) => (
                  <tr key={row.path}>
                    <td>
                      <button type="button" className={styles.rowButton} onClick={() => applyFilter('page', row.path)}>
                        {row.name}
                      </button>
                      <InlineBar value={view === 'top' ? row.visitors : row.visits} max={max} />
                    </td>
                    <td className={styles.num}>{formatNumber(view === 'top' ? row.visitors : row.visits)}</td>
                    <td className={styles.num}>{view === 'top' ? duration(row.median_seconds) : pct(row.engaged, row.visits)}</td>
                    {view === 'top' && <td className={styles.hideSmall}><Sparkline values={row.series} /></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <button type="button" className={`${styles.linkButton} ${styles.more}`} onClick={() => setAll(!all)}>
              {all ? 'Show fewer' : `Show all ${rows.length}`}
            </button>
          )}
        </>
      )}
    </Section>
  );
};

const Sources = ({ data, applyFilter }) => {
  const [view, setView] = useState('channels');
  const max = Math.max(1, ...data.sources.map((r) => r.visits));
  return (
    <Section id="sources" title="Sources" aside={(
      <div className={styles.miniTabs} role="group" aria-label="Sources view">
        <button type="button" aria-pressed={view === 'channels'} onClick={() => setView('channels')}>Channels</button>
        <button type="button" aria-pressed={view === 'sites'} onClick={() => setView('sites')}>Websites</button>
      </div>
    )}>
      {data.sources.length === 0 ? <Empty /> : view === 'channels' ? (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Channel</th>
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
                        title={SOURCE_HINTS[row.source]}>
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
          </div>
          {data.sources.some((r) => r.source === 'Direct') && (
            <p className={styles.footnote}>
              Direct includes links opened from the Facebook and Instagram apps and text messages, which hide
              their source. Add <code>?utm_source=facebook</code> to shared links to track them.
            </p>
          )}
        </>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr><th>Website</th><th>Channel</th><th className={styles.num}>Visits</th></tr>
            </thead>
            <tbody>
              {data.referrers.length === 0 && data.campaigns.length === 0 && (
                <tr><td colSpan={3}><Empty /></td></tr>
              )}
              {data.referrers.map((row) => (
                <tr key={row.referrer}>
                  <td>
                    {row.referrer}
                    {row.new && row.source === 'Other websites' && <span className={styles.newBadge}>New</span>}
                  </td>
                  <td className={styles.muted}>{row.source}</td>
                  <td className={styles.num}>{formatNumber(row.visits)}</td>
                </tr>
              ))}
              {data.campaigns.map((row) => (
                <tr key={`c-${row.campaign}`}>
                  <td>{row.campaign}</td>
                  <td className={styles.muted}>Campaign</td>
                  <td className={styles.num}>{formatNumber(row.visits)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
};

const Signs = ({ data, applyFilter }) => (
  <Section id="signs" title="QR signs" aside={data.signs.length > 0 && (
    <button type="button" className={styles.linkButton} onClick={() => applyFilter('source', 'QR code')}>Filter</button>
  )}>
    {data.signs.length === 0 ? <Empty /> : (
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Sign</th>
            <th className={styles.num}>Scans</th>
            <th className={styles.num} title="Opened the sign as a PDF">PDF</th>
            <th className={styles.num} title="Went on to other pages of the website">Browsed</th>
          </tr>
        </thead>
        <tbody>
          {data.signs.map((row) => (
            <tr key={row.sign}>
              <td>
                <span className={styles.capitalize}>{row.sign.replace(/-/g, ' ')}</span>
                <span className={`${styles.subline} ${row.days_since_scan > 30 ? styles.flag : ''}`}>
                  {row.last_scan ? `Last ${shortDate(row.last_scan)}` : 'Never scanned'}
                </span>
              </td>
              <td className={styles.num}>{formatNumber(row.scans)}</td>
              <td className={styles.num}>{formatNumber(row.pdf_opens)}</td>
              <td className={styles.num}>{formatNumber(row.explored)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </Section>
);

const Devices = ({ data, applyFilter }) => (
  <Section id="devices" title="Devices">
    {data.devices.length === 0 ? <Empty /> : (
      <ShareBar
        parts={data.devices.map((d) => ({ key: d.device, label: DEVICE_LABELS[d.device], value: d.visits, color: DEVICE_COLORS[d.device] }))}
        onSelect={(key) => applyFilter('device', key)}
      />
    )}
  </Section>
);

const Weekdays = ({ data }) => {
  const max = Math.max(1, ...data.weekdays.map((d) => d.visits));
  return (
    <Section id="when" title="Day of week">
      <table className={styles.table}>
        <tbody>
          {data.weekdays.map((d) => (
            <tr key={d.day} className={styles.compactRow}>
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
  <Section id="not-found" title="Broken links">
    <table className={styles.table}>
      <thead><tr><th>Address</th><th>Referred by</th><th className={styles.num}>Hits</th></tr></thead>
      <tbody>
        {data.not_found.map((row) => (
          <tr key={row.path}>
            <td><code>{row.path}</code></td>
            <td className={styles.muted}>{row.came_from}</td>
            <td className={styles.num}>{formatNumber(row.views)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </Section>
);

const VisitTypes = ({ data }) => {
  const t = data.traffic;
  const [table, setTable] = useState(false);
  const total = VISIT_TYPES.reduce((sum, v) => sum + (t.visitors[v.key] || 0), 0);
  const series = useMemo(() => VISIT_TYPES.map((v) => ({ ...v, values: t.daily.map((d) => d[v.key]) })), [t.daily]);
  const maxBot = Math.max(1, ...t.bots.map((b) => b.requests));

  return (
    <Section id="visit-types" title="Visit types"
      aside={t.through && <span className={styles.asideMeta}>Server logs through {shortDate(t.through)}</span>}>
      {total === 0 ? <Empty>Available after the first full day</Empty> : (
        <>
          <div className={styles.typesHead}>
            <div className={styles.hero}>
              <span className={styles.heroValue}>{pct(t.visitors.human || 0, total)}</span>
              <span className={styles.heroLabel}>real people</span>
              <span className={styles.muted}>{formatNumber(t.visitors.human || 0)} of {formatNumber(total)} unique addresses</span>
            </div>
            <div className={styles.typesShare}>
              <div className={styles.shareBar} aria-hidden="true">
                {VISIT_TYPES.filter((v) => t.visitors[v.key]).map((v) => (
                  <span key={v.key} style={{ flexGrow: t.visitors[v.key], background: v.color }} />
                ))}
              </div>
              <ul className={styles.typeLegend}>
                {VISIT_TYPES.map((v) => (
                  <li key={v.key} title={v.hint}>
                    <span className={styles.swatch} style={{ background: v.color }} aria-hidden="true" />
                    <span className={styles.typeName}>{v.label}</span>
                    <span className={styles.num}>{formatNumber(t.visitors[v.key] || 0)}</span>
                    <span className={`${styles.num} ${styles.muted}`}>{pct(t.visitors[v.key] || 0, total)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={styles.chartHeader}>
            <span className={styles.chartLabel}>Unique addresses per day</span>
            <TableToggle shown={table} onToggle={() => setTable(!table)} />
          </div>
          {table ? (
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <thead><tr><th>Day</th>{VISIT_TYPES.map((v) => <th key={v.key} className={styles.num}>{v.label}</th>)}</tr></thead>
                <tbody>
                  {t.daily.map((d) => (
                    <tr key={d.date}><td>{shortDate(d.date)}</td>{VISIT_TYPES.map((v) => <td key={v.key} className={styles.num}>{formatNumber(d[v.key])}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <StackedColumns buckets={t.daily.map((d) => d.date)} series={series} label="Unique addresses per day by visit type" />
          )}

          {t.bots.length > 0 && (
            <div className={styles.tableScroll}>
              <table className={`${styles.table} ${styles.spaceTop}`}>
                <thead>
                  <tr><th>Declared bot</th><th>Type</th><th className={styles.num}>Requests</th></tr>
                </thead>
                <tbody>
                  {t.bots.map((b) => (
                    <tr key={b.name}>
                      <td>{b.name}<InlineBar value={b.requests} max={maxBot} /></td>
                      <td className={styles.muted}>{BOT_GROUPS[b.group] || 'Other'}</td>
                      <td className={styles.num}>{formatNumber(b.requests)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Section>
  );
};

const Server = ({ data, health }) => {
  const t = data.traffic;
  const rows = [];
  if (health) {
    (health.resources || []).forEach((r) => {
      const value = r.unit === 'bytes' ? bytes(r.used) : r.unit === 'percent' ? `${Math.round(r.used)}%` : formatNumber(r.used);
      const limit = r.limit ? (r.unit === 'bytes' ? bytes(r.limit) : r.unit === 'percent' ? '100%' : formatNumber(r.limit)) : null;
      rows.push({ label: r.label, level: r.level, value, limit, share: r.limit ? r.used / r.limit : null });
    });
    if (health.uploads_bytes !== null && health.uploads_bytes !== undefined) {
      rows.push({ label: 'Uploads', level: 'ok', value: bytes(health.uploads_bytes) });
    }
    if (health.certificate) {
      const left = health.certificate.days_left;
      rows.push({ label: 'HTTPS certificate', level: left < 7 ? 'bad' : left < 20 ? 'warn' : 'ok', value: `${left} days left` });
    }
    if (health.errors) {
      rows.push({ label: 'Logged errors (24 h / 7 days)', level: health.errors.level,
        value: `${health.errors.last_24h} / ${health.errors.last_7d}` });
    }
    if (health.deploys?.length) {
      const last = health.deploys[0];
      rows.push({ label: 'Last update', level: last.ok ? 'ok' : 'bad',
        value: new Date(last.at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) });
    }
  }
  if (t.all_requests) {
    const rate = t.server_errors / t.all_requests;
    rows.push({ label: 'Server error rate', level: rate > 0.02 ? 'bad' : rate > 0.005 ? 'warn' : 'ok',
      value: `${(100 * rate).toFixed(2)}%`, limit: `${formatNumber(t.server_errors)} of ${formatNumber(t.all_requests)}` });
  }

  return (
    <Section id="server" title="Server">
      {!health && rows.length === 0 ? <p className={styles.muted}>Checking…</p> : rows.length === 0 ? <Empty>Not available</Empty> : (
        <>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    <td className={styles.num}>
                      {row.value}
                      {row.limit && <span className={styles.muted}> / {row.limit}</span>}
                    </td>
                    <td className={`${styles.hideSmall} ${styles.meterCell}`}>
                      {row.share !== null && row.share !== undefined && (
                        <span className={styles.meter} aria-hidden="true">
                          <span className={styles[`meter_${row.level}`]} style={{ width: `${Math.max(1, Math.min(100, 100 * row.share))}%` }} />
                        </span>
                      )}
                    </td>
                    <td className={styles.statusCell}><Status level={row.level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {health?.errors?.recent?.length > 0 && (
            <details className={styles.errorDetails}>
              <summary>Recent errors</summary>
              <ul>
                {health.errors.recent.map((e) => <li key={e.at + e.message}><code>{e.at}</code> {e.message}</li>)}
              </ul>
            </details>
          )}
        </>
      )}
    </Section>
  );
};

export default AdminStats;
