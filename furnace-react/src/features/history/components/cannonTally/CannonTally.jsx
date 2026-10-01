import useInView from '../../hooks/useInView';
import styles from './CannonTally.module.css';

const COUNT = 42;

const Cannon = () => (
	<svg viewBox="0 0 64 28" className={styles.icon} aria-hidden="true">
		<path d="M4 9 L46 6 Q54 6 56 10 L56 16 Q54 20 46 20 L4 17 Q1 13 4 9 Z" className={styles.barrel} />
		<rect x="56" y="10.5" width="5" height="5" rx="1.2" className={styles.barrel} />
		<circle cx="22" cy="20" r="6.5" className={styles.wheel} />
		<circle cx="22" cy="20" r="1.8" className={styles.hub} />
	</svg>
);

/**
 * Forty-two "proved" cannons, drawn one by one as the figure scrolls into view.
 * The first, completed on September 6, 1776, is called out.
 */
const CannonTally = () => {
	const [ref, inView] = useInView({ threshold: 0.35 });

	return (
		<figure ref={ref} className={`${styles.tally} ${inView ? styles.shown : ''}`}>
			<div className={styles.header}>
				<p className={styles.number}>42</p>
				<div>
					<p className={styles.lead}>cannons “proved” at Cornwall for the Revolutionary War</p>
					<p className={styles.gloss}>
						A new cannon was proved by test-firing it with a heavy charge of powder. Only guns that
						survived the test were accepted.
					</p>
				</div>
			</div>

			<ol className={styles.grid} aria-label="Forty-two proved cannons, the first completed September 6, 1776">
				{Array.from({ length: COUNT }, (_, i) => (
					<li key={i} className={styles.cell} style={{ '--i': i }} aria-hidden="true">
						<Cannon />
						{i === 0 && <span className={styles.first}>Sept. 6, 1776</span>}
					</li>
				))}
			</ol>

			<figcaption className={styles.caption}>
				The furnace also supplied shot and shell. The first proved cannon followed an unsuccessful
				attempt to cast one.
			</figcaption>
		</figure>
	);
};

export default CannonTally;
