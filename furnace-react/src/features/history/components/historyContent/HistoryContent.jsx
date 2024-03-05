import { LineHeader } from '/src/components/ui';
import HistoryBlock from '../historyBlock/HistoryBlock';
import styles from './HistoryContent.module.css';

const HistoryContent = () => {
	return (
		<div className={styles.historyContent}>
			<LineHeader title="The Grubb Legacy: 1734 to 1789" />

			<HistoryBlock margin="40px 0 0">
				{/*
				<p className={styles.pullQuote}>
					"This memorable quote is a great way to summarize the content of this section."
				</p>
				*/}
				<p>
					In 1734, William Allen sold 300 acres in what is now Cornwall, Pennsylvania, to 
					Peter Grubb for £135. Three years later, another 142 acres were purchased. Peter 
					and his brother, Samuel, built a small bloomery forge to test the quality of the 
					iron ore present on the property. Pleased with the results, they made plans to 
					construct a cold blast charcoal iron furnace just north of the ore supply. The 
					furnace went into blast for the first time in 1742. Peter signed a 20-year lease 
					on the furnace to an outside group. He died in 1754 leaving the furnace and the 
					ore mine to his sons, Curtis and Peter, Jr. The brothers took over the 
					operations when the lease ended.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 80px">
				<p>
					Curtis ran the furnace and ore bank while Peter, Jr. managed the Hopewell Forge 
					a few miles southwest of the furnace. Curtis built a mansion on a hill 
					overlooking the furnace. The air supply for the furnace was provided by a water 
					wheel powered by Furnace Creek, and the nearby forests provided the charcoal. 
					The furnace supplied shot, shell, and cannons for the Revolutionary War. After 
					an unsuccessful attempt to cast a cannon, the first “proved” cannon, of an 
					eventual forty-two, was completed on September 6, 1776. Two dozen enslaved 
					workers contributed to the working of the operations, which included field 
					work and domestic service in addition to supporting the industrial operations.
				</p>
			</HistoryBlock>

			<LineHeader title="Robert Coleman: 1786 to 1825" />
			<HistoryBlock margin="40px 0 0">
				<p>
					Robert Coleman arrived in the American Colonies at the age of 16 and eventually 
					became a clerk at the Hopewell Forge operated by Peter Grubb, Jr. After a year 
					in Grubb's employment, Robert left to work for James Old, a well-known 
					Lancaster-area iron master. Robert married Old's daughter, Ann, in 1773 and 
					after leasing Salford Forge near present day Norristown, Pennsylvania, returned 
					to the area, taking a seven-year lease on nearby Elizabeth Furnace. Beginning 
					in 1786, Robert began acquiring ownership of the Cornwall Furnace and the ore 
					mine and added a new charging house, wheelhouse and, possibly, a new coalhouse. 
					By 1798 he owned the furnace outright as well as 5/6th of the mine.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 80px">
				<p>
					Robert installed his oldest son, William, as manager of the Cornwall properties. 
					William remained in charge of the operations until 1828. Robert Coleman died in 
					1825 and left the Cornwall Furnace to his sons William, James, and Edward and 
					the mines to the three brothers and their younger brother, Thomas Bird. In that 
					same year a roasting oven was built next to the coalhouse to roast the iron ore 
					before charging to burn off sulfur. William and Edward sold their ownership of 
					all of their iron properties to their brothers, James and Thomas Bird. When 
					James died in 1831, Thomas Bird became sole owner of the Cornwall Furnace.
				</p>
			</HistoryBlock>

			<LineHeader title="Robert W. and William Coleman: 1836 to 1864" />
			<HistoryBlock margin="40px 0 0">
				<p>
					Robert W. and William Coleman were teenagers when their father, Thomas Bird 
					Coleman, died in 1836. Their uncles, William and Edward, along with trusted 
					managers, stepped in to keep the furnace running. During the 1840s numerous 
					improvements were made to the furnace. The first steam engine was introduced 
					to replace the water wheel, and blowing tubs were added to regulate the 
					airflow to the furnace. The furnace stack was rebuilt and various repairs 
					were made. During the next decade the current stone walls were built. In 1859, 
					the steam engine was replaced with a newer 20 horsepower engine, and a new 
					water wheel was built.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 80px">
				<p>
					Robert W. Coleman, the visionary of the brothers, was a gifted iron master 
					and shrewd businessman. In addition to the improvements to the Cornwall 
					Furnace, he oversaw the construction of a new hot blast furnace. In 
					partnership with his cousin, George Dawson Coleman, a railroad was built 
					between the ore mines and the Union Canal in north Lebanon, near the site of 
					George Dawson's anthracite furnaces.
				</p>
			</HistoryBlock>

			<LineHeader title="Heirs of R. W. Coleman and The Cornwall Iron Company: 1864 to 1883" />
			<HistoryBlock margin="40px 0 0">
				<p>
					After William died in 1861 and Robert in 1864, the significant expansion in 
					the Cornwall Furnace operations came to a close. The Heirs of R. W. Coleman 
					was formed, owned by William and Robert's sisters, Margaret Freeman, Anne 
					Alden and Sarah Coleman, and William's two young children, Robert H. and 
					Anne Coleman. During the next decade and a half, managers such as Artemis 
					Wilhelm were crucial to the success of the Cornwall Furnace and the other 
					furnaces which the Heirs owned.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 80px">
				<p>
					When Robert H. Coleman became involved in the family business he sought to 
					venture out on his own and forced a partition of the family holdings. 
					Robert became owner of the Cornwall Anthracite Furnace and all other 
					properties in Cornwall, including the charcoal furnace. By the early 1880s 
					demand for charcoal-based iron was drying up and the Cornwall Furnace was 
					losing money. The furnace went out of blast on February 11, 1883.
				</p>
			</HistoryBlock>

			<LineHeader title="The Cornwall Iron Furnace Museum" />
			<HistoryBlock margin="40px 0 0">
				<p>
					While the Coleman descendants sold their properties to Bethlehem Steel in 
					the years following WWI, they held onto the Cornwall Furnace. The last 
					Coleman family member to live in the manor on the top of the hill 
					overlooking the furnace, Margaret Coleman Freeman Buckingham, donated the 
					furnace to the Commonwealth of Pennsylvania in 1932 to preserve it as a 
					museum. Because of this gift, the Pennsylvania Historical Museum Commission 
					is proud to share this industrial gem with thousands of guests every year.
				</p>
			</HistoryBlock>
			<HistoryBlock margin="40px 0 120px">
				<p>
					The operations at Cornwall Iron Furnace were not just a local affair; they 
					had far-reaching implications. The iron produced here played a crucial role 
					in the nation's development, from building infrastructure to supplying 
					materials for manufacturing and warfare. The furnace stands as a testament 
					to the industrial capabilities of the United States, contributing 
					significantly to the country's economic and industrial growth.
				</p>
			</HistoryBlock>
		</div>
	);
}

export default HistoryContent;