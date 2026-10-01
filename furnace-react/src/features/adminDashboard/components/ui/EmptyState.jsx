import React from 'react';
import ui from './admin.module.css';

const EmptyState = ({ children }) => (
	<div className={ui.emptyState}>{children}</div>
);

export default EmptyState;
