import React from 'react';
import styles from './AssociatesContent.module.css';
import { TextLink, InfoBlock } from '/src/components/ui';
import ScrollableSection from '/src/layouts/scrollableSection/ScrollableSection';

const AssociatesContent = () => {
	return (
		<div className={styles.associatesPage}>
			<div className={styles.associatesPageContent}>
				<ScrollableSection id="associates" title="Associates">
				<InfoBlock>
					<p>
						Formed in 1984, Cornwall Iron Furnace Associates, also
						referred to as The Friends of Cornwall Iron Furnace, works in partnership
						with the
						{" "}<a className="accessibility-link" href="http://PHMC.pa.gov" target="_blank" rel="noopener noreferrer">
							Pennsylvania Historical and Museum Commission
						</a>{" "}
						to preserve and interpret this premier historic site. It is one of more than
						twenty associations that support individual historic sites and museums on
						the Pennsylvania Trail of History.
					</p>
				</InfoBlock>
				</ScrollableSection>
			</div>
		</div>
	);
}

export default AssociatesContent;