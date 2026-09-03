import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MdDashboard, MdEvent, MdHandshake, MdGroups, MdSchedule, MdCampaign, MdOpenInNew } from 'react-icons/md';
import styles from './AdminDashboard.module.css';
import { useAuth } from '/src/features/authentication';

const DashLink = ({ to, icon, end = false, children }) => {
	return (
		<NavLink
			to={to}
			end={end}
			className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
		>
			{icon && <span className={styles.navIcon}>{icon}</span>}
			{children}
		</NavLink>
	);
};

const SidebarGroup = ({ label, children }) => {
	return (
		<div className={styles.sidebarGroup}>
			<span className={styles.groupLabel}>{label}</span>
			{children}
		</div>
	);
};

const AdminDashboard = () => {
	const navigate = useNavigate();
	const { user, logoutUser } = useAuth();

	const handleLogout = () => {
		logoutUser();
		navigate('/');
	};

	return (
		<div className={styles.adminDashboard}>
			<nav className={styles.sidebar}>
				<div className={styles.brand}>
					<span className={styles.brandTitle}>Cornwall Iron Furnace</span>
					<span className={styles.brandSub}>Admin dashboard</span>
				</div>
				<SidebarGroup label="Overview">
					<DashLink to="/admin/" icon={<MdDashboard />} end>Dashboard</DashLink>
				</SidebarGroup>
				<SidebarGroup label="Content">
					<DashLink to="/admin/banner" icon={<MdCampaign />}>Banner</DashLink>
					<DashLink to="/admin/events" icon={<MdEvent />}>Events</DashLink>
					<DashLink to="/admin/sponsors" icon={<MdHandshake />}>Sponsors</DashLink>
					<DashLink to="/admin/board" icon={<MdGroups />}>Board</DashLink>
				</SidebarGroup>
				<SidebarGroup label="Settings">
					<DashLink to="/admin/hours" icon={<MdSchedule />}>Hours</DashLink>
				</SidebarGroup>
			</nav>
			<div className={styles.mainContent}>
				<header className={styles.topBar}>
					<a href="/" target="_blank" rel="noopener noreferrer" className={styles.viewSite}>
						<MdOpenInNew /> View website
					</a>
					<span className={styles.userInfo}>
						Signed in as <strong>{user?.username}</strong>
					</span>
					<button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
				</header>
				<div className={styles.content}>
					<Outlet />
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
