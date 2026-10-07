import { useLayoutEffect, useRef } from 'react';
import '@fontsource/eb-garamond/latin-500.css';
import styles from './SponsorList.module.css';

/**
 * Sponsor names set in centred lines, like the thank-you page of a printed program,
 * in the display order set on the admin dashboard. A copper diamond separates names
 * on the same line. Narrow containers (phones) list one name per line instead, so it
 * fits both the home page section and the narrower Associates page column.
 *
 * @param {Array<{id: number, name: string}>} sponsors - Sponsors to show
 * @param {string} align - "center" (default), or "start" to sit in a column of left-aligned text
 * @param {string} className - Additional CSS classes
 */
const SponsorList = ({ sponsors, align = 'center', className = '' }) => {
	const listRef = useRef(null);

	// Mark the first name on each line so the diamond in front of it can be hidden. The
	// lines change when the list resizes, when the names change, and when the serif font
	// finishes loading (it is wider than the fallback).
	useLayoutEffect(() => {
		const list = listRef.current;
		if (!list) return undefined;

		const markLineStarts = () => {
			let previousTop = null;
			for (const item of list.children) {
				item.toggleAttribute('data-line-start', item.offsetTop !== previousTop);
				previousTop = item.offsetTop;
			}
		};

		markLineStarts();
		const observer = new ResizeObserver(markLineStarts);
		observer.observe(list);
		document.fonts?.addEventListener('loadingdone', markLineStarts);
		return () => {
			observer.disconnect();
			document.fonts?.removeEventListener('loadingdone', markLineStarts);
		};
	}, [sponsors]);

	return (
		<div className={`${styles.sponsorListContainer} ${className}`.trim()}>
			<ul ref={listRef} className={`${styles.sponsorList} ${align === 'start' ? styles.alignStart : ''}`.trim()}>
				{sponsors.map(s => (
					<li key={s.id} className={styles.sponsor}>
						{s.name}
					</li>
				))}
			</ul>
		</div>
	);
};

export default SponsorList;
