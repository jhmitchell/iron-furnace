import React from "react";
import styles from "./InfoBlock.module.css";

const InfoBlock = ({ text, id }) => {
	return (
		<div className={styles.infoBlock} id={id}>
			<div className={styles.infoBlockContent}>
				<p>
					{text}
				</p>
			</div>
		</div>
	);
};

export default InfoBlock;