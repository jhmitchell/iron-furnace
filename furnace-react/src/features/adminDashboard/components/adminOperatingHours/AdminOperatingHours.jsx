import HoursCard from '../hoursCard/HoursCard';
import HolidaysCard from '../holidaysCard/HolidaysCard';
import styles from './AdminOperatingHours.module.css';

const AdminOperatingHours = () => {
	return (
		<div className={styles.hoursGrid}>
			<div className={styles.hoursCard}>
				<HoursCard />
			</div>
			<div className={styles.holidaysCard}>
				<HolidaysCard />
			</div>
		</div>
	)
}

export default AdminOperatingHours;