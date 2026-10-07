import HorizontalLine from '../horizontalLine/HorizontalLine';
import styles from './LineHeader.module.css';

const LineHeader = ({ title }) => (
	<div className={styles.lineHeader}>
		<h2 className={styles.headerTitle}>{title}</h2>
		<HorizontalLine className={styles.line} />
	</div>
);

export default LineHeader;
