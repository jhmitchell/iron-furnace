import { useEffect, useRef, useState } from 'react';
import chapters from '../../data/chapters';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import styles from './StoryRail.module.css';

const scrollToSection = (id, reduced) => {
	const el = document.getElementById(id);
	if (!el) return;
	el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
	window.history.replaceState(null, '', `#${id}`);
};

/**
 * The story's table of contents. On wide screens it is a timeline down the left edge
 * whose line fills like molten iron as you read; on narrow screens it is a floating
 * "chapter" button that opens a list.
 */
const StoryRail = ({ storyRef }) => {
	const reduced = usePrefersReducedMotion();
	const [active, setActive] = useState(null);
	const [tone, setTone] = useState('iron');
	const [open, setOpen] = useState(false);
	const railRef = useRef(null);
	const pillRef = useRef(null);

	// Track which section is crossing the middle of the screen.
	useEffect(() => {
		const targets = ['top', ...chapters.map((c) => c.id)]
			.map((id) => document.getElementById(id))
			.filter(Boolean);
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (!entry.isIntersecting) return;
					const id = entry.target.id;
					setActive(id === 'top' ? null : id);
					setTone(entry.target.dataset.tone || 'iron');
				});
			},
			{ rootMargin: '-48% 0px -48% 0px' }
		);
		targets.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);

	// Fill the timeline line with reading progress (no React state, so no re-render per frame).
	useEffect(() => {
		let frame = 0;
		const update = () => {
			frame = 0;
			const story = storyRef.current;
			if (!story) return;
			const rect = story.getBoundingClientRect();
			const travel = rect.height - window.innerHeight;
			const p = travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0;
			railRef.current?.style.setProperty('--progress', p.toFixed(4));
			pillRef.current?.style.setProperty('--progress', p.toFixed(4));
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	}, [storyRef]);

	useEffect(() => {
		if (!open) return undefined;
		const onKey = (e) => e.key === 'Escape' && setOpen(false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open]);

	const go = (event, id) => {
		event.preventDefault();
		setOpen(false);
		scrollToSection(id, reduced);
	};

	const current = chapters.find((c) => c.id === active);
	const shown = active !== null;

	return (
		<>
			<nav
				ref={railRef}
				className={`${styles.rail} ${shown ? styles.shown : ''} ${tone === 'paper' ? styles.onPaper : ''}`}
				aria-label="Chapters"
			>
				<div className={styles.track} aria-hidden="true">
					<div className={styles.fill} />
				</div>
				<ol className={styles.list}>
					{chapters.map((c) => (
						<li key={c.id}>
							<a
								href={`#${c.id}`}
								onClick={(e) => go(e, c.id)}
								className={`${styles.item} ${c.id === active ? styles.active : ''}`}
								aria-current={c.id === active ? 'location' : undefined}
							>
								<span className={styles.dot} aria-hidden="true" />
								<span className={styles.mark}>{c.mark}</span>
								<span className={styles.label}>{c.label}</span>
							</a>
						</li>
					))}
				</ol>
			</nav>

			<div ref={pillRef} className={`${styles.mobile} ${shown ? styles.shown : ''}`}>
				{open && (
					<ol id="story-chapter-list" className={styles.sheet}>
						{chapters.map((c) => (
							<li key={c.id}>
								<a
									href={`#${c.id}`}
									onClick={(e) => go(e, c.id)}
									className={c.id === active ? styles.sheetActive : undefined}
									aria-current={c.id === active ? 'location' : undefined}
								>
									<span className={styles.sheetMark}>{c.mark}</span>
									{c.label}
								</a>
							</li>
						))}
					</ol>
				)}
				<button
					type="button"
					className={styles.pill}
					onClick={() => setOpen((o) => !o)}
					aria-expanded={open}
					aria-controls="story-chapter-list"
				>
					<span className={styles.pillRing} aria-hidden="true" />
					<span className={styles.pillText}>
						<span className={styles.pillHint}>Chapter</span>
						{current ? current.label : 'Contents'}
					</span>
				</button>
			</div>
		</>
	);
};

export default StoryRail;
