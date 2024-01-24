import React from 'react';
import styles from './TwoColumn.module.css';

const TwoColumn = ({ leftContent, rightContent, className }) => {
	return (
		<div className={`${styles.twoColumn} ${className}`}>
			<div className={styles.leftColumn}>
				{leftContent}
			</div>
			<div className={styles.rightColumn}>
				{rightContent}
			</div>
		</div>
	);
};

export default TwoColumn;
