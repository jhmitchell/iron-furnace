import storyStyles from '../../HistoryStory.module.css';
import Reveal from './Reveal';
import styles from './Chapter.module.css';

/**
 * One written chapter of the history, on paper.
 * `numeral` is the chapter number (I, II…), `years` the span it covers.
 */
const Chapter = ({ id, numeral, title, years, dek, children }) => (
	<section id={id} data-tone="paper" className={storyStyles.paper} aria-labelledby={`${id}-title`}>
		<div className={`${storyStyles.inner} ${styles.chapter}`}>
			<Reveal as="header" className={styles.header}>
				<p className={styles.kicker}>
					<span className={styles.numeral} aria-hidden="true">{numeral}</span>
					<span>Chapter {numeral}</span>
				</p>
				<h2 id={`${id}-title`} className={styles.title}>{title}</h2>
				<p className={styles.years}>{years}</p>
				{dek && <p className={styles.dek}>{dek}</p>}
			</Reveal>
			<div className={styles.body}>{children}</div>
		</div>
	</section>
);

/**
 * A paragraph (or two) of the story with an optional note in the margin beside it.
 * On narrow screens the note drops beneath the text.
 */
export const Passage = ({ children, note, dropCap = false }) => (
	<div className={styles.passage}>
		<div className={`${styles.text} ${dropCap ? styles.dropCap : ''}`}>{children}</div>
		{note && <aside className={styles.noteSlot}>{note}</aside>}
	</div>
);

/** A dated entry in the margin, like an archivist's annotation. */
export const MarginNote = ({ year, children }) => (
	<Reveal className={styles.note}>
		{year && <span className={styles.noteYear}>{year}</span>}
		<span className={styles.noteText}>{children}</span>
	</Reveal>
);

/** A full-width figure or feature placed between passages. */
export const Feature = ({ children }) => <Reveal className={styles.feature}>{children}</Reveal>;

/** A large pull quote drawn from the text above it. */
export const PullQuote = ({ children, cite }) => (
	<Reveal as="figure" className={styles.pullQuote}>
		<blockquote>{children}</blockquote>
		{cite && <figcaption>{cite}</figcaption>}
	</Reveal>
);

export default Chapter;
