import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdCampaign, MdSchedule, MdEvent, MdHandshake, MdGroups, MdArrowForward, MdOpenInNew } from 'react-icons/md';
import { useAuth } from '/src/features/authentication';
import { getBanner } from '/src/features/banner';
import { getHours } from '/src/features/hours';
import { getAllEvents } from '/src/features/events';
import { getAllSponsors } from '/src/features/sponsors';
import { getAllBoardMembers } from '/src/features/boardMembers';
import { AdminPage, AdminCard, ui } from '../ui';
import { eventStart } from '../../utils/dates';
import styles from './AdminOverview.module.css';

const settle = (result) => (result.status === 'fulfilled' ? { ok: true, value: result.value } : { ok: false });

const eventDate = (event) => new Date(eventStart(event));

const formatEventDate = (event) =>
  eventDate(event).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const StatCard = ({ icon, label, value, tone, detail, to, cta }) => (
  <Link to={to} className={styles.statCard}>
    <div className={styles.statTop}>
      <span className={styles.statIcon}>{icon}</span>
      {label}
    </div>
    <div className={`${styles.statValue} ${tone ? styles[tone] : ''}`}>{value}</div>
    <div className={styles.statDetail}>{detail}</div>
    <div className={styles.statCta}>
      {cta} <MdArrowForward />
    </div>
  </Link>
);

/**
 * Landing page of the admin dashboard: a greeting, an at-a-glance summary of
 * what the public site is currently showing, and shortcuts to common tasks.
 */
const AdminOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const [banner, status, events, sponsors, board] = await Promise.allSettled([
        getBanner(),
        getHours(),
        getAllEvents(),
        getAllSponsors(),
        getAllBoardMembers(),
      ]);
      if (!active) return;
      setData({
        banner: settle(banner),
        status: settle(status),
        events: settle(events),
        sponsors: settle(sponsors),
        board: settle(board),
      });
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const loading = data === null;
  const pending = { value: '…', detail: 'Loading' };
  const failed = { value: '—', detail: 'Could not load' };

  const bannerStat = (() => {
    if (loading) return pending;
    if (!data.banner.ok) return failed;
    const banner = data.banner.value;
    return banner
      ? { value: 'Live', tone: 'live', detail: banner.message }
      : { value: 'None', detail: 'No banner is shown on the home page.' };
  })();

  const statusStat = (() => {
    if (loading) return pending;
    if (!data.status.ok) return failed;
    const { isOpen, message } = data.status.value;
    return { value: isOpen ? 'Open' : 'Closed', tone: isOpen ? 'live' : 'closed', detail: message };
  })();

  const eventsStat = (() => {
    if (loading) return pending;
    if (!data.events.ok) return failed;
    const now = new Date();
    const upcoming = data.events.value
      .filter((event) => eventDate(event) >= now)
      .sort((a, b) => eventDate(a) - eventDate(b));
    const next = upcoming[0];
    return {
      value: upcoming.length,
      detail: next ? `Next: ${formatEventDate(next)} · ${next.title}` : 'No upcoming events scheduled.',
    };
  })();

  const countStat = (entry, noun) => {
    if (loading) return pending;
    if (!entry.ok) return failed;
    const count = entry.value.length;
    return { value: count, detail: count === 1 ? `1 ${noun} listed on the site.` : `${count} ${noun}s listed on the site.` };
  };

  return (
    <AdminPage
      title={`Welcome back, ${user?.username || 'admin'}`}
      description="Here is what the website is showing right now. Select a card to manage that section."
    >
      <div className={styles.statGrid}>
        <StatCard
          icon={<MdCampaign />}
          label="Home page banner"
          to="/admin/banner"
          cta={bannerStat.value === 'Live' ? 'Edit banner' : 'Publish a banner'}
          {...bannerStat}
        />
        <StatCard
          icon={<MdSchedule />}
          label="Museum status"
          to="/admin/hours"
          cta="Manage hours"
          {...statusStat}
        />
        <StatCard
          icon={<MdEvent />}
          label="Upcoming events"
          to="/admin/events"
          cta="Manage events"
          {...eventsStat}
        />
        <StatCard
          icon={<MdHandshake />}
          label="Sponsors"
          to="/admin/sponsors"
          cta="Manage sponsors"
          {...countStat(loading ? null : data.sponsors, 'sponsor')}
        />
        <StatCard
          icon={<MdGroups />}
          label="Board members"
          to="/admin/board"
          cta="Manage board"
          {...countStat(loading ? null : data.board, 'board member')}
        />
      </div>

      <AdminCard title="Quick actions">
        <div className={ui.actions}>
          <Link to="/admin/banner" className={`${ui.button} ${ui.buttonPrimary}`}>
            <MdCampaign /> Publish a banner
          </Link>
          <Link to="/admin/events" className={`${ui.button} ${ui.buttonSecondary}`}>
            <MdEvent /> Add an event
          </Link>
          <Link to="/admin/hours" className={`${ui.button} ${ui.buttonSecondary}`}>
            <MdSchedule /> Update hours
          </Link>
          <a href="/" target="_blank" rel="noopener noreferrer" className={`${ui.button} ${ui.buttonSecondary}`}>
            <MdOpenInNew /> View website
          </a>
        </div>
      </AdminCard>
    </AdminPage>
  );
};

export default AdminOverview;
