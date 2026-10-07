import Embers from '../embers/Embers';
import storyStyles from '../../HistoryStory.module.css';
import heroPhoto from '/src/assets/images/history/hero-furnace-1934.webp';
import styles from './StoryHero.module.css';

/**
 * The opening: the furnace in 1934, lit from below as if the fire were still burning.
 * `title` is two lines; the second glows like metal from the furnace. `start` is the
 * link down to the first section: `{ href, label }`.
 */
const StoryHero = ({ title, subtitle, start }) => (
	<header id="top" className={styles.hero}>
		<div className={styles.photo} aria-hidden="true">
			<img src={heroPhoto} alt="" width="2000" height="1092" />
		</div>
		<div className={styles.shade} aria-hidden="true" />
		<div className={styles.glow} aria-hidden="true" />
		<Embers className={styles.embers} count={70} />

		<div className={`${storyStyles.inner} ${styles.content}`}>
			<h1 className={styles.title}>
				<span className={styles.titleLine}>{title[0]}</span>{' '}
				<span className={`${styles.titleLine} ${styles.titleAccent}`}>{title[1]}</span>
			</h1>
			<p className={styles.subtitle}>{subtitle}</p>
			<a className={styles.begin} href={start.href}>
				{start.label}
				<span className={styles.beginArrow} aria-hidden="true" />
			</a>
		</div>

		<p className={styles.credit}>Cornwall Iron Furnace, 1934 · Pennsylvania Geological Survey</p>
	</header>
);

export default StoryHero;
