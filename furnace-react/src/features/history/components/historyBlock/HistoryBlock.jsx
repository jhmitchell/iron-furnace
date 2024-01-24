import React from "react";
import styles from "./HistoryBlock.module.css";

const HistoryBlock = ({ children, id, margin }) => {
	const customStyle = margin ? { margin } : {};

	return (
		<div className={styles.historyBlock} id={id} style={customStyle}>
			<div className={styles.historyBlockContent}>
				{children}
			</div>
		</div>
	);
};

export default HistoryBlock;
