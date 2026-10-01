import { useId, useState } from 'react';
import styles from './ThenAndNow.module.css';

/**
 * Two aligned photographs of the same view, with a handle to wipe between them.
 * The handle is a real range input, so it works with a keyboard and screen readers.
 */
const BeforeAfter = ({ then, now, label }) => {
	const [pos, setPos] = useState(50);
	const id = useId();

	return (
		<div className={styles.compare} style={{ '--pos': `${pos}%` }}>
			<img className={styles.nowImage} src={now.src} alt={now.alt} loading="lazy" />
			<img className={styles.thenImage} src={then.src} alt={then.alt} loading="lazy" />

			<span className={`${styles.tag} ${styles.tagThen}`}>{then.year}</span>
			<span className={`${styles.tag} ${styles.tagNow}`}>Today</span>

			<div className={styles.handle} aria-hidden="true">
				<span className={styles.grip}>
					<span>‹</span>
					<span>›</span>
				</span>
			</div>

			<label htmlFor={id} className={styles.srOnly}>
				{label}: drag to compare {then.year} with today
			</label>
			<input
				id={id}
				className={styles.range}
				type="range"
				min="0"
				max="100"
				step="0.5"
				value={pos}
				onChange={(e) => setPos(Number(e.target.value))}
				aria-valuetext={`${Math.round(pos)}% ${then.year}`}
			/>
		</div>
	);
};

export default BeforeAfter;
