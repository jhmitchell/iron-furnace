import React from "react";
import styles from "./InfoBlock.module.css";

const InfoBlock = ({ children, id, margin }) => {
	const customStyle = margin ? { margin } : {};

	return (
		<div className={styles.infoBlock} id={id} style={customStyle}>
			<div className={styles.infoBlockContent}>
				{children}
			</div>
		</div>
	);
};

export default InfoBlock;
