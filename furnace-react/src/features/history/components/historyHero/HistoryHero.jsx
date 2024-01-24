import React from 'react';
import { TwoColumn } from '/src/layouts';

import WheelImg from '/src/assets/images/history-wheel.jpeg';
import styles from './HistoryHero.module.css';

const HistoryHero = () => {
	const HeroText = () => (
		<div className={styles.heroTextContainer}>
			<div className={styles.heroText}>
				<h1>Our History</h1>
				<p>
					Tracing the legacy of Cornwall Iron Furnace: a monument to America's Industrial Past
				</p>
			</div>
		</div>
	);

	const HeroImg = (
		<div className={styles.heroImgContainer}>
			<img src={WheelImg} alt="Cornwall Iron Furnace" />
		</div>
	);

	return (
		<TwoColumn className={styles.historyHero}
			leftContent={<HeroText />}
			rightContent={HeroImg}
		/>
	);
};

export default HistoryHero;
