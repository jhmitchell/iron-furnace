import React from 'react';
import ScrollableSection from '/src/layouts/scrollableSection/ScrollableSection';
import TwoColumn from '/src/layouts/twoColumn/TwoColumn';
import styles from './HoldingsSection.module.css';
import TongsImg from '/src/assets/images/collections-tongs.png';
import TurnpikeImg from '/src/assets/images/collections-turnpike.jpg';
import CollectionsBookImg from '/src/assets/images/collections-book.png';
import { HorizontalPictureCard, StyledLink, InfoBlock } from '/src/components/ui'

const HoldingsSection = () => (
	<ScrollableSection id="holdings-section" title="Our Holdings">
		<TwoColumn
			leftContent={
				<>
					<InfoBlock margin="0">
						Explore our extensive archives and collections.
					</InfoBlock>
				</>
			}
			rightContent={
				<div className={styles.cardsContainer}>
					<HorizontalPictureCard image={TurnpikeImg}>
						<h3>Holdings at the PA State Archives</h3>
						<StyledLink to="https://www.cornwallironfurnace.org/CORNWALL_FINA.pdf">
							See more
						</StyledLink>
					</HorizontalPictureCard>
					<HorizontalPictureCard image={TongsImg}>
						<h3>Holdings at the PA Historical Society</h3>
						<StyledLink to="https://www.portal.hsp.org/">
							See more
						</StyledLink>
					</HorizontalPictureCard>
					<HorizontalPictureCard image={CollectionsBookImg}>
						<h3>Collections showcase</h3>
						<StyledLink to="https://www.youtube.com/watch?v=Bt2cKXoaPTo">
							Watch video
						</StyledLink>
					</HorizontalPictureCard>
				</div>
			}
		/>

		{/*
			<p>Explore our extensive archives and collections:</p>
			<ul>
				<li>
					<a href="https://www.cornwallironfurnace.org/CORNWALL_FINA.pdf" target="_blank" rel="noopener noreferrer">
						Holdings at the PA State Archives
					</a>
				</li>
				<li>
					Holdings at the PA Historical Society (Link not available yet)
				</li>
			</ul>
		*/}

	</ScrollableSection>
);

export default HoldingsSection;