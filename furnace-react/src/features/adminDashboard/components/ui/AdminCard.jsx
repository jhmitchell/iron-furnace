import React from 'react';
import ui from './admin.module.css';

/**
 * Dark content card with an optional header (title, description, and an
 * `aside` slot for a badge or count on the right).
 */
const AdminCard = ({ title, description, aside, className = '', children }) => (
	<section className={`${ui.card} ${className}`.trim()}>
		{(title || aside) && (
			<div className={ui.cardHeader}>
				<div>
					{title && <h3 className={ui.cardTitle}>{title}</h3>}
					{description && <p className={ui.cardDescription}>{description}</p>}
				</div>
				{aside}
			</div>
		)}
		{children}
	</section>
);

export default AdminCard;
