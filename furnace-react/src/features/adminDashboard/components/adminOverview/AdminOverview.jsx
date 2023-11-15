import React from 'react';
import { useAuth } from '/src/features/authentication';
import styles from './AdminOverview.module.css';

const AdminOverview = () => {
  const { user } = useAuth(); 

  return (
    <div className={styles.adminOverview}>
      <h1>Welcome, {user.username}!</h1> 
      <p>
        This is your admin dashboard where you can manage users, settings, and other administrative tasks.
        Please use the sidebar to navigate the dashboard.
      </p>
    </div>
  );
};

export default AdminOverview;
