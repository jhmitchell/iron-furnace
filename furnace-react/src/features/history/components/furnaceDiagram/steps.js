/*
 * The steps of the furnace diagram. Text draws on the site's own descriptions of the
 * furnace buildings and on ASME's 1985 landmark brochure (see Sources).
 *
 * `focus` names the parts of the drawing to light up; `labels` are the callouts,
 * given per era where the machinery differs. Label coordinates are in the SVG's
 * 1100 × 660 viewBox: (x, y) is the point being labelled, (lx, ly) where the text sits.
 * `view` is the region the drawing zooms to on narrow screens (same 5:3 shape).
 */

export const ERAS = {
	early: {
		id: 'early',
		short: '1742',
		label: 'As first built',
		caption: 'Water power and bellows, 1742',
	},
	rebuilt: {
		id: 'rebuilt',
		short: 'Mid-1800s',
		label: 'As rebuilt · today',
		caption: 'Steam power and blowing tubs, as the furnace survives today',
	},
};

const steps = [
	{
		id: 'recipe',
		view: { early: '0 120 760 456', rebuilt: '0 60 800 480' },
		title: 'The recipe',
		focus: ['hill', 'barn', 'charge', 'ore'],
		body: {
			early: [
				'Three ingredients went into the furnace in measured batches. Iron ore came from the Cornwall Ore Banks, a deposit of unusually rich magnetite just south of the furnace. Charcoal, the fuel, was made from the surrounding forests. Limestone was the flux: in the fire it bonded with the impurities in the ore and carried them away.',
			],
			rebuilt: [
				'Three ingredients went into the furnace in measured batches. Iron ore came from the Cornwall Ore Banks, a deposit of unusually rich magnetite just south of the furnace. Charcoal, the fuel, was stored in the great charcoal barn on the hill, today the Visitor Center. Limestone was the flux, bonding with impurities in the ore and carrying them away.',
				'As the mine began to yield a lower grade of ore, it was first roasted in an oven beside the furnace, in alternate layers with charcoal, to drive off sulfur. Sulfur left in the ore could cause difficulties in smelting and even force the furnace to stop.',
			],
		},
		materials: true,
		labels: {
			early: [
				{ text: 'Charcoal house', x: 125, y: 214, lx: 70, ly: 150 },
				{ text: 'Ore from the mine, just south', x: 40, y: 300, lx: 40, ly: 300, arrow: true },
				{ text: 'The charge: ore, charcoal, limestone', x: 600, y: 330, lx: 745, ly: 300 },
			],
			rebuilt: [
				{ text: 'Charcoal barn (today’s Visitor Center)', x: 120, y: 190, lx: 30, ly: 70 },
				{ text: 'Ore from the mine, just south', x: 40, y: 300, lx: 40, ly: 300, arrow: true },
				{ text: 'The charge: ore, charcoal, limestone', x: 600, y: 330, lx: 790, ly: 300 },
			],
		},
	},
	{
		id: 'charging',
		view: { early: '200 70 650 390', rebuilt: '200 40 700 420' },
		title: 'Charging the stack',
		focus: ['bridge', 'chargingRoom', 'cart', 'charge', 'throat'],
		body: {
			early: [
				'The furnace was open at the top. Measured loads of ore, charcoal and limestone were wheeled across a bridge from the hilltop and dumped into the opening, more or less continuously, so that the stack stayed full.',
			],
			rebuilt: [
				'After the furnace was remodeled and enlarged in the mid-1800s, its top was enclosed by the charging room, whose elegant Gothic Revival facade still stands as a testament to the furnace’s success.',
				'Charcoal came in carts from the charcoal barn under the roof of the connecting shed, sheltered from the weather. Ore, charcoal and limestone were brought into the room by cart and wagon and tipped through a hole in the floor into the furnace below.',
			],
		},
		labels: {
			early: [
				{ text: 'Bridge from the hilltop', x: 380, y: 250, lx: 300, ly: 175 },
				{ text: 'Open top of the stack', x: 600, y: 252, lx: 690, ly: 175 },
			],
			rebuilt: [
				{ text: 'Connecting shed', x: 340, y: 228, lx: 270, ly: 150 },
				{ text: 'Charging room', x: 520, y: 196, lx: 500, ly: 70 },
				{ text: 'Hole in the floor', x: 600, y: 252, lx: 800, ly: 200 },
			],
		},
	},
	{
		id: 'blast',
		view: { early: '180 330 420 252', rebuilt: '20 230 580 348' },
		title: 'The blast',
		focus: ['wheel', 'engine', 'blowers', 'pipe', 'air', 'flume', 'tuyere'],
		body: {
			early: [
				'Charcoal alone will not burn hot enough to melt iron; the fire needs a forced draft. At Cornwall that air first came from a pair of wood-and-leather bellows nearly 21 feet long, worked by an overshot water wheel turned by a small stream.',
				'The air went into the furnace unheated. That is what “cold blast” means.',
			],
			rebuilt: [
				'In the rebuilding, the bellows gave way to two great wooden blowing cylinders, the “tubs.” A 20-horsepower steam engine, built by the West Point Foundry in New York, turned the Great Wheel: a timber gear wheel 24 feet across and weighing four tons, set in the old water-wheel pit. The wheel worked the tubs, and the air entered the base of the furnace through pipes called tuyeres.',
				'The air still went in unheated. Cornwall kept the “cold blast” to the end, even after hotter, heated-air furnaces had spread.',
			],
		},
		labels: {
			early: [
				{ text: 'Overshot water wheel', x: 320, y: 455, lx: 70, ly: 410 },
				{ text: 'Bellows', x: 440, y: 506, lx: 410, ly: 440 },
				{ text: 'Tuyere: the blast enters here', x: 560, y: 530, lx: 760, ly: 470 },
			],
			rebuilt: [
				{ text: 'Steam engine · 20 hp', x: 100, y: 514, lx: 40, ly: 420 },
				{ text: 'Great Wheel · 24 ft', x: 250, y: 380, lx: 40, ly: 330 },
				{ text: 'Blowing tubs', x: 412, y: 300, lx: 470, ly: 300, side: 'right' },
				{ text: 'Tuyere: the blast enters here', x: 560, y: 528, lx: 780, ly: 470 },
			],
		},
	},
	{
		id: 'smelting',
		view: { early: '335 245 540 324', rebuilt: '335 245 540 324' },
		title: 'Inside the stack',
		focus: ['charge', 'heat', 'hearth', 'tuyere', 'section'],
		body: {
			early: [
				'Inside, the charge sank slowly down the stack. Burning charcoal gave off fierce heat and carbon monoxide gas, which drew the oxygen out of the ore and left iron behind.',
				'Lower down, where the stack widens into the bosh, the iron melted and trickled into the hearth. The limestone and impurities became slag, a glassy waste that floated on top of the molten iron.',
			],
			rebuilt: [
				'Inside, the charge sank slowly down the stack. Burning charcoal gave off fierce heat and carbon monoxide gas, which drew the oxygen out of the ore and left iron behind.',
				'Lower down, where the stack widens into the bosh, the iron melted and trickled into the hearth. The limestone and impurities became slag, a glassy waste that floated on top of the molten iron.',
			],
		},
		labels: {
			early: [
				{ text: 'Throat', x: 600, y: 285, lx: 745, ly: 270 },
				{ text: 'Bosh: the widest, hottest zone', x: 650, y: 430, lx: 760, ly: 380 },
				{ text: 'Slag', x: 612, y: 526, lx: 790, ly: 490 },
				{ text: 'Molten iron in the hearth', x: 600, y: 552, lx: 790, ly: 530 },
			],
			rebuilt: [
				{ text: 'Throat', x: 600, y: 285, lx: 790, ly: 270 },
				{ text: 'Bosh: the widest, hottest zone', x: 650, y: 430, lx: 800, ly: 380 },
				{ text: 'Slag', x: 612, y: 526, lx: 830, ly: 490 },
				{ text: 'Molten iron in the hearth', x: 600, y: 552, lx: 830, ly: 530 },
			],
		},
	},
	{
		id: 'waste-heat',
		view: { early: '450 70 330 198', rebuilt: '20 10 820 492' },
		title: 'Fire at the top',
		focus: ['top', 'boilers', 'chimney', 'flames', 'steamLine'],
		body: {
			early: [
				'Flame and hot gas poured from the open top of the stack, and all of that heat was lost to the sky.',
			],
			rebuilt: [
				'The rebuilt furnace put its waste heat to work. Boilers sat on top of the stack, where the hot gases escaping from the furnace passed beneath them before leaving by the chimney.',
				'The steam they raised drove the engine that made the blast. In effect, the furnace helped to power itself.',
			],
		},
		labels: {
			early: [{ text: 'Flame and gas from the open top', x: 600, y: 215, lx: 690, ly: 140 }],
			rebuilt: [
				{ text: 'Boilers heated by furnace gases', x: 600, y: 230, lx: 760, ly: 120 },
				{ text: 'Chimney', x: 644, y: 70, lx: 700, ly: 40 },
				{ text: 'Steam to the engine', x: 160, y: 400, lx: 40, ly: 330 },
			],
		},
	},
	{
		id: 'casting',
		view: { early: '560 380 500 280', rebuilt: '590 380 500 280' },
		title: 'Tapping and casting',
		focus: ['hearth', 'castingArch', 'castingHouse', 'pigBed', 'molten'],
		body: {
			early: [
				'Twice a day the furnace was tapped. The slag was let off first; then the clay dam at the foot of the hearth was lowered and the iron ran out across the casting-house floor.',
				'If the molder was making stove plates, pans, cannon balls or other goods, his molding flasks stood ready. The rest ran into channels in the sand floor, forming bars known as pig iron, about three feet long and light enough for one man to lift, which went to the forges for further working. A typical week produced about 20 tons.',
			],
			rebuilt: [
				'Twice a day the furnace was tapped. The slag was let off first; then the clay dam at the foot of the hearth was lowered and the iron ran out across the casting-house floor.',
				'If the molder was making stove plates, pans, cannon balls or other goods, his molding flasks stood ready. The rest ran into channels in the sand floor, forming bars known as pig iron, about three feet long and light enough for one man to lift, which went to the forges for further working.',
			],
		},
		labels: {
			early: [
				{ text: 'Casting house', x: 820, y: 470, lx: 860, ly: 360 },
				{ text: 'Molding flasks', x: 760, y: 600, lx: 620, ly: 625, side: 'left' },
				{ text: 'Pig bed in the sand floor', x: 930, y: 612, lx: 1070, ly: 520, side: 'left' },
			],
			rebuilt: [
				{ text: 'Casting house', x: 860, y: 470, lx: 880, ly: 360 },
				{ text: 'Molding flasks', x: 800, y: 600, lx: 650, ly: 625, side: 'left' },
				{ text: 'Pig bed in the sand floor', x: 960, y: 612, lx: 1090, ly: 520, side: 'left' },
			],
		},
	},
];

export default steps;
