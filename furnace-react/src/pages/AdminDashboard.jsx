import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import styles from './AdminDashboard.module.css';
import { useAuth } from '/src/features/authentication';

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
				<NavLink
					to="/admin"
					className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
				>
					Dashboard
				</NavLink>
				<NavLink
					to="/admin/hours"
					className={({ isActive }) => isActive ? `${styles.navLink} ${styles.activeNavLink}` : styles.navLink}
				>
					Hours
				</NavLink>
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