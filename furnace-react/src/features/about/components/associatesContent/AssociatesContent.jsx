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
							{" "}<TextLink to="http://PHMC.pa.gov" target="_blank" rel="noopener noreferrer">
								Pennsylvania Historical and Museum Commission
							</TextLink>{" "}
							to preserve and interpret this premier historic site. It is one of more than
							twenty associations that support individual historic sites and museums on
							the Pennsylvania Trail of History.
						</p>
					</InfoBlock>

					<InfoBlock>
						<h3>Enhancing the Visitor's Experience</h3>
						<p>
							Cornwall Iron Furnace Associates work closely with staff providing volunteers
							to help with operations and programs to promote and interpret the site.
							Cornwall Iron Furnace is increasingly dependent on its Associates to maintain
							a high standard of public service. We donate hundreds of hours of volunteer
							service every year. Our financial support enhances the historic site's
							endeavors in education, public programs, special events, and marketing.

							The Associates plan and organize
							{" "}<TextLink className="accessibility-link" to="/events">
								special events
							</TextLink>
							, such as the lecture series,
							living history demonstrations, and annual Christmas at Cornwall event. We
							provide much needed funding to help with preservation projects, educational
							programs, and interpretation. We also manage and maintain the on-site
							{" "}<TextLink className="accessibility-link" to="/store">museum
								store
							</TextLink>.
						</p>
					</InfoBlock>
				</ScrollableSection>
			</div>
		</div>
	);
}

export default AssociatesContent;