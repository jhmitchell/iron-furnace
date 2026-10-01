import { useState } from 'react';
import { Link } from 'react-router-dom';
import storyStyles from '../../HistoryStory.module.css';
import Reveal from '../chapter/Reveal';
import credits from '../../data/credits';
import styles from './StoryClosing.module.css';

const TICKETS_URL = 'https://www.storepatrailsofhistory.com/6/#/Admission';

const SOURCES = [
	{
		text: 'Cornwall Iron Furnace and the Pennsylvania Historical and Museum Commission: the history of the furnace (Chapters I–V) and the descriptions of the plantation’s buildings.',
	},
	{
		text: 'American Society of Mechanical Engineers, Susquehanna Section. ',
		title: 'Cornwall Iron Furnace: National Historic Mechanical Engineering Landmark',
		after: '. Dedication brochure, June 8, 1985. Source for the furnace’s machinery and dimensions.',
		href: 'https://www.asme.org/wwwasmeorg/media/resourcefiles/aboutasme/who%20we%20are/engineering%20history/landmarks/106-cornwall-iron-furnace.pdf',
	},
	{
		text: 'Pennsylvania Historical and Museum Commission. ',
		title: 'Cornwall Iron Furnace',
		after: '.',
		href: 'https://www.pa.gov/agencies/phmc/historic-sites-and-museums/pahistory2go/cornwall-iron-furnace',
	},
];

const READING = [
	{ author: 'Greville Bathe', title: 'An Engineer’s Miscellany', rest: 'Philadelphia: Patterson & White, 1938. Chapter VI, “The Old Cornwall Furnace.”' },
	{ author: 'Arthur Cecil Bining', title: 'Pennsylvania Iron Manufacture in the Eighteenth Century', rest: 'Harrisburg: Pennsylvania Historical and Museum Commission, 1973.' },
	{ author: 'W. David Lewis', title: 'Iron and Steel in America', rest: 'Greenville, Del.: Hagley Museum, 1976.' },
	{ author: 'James M. Swank', title: 'History of the Manufacture of Iron in All Ages', rest: 'Philadelphia: American Iron and Steel Association, 1892.' },
];

const CREDITS = [
	...Object.values(credits),
	'Furnace cutaway, family tree and plantation map: drawn for this page from the sources above.',
];

const citation = () => {
	const accessed = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	return `“Our History.” Cornwall Iron Furnace, Pennsylvania Historical and Museum Commission. https://cornwallironfurnace.org/history. Accessed ${accessed}.`;
};

const StoryClosing = () => {
	const [copied, setCopied] = useState(false);
	const cite = citation();

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(cite);
			setCopied(true);
			setTimeout(() => setCopied(false), 2500);
		} catch {
			setCopied(false);
		}
	};

	return (
		<>
			<section className={styles.quoteSection} aria-label="A site of transcendent significance">
				<div className={storyStyles.inner}>
					<Reveal as="figure" className={styles.quote}>
						<p className={styles.quoteLead}>A site of transcendent significance.</p>
						<blockquote className={styles.quoteText}>
							“With the exception of a mere handful of similar preservations in Sweden and Germany, and
							possibly a few in eastern Europe, I doubt that elsewhere in the world is there a
							19th-century iron furnace complex with the degree of historical integrity to be found at
							Cornwall…”
						</blockquote>
						<figcaption className={styles.quoteCite}>Robert Vogel, Smithsonian Institution</figcaption>
					</Reveal>
				</div>
			</section>

			<section className={styles.visit} aria-labelledby="visit-title">
				<div className={`${storyStyles.inner} ${styles.visitInner}`}>
					<div>
						<h2 id="visit-title" className={styles.visitTitle}>
							Stand where they stood.
						</h2>
						<p className={styles.visitText}>
							The stack, the Great Wheel, the blowing tubs, the charging room and the casting house are
							all still here, much as they were when the furnace went out of blast. Come and see them.
						</p>
					</div>
					<div className={styles.visitActions}>
						<Link to="/visit" className={styles.primary}>
							Plan your visit
						</Link>
						<a href={TICKETS_URL} className={styles.secondary} target="_blank" rel="noopener noreferrer">
							Buy tickets
						</a>
						<Link to="/map" className={styles.tertiary}>
							Explore the grounds map →
						</Link>
					</div>
				</div>
			</section>

			<section id="sources" data-tone="paper" className={`${storyStyles.paper} ${styles.sources}`} aria-labelledby="sources-title">
				<div className={storyStyles.inner}>
					<h2 id="sources-title" className={styles.sourcesTitle}>
						Sources &amp; further reading
					</h2>

					<div className={styles.sourceGrid}>
						<div>
							<h3 className={styles.listTitle}>Sources</h3>
							<ol className={styles.list}>
								{SOURCES.map((s) => (
									<li key={s.text}>
										{s.text}
										{s.title &&
											(s.href ? (
												<a href={s.href} target="_blank" rel="noopener noreferrer">
													<cite>{s.title}</cite>
												</a>
											) : (
												<cite>{s.title}</cite>
											))}
										{s.after}
									</li>
								))}
							</ol>

							<h3 className={styles.listTitle}>Further reading</h3>
							<ul className={styles.list}>
								{READING.map((r) => (
									<li key={r.title}>
										{r.author}, <cite>{r.title}</cite>. {r.rest}
									</li>
								))}
							</ul>
						</div>

						<div>
							<div className={styles.citeBox}>
								<h3 className={styles.listTitle}>Cite this page</h3>
								<p className={styles.citeText}>{cite}</p>
								<button type="button" className={styles.copy} onClick={copy}>
									{copied ? 'Copied' : 'Copy citation'}
								</button>
							</div>

							<h3 className={styles.listTitle}>Image credits</h3>
							<ul className={styles.list}>
								{CREDITS.map((c) => (
									<li key={c}>{c}</li>
								))}
							</ul>

							<p className={styles.corrections}>
								Spotted an error, or hold a document or photograph we should know about? Write to us at{' '}
								<a href="mailto:cornwallironfurnace@gmail.com">cornwallironfurnace@gmail.com</a>.
							</p>
						</div>
					</div>
				</div>
			</section>
		</>
	);
};

export default StoryClosing;
