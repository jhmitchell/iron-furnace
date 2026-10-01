import Embers from '../embers/Embers';
import storyStyles from '../../HistoryStory.module.css';
import heroPhoto from '/src/assets/images/history/hero-furnace-1934.webp';
import styles from './StoryHero.module.css';

/** The opening: the furnace in 1934, lit from below as if the fire were still burning. */
const StoryHero = () => (
	<header id="top" className={styles.hero}>
		<div className={styles.photo} aria-hidden="true">
			<img src={heroPhoto} alt="" width="2000" height="1092" />
		</div>
		<div className={styles.shade} aria-hidden="true" />
		<div className={styles.glow} aria-hidden="true" />
		<Embers className={styles.embers} count={70} />

		<div className={`${storyStyles.inner} ${styles.content}`}>
			<h1 className={styles.title}>
				<span className={styles.titleLine}>Forged at</span>
				<span className={`${styles.titleLine} ${styles.titleAccent}`}>Cornwall</span>
			</h1>
			<p className={styles.subtitle}>
				The ore, the fire, and the people behind the last intact charcoal cold-blast furnace in the
				Western Hemisphere, in blast from 1742 until 1883.
			</p>
			<a className={styles.begin} href="#prologue">
				Begin the story
				<span className={styles.beginArrow} aria-hidden="true" />
			</a>
		</div>

		<p className={styles.credit}>Cornwall Iron Furnace, 1934 · Pennsylvania Geological Survey</p>
	</header>
);

export default StoryHero;
