import Reveal from '../chapter/Reveal';
import styles from './ArchivalFigure.module.css';

/**
 * A historic image mounted like a print, with a caption and a source credit.
 * `layout` is "text" (the width of the text column), "wide", "margin" or "pair"
 * (two images side by side, passed as `images`).
 */
const ArchivalFigure = ({ src, alt, width, height, caption, credit, layout = 'text', images, tone = 'paper', ratio }) => {
	const list = images || [{ src, alt, width, height }];

	return (
		<Reveal as="figure" className={`${styles.figure} ${styles[layout]} ${tone === 'iron' ? styles.onIron : ''}`}>
			<div className={styles.prints}>
				{list.map((img) => (
					<div key={img.src} className={styles.mount}>
						<img
							src={img.src}
							alt={img.alt}
							width={img.width}
							height={img.height}
							loading="lazy"
							decoding="async"
							style={ratio ? { aspectRatio: ratio, objectFit: 'cover' } : undefined}
						/>
						{img.label && <span className={styles.label}>{img.label}</span>}
					</div>
				))}
			</div>
			<figcaption className={styles.caption}>
				{caption}
				{credit && <span className={styles.credit}>{credit}</span>}
			</figcaption>
		</Reveal>
	);
};

export default ArchivalFigure;
