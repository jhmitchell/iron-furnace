import { useEffect, useRef } from 'react';
import '@fontsource/eb-garamond/latin-400.css';
import '@fontsource/eb-garamond/latin-400-italic.css';
import '@fontsource/eb-garamond/latin-500.css';
import '@fontsource/eb-garamond/latin-600.css';
import StoryHero from './components/storyHero/StoryHero';
import StoryRail from './components/storyRail/StoryRail';
import Chapter, { Passage, MarginNote, Feature } from './components/chapter/Chapter';
import Reveal from './components/chapter/Reveal';
import CannonTally from './components/cannonTally/CannonTally';
import Remembrance from './components/remembrance/Remembrance';
import FurnaceDiagram from './components/furnaceDiagram/FurnaceDiagram';
import ColemanTree from './components/colemanTree/ColemanTree';
import PlantationMap from './components/plantationMap/PlantationMap';
import OutOfBlast from './components/outOfBlast/OutOfBlast';
import MineEpilogue from './components/mineEpilogue/MineEpilogue';
import ThenAndNow from './components/thenAndNow/ThenAndNow';
import StoryClosing from './components/storyClosing/StoryClosing';
import ArchivalFigure from './components/archivalFigure/ArchivalFigure';
import robertColeman from '/src/assets/images/history/robert-coleman-eichholtz.webp';
import annColeman from '/src/assets/images/history/ann-old-coleman-eichholtz.webp';
import colemanSisters from '/src/assets/images/history/coleman-sisters-sully-1844.webp';
import elizabethHouse from '/src/assets/images/history/coleman-house-elizabeth-furnace-1920.webp';
import furnace1934 from '/src/assets/images/history/furnace-building-1934-b.webp';
import furnace1934Wide from '/src/assets/images/history/furnace-building-1934-a.webp';
import furnace1950s from '/src/assets/images/history/furnace-1956.webp';
import postcard from '/src/assets/images/history-old-furnace.jpg';
import credits from './data/credits';
import styles from './HistoryStory.module.css';
import chapterStyles from './components/chapter/Chapter.module.css';

/** Five of six wedges filled: Robert Coleman's share of the mine by 1798. */
const FiveSixths = () => (
	<svg viewBox="-20 -20 40 40" width="44" height="44" className={chapterStyles.fraction} aria-hidden="true">
		{Array.from({ length: 6 }, (_, i) => {
			const a1 = (i / 6) * Math.PI * 2 - Math.PI / 2;
			const a2 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
			const d = `M0 0 L${18 * Math.cos(a1)} ${18 * Math.sin(a1)} A18 18 0 0 1 ${18 * Math.cos(a2)} ${18 * Math.sin(a2)} Z`;
			return <path key={i} d={d} className={i < 5 ? chapterStyles.fractionOn : chapterStyles.fractionOff} />;
		})}
	</svg>
);

const HistoryStory = () => {
	const storyRef = useRef(null);

	useEffect(() => {
		const previous = document.title;
		document.title = 'Our History · Cornwall Iron Furnace';

		// The router scrolls to the top on every page change, so jump to a linked chapter afterwards.
		let frame;
		if (window.location.hash) {
			const id = decodeURIComponent(window.location.hash.slice(1));
			frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
		}
		return () => {
			document.title = previous;
			if (frame) cancelAnimationFrame(frame);
		};
	}, []);

	return (
		<article ref={storyRef} className={styles.story}>
			<StoryHero />
			<StoryRail storyRef={storyRef} />

			{/* ---------------- Prologue ---------------- */}
			<section id="prologue" data-tone="paper" className={`${styles.paper} ${styles.prologue}`} aria-label="Prologue">
				<div className={styles.inner}>
					<Reveal as="p" className={styles.prologueLead}>
						Cornwall Iron Furnace (1742–1883) is the only surviving intact charcoal cold blast furnace in
						the Western Hemisphere, <em>a testament to the once great iron industry</em> that flourished
						in south-central Pennsylvania and our nation.
					</Reveal>
					<p className={styles.prologueBody}>
						Its story runs from a tract of ore-rich land bought in 1734, through generations of ironmasters,
						workers and families, to the fire going out in 1883 and the gift that saved the furnace for
						everyone. It is told here in five chapters, with a look inside the furnace and across the iron
						plantation along the way.
					</p>
					<ul className={styles.landmarks} aria-label="Recognition">
						<li>
							<strong>National Historic Landmark</strong> · 1966
						</li>
						<li>
							<strong>National Historic Mechanical Engineering Landmark</strong> · ASME, 1985
						</li>
						<li>
							<strong>Pennsylvania Trail of History</strong> · PHMC
						</li>
					</ul>
				</div>
			</section>

			{/* ---------------- Chapter I ---------------- */}
			<Chapter
				id="grubb"
				numeral="I"
				title="The Grubb Legacy"
				years="1734 – 1789"
				dek="Ore, forest and water: the founding of an iron furnace."
			>
				<Passage
					dropCap
					note={
						<>
							<MarginNote year="1734">William Allen sells Peter Grubb 300 acres for £135.</MarginNote>
							<MarginNote year="1737">Another 142 acres are purchased.</MarginNote>
						</>
					}
				>
					<p>
						In 1734, William Allen sold 300 acres in what is now Cornwall, Pennsylvania, to Peter Grubb
						for £135. Three years later, another 142 acres were purchased. Peter and his brother, Samuel,
						built a small bloomery forge to test the quality of the iron ore present on the property.
						Pleased with the results, they made plans to construct a cold blast charcoal iron furnace
						just north of the ore supply.
					</p>
				</Passage>

				<Passage
					note={
						<>
							<MarginNote year="1742">The furnace goes into blast for the first time.</MarginNote>
							<MarginNote year="1754">
								Peter Grubb dies, leaving the furnace and ore mine to his sons, Curtis and Peter, Jr.
							</MarginNote>
						</>
					}
				>
					<p>
						The furnace went into blast for the first time in 1742. Peter signed a 20-year lease on the
						furnace to an outside group. He died in 1754 leaving the furnace and the ore mine to his
						sons, Curtis and Peter, Jr. The brothers took over the operations when the lease ended.
					</p>
				</Passage>

				<Passage
					note={
						<>
							<MarginNote year="1773">
								Curtis and Peter Grubb build the Ironmaster’s Mansion on the hill. It still stands.
							</MarginNote>
							<MarginNote>
								<strong>Why “Cornwall”?</strong> Peter Grubb named the site for the English county of
								mining fame where his father was born. (ASME, 1985)
							</MarginNote>
						</>
					}
				>
					<p>
						Curtis ran the furnace and ore bank while Peter, Jr. managed the Hopewell Forge a few miles
						southwest of the furnace. Curtis built a mansion on a hill overlooking the furnace. The air
						supply for the furnace was provided by a water wheel powered by Furnace Creek, and the nearby
						forests provided the charcoal.
					</p>
				</Passage>

				<Passage>
					<p>
						The furnace supplied shot, shell, and cannons for the Revolutionary War. After an unsuccessful
						attempt to cast a cannon, the first “proved” cannon, of an eventual forty-two, was completed
						on September 6, 1776.
					</p>
				</Passage>

				<Feature>
					<CannonTally />
				</Feature>
			</Chapter>

			<Remembrance />

			<FurnaceDiagram />

			{/* ---------------- Chapter II ---------------- */}
			<Chapter
				id="robert-coleman"
				numeral="II"
				title="Robert Coleman"
				years="1786 – 1825"
				dek="A forge clerk becomes the master of Cornwall."
			>
				<Passage
					dropCap
					note={
						<>
							<MarginNote year="1773">Robert Coleman marries Ann Old, daughter of ironmaster James Old.</MarginNote>
							<ArchivalFigure
								layout="margin"
								src={elizabethHouse}
								alt="A large house with a deep porch among trees"
								width="1100"
								height="706"
								caption="Robert Coleman’s home at Elizabeth Furnace, photographed for a 1920 book."
								credit={credits.elizabeth}
							/>
						</>
					}
				>
					<p>
						Robert Coleman arrived in the American Colonies at the age of 16 and eventually became a clerk
						at the Hopewell Forge operated by Peter Grubb, Jr. After a year in Grubb’s employment, Robert
						left to work for James Old, a well-known Lancaster-area iron master. Robert married Old’s
						daughter, Ann, in 1773 and after leasing Salford Forge near present day Norristown,
						Pennsylvania, returned to the area, taking a seven-year lease on nearby Elizabeth Furnace.
					</p>
				</Passage>

				<ArchivalFigure
					layout="pair"
					images={[
						{ src: robertColeman, alt: 'Portrait of Robert Coleman, an older man in a dark coat and white cravat', width: 760, height: 983 },
						{ src: annColeman, alt: 'Portrait of Ann Old Coleman in a white bonnet and dark shawl', width: 760, height: 985 },
					]}
					caption="Robert Coleman and his wife, Ann Old Coleman, painted by Jacob Eichholtz about 1820."
					credit={credits.portraits}
				/>

				<Passage
					note={
						<>
							<MarginNote year="1786">Coleman begins acquiring the furnace and the ore mine.</MarginNote>
							<MarginNote year="1798">
								<span className={chapterStyles.fractionRow}>
									<FiveSixths />
									<span>Sole owner of the furnace, and of five-sixths of the mine.</span>
								</span>
							</MarginNote>
						</>
					}
				>
					<p>
						Beginning in 1786, Robert began acquiring ownership of the Cornwall Furnace and the ore mine
						and added a new charging house, wheelhouse and, possibly, a new coalhouse. By 1798 he owned
						the furnace outright as well as 5/6th of the mine.
					</p>
				</Passage>

				<Passage
					note={<MarginNote year="1825">Robert Coleman dies. A roasting oven is built beside the coalhouse.</MarginNote>}
				>
					<p>
						Robert installed his oldest son, William, as manager of the Cornwall properties. William
						remained in charge of the operations until 1828. Robert Coleman died in 1825 and left the
						Cornwall Furnace to his sons William, James, and Edward and the mines to the three brothers
						and their younger brother, Thomas Bird. In that same year a roasting oven was built next to
						the coalhouse to roast the iron ore before charging to burn off sulfur.
					</p>
				</Passage>

				<Passage note={<MarginNote year="1831">Thomas Bird Coleman becomes sole owner of the furnace.</MarginNote>}>
					<p>
						William and Edward sold their ownership of all of their iron properties to their brothers,
						James and Thomas Bird. When James died in 1831, Thomas Bird became sole owner of the Cornwall
						Furnace.
					</p>
				</Passage>

				<Feature>
					<ColemanTree />
				</Feature>
			</Chapter>

			{/* ---------------- Chapter III ---------------- */}
			<Chapter
				id="brothers"
				numeral="III"
				title="Robert W. and William Coleman"
				years="1836 – 1864"
				dek="Steam, stone and a new generation."
			>
				<Passage
					dropCap
					note={<MarginNote year="1836">Thomas Bird Coleman dies. His sons are still teenagers.</MarginNote>}
				>
					<p>
						Robert W. and William Coleman were teenagers when their father, Thomas Bird Coleman, died in
						1836. Their uncles, William and Edward, along with trusted managers, stepped in to keep the
						furnace running.
					</p>
				</Passage>

				<Passage
					note={
						<>
							<MarginNote year="1840s">A steam engine and blowing tubs arrive; the stack is rebuilt.</MarginNote>
							<MarginNote year="1850s">The stone walls that stand today are built.</MarginNote>
							<MarginNote year="1859">A newer 20-horsepower engine is installed.</MarginNote>
						</>
					}
				>
					<p>
						During the 1840s numerous improvements were made to the furnace. The first steam engine was
						introduced to replace the water wheel, and blowing tubs were added to regulate the airflow to
						the furnace. The furnace stack was rebuilt and various repairs were made. During the next
						decade the current stone walls were built. In 1859, the steam engine was replaced with a newer
						20 horsepower engine, and a new water wheel was built.
					</p>
					<p className={chapterStyles.crossRef}>
						<a href="#how-it-worked">See the steam engine, the Great Wheel and the blowing tubs at work ↑</a>
					</p>
				</Passage>

				<ArchivalFigure
					layout="wide"
					src={furnace1934}
					alt="The stone furnace building with Gothic windows and a brick-topped stack behind"
					width="1400"
					height="796"
					caption="The stone furnace building with its Gothic Revival windows, photographed in 1934."
					credit={credits.furnace1934}
				/>

				<Passage
					note={
						<MarginNote>
							<strong>Cold blast and hot blast.</strong> A hot blast furnace heats its air before blowing it
							in, saving fuel. Cornwall kept its cold blast to the end; many ironmasters held that cold-blast
							charcoal iron was of higher quality. (ASME, 1985)
						</MarginNote>
					}
				>
					<p>
						Robert W. Coleman, the visionary of the brothers, was a gifted iron master and shrewd
						businessman. In addition to the improvements to the Cornwall Furnace, he oversaw the
						construction of a new hot blast furnace. In partnership with his cousin, George Dawson
						Coleman, a railroad was built between the ore mines and the Union Canal in north Lebanon, near
						the site of George Dawson’s anthracite furnaces.
					</p>
				</Passage>
			</Chapter>

			<PlantationMap />

			{/* ---------------- Chapter IV ---------------- */}
			<Chapter
				id="heirs"
				numeral="IV"
				title="The Heirs of R. W. Coleman"
				years="1864 – 1883"
				dek="Managers, heirs and the last years in blast."
			>
				<Passage
					dropCap
					note={
						<>
							<MarginNote year="1861">William Coleman dies.</MarginNote>
							<MarginNote year="1864">Robert W. Coleman dies. The Heirs of R. W. Coleman is formed.</MarginNote>
						</>
					}
				>
					<p>
						After William died in 1861 and Robert in 1864, the significant expansion in the Cornwall
						Furnace operations came to a close. The Heirs of R. W. Coleman was formed, owned by William
						and Robert’s sisters, Margaret Freeman, Anne Alden and Sarah Coleman, and William’s two young
						children, Robert H. and Anne Coleman. During the next decade and a half, managers such as
						Artemis Wilhelm were crucial to the success of the Cornwall Furnace and the other furnaces
						which the Heirs owned.
					</p>
				</Passage>

				<ArchivalFigure
					layout="text"
					src={colemanSisters}
					alt="Three young women with dark ringlets, painted close together"
					width="1000"
					height="1292"
					caption="Thomas Sully, The Coleman Sisters, 1844. The sitters are recorded as Margaret Coleman Freeman, Sarah Hand Coleman and Isabel Coleman. Margaret and Sarah are named among the Heirs of R. W. Coleman."
					credit={credits.sisters}
				/>

				<Passage
					note={
						<MarginNote>
							<strong>Charcoal iron’s last market.</strong> By then it went mostly into specialty steels and
							into the parts of railroad cars and locomotives under the greatest stress: wheels, axles and
							driving-wheel tires. (ASME, 1985)
						</MarginNote>
					}
				>
					<p>
						When Robert H. Coleman became involved in the family business he sought to venture out on his
						own and forced a partition of the family holdings. Robert became owner of the Cornwall
						Anthracite Furnace and all other properties in Cornwall, including the charcoal furnace. By
						the early 1880s demand for charcoal-based iron was drying up and the Cornwall Furnace was
						losing money. The furnace went out of blast on February 11, 1883.
					</p>
				</Passage>
			</Chapter>

			<OutOfBlast />

			{/* ---------------- Chapter V ---------------- */}
			<Chapter
				id="museum"
				numeral="V"
				title="The Cornwall Iron Furnace Museum"
				years="1883 – today"
				dek="From ironworks to landmark."
			>
				<Passage
					dropCap
					note={
						<>
							<MarginNote year="1932">
								Margaret Coleman Freeman Buckingham, a great-granddaughter of Robert Coleman, gives the
								furnace to the Commonwealth.
							</MarginNote>
							<MarginNote year="1966">Designated a National Historic Landmark.</MarginNote>
							<MarginNote year="1985">
								Named a National Historic Mechanical Engineering Landmark by ASME.
							</MarginNote>
						</>
					}
				>
					<p>
						While the Coleman descendants sold their properties to Bethlehem Steel in the years following
						WWI, they held onto the Cornwall Furnace. The last Coleman family member to live in the manor
						on the top of the hill overlooking the furnace, Margaret Coleman Freeman Buckingham, donated
						the furnace to the Commonwealth of Pennsylvania in 1932 to preserve it as a museum. Because of
						this gift, the Pennsylvania Historical and Museum Commission is proud to share this industrial
						gem with thousands of guests every year.
					</p>
				</Passage>

				<ArchivalFigure
					layout="row"
					ratio="4 / 3"
					images={[
						{ src: postcard, alt: 'Postcard captioned “Old Charcoal Furnace, Built 1742, Cornwall, Pa.”', width: 640, height: 388, label: 'c. 1910' },
						{ src: furnace1934Wide, alt: 'The furnace buildings in 1934, stone walls and steep roofs', width: 1400, height: 765, label: '1934' },
						{ src: furnace1950s, alt: 'The furnace buildings in the 1950s, with a flagpole in front', width: 1400, height: 952, label: '1950s' },
					]}
					caption="After the fire: the furnace on an early twentieth-century postcard, decades after it went out of blast; in 1934, two years after the gift; and in the 1950s."
					credit={`${credits.postcard} ${credits.survey}`}
				/>

				<Feature>
					<MineEpilogue />
				</Feature>

				<Passage>
					<p className={chapterStyles.closingText}>
						The operations at Cornwall Iron Furnace were not just a local affair; they had far-reaching
						implications. The iron produced here played a crucial role in the nation’s development, from
						building infrastructure to supplying materials for manufacturing and warfare. The furnace
						stands as a testament to the industrial capabilities of the United States, contributing
						significantly to the country’s economic and industrial growth.
					</p>
				</Passage>
			</Chapter>

			<ThenAndNow />
			<StoryClosing />
		</article>
	);
};

export default HistoryStory;
