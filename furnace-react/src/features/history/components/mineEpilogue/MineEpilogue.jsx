import mine1913 from '/src/assets/images/history/cornwall-mine-1913-a.webp';
import oreMap from '/src/assets/images/history/cornwall-ore-bank-map-1873.webp';
import credits from '../../data/credits';
import styles from './MineEpilogue.module.css';

const FACTS = [
	{ value: '1730s–1973', label: 'Mined continuously for more than two centuries' },
	{ value: '106 million', label: 'Tons of iron ore, with copper, cobalt, gold and silver' },
	{ value: '1984', label: 'The flooded pit reaches its full capacity' },
];

/** The mine that fed the furnace outlived it by ninety years. */
const MineEpilogue = () => (
	<div className={styles.epilogue}>
		<div className={styles.top}>
			<div className={styles.head}>
				<p className={styles.kicker}>Epilogue</p>
				<h3 className={styles.title}>The mine outlived the furnace</h3>
				<p className={styles.text}>
					The Cornwall Ore Banks that drew Peter Grubb here kept working long after the furnace went cold.
					At one time it was the largest open-pit iron ore mine in the world. Mining ended only after
					flooding from Tropical Storm Agnes, and the pit slowly filled with water. It can be seen today
					from Boyd Street, just south of the furnace.
				</p>
			</div>
			<dl className={styles.facts}>
				{FACTS.map((f) => (
					<div key={f.value} className={styles.fact}>
						<dt>{f.label}</dt>
						<dd>{f.value}</dd>
					</div>
				))}
			</dl>
		</div>

		<div className={styles.images}>
			<figure className={styles.image}>
				<img src={mine1913} alt="Terraced open-pit mine workings with rail tracks in the foreground" width="1400" height="771" loading="lazy" />
				<figcaption>
					The open pit in August 1913.
					<span>{credits.mine1913}</span>
				</figcaption>
			</figure>
			<figure className={styles.image}>
				<a href={oreMap} target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
					<img src={oreMap} alt="Hand-coloured 1873 map of the Cornwall ore bank showing Big Hill, Middle Hill and Grassy Hill, with cross sections below" width="1800" height="1420" loading="lazy" />
					<span className={styles.zoom}>Open full size ↗</span>
				</a>
				<figcaption>
					The ore bank mapped in 1873, with sections through its three hills.
					<span>{credits.oreMap}</span>
				</figcaption>
			</figure>
		</div>
	</div>
);

export default MineEpilogue;
