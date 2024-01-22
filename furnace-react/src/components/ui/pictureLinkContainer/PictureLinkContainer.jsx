import React from 'react';
import styles from './PictureLinkContainer.module.css';

const PictureLinkContainer = ({ children }) => (
	<div className={styles.pictureLinkContainer}>
		{children}
	</div>
);

export default PictureLinkContainer;
