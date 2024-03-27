import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { useAuth } from '/src/features/authentication';

const DashLink = ({ to, children }) => {
	return (
		<NavLink
			to={to}
			className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
		>
			{children}
		</NavLink>
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
				<DashLink to="/admin/">Dashboard</DashLink>
				<DashLink to="/admin/hours">Hours</DashLink>
				<DashLink to="/admin/events">Events</DashLink>
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