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
					The Cornwall Iron Furnace is the only surviving intact charcoal cold
					blast furnace in the Western Hemisphere.
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
