import { useEffect } from 'react';
import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-400-italic.css';
import '@fontsource/eb-garamond/latin-500.css';
import '@fontsource/eb-garamond/latin-600.css';
import StoryHero from './components/storyHero/StoryHero';
import Chapter from './components/chapter/Chapter';
import storyStyles from './HistoryStory.module.css';
import chapterStyles from './components/chapter/Chapter.module.css';
import styles from './HistoryClassic.module.css';

/** A chapter's running text, opening with a drop cap. */
const ChapterText = ({ children }) => (
	<div className={`${chapterStyles.text} ${chapterStyles.dropCap}`}>{children}</div>
);

/**
 * The client's approved history at /history, set in the story's design: the firelit
 * hero, chapters on paper and serif type. The full story at /history2 replaces it once
 * that is approved.
 */
const HistoryClassic = () => {
	// The router scrolls to the top on every page change, so jump to a linked chapter afterwards.
	useEffect(() => {
		if (!window.location.hash) return undefined;
		const id = decodeURIComponent(window.location.hash.slice(1));
		const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
		return () => cancelAnimationFrame(frame);
	}, []);

	return (
		<article className={storyStyles.story}>
			<div className={styles.column}>
				<StoryHero
					title={['Our', 'History']}
					subtitle="Tracing the legacy of Cornwall Iron Furnace: a monument to America’s industrial past"
					start={{ href: '#grubb', label: 'Start reading' }}
				/>

				<div className={styles.chapters}>
					<Chapter id="grubb" numeral="I" title="The Grubb Legacy" years="1734 – 1789">
						<ChapterText>
							<p>
								In 1734, William Allen sold 300 acres in what is now Cornwall, Pennsylvania, to Peter Grubb
								for £135. Three years later, another 142 acres were purchased. Peter and his brother, Samuel,
								built a small bloomery forge to test the quality of the iron ore present on the property.
								Pleased with the results, they made plans to construct a cold-blast charcoal iron furnace
								just north of the ore supply. The furnace went into blast for the first time in 1742. Peter
								leased the furnace to an outside group for 20 years. He died in 1754, leaving the furnace and
								the ore mine to his sons, Curtis and Peter, Jr. The brothers took over the operations when the
								lease ended.
							</p>
							<p>
								Curtis ran the furnace and ore bank while Peter, Jr., managed the Hopewell Forge, a few miles
								southwest of the furnace. Curtis built a mansion on a hill overlooking the furnace. The
								furnace’s air supply came from a water wheel powered by Furnace Creek, and its charcoal from
								the nearby forests. The furnace supplied shot, shell, and cannons for the Revolutionary War.
								After an unsuccessful attempt to cast a cannon, the furnace completed its first “proved”
								cannon, of an eventual forty-two, on September 6, 1776. Two dozen enslaved workers contributed
								to the operations, doing field work and domestic service in addition to supporting the
								industrial work.
							</p>
						</ChapterText>
					</Chapter>

					<Chapter id="robert-coleman" numeral="II" title="Robert Coleman" years="1786 – 1825">
						<ChapterText>
							<p>
								Robert Coleman arrived in the American Colonies at the age of 16 and eventually became a clerk
								at the Hopewell Forge operated by Peter Grubb, Jr. After a year in Grubb’s employment, Robert
								left to work for James Old, a well-known Lancaster-area ironmaster. Robert married Old’s
								daughter, Ann, in 1773. After leasing Salford Forge near present-day Norristown,
								Pennsylvania, he returned to the area and took a seven-year lease on nearby Elizabeth
								Furnace. In 1786, Robert began acquiring ownership of the Cornwall Furnace and the ore mine
								and added a new charging house, wheelhouse and, possibly, a new coalhouse. By 1798, he owned
								the furnace outright as well as five-sixths of the mine.
							</p>
							<p>
								Robert installed his oldest son, William, as manager of the Cornwall properties. William
								remained in charge of the operations until 1828. Robert Coleman died in 1825 and left the
								Cornwall Furnace to his sons William, James, and Edward, and the mines to the three brothers
								and their younger brother, Thomas Bird. That same year, a roasting oven was built next to the
								coalhouse to roast the iron ore and burn off sulfur before charging. William and Edward sold
								their interests in all of their iron properties to their brothers, James and Thomas Bird.
								When James died in 1831, Thomas Bird became sole owner of the Cornwall Furnace.
							</p>
						</ChapterText>
					</Chapter>

					<Chapter id="brothers" numeral="III" title="Robert W. and William Coleman" years="1836 – 1864">
						<ChapterText>
							<p>
								Robert W. and William Coleman were teenagers when their father, Thomas Bird Coleman, died in
								1836. Their uncles, William and Edward, along with trusted managers, stepped in to keep the
								furnace running. During the 1840s, numerous improvements were made to the furnace. The first
								steam engine was introduced to replace the water wheel, and blowing tubs were added to
								regulate the airflow to the furnace. The furnace stack was rebuilt and various repairs were
								made. During the next decade, the current stone walls were built. In 1859, the steam engine
								was replaced with a newer 20-horsepower engine, and a new water wheel was built.
							</p>
							<p>
								Robert W. Coleman, the visionary of the brothers, was a gifted ironmaster and shrewd
								businessman. In addition to the improvements to the Cornwall Furnace, he oversaw the
								construction of a new hot-blast furnace. In partnership with his cousin, George Dawson
								Coleman, he built a railroad between the ore mines and the Union Canal in north Lebanon, near
								the site of George Dawson’s anthracite furnaces.
							</p>
						</ChapterText>
					</Chapter>

					<Chapter
						id="heirs"
						numeral="IV"
						title="Heirs of R. W. Coleman and the Cornwall Iron Company"
						years="1864 – 1883"
					>
						<ChapterText>
							<p>
								After William died in 1861 and Robert in 1864, the significant expansion in the Cornwall
								Furnace operations came to a close. The Heirs of R. W. Coleman was formed, owned by William and
								Robert’s sisters—Margaret Freeman, Anne Alden and Sarah Coleman—and William’s two young
								children, Robert H. and Anne Coleman. During the next decade and a half, managers such as
								Artemis Wilhelm were crucial to the success of the Cornwall Furnace and the other furnaces
								which the Heirs owned.
							</p>
							<p>
								When Robert H. Coleman became involved in the family business, he sought to venture out on
								his own and forced a partition of the family holdings. Robert became owner of the Cornwall
								Anthracite Furnace and all other properties in Cornwall, including the charcoal furnace. By
								the early 1880s, demand for charcoal-based iron was drying up, and the Cornwall Furnace was
								losing money. The furnace went out of blast on February 11, 1883.
							</p>
						</ChapterText>
					</Chapter>

					<Chapter id="museum" numeral="V" title="The Cornwall Iron Furnace Museum">
						<ChapterText>
							<p>
								While the Coleman descendants sold their properties to Bethlehem Steel in the years
								following World War I, they held onto the Cornwall Furnace. The last Coleman family member to
								live in the manor on the top of the hill overlooking the furnace, Margaret Coleman Freeman
								Buckingham, donated the furnace to the Commonwealth of Pennsylvania in 1932 to preserve it as
								a museum. Because of this gift, the Pennsylvania Historical and Museum Commission is proud to
								share this industrial gem with thousands of guests every year.
							</p>
						</ChapterText>
						<div className={`${chapterStyles.text} ${styles.closing}`}>
							<p className={chapterStyles.closingText}>
								The operations at Cornwall Iron Furnace were not just a local affair; they had far-reaching
								implications. The iron produced here played a crucial role in the nation’s development, from
								building infrastructure to supplying materials for manufacturing and warfare. The furnace
								contributed significantly to the country’s economic and industrial growth and stands as a
								testament to the industrial capabilities of the United States.
							</p>
						</div>
					</Chapter>
				</div>
			</div>
		</article>
	);
};

export default HistoryClassic;
