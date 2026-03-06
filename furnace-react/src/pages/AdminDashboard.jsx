import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MdDashboard, MdEvent, MdHandshake, MdGroups, MdSchedule } from 'react-icons/md';
import styles from './AdminDashboard.module.css';
import { useAuth } from '/src/features/authentication';

const DashLink = ({ to, icon, children }) => {
	return (
		<NavLink
			to={to}
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
	const { logoutUser } = useAuth();

	const handleLogout = () => {
		logoutUser();
		navigate('/');
	};

	return (
		<div className={styles.adminDashboard}>
			<nav className={styles.sidebar}>
				<SidebarGroup label="Overview">
					<DashLink to="/admin/" icon={<MdDashboard />}>Dashboard</DashLink>
				</SidebarGroup>
				<SidebarGroup label="Content">
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
