import React from 'react';
import styles from './HorizontalPictureCard.module.css';

const HorizontalPictureCard = ({ image, children }) => {
	return (
		<div className={styles.card}>
			<div className={styles.cardImage}>
				<img src={image} alt="" />
			</div>
			<div className={styles.cardContent}>
				{children}
			</div>
		</div>
	);
};

export default HorizontalPictureCard;