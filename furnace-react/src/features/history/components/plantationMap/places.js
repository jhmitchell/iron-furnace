import chargingRoom from '/src/assets/images/map/charging-room.webp';
import exhibits from '/src/assets/images/map/exhibits.webp';
import connectingShed from '/src/assets/images/map/connecting-shed.webp';
import buttresses from '/src/assets/images/map/buttresses.webp';
import mansion from '/src/assets/images/map/mansion.webp';
import paymaster from '/src/assets/images/map/paymaster.jpg';
import managerHouse from '/src/assets/images/map/manager-house.webp';
import abattoir from '/src/assets/images/map/abattoir.webp';
import blacksmith from '/src/assets/images/map/blacksmith-shop.webp';
import wagonShop from '/src/assets/images/map/wagon-shop.webp';
import stable from '/src/assets/images/map/stable.webp';
import openPit from '/src/assets/images/map/open-pit.webp';
import minersVillage from '/src/assets/images/map/miners-village.webp';

/*
 * Places on the iron plantation. Descriptions are the site's own (from the grounds map).
 * Coordinates are in the same space as the grounds map on /map.
 */
const places = [
	{
		id: 'furnace',
		name: 'The Furnace',
		role: 'Ironmaking',
		x: 95,
		y: 245,
		photo: chargingRoom,
		photoAlt: 'The charging room inside the furnace building today',
		text: [
			'Originally, several distinct buildings clustered around the furnace stack. The furnace building was constructed when the furnace was remodeled and enlarged in the mid-1800s. Its elegant facade and Gothic Revival details add testament to the success of the furnace and to the refined taste of its owners.',
			'Inside are the charging room, where raw materials went into the stack; the casting house, where the furnace was tapped twice daily; the four-ton Great Wheel; and the boilers on top of the stack.',
		],
		link: { href: '#how-it-worked', text: 'See how the furnace worked ↑' },
	},
	{
		id: 'barn',
		name: 'Charcoal Barn',
		role: 'Fuel store · today the Visitor Center',
		x: 219,
		y: 232,
		photo: exhibits,
		photoAlt: 'Exhibits inside the Visitor Center today',
		text: [
			'Located in the mid-nineteenth century charcoal barn, the Visitor Center offers interpretative exhibits on mining, charcoal making, and ironmaking and gives the visitor a glimpse of the huge spaces needed to contain the fuel used in the smelting process.',
		],
	},
	{
		id: 'shed',
		name: 'Connecting Shed',
		role: 'Fuel route',
		x: 162,
		y: 241,
		photo: connectingShed,
		photoAlt: 'The connecting shed today',
		text: [
			'This roof protected charcoal from inclement weather as it was transported in carts from the charcoal barn to the charging room. Before the furnace building was constructed around the stack, raw materials were brought to the top of the stack on a bridge from the top of the hill.',
		],
	},
	{
		id: 'roasting',
		name: 'Roasting Oven & Buttresses',
		role: 'Ore preparation',
		x: 312,
		y: 282,
		photo: buttresses,
		photoAlt: 'The stone buttresses today',
		text: [
			'The stone buttresses were built to support the railway that transported ore from the mine to the site. Later, these buttresses were used to store anthracite coal for use on the iron plantation.',
			'Next to the buttresses is the roasting oven, in which alternate layers of charcoal and iron ore were loosely placed to remove sulphur from the iron ore. This structure was probably erected in the early 1800s when the mine was beginning to yield a lower grade of ore.',
		],
	},
	{
		id: 'mansion',
		name: 'Ironmaster’s Mansion',
		role: 'Built 1773',
		x: 138,
		y: 30,
		photo: mansion,
		photoAlt: 'The Ironmaster’s Mansion today',
		text: [
			'Curtis and Peter Grubb, the sons of the builder of Cornwall Furnace, built this mansion in 1773. The Coleman family, whose patriarch Robert Coleman had acquired the furnace and estate, did extensive remodeling in the mid-nineteenth century, adding Italianate architectural elements.',
			'Today a few residents of Cornwall Manor have apartments in this building. These private residences are not open to the public.',
		],
	},
	{
		id: 'paymaster',
		name: 'Paymaster’s Office',
		role: 'Estate office',
		x: 226,
		y: 102,
		photo: paymaster,
		photoAlt: 'The Paymaster’s Office today',
		text: [
			'By 1875, this structure was an office serving the Cornwall Estate. The Cornwall Iron Company, Ltd. (1886–1901), which had control over the defunct Cornwall Iron Furnace, used the building for its office. Today, Cornwall Manor uses the building as an artist studio.',
		],
	},
	{
		id: 'manager',
		name: 'Manager’s House',
		role: 'Home of the furnace manager',
		x: 429,
		y: 451,
		photo: managerHouse,
		photoAlt: 'The Manager’s House today',
		text: [
			'This impressive stone building was constructed in the nineteenth century as a residence for the furnace manager. Its size and design show the importance of the manager, who ranked second only to the owner. Throughout the twentieth century, Bethlehem Steel used this building as its Cornwall office.',
			'Today the structure is owned by Cornwall Manor and is not open to the public.',
		],
	},
	{
		id: 'abattoir',
		name: 'Abattoir',
		role: 'Butcher shop & smokehouse',
		x: 342,
		y: 362,
		photo: abattoir,
		photoAlt: 'The abattoir today',
		text: [
			'This charming Gothic Revival building, featuring quatrefoil windows, served as the butcher shop and smokehouse for the Cornwall Estate. The three-story interior meat tree still stands and serves as a structural support.',
		],
	},
	{
		id: 'blacksmith',
		name: 'Blacksmith Shop',
		role: 'Tools & hardware',
		x: 377,
		y: 238,
		photo: blacksmith,
		photoAlt: 'The blacksmith shop today',
		text: [
			'The fabrication and repair of tools for mining and ironmaking was an ongoing process. Here a blacksmith could make tools and hardware for the plantation.',
		],
	},
	{
		id: 'wagon',
		name: 'Wagon Shop',
		role: 'Wagons for mine & furnace',
		x: 417,
		y: 247,
		photo: wagonShop,
		photoAlt: 'The wagon shop today',
		text: ['Wagons for the mining and ironmaking operations were constructed and repaired in this building.'],
	},
	{
		id: 'stable',
		name: 'Stables',
		role: 'Horses & mules',
		x: 520,
		y: 206,
		photo: stable,
		photoAlt: 'The stables today',
		text: [
			'This building quartered the horses and mules used in everyday functions of the furnace, such as hauling raw materials and finished products. There are keystone arches over the lower doors and the vent grills in the upper doors.',
			'Today the stable serves as the maintenance shop for Cornwall Manor and is closed to the public.',
		],
	},
	{
		id: 'pit',
		name: 'The Open Pit',
		role: 'The Cornwall Ore Banks',
		x: 175,
		y: 548,
		photo: openPit,
		photoAlt: 'The flooded open pit today',
		text: [
			'The mine operated continuously from the 1730s to 1973 and was at one time the largest open-pit iron ore mine in the world. It produced over 106 million tons of iron ore, as well as copper, cobalt, gold, and silver.',
			'Mining operations closed as a result of flooding from Tropical Storm Agnes. The pit continued to fill with water until it reached its full capacity in 1984. It is visible today from Boyd Street, just south of the furnace.',
		],
	},
	{
		id: 'village',
		name: 'Minersvillage',
		role: 'Workers’ housing',
		x: 486,
		y: 548,
		photo: minersVillage,
		photoAlt: 'Houses in Minersvillage today',
		text: [
			'Just beyond the open pit lies Minersvillage, a picturesque community of brick, stone, and frame homes. The mine owners built this village a few units at a time to provide housing for their workers.',
			'Today the houses are private residences and may be seen along Boyd Street.',
		],
	},
];

export const FLOWS = [
	{
		id: 'ore',
		label: 'Ore',
		note: 'Ore came up from the mine, was roasted beside the buttresses, and went into the furnace.',
		d: 'M196 526 C228 452 262 384 282 322 C252 282 196 262 128 241',
	},
	{
		id: 'charcoal',
		label: 'Charcoal',
		note: 'Charcoal from the surrounding forests filled the barn, then rolled through the connecting shed to the furnace.',
		d: 'M-40 150 C40 150 150 150 214 186 M219 232 C190 240 160 241 128 240',
	},
	{
		id: 'iron',
		label: 'Pig iron',
		note: 'Pig iron left the casting house for the forges, to be worked further. Hopewell Forge, managed by Peter Grubb, Jr., lay a few miles to the southwest.',
		d: 'M62 248 C40 300 30 380 4 460 C-10 505 -30 540 -46 580',
	},
	{
		id: 'rail',
		label: 'Railroad',
		note: 'Robert W. Coleman and his cousin George Dawson Coleman built a railroad from the ore mines north to the Union Canal at Lebanon.',
		d: 'M260 528 C300 460 330 380 349 231 C380 160 400 80 410 -40',
	},
];

export default places;
