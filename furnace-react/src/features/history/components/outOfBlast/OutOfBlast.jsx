import { useRef } from 'react';
import Embers from '../embers/Embers';
import useScrollProgress from '../../hooks/useScrollProgress';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import styles from './OutOfBlast.module.css';

/**
 * February 11, 1883. A pinned scene in which the furnace's glow and sparks die away
 * as the reader scrolls through it.
 */
const OutOfBlast = () => {
	const reduced = usePrefersReducedMotion();
	const stageRef = useRef(null);
	const intensity = useRef(1);

	const sectionRef = useScrollProgress((p) => {
		intensity.current = Math.max(0, 1 - p * 1.25);
		stageRef.current?.style.setProperty('--p', p.toFixed(4));
	});

	return (
		<section
			id="out-of-blast"
			ref={sectionRef}
			data-tone="iron"
			className={`${styles.section} ${reduced ? styles.still : ''}`}
			aria-labelledby="blast-date"
		>
			<div ref={stageRef} className={styles.stage}>
				<div className={styles.glow} aria-hidden="true" />
				<Embers className={styles.embers} count={60} intensityRef={intensity} />

				<div className={styles.lines}>
					<p className={`${styles.line} ${styles.first}`}>
						For more than 140 years, Cornwall made iron.
					</p>
					<div className={`${styles.line} ${styles.second}`}>
						<p id="blast-date" className={styles.date}>
							February 11, 1883
						</p>
						<p className={styles.dateText}>The furnace went out of blast.</p>
					</div>
					<p className={`${styles.line} ${styles.third}`}>
						Its fire was never lit again. But the family never let the furnace go.
					</p>
				</div>
			</div>
		</section>
	);
};

export default OutOfBlast;
