import React from 'react';
import ui from './admin.module.css';

/**
 * Inline success/error feedback. Pass `{ type: 'success' | 'error', text }`
 * or null to render nothing.
 */
const StatusMessage = ({ status, className = '' }) => {
	if (!status) return null;

	const tone = status.type === 'error' ? ui.statusError : ui.statusSuccess;
	return (
		<div className={`${ui.status} ${tone} ${className}`.trim()} role="status">
			{status.text}
		</div>
	);
};

export default StatusMessage;
