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

				{/* Add additional admin links
				<NavLink to="/admin/users" className={({ isActive }) => isActive ? styles.activeNavLink : ''}>
					Users
				</NavLink>
				<NavLink to="/admin/settings" className={({ isActive }) => isActive ? styles.activeNavLink : ''}>
					Settings
				</NavLink>
				*/}
			</nav>
			<div className={styles.mainContent}>
				<header className={styles.topBar}>
					<button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
				</header>
				<div className={styles.content}>
					<Outlet /> {/* Where nested routes are rendered */}
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;