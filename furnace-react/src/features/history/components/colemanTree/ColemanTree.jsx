import { useState } from 'react';
import styles from './ColemanTree.module.css';

/*
 * The Coleman family as the history describes it, with the furnace's owners lit up
 * year by year. Only relationships stated in the text are drawn.
 */

const W = 168;
const H = 58;

const PEOPLE = {
	robert: { x: 480, y: 56, name: 'Robert Coleman', sub: 'm. Ann Old, 1773 · d. 1825' },
	william: { x: 150, y: 178, name: 'William', sub: 'manager until 1828' },
	james: { x: 370, y: 178, name: 'James', sub: 'd. 1831' },
	edward: { x: 590, y: 178, name: 'Edward', sub: 'son' },
	thomas: { x: 810, y: 178, name: 'Thomas Bird', sub: 'd. 1836' },
	robertW: { x: 110, y: 300, name: 'Robert W.', sub: 'd. 1864' },
	william2: { x: 290, y: 300, name: 'William', sub: 'd. 1861' },
	margaret: { x: 470, y: 300, name: 'Margaret Freeman', sub: 'daughter' },
	anne: { x: 650, y: 300, name: 'Anne Alden', sub: 'daughter' },
	sarah: { x: 830, y: 300, name: 'Sarah Coleman', sub: 'daughter' },
	robertH: { x: 200, y: 422, name: 'Robert H.', sub: 'son of William' },
	anne2: { x: 380, y: 422, name: 'Anne', sub: 'daughter of William' },
	buckingham: { x: 760, y: 422, name: 'Margaret C. F. Buckingham', sub: 'great-granddaughter of Robert', wide: true },
};

// Parent → children, drawn as elbow connectors.
const FAMILIES = [
	{ parent: 'robert', children: ['william', 'james', 'edward', 'thomas'] },
	{ parent: 'thomas', children: ['robertW', 'william2', 'margaret', 'anne', 'sarah'] },
	{ parent: 'william2', children: ['robertH', 'anne2'] },
];

const MOMENTS = [
	{ year: '1798', owners: ['robert'], text: 'Robert Coleman owns the furnace outright, and five-sixths of the mine.' },
	{
		year: '1825',
		owners: ['william', 'james', 'edward'],
		text: 'Robert dies and leaves the furnace to his sons William, James and Edward. The mines go to all four brothers.',
	},
	{
		year: 'Then',
		owners: ['james', 'thomas'],
		text: 'William and Edward sell all of their iron properties to their brothers, James and Thomas Bird.',
	},
	{ year: '1831', owners: ['thomas'], text: 'James dies, and Thomas Bird becomes sole owner of the furnace.' },
	{
		year: '1836',
		owners: ['robertW', 'william2'],
		stewards: ['william', 'edward'],
		text: 'Thomas Bird dies. His sons Robert W. and William are teenagers, so their uncles William and Edward, with trusted managers, keep the furnace running.',
	},
	{
		year: '1864',
		owners: ['margaret', 'anne', 'sarah', 'robertH', 'anne2'],
		text: 'With both brothers gone, the Heirs of R. W. Coleman is formed: the brothers’ sisters and William’s two young children.',
	},
	{
		year: 'Later',
		owners: ['robertH'],
		text: 'Robert H. Coleman forces a partition of the family holdings and takes every Cornwall property, the charcoal furnace included.',
	},
	{
		year: '1932',
		owners: ['buckingham'],
		text: 'Margaret Coleman Freeman Buckingham, the last of the family to live in the mansion, gives the furnace to the Commonwealth of Pennsylvania.',
	},
];

const width = (p) => (p.wide ? 236 : W);

const Connector = ({ parent, children, lit }) => {
	const p = PEOPLE[parent];
	const kids = children.map((c) => PEOPLE[c]);
	const busY = (p.y + H / 2 + kids[0].y - H / 2) / 2;
	const xs = kids.map((k) => k.x);
	const d = [
		`M${p.x} ${p.y + H / 2} V${busY}`,
		`M${Math.min(...xs, p.x)} ${busY} H${Math.max(...xs, p.x)}`,
		...kids.map((k) => `M${k.x} ${busY} V${k.y - H / 2}`),
	].join(' ');
	return <path d={d} className={`${styles.line} ${lit ? styles.lineLit : ''}`} />;
};

const ColemanTree = () => {
	const [index, setIndex] = useState(0);
	const moment = MOMENTS[index];
	const owners = new Set(moment.owners);
	const stewards = new Set(moment.stewards || []);

	return (
		<figure className={styles.tree} aria-labelledby="tree-title">
			<div className={styles.head}>
				<h3 id="tree-title" className={styles.title}>
					Who owned the furnace?
				</h3>
				<p className={styles.hint}>Step through the years to follow Cornwall down the Coleman line.</p>
			</div>

			<div className={styles.years} role="group" aria-label="Choose a year">
				{MOMENTS.map((m, i) => (
					<button
						key={m.year}
						type="button"
						className={`${styles.year} ${i === index ? styles.yearOn : ''}`}
						aria-pressed={i === index}
						onClick={() => setIndex(i)}
					>
						{m.year}
					</button>
				))}
			</div>

			<p className={styles.moment} aria-live="polite">
				<span className={styles.momentYear}>{moment.year}</span>
				{moment.text}
			</p>

			<div className={styles.scroller}>
				<svg viewBox="0 0 960 470" className={styles.svg} role="img" aria-label={`Coleman family tree. ${moment.text}`}>
					{FAMILIES.map((f) => (
						<Connector
							key={f.parent}
							{...f}
							lit={f.children.some((c) => owners.has(c)) && (owners.has(f.parent) || index > 0)}
						/>
					))}

					{Object.entries(PEOPLE).map(([id, p]) => {
						const w = width(p);
						const state = owners.has(id) ? styles.owner : stewards.has(id) ? styles.steward : '';
						return (
							<g key={id} className={`${styles.node} ${state}`} transform={`translate(${p.x - w / 2} ${p.y - H / 2})`}>
								<rect width={w} height={H} rx="8" className={styles.box} />
								<text x={w / 2} y="25" textAnchor="middle" className={styles.name}>
									{p.name}
								</text>
								<text x={w / 2} y="44" textAnchor="middle" className={styles.sub}>
									{p.sub}
								</text>
							</g>
						);
					})}

					<g className={styles.legend} transform="translate(12 36)">
						<rect x="0" y="-8" width="14" height="14" rx="3" className={styles.legendOwner} />
						<text x="22" y="4">Owner</text>
						<rect x="0" y="16" width="14" height="14" rx="3" className={styles.legendSteward} />
						<text x="22" y="28">Ran the furnace</text>
					</g>
				</svg>
			</div>
			<figcaption className={styles.caption}>
				Only the family members named in this history are shown.
			</figcaption>
		</figure>
	);
};

export default ColemanTree;
