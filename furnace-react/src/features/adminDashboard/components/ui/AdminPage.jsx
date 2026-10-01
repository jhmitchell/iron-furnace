import React from 'react';
import ui from './admin.module.css';

/**
 * Page scaffold for admin dashboard routes: a title, an optional one-line
 * description, optional header actions, and the page body.
 */
const AdminPage = ({ title, description, actions, narrow = false, children }) => (
	<div className={narrow ? ui.pageNarrow : ui.page}>
		<header className={ui.pageHeader}>
			<div>
				<h2 className={ui.pageTitle}>{title}</h2>
				{description && <p className={ui.pageDescription}>{description}</p>}
			</div>
			{actions && <div className={ui.pageActions}>{actions}</div>}
		</header>
		{children}
	</div>
);

export default AdminPage;
