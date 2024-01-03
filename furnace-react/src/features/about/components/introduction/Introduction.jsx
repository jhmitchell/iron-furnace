import React from "react";
import styles from "./Introduction.module.css";

const Introduction = () => {
	return (
		<div className={styles.introduction}>
			<div className={`${styles.introductionContent} ${styles.dropcap}`}>
				<p>
					Cornwall Iron Furnace (1742-1883) is the only surviving intact charcoal cold
					blast furnace in the Western Hemisphere, a testament to the once great iron
					industry that flourished in south-central Pennsylvania and our nation.
				</p>
			</div>
		</div>
	);
};

export default Introduction;