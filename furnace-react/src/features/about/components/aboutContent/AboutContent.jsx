import React from 'react';
import { NavLink } from 'react-router-dom';
import Introduction from '../introduction/Introduction';
import InfoBlock from '../infoBlock/InfoBlock';
import styles from './AboutContent.module.css';
import ScrollableSection from '/src/layouts/scrollableSection/ScrollableSection';
import TwoColumn from '/src/layouts/twoColumn/TwoColumn';

import Furnace from '/src/assets/images/shed.webp';
import HistorySection from '../historySection/HistorySection';
import HoldingsSection from '../holdingsSection/HoldingsSection';

/**
 * The AboutContent component renders the content for the about page.
 */
const AboutContent = () => {
	return (
		<div className={styles.aboutPage}>
			<div className={styles.aboutPageContent}>
				<HistorySection />
				<HoldingsSection />

				<ScrollableSection id="associates-section" title="Our Associates">
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
							{" "}<NavLink className="accessibility-link" to="/events">
								special events
							</NavLink>
							, such as the lecture series,
							living history demonstrations, and annual Christmas at Cornwall event. We
							provide much needed funding to help with preservation projects, educational
							programs, and interpretation. We also manage and maintain the on-site
							{" "}<NavLink className="accessibility-link" to="/store">museum
								store
							</NavLink>.
						</p>
					</InfoBlock>

					<InfoBlock>
						<h3>Serving an International Audience</h3>
						<p>
							Every year, visitors to Cornwall Iron Furnace represent almost every state in the
							United States and some twenty other countries. A large number of school children
							are among those who come to see this vestige of Pennsylvania's rich industrial and
							technological past.
						</p>
					</InfoBlock>

					<InfoBlock>
						<h3>Board of Directors</h3>
						<p>
							New board members are nominated by the Board Nominating Committee and elected for 3-year terms by members at the Annual Membership Meeting.
						</p>
						<h3 className={styles.boardHeader}>2024 Board of Directors</h3>
						<div className={styles.boardMembers}>
							<p>James Polczynski, <b>President</b></p>
							<p>Michael A. Trump, <b>Vice President</b></p>
							<p>Andrew Hebert, <b>Secretary</b></p>
							<p>Kathy Donaldson, <b>Treasurer</b></p>
							<p>Craig Ball</p>
							<p>Michael Bernard</p>
							<p>Rick Brouse</p>
							<p>Catherine “Cavi” Miller</p>
							<p>Irvin Muritz</p>
							<p>Timothy Nieman</p>
							<p>L. Susan Wentzel</p>
						</div>
					</InfoBlock>

					<InfoBlock>
						<h3>Becoming a Member of the Cornwall Iron Furnace Associates</h3>
						<p>
							We invite you to become part of Cornwall Iron Furnace Associates. You can help us to preserve this important historic site by joining our organization. Members receive:
						</p>
						<ul className={styles.membershipBenefits}>
							<li>Unlimited free admission to Cornwall Iron Furnace</li>
							<li>Our quarterly newsletter, The Ledger</li>
							<li>10% discounts on museum store purchases</li>
							<li>Special invitations and opportunities reserved for members</li>
						</ul>
						<p>
							Please join Cornwall Iron Furnace Associates, Inc., d/b/a The Friends of Cornwall Iron Furnace, a non-profit group that supports and maintains the preservation, interpretation, curatorial, and educational programs at Cornwall Iron Furnace. The Friends group is a 501c3 and your membership dues and contributions are tax deductible.
						</p>
						<p>
							There are various levels of membership. You may also upgrade your membership to include the Pennsylvania Heritage Foundation for an additional fee. Your support can make all the difference.
						</p>
						<p>
							<a href="/membership" className="accessibility-link">Click here to become a member.</a>
						</p>
					</InfoBlock>
				</ScrollableSection>
			</div>
		</div>
	);
}

export default AboutContent;