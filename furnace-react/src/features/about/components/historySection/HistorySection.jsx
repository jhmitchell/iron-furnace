import React from 'react';
import InfoBlock from '../infoBlock/InfoBlock';
import ScrollableSection from '/src/layouts/scrollableSection/ScrollableSection';
import { PictureLink, PictureLinkContainer } from '/src/components/ui';

import styles from './HistorySection.module.css';
import OldImg from '/src/assets/images/history-old-furnace.jpg';
import AssociatesImg from '/src/assets/images/history-associates.jpg';

const HistorySection = () => (
	<ScrollableSection id="history-section" title="About the Furnace">
		{/*<Introduction />*/}
		<InfoBlock margin="0">
			
			Cornwall Iron Furnace (1742-1883) is the only surviving intact charcoal cold
			blast furnace in the Western Hemisphere, a testament to the once great iron
			industry that flourished in south-central Pennsylvania and our nation.
		</InfoBlock>

		<InfoBlock>
			<p>
				The furnace was the heart of a vast industrial plantation for nearly
				a century and a half. It is typical of the furnaces that dotted the
				Pennsylvania countryside in the eighteenth and nineteenth centuries.
				Around it developed villages, artisans' shops, stores, schools, churches,
				and the home of a wealthy ironmaster. Iron ore, limestone, and wood for
				charcoal were found in this self-contained iron plantation, totaling about
				10,000 acres at its peak; all of these raw materials were necessary for
				the smelting process.
			</p>
		</InfoBlock>

		<InfoBlock margin="0 0 72px">
			<p>
				Originally built by Peter Grubb in 1742, the furnace underwent extensive
				renovations in 1856-57 under its subsequent owners, the Coleman family,
				and then the furnace closed in 1883. It is this mid-19th century ironmaking
				complex which survives today. Visitors will find the furnace, blast
				equipment, and related buildings still standing as they did over a century
				ago. Here visitors can explore the rambling Gothic buildings where cannons,
				stoves, and pig iron were cast, and where men labored day and night to
				satisfy the furnace's appetite for charcoal, limestone, and iron ore.
			</p>
		</InfoBlock>

		<PictureLinkContainer>
			<PictureLink image={OldImg} link="/history">
				<p>About the Furnace</p>
				<h2>Explore our history</h2>
			</PictureLink>
			<PictureLink image={AssociatesImg} link="/associates">
				<p>About the Furnace</p>
				<h2>Our Associates and Partners</h2>
			</PictureLink>
		</PictureLinkContainer>
	</ScrollableSection>
);

export default HistorySection;
