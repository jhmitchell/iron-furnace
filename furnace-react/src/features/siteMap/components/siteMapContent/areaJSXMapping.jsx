import MuseumCannonballs from '/src/assets/images/map/museum-cannonballs.jpg';
import ConnectingShed from '/src/assets/images/map/connecting-shed.jpg';
import Boilers from '/src/assets/images/map/boilers.png';
import CastingHouse from '/src/assets/images/map/casting-house.jpg';
import GreatWheel from '/src/assets/images/map/great-wheel.jpg';
import CharingRoom from '/src/assets/images/map/charging-room.png';
import MuseumStore from '/src/assets/images/map/museum-store.png';
import Exhibits from '/src/assets/images/map/exhibits.jpg';
import Stable from '/src/assets/images/map/stable.jpg';
import Mansion from '/src/assets/images/map/mansion.jpg';
import Paymaster from '/src/assets/images/map/paymaster.jpg';
import ManagerHouse from '/src/assets/images/map/manager-house.jpg';
import Abattoir from '/src/assets/images/map/abattoir.png';
import Buttresses from '/src/assets/images/map/buttresses.png';
import BlacksmithShop from '/src/assets/images/map/blacksmith-shop.jpg';
import WagonShop from '/src/assets/images/map/wagon-shop.jpg';
import OpenPit from '/src/assets/images/map/open-pit.jpg';
import MinersVillage from '/src/assets/images/map/miners-village.jpg';
import styles from './SiteMapContent.module.css';

const restrooms = () => (
	<div>
		<h2>Restrooms</h2>
		<p>
			Accessible restrooms and baby changing area are located in the
			Visitor's Center.
		</p>
	</div>
);

const areaJSXMapping = {
	"museum": () => (
		<div className={styles.info}>
			<h2>Visitor's Center</h2>
			<img src={MuseumCannonballs} alt="Museum Cannonballs" />
			<p>
				Located in the 19th century charcoal barn, the Visitor's Center
				offers interpretative exhibits on mining, charcoal making, and
				ironmaking and gives the visitor a glimpse of the huge spaces
				needed to contain the fuel used in the smelting process.
			</p>
		</div>
	),
	"connecting-shed": () => (
		<div>
			<h2>Connecting Shed</h2>
			<img src={ConnectingShed} alt="Connecting Shed" />
			<p>
				This roof protected charcoal from inclement weather as it was
				transported in carts from the charcoal barn to the charging room.
				Before the furnace building was constructed around the stack,
				raw materials were brought to the top of the stack on a bridge
				from the top of the hill.
			</p>
		</div>
	),
	"arch": () => (
		<div>
			<h2>Boilers</h2>
			<img src={Boilers} alt="Boilers" />
			<p>
				The boilers, located on the top of the furnace stack, use exhausted
				heat from the smelting process to create steam to power the steam
				engine.
			</p>
		</div>
	),
	"molding-room": () => (
		<div>
			<h2>Casting House</h2>
			<img src={CastingHouse} alt="Casting House" />
			<p>
				It was here that the furnace was tapped for iron twice daily. If the
				molder was making any stove plates, pans, cannon balls, or other
				items, he would have his molding flask ready on the casting house
				floor. The remainder was directed into small channels on the casting
				house floor. A bar of iron created in these channels was known as pig
				iron and was taken to forges for further processing.
			</p>
		</div>
	),
	"bathroom1": restrooms,
	"bathroom2": restrooms,
	"bathroom3": restrooms,
	"giant-wheel": () => (
		<div>
			<h2>Great Wheel</h2>
			<img src={GreatWheel} alt="Great Wheel" />
			<p>
				The blowing apparatus installed by the Coleman family included the
				Great Wheel, which weighs four tons and measures 24 feet in diameter.
			</p>
		</div>
	),
	"cart-room": () => (
		<div>
			<h2>Charging Room</h2>
			<img src={CharingRoom} alt="Charging Room" />
			<p>
				Originally, several distinct buildings clustered around the furnace stack.
				The furnace building was constructed when the furnace was remodeled and
				enlarged in the mid-1800s. Its elegant facade and Gothic Revival details
				add testament to the success of the furnace and to the refined taste of
				its owners. Charcoal, iron ore, and limestone were brought into this room
				with carts and wagons and added to the furnace through a hole in the floor.
			</p>
		</div>
	),
	"museum-store": () => (
		<div>
			<h2>Museum Store</h2>
			<img src={MuseumStore} alt="Museum Store" />
			<p>
				The museum store is located in the visitor's center and offers a
				selection of redware, cast iron cookware, books, artwork, apparel, and
				other souvenirs relating to the furnace and the iron industry. Every
				purchase supports the Friends of the Cornwall Iron Furnace.
			</p>
		</div>
	),
	"exhibits": () => (
		<div>
			<h2>Exhibits</h2>
			<img src={Exhibits} alt="Exhibits" />
			<p>
				Interpretative displays and a short film help to tell the story of 
				Cornwall Iron Furnace.
			</p>
		</div>
	),
	"stable": () => (
		<div>
			<h2>Stables</h2>
			<img src={Stable} alt="Stables" />
			<p>
				This building quartered the horses and mules used in everyday functions of 
				the furnace, such as hauling raw materials and finished products. There are 
				Keystone arches over the lower doors and the vent grills in the upper doors. 
				Today the stable serves as the maintenance shop for Cornwall Manor.
			</p>
		</div>
	),
	"mansion": () => (
		<div>
			<h2>Ironmaster's Mansion</h2>
			<img src={Mansion} alt="Ironmaster's Mansion" />
			<p>
				Curttis and Peter Grubb, the sons of the builder of Cornwall Furnace, built 
				this mansion in 1773. The Coleman family, whose patriarch Robert Coleman had 
				acquired the furnace and estate, did extensive remodeling in 1865. Included 
				in the renovation was the addition of Italianate architectural elements. 
				Today a few residents of Cornwall Manor have apartments in this building.
			</p>
		</div>
	),
	"paymaster": () => (
		<div>
			<h2>Paymaster's Office</h2>
			<img src={Paymaster} alt="Paymaster's Office" />
			<p>
				By 1875, this structure was an office serving the Cornwall Estate. The Cornwall 
				Iron Company, Ltd. (1886-1901), which had control over the defunct Cornwall 
				Iron Furnace, used the building for its office. Today, Cornwall Manor uses the 
				building as an artist studio.
			</p>
		</div>
	),
	"manager-house": () => (
		<div>
			<h2>Manager's House</h2>
			<img src={ManagerHouse} alt="Manager's House" />
			<p>
				Present knowledge indicates that this impressive stone building was constructed 
				in the 19th Century as a residence for the furnace manager. Its size and design 
				show the importance of the manager, who ranked second only to the owner. In the 
				20th Century, Bethlehem Steel used this building as its Cornwall office. Today 
				the structure is owned by Cornwall Manor.
			</p>
		</div>
	),
	"abattoir": () => (
		<div>
			<h2>Abattoir</h2>
			<img src={Abattoir} alt="Abattoir" />
			<p>
				This charming Gothic Revival building, featuring quatrefoil-foil windows, served 
				as the smokehouse and butcher shop for the Cornwall Estate.
			</p>
		</div>
	),
	"buttresses": () => (
		<div>
			<h2>Buttresses</h2>
			<img src={Buttresses} alt="Buttresses" />
			<p>
				The stone buttresses were built to support the railway that transported ore from 
				the mine to the site. Later, these buttresses were used to store anthracite coal 
				for use on the iron plantation.
			</p>
			<p>
				Next to the buttresses is the roasting oven, in which alternate layers of charcoal 
				and iron ore were loosely placed to remove sulphur from the iron ore. Failure to 
				eliminate sulfur would cause difficulties in smelting and might force the 
				operation to stop. This structure was probably erected in the early 1800s when the 
				mine was beginning to yield a lower grade of ore.
			</p>
		</div>
	),
	"blacksmith-shop": () => (
		<div>
			<h2>Blacksmith Shop</h2>
			<img src={BlacksmithShop} alt="Blacksmith Shop" />
			<p>
				The fabrication and repair of tools for mining and ironmaking was an ongoing 
				process. Here a blacksmith could make tools and hardware for the plantation.
			</p>
		</div>
	),
	"wagon-shop": () => (
		<div>
			<h2>Wagon Shop</h2>
			<img src={WagonShop} alt="Wagon Shop" />
			<p>
				Wagons for the mining and ironmaking operations were constructed and repaired 
				in this building.
			</p>
		</div>
	),
	"open-pit": () => (
		<div>
			<h2>Open Pit</h2>
			<img src={OpenPit} alt="Open Pit" />
			<p>
				Cornwall Ore Banks was one of the world's greatest iron ore deposits. More 
				than 100 million tons were extracted between 1730 and 1973. The depth of the 
				open pit reached five hundred feet below the surface. Today, the pit is 
				filled with water and may be viewed from Boyd Street.
			</p>
		</div>
	),
	"miners-village": () => (
		<div>
			<h2>Miners' Village</h2>
			<img src={MinersVillage} alt="Miners' Village" />
			<p>
				Company housing was made available to miners and furnace workers. 
				Minersvillage was started in 1865 and has been occupied continuously. Today 
				the houses are private residences and may be seen along Boyd Street.
			</p>
		</div>
	)
};

export default areaJSXMapping;