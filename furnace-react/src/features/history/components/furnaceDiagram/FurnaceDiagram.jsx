import { useEffect, useRef, useState } from 'react';
import storyStyles from '../../HistoryStory.module.css';
import useInView from '../../hooks/useInView';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import FurnaceSvg from './FurnaceSvg';
import steps, { ERAS } from './steps';
import credits from '../../data/credits';
import engraving from '/src/assets/images/history/charcoal-furnace-section-1890.webp';
import styles from './FurnaceDiagram.module.css';

const NARROW = '(max-width: 899px)';

const MATERIALS = [
	{ name: 'Iron ore', className: 'ore' },
	{ name: 'Charcoal', className: 'charcoal' },
	{ name: 'Limestone', className: 'limestone' },
];

/**
 * "How the Furnace Worked": a step-by-step cutaway of the furnace.
 * Scrolling the step cards advances the drawing; the controls do the same for
 * people who prefer to click. The era switch compares the furnace of 1742
 * with the rebuilt furnace that survives today.
 */
const FurnaceDiagram = () => {
	const reduced = usePrefersReducedMotion();
	const [index, setIndex] = useState(0);
	const [era, setEra] = useState(ERAS.rebuilt.id);
	const cardRefs = useRef([]);
	const [figureRef, figureInView] = useInView({ threshold: 0.05, once: false });
	const [compact, setCompact] = useState(
		() => typeof window !== 'undefined' && window.matchMedia(NARROW).matches
	);

	useEffect(() => {
		const mq = window.matchMedia(NARROW);
		const update = () => setCompact(mq.matches);
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	}, []);

	// The card crossing the reading line becomes the active step.
	useEffect(() => {
		const narrow = window.matchMedia(NARROW).matches;
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) setIndex(Number(entry.target.dataset.index));
				});
			},
			{ rootMargin: narrow ? '-72% 0px -22% 0px' : '-45% 0px -50% 0px' }
		);
		cardRefs.current.forEach((el) => el && observer.observe(el));
		return () => observer.disconnect();
	}, []);

	const goTo = (i) => {
		const next = Math.max(0, Math.min(steps.length - 1, i));
		setIndex(next);
		cardRefs.current[next]?.scrollIntoView({
			behavior: reduced ? 'auto' : 'smooth',
			block: compact ? 'end' : 'center',
		});
	};

	const step = steps[index];
	const eraInfo = ERAS[era];

	return (
		<section id="how-it-worked" data-tone="iron" className={styles.section} aria-labelledby="how-title">
			<div className={storyStyles.inner}>
				<header className={styles.intro}>
					<div>
						<p className={styles.kicker}>Interlude</p>
						<h2 id="how-title" className={styles.title}>
							How the Furnace Worked
						</h2>
						<p className={styles.dek}>
							Follow the iron from ore to pig through a cutaway of the furnace. Scroll through the
							steps, or use the controls beside the drawing, and switch between the furnace as it was
							first built and as it survives today.
						</p>
					</div>
					<figure className={styles.engraving}>
						<img
							src={engraving}
							alt="Nineteenth-century engraving of a charcoal blast furnace cut in half, showing its stone stack and inner lining"
							width="700"
							height="919"
							loading="lazy"
						/>
						<figcaption>
							A charcoal blast furnace in section, 1890.
							<span>{credits.section}</span>
						</figcaption>
					</figure>
				</header>

				<div className={styles.stage}>
					<div className={styles.cards}>
						{steps.map((s, i) => (
							<article
								key={s.id}
								ref={(el) => {
									cardRefs.current[i] = el;
								}}
								data-index={i}
								className={`${styles.card} ${i === index ? styles.cardActive : ''}`}
								aria-labelledby={`step-${s.id}`}
							>
								<p className={styles.stepNumber}>
									Step {i + 1} <span aria-hidden="true">/ {steps.length}</span>
								</p>
								<h3 id={`step-${s.id}`} className={styles.cardTitle}>
									{s.title}
								</h3>
								{s.body[era].map((para) => (
									<p key={para} className={styles.cardText}>
										{para}
									</p>
								))}
								{s.materials && (
									<ul className={styles.materials} aria-label="The three ingredients">
										{MATERIALS.map((m) => (
											<li key={m.name}>
												<span className={`${styles.swatch} ${styles[m.className]}`} aria-hidden="true" />
												{m.name}
											</li>
										))}
									</ul>
								)}
							</article>
						))}
					</div>

					<div className={styles.figureColumn}>
						<figure ref={figureRef} className={styles.figure}>
							<div className={styles.toolbar}>
								<div className={styles.eraSwitch} role="group" aria-label="Show the furnace">
									{Object.values(ERAS).map((e) => (
										<button
											key={e.id}
											type="button"
											className={`${styles.eraButton} ${era === e.id ? styles.eraButtonOn : ''}`}
											aria-pressed={era === e.id}
											onClick={() => setEra(e.id)}
										>
											<span className={styles.eraYear}>{e.short}</span>
											<span className={styles.eraLabel}>{e.label}</span>
										</button>
									))}
								</div>
								<p className={styles.stepTitle} aria-live="polite">
									<span>{index + 1}</span> {step.title}
								</p>
							</div>

							<div className={styles.svgWrap}>
								<FurnaceSvg
									era={era}
									step={step}
									animate={!reduced && figureInView}
									compact={compact}
									reduced={reduced}
									titleId="furnace-title"
									descId="furnace-desc"
									title={`Cutaway of Cornwall Iron Furnace: ${eraInfo.caption}`}
									description={`Step ${index + 1}, ${step.title}. ${step.body[era][0]}`}
								/>
							</div>

							{compact && (
								<ol className={styles.legend}>
									{step.labels[era].map((label) => (
										<li key={label.text}>{label.text}</li>
									))}
								</ol>
							)}

							<div className={styles.controls}>
								<button
									type="button"
									className={styles.arrow}
									onClick={() => goTo(index - 1)}
									disabled={index === 0}
									aria-label="Previous step"
								>
									<span aria-hidden="true">←</span>
								</button>
								<ol className={styles.dots}>
									{steps.map((s, i) => (
										<li key={s.id}>
											<button
												type="button"
												className={`${styles.dot} ${i === index ? styles.dotOn : ''}`}
												onClick={() => goTo(i)}
												aria-label={`Step ${i + 1}: ${s.title}`}
												aria-current={i === index ? 'step' : undefined}
											/>
										</li>
									))}
								</ol>
								<button
									type="button"
									className={styles.arrow}
									onClick={() => goTo(index + 1)}
									disabled={index === steps.length - 1}
									aria-label="Next step"
								>
									<span aria-hidden="true">→</span>
								</button>
							</div>

							<figcaption className={styles.caption}>
								Schematic cutaway, not to scale. After descriptions by Cornwall Iron Furnace and the
								American Society of Mechanical Engineers (1985).
							</figcaption>
						</figure>
					</div>
				</div>
			</div>
		</section>
	);
};

export default FurnaceDiagram;
