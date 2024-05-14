import React from 'react';
import ScrollableSection from '/src/layouts/scrollableSection/ScrollableSection';
import { PictureLink, PictureLinkContainer, InfoBlock } from '/src/components/ui';

import styles from './HistorySection.module.css';
import OldImg from '/src/assets/images/history-old-furnace.jpg';
import MapImg from '/src/assets/images/history-map.jpeg';
import AssociatesImg from '/src/assets/images/history-associates.jpg';

const HistorySection = () => (
	<ScrollableSection id="history-section" title="About the Furnace">
		<InfoBlock margin="0 0 72px">
			Cornwall Iron Furnace (1742-1883) is the only surviving intact charcoal 
			cold-blast furnace in the Western Hemisphere, a testament to the once great 
			iron industry that flourished in South-Central Pennsylvania and our nation.
		</InfoBlock>

		<PictureLinkContainer>
			<PictureLink image={OldImg} link="/history">
				<h2>Explore our history</h2>
			</PictureLink>
			<PictureLink image={MapImg} link="/map">
				<h2>Interactive Site Map</h2>
			</PictureLink>
			<PictureLink image={AssociatesImg} link="/associates">
				<h2>Our Associates and Partners</h2>
			</PictureLink>
		</PictureLinkContainer>
	</ScrollableSection>
);

export default HistorySection;
