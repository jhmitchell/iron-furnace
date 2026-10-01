import storyStyles from '../../HistoryStory.module.css';
import Reveal from '../chapter/Reveal';
import BeforeAfter from './BeforeAfter';
import pairs from './pairs';
import styles from './ThenAndNow.module.css';

const Diptych = ({ then, now }) => (
	<div className={styles.diptych}>
		<div className={styles.panel}>
			<img src={then.src} alt={then.alt} loading="lazy" className={styles.thenStatic} />
			<span className={`${styles.tag} ${styles.tagThen}`}>{then.year}</span>
		</div>
		<div className={styles.panel}>
			<img src={now.src} alt={now.alt} loading="lazy" />
			<span className={`${styles.tag} ${styles.tagThen}`}>Today</span>
		</div>
	</div>
);

/** Historic photographs set against the same places today. */
const ThenAndNow = () => {
	const anyAligned = pairs.some((p) => p.aligned);

	return (
		<section id="then-and-now" data-tone="iron" className={styles.section} aria-labelledby="then-title">
			<div className={storyStyles.inner}>
				<Reveal as="header" className={styles.intro}>
					<p className={styles.kicker}>Then &amp; Now</p>
					<h2 id="then-title" className={styles.title}>
						The same places, a century apart
					</h2>
					<p className={styles.dek}>
						The furnace has outlasted the mine, the railroads and the people who worked them. Here are some
						of the plantation’s places as they were, beside the same places today.
						{anyAligned && ' Drag the handle to wipe between the two.'}
					</p>
				</Reveal>

				<div className={styles.pairs}>
					{pairs.map((pair) => (
						<Reveal as="figure" key={pair.id} className={styles.pair}>
							{pair.aligned ? (
								<BeforeAfter then={pair.then} now={pair.now} label={pair.title} />
							) : (
								<Diptych then={pair.then} now={pair.now} />
							)}
							<figcaption className={styles.caption}>
								<span className={styles.captionTitle}>{pair.title}</span>
								{pair.caption}
								<span className={styles.credit}>{pair.credit}</span>
							</figcaption>
						</Reveal>
					))}
				</div>
			</div>
		</section>
	);
};

export default ThenAndNow;
