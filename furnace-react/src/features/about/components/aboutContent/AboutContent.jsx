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
							Around it developed villages, artisans’ shops, stores, schools, churches,
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
							satisfy the furnace’s appetite for charcoal, limestone, and iron ore.
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
				</div>
			</div>
		</div>
	);
}

export default AboutContent;