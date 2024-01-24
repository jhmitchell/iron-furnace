import { LineHeader } from '/src/components/ui';
import HistoryBlock from '../historyBlock/HistoryBlock';
import styles from './HistoryContent.module.css';

const HistoryContent = () => {
	return (
		<div className={styles.historyContent}>
			<LineHeader title="From Humble Beginnings: The Genesis of an Iron Giant"/>
			
			<HistoryBlock margin="40px 0 0">
				<h2>The Grubb Legacy</h2>
				<p>
					In the 1730s, the story of Cornwall Iron Furnace began with Peter Grubb, 
					a visionary stonemason who saw potential in the rich iron ore deposits 
					of south-central Pennsylvania. Grubb's initial foray into mining laid 
					the foundation for what would become one of the most significant 
					ironworks in American history.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 0">
				<h2>Establishing the Furnace</h2>
				<p>
					In 1742, Grubb established the Cornwall Iron Furnace, aptly naming it after 
					Cornwall in England, his father's birthplace. This decision marked the 
					beginning of an era that would see this furnace become a cornerstone of 
					American iron production. The early years were marked by manual labor and 
					rudimentary techniques, with local resources like iron ore, limestone, and 
					wood for charcoal fuelling the furnace's insatiable appetite.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 80px">
				<h2>The Iron Industry's Rise</h2>
				<p>
					Despite the challenges of the colonial period, including the British 
					Parliament's attempts in 1750 to restrict iron production in the colonies, 
					the furnace thrived. The American colonies, spearheaded by Pennsylvania's 
					ironworks, continued to ramp up production, defiantly contributing 
					significantly to the world's iron output. Cornwall Iron Furnace stood at the 
					forefront of this industrial revolution, symbolizing the colonies' burgeoning 
					independence and industrial prowess.
				</p>
			</HistoryBlock>

			<LineHeader title="The Industrial Powerhouse: Cornwall in its Prime"/>
			<HistoryBlock margin="40px 0 0">
				<h2>The Furnace at Work</h2>
				<p>
					During its operational peak, Cornwall Iron Furnace emerged as a beacon of 
					industrial might. The furnace, with its roaring fires and molten iron, became 
					a symbol of American ingenuity and resilience. It was here that raw materials 
					— iron ore, limestone, and wood for charcoal — were masterfully transformed 
					into valuable commodities like cannons, stoves, and pig iron. These products 
					were not just commercial goods; they were instrumental in shaping the 
					burgeoning nation, both in times of peace and during conflicts.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 0">
				<h2>Life in the Iron Plantation</h2>
				<p>
					The furnace was more than an industrial unit; it was the heart of a vast 
					industrial plantation. Around it, a self-sufficient community thrived, 
					complete with villages, artisans' shops, stores, schools, and churches. The 
					life of the workers and their families revolved around the furnace's rhythm, 
					creating a unique socio-economic ecosystem. This microcosm of industry and 
					community life was a typical representation of the iron plantations that 
					dotted Pennsylvania's landscape during this era.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 0">
				<h2>Technological Advancements</h2>
				<p>
					The mid-19th century brought significant advancements in iron making, and 
					Cornwall Iron Furnace was at the forefront of these innovations. The furnace 
					underwent extensive renovations in 1856-57 under the Coleman family, 
					adapting to new techniques and increasing efficiency. These improvements 
					reflected the broader industrial revolution sweeping across the nation, 
					positioning the furnace as a leader in iron production technology.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 0">
				<h2>The Furnace's Broader Impact</h2>
				<p>
					The operations at Cornwall Iron Furnace were not just a local affair; they 
					had far-reaching implications. The iron produced here played a crucial role 
					in the nation's development, from building infrastructure to supplying 
					materials for manufacturing and warfare. The furnace stood as a testament 
					to the industrial capabilities of the United States, contributing significantly 
					to the country's economic and industrial growth.
				</p>
			</HistoryBlock>
		</div>
	);
}

export default HistoryContent;