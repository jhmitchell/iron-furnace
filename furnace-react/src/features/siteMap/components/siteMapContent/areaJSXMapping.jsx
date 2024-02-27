import MuseumCannonballs from '/src/assets/images/map/museum-cannonballs.jpg';
import styles from './SiteMapContent.module.css';

const areaJSXMapping = {
	museum: () => (
		<div className={styles.info}>
			<h2>Visitor's Center</h2>
			<img src={MuseumCannonballs} alt="Museum Cannonballs" />
			<p>Located in the 19th century charcoal barn, the Visitors' Center offers interpretative exhibits on mining, charcoal making, and ironmaking and gives the visitor a glimpse of the huge spaces needed to contain the fuel used in the smelting process.
			</p>
		</div>
	),
	area2: () => (
		<div>
			<h2>Area 2 Title</h2>
			<img src="/path/to/area2photo.jpg" alt="Area 2" />
			<p>Description for Area 2...</p>
			{/* More custom JSX for Area 2 */}
		</div>
	),
};

export default areaJSXMapping;