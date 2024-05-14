import React from 'react';
import ScrollableSection from '/src/layouts/scrollableSection/ScrollableSection';
import TwoColumn from '/src/layouts/twoColumn/TwoColumn';
import styles from './HoldingsSection.module.css';
import TongsImg from '/src/assets/images/collections-tongs.png';
import TurnpikeImg from '/src/assets/images/collections-turnpike.jpg';
import CollectionsBookImg from '/src/assets/images/collections-book.png';
import { HorizontalPictureCard, StyledLink, InfoBlock } from '/src/components/ui';
import useResponsive from '/src/hooks/useResponsive';

const HoldingsSection = () => {
  const { isMobile } = useResponsive();

  const renderCards = () => (
    <div className={styles.cardsContainer}>
      <HorizontalPictureCard image={TurnpikeImg}>
        <h3>Holdings at the PA State Archives</h3>
        <StyledLink to="https://www.cornwallironfurnace.org/CORNWALL_FINA.pdf">
          See more
        </StyledLink>
      </HorizontalPictureCard>
      <HorizontalPictureCard image={TongsImg}>
        <h3>Holdings at the PA Historical Society</h3>
        <StyledLink to="https://www.portal.hsp.org/">See more</StyledLink>
      </HorizontalPictureCard>
      <HorizontalPictureCard image={CollectionsBookImg}>
        <h3>Collections showcase</h3>
        <StyledLink to="https://www.youtube.com/watch?v=Bt2cKXoaPTo">
          Watch video
        </StyledLink>
      </HorizontalPictureCard>
    </div>
  );

  return (
    <ScrollableSection id="holdings-section" title="Our Holdings">
      {isMobile ? (
        <div className={styles.mobileContainer}>
          <InfoBlock margin="0 0 20px">
            Explore our extensive archives and collections.
          </InfoBlock>
          {renderCards()}
        </div>
      ) : (
        <TwoColumn
          leftContent={
            <>
              <InfoBlock margin="0">
                Explore our extensive archives and collections.
              </InfoBlock>
            </>
          }
          rightContent={renderCards()}
        />
      )}
    </ScrollableSection>
  );
};

export default HoldingsSection;