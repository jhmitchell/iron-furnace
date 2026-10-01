import Reveal from '../chapter/Reveal';
import styles from './Remembrance.module.css';

/** A quiet section of its own for the people who were enslaved at Cornwall. */
const Remembrance = () => (
	<section id="enslaved-workers" data-tone="paper" className={styles.section} aria-labelledby="enslaved-title">
		<div className={styles.frame}>
			<Reveal className={styles.content}>
				<span className={styles.mark} aria-hidden="true" />
				<h2 id="enslaved-title" className={styles.title}>
					The enslaved workers of Cornwall
				</h2>
				<p className={styles.text}>
					Two dozen enslaved workers contributed to the working of the operations, which included field
					work and domestic service in addition to supporting the industrial operations.
				</p>
				<span className={styles.mark} aria-hidden="true" />
			</Reveal>
		</div>
	</section>
);

export default Remembrance;
