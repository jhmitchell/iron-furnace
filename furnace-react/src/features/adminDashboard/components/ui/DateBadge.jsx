import React from 'react';
import ui from './admin.module.css';

/** Compact month/day calendar tile used in list rows. */
const DateBadge = ({ date }) => (
	<div className={ui.dateBadge} aria-hidden="true">
		<span className={ui.dateBadgeMonth}>{date.toLocaleDateString('en-US', { month: 'short' })}</span>
		<span className={ui.dateBadgeDay}>{date.getDate()}</span>
	</div>
);

export default DateBadge;
