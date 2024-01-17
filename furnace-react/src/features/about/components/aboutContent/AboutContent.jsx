import React from 'react';
import { NavLink } from 'react-router-dom';
import Introduction from '../introduction/Introduction';
import InfoBlock from '../infoBlock/InfoBlock';
import styles from './AboutContent.module.css';
import { ArrowTextLink } from '/src/components/ui';

/**
 * The AboutContent component renders the content for the about page.
 */

const AboutContent = () => {
	return (
		<div className={styles.aboutPage}>
			<div className={styles.aboutPageContent}>
				<div id="history-section">
					<Introduction />
					<InfoBlock>
						<p>The furnace was the heart of a vast industrial plantation for nearly
							a century and a half. It is typical of the furnaces that dotted the
							Pennsylvania countryside in the eighteenth and nineteenth centuries.
							Around it developed villages, artisans' shops, stores, schools, churches,
							and the home of a wealthy ironmaster. Iron ore, limestone, and wood for
							charcoal were found in this self-contained iron plantation, totaling about
							10,000 acres at its peak; all of these raw materials were necessary for
							the smelting process.</p>
					</InfoBlock>
					<InfoBlock>
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
					<ArrowTextLink text="LEARN MORE" path="/history" />
				</div>

				<div id="holdings-section" className={styles.holdings}>
					<h2>Our Holdings</h2>
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
				</div>

				<div id="associates-section" className={styles.associates}>
					<h2>Our Associates</h2>
					<InfoBlock>
						<p>
							Formed in 1984, Cornwall Iron Furnace Associates, also
							referred to as The Friends of Cornwall Iron Furnace, works in partnership
							with the
							{" "}<a className="accessibility-link" href="http://PHMC.pa.gov" target="_blank" rel="noopener noreferrer">
								Pennsylvania Historical and Museum Commission (PHMC.pa.gov)
							</a>{" "}
							to preserve and interpret this premier historic site. It is one of more than
							twenty associations that support individual historic sites and museums on
							the Pennsylvania Trail of History.
						</p>
					</InfoBlock>

					<h2>Enhancing the Visitor's Experience</h2>
					<InfoBlock>
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
						<h2>Serving an International Audience</h2>
						<p>
							Every year, visitors to Cornwall Iron Furnace represent almost every state in the
							United States and some twenty other countries. A large number of school children
							are among those who come to see this vestige of Pennsylvania’s rich industrial and
							technological past.
						</p>
					</InfoBlock>

					<InfoBlock>
						<h2>Board of Directors</h2>
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
						<h2>Becoming a Member of the Cornwall Iron Furnace Associates</h2>
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
				</div>
			</div>
		</div>
	);
}

export default AboutContent;