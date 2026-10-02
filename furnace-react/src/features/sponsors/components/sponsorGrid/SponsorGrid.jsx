import styles from './SponsorGrid.module.css';

/**
 * Grid of sponsor names, in the display order set on the admin dashboard.
 * The column count follows the grid's own width, so it fits both the
 * full-width home page section and the narrower Associates page column.
 *
 * @param {Array<{id: number, name: string}>} sponsors - Sponsors to show
 * @param {string} className - Additional CSS classes
 */
const SponsorGrid = ({ sponsors, className = '' }) => (
	<div className={`${styles.sponsorGridContainer} ${className}`.trim()}>
		<ul className={styles.sponsorGrid}>
			{sponsors.map(s => (
				<li key={s.id} className={styles.sponsorCard}>
					{s.name}
				</li>
			))}
		</ul>
	</div>
);

export default SponsorGrid;
