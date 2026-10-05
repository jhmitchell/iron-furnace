import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdCampaign, MdSchedule, MdEvent, MdArrowForward } from 'react-icons/md';
import { useAuth } from '/src/features/authentication';
import { getBanner } from '/src/features/banner';
import { getHours } from '/src/features/hours';
import { getAllEvents } from '/src/features/events';
import { AdminPage, ui } from '../ui';
import { eventStart } from '../../utils/dates';
import styles from './AdminOverview.module.css';

const settle = (result) => (result.status === 'fulfilled' ? { ok: true, value: result.value } : { ok: false });

const eventDate = (event) => new Date(eventStart(event));

const formatEventDate = (event) =>
  eventDate(event).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

/** One line of the "On the website now" panel: what it is, what it shows, and a link to change it. */
const LiveRow = ({ label, badge, text, to, cta }) => (
  <div className={styles.row}>
    <dt className={styles.rowLabel}>{label}</dt>
    <dd className={styles.rowValue}>
      {badge}
      {text && <span className={styles.rowText}>{text}</span>}
    </dd>
    <dd className={styles.rowAction}>
      <Link to={to} className={styles.rowLink}>
        {cta} <MdArrowForward aria-hidden="true" />
      </Link>
    </dd>
  </div>
);

const Badge = ({ tone, children }) => <span className={`${ui.badge} ${ui[tone]}`}>{children}</span>;

/**
 * Landing page of the admin dashboard: shortcuts to the common tasks, then what the
 * public site is showing right now (museum status, home page banner, next event).
 */
const AdminOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [banner, status, events] = await Promise.allSettled([getBanner(), getHours(), getAllEvents()]);
      if (!active) return;
      setData({ banner: settle(banner), status: settle(status), events: settle(events) });
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const loading = data === null;
  const pending = { text: 'Loading…' };
  const failed = { text: 'Could not load. Refresh the page to try again.' };

  const status = (() => {
    if (loading) return pending;
    if (!data.status.ok) return failed;
    const { isOpen, message } = data.status.value;
    return {
      badge: isOpen ? <Badge tone="badgeLive">Open</Badge> : <Badge tone="badgeClosed">Closed</Badge>,
      text: message,
    };
  })();

  const hasBanner = !loading && data.banner.ok && Boolean(data.banner.value);
  const banner = (() => {
    if (loading) return pending;
    if (!data.banner.ok) return failed;
    return hasBanner
      ? { badge: <Badge tone="badgeLive">Showing</Badge>, text: data.banner.value.message }
      : { badge: <Badge tone="badgeOff">None</Badge> };
  })();

  const nextEvent = (() => {
    if (loading) return pending;
    if (!data.events.ok) return failed;
    const now = new Date();
    const next = data.events.value
      .filter((event) => eventDate(event) >= now)
      .sort((a, b) => eventDate(a) - eventDate(b))[0];
    return next
      ? { text: `${formatEventDate(next)} · ${next.title}` }
      : { badge: <Badge tone="badgeOff">None scheduled</Badge> };
  })();

  return (
    <AdminPage title={`Welcome back, ${user?.username || 'admin'}`}>
      <div className={`${ui.actions} ${styles.quickActions}`}>
        <Link to="/admin/banner" className={`${ui.button} ${ui.buttonPrimary}`}>
          <MdCampaign aria-hidden="true" /> {hasBanner ? 'Edit the banner' : 'Publish a banner'}
        </Link>
        <Link to="/admin/events" className={`${ui.button} ${ui.buttonSecondary}`}>
          <MdEvent aria-hidden="true" /> Add an event
        </Link>
        <Link to="/admin/hours" className={`${ui.button} ${ui.buttonSecondary}`}>
          <MdSchedule aria-hidden="true" /> Update hours
        </Link>
      </div>

      <section className={ui.card} aria-labelledby="live-heading">
        <h3 id="live-heading" className={`${ui.cardTitle} ${styles.panelTitle}`}>On the website now</h3>
        <dl className={styles.rows} aria-busy={loading}>
          <LiveRow label="Museum" to="/admin/hours" cta="Hours" {...status} />
          <LiveRow label="Home page banner" to="/admin/banner" cta="Banner" {...banner} />
          <LiveRow label="Next event" to="/admin/events" cta="Events" {...nextEvent} />
        </dl>
      </section>
    </AdminPage>
  );
};

export default AdminOverview;
