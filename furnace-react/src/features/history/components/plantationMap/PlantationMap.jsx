import { useState } from 'react';
import storyStyles from '../../HistoryStory.module.css';
import Reveal from '../chapter/Reveal';
import places, { FLOWS } from './places';
import styles from './PlantationMap.module.css';

// Roads and building outlines follow the grounds map on /map, so the two agree.
const ROADS = [
	'M484.98 142.42l-124.74 334.8c-1.64 12.86-4.18 28.55.86 40.49 5.49 13 17.63 21.81 29.21 29.92',
	'M47.68 322.92a275.16 275.16 0 00-3.1-43.95c-1-6.23-2.2-12.66-5.86-17.79s-10.38-8.62-16.37-6.66H-40',
	'M183.54 125.14c-17.82-.3-35.37 5.56-50.71 14.52s-28.65 20.93-41 33.58a415.73 415.73 0 00-60 78.05',
	'M183.54 -40L183.54 125.13',
	'M171.99 125.56c15.35-1.86 30.6 2.7 45.56 6 22.41 4.93 45.62 7.1 68.72 9.25 24.54 2.29 49.09 4.58 73.74 6 55.62 3.3 111.49 2.39 167.25 1.46 L620 147',
	'M341.68 148.59a138.23 138.23 0 01-29.93 69.78c-28.13 34.43-50.16 74.09-87.41 98.38',
];

const BUILDINGS = [
	// Furnace group: casting house, charging room, boilers, wheel house.
	'M62.55 225.71H127.53V256.7H62.55z',
	'M84.72 196.65H127.14V224.51H84.72z',
	'M84.73 257.83H127.18V295.29H84.73z',
	// Connecting shed and charcoal barn.
	'M127.76 225.71H198V256.7H127.76z',
	'M199.29 177.56H238.63V287.9H199.29z',
	// Mansion, paymaster, blacksmith, wagon shop, stables, abattoir.
	'M111.71 16.13H164.81V43.57H111.71z',
	'M213.34 92.06H238.7V112.46H213.34z',
	'M364.71 220.87H390.04V254.33H364.71z',
	'M406.97 233.15H426.64V261.04H406.97z',
	'M500.14 181.97H548.88V208.34H522.51V250.32H500.14Z',
	'M329.27 343.82H354.32V380.41H329.27z',
];

const TREES = [
	[-30, 60], [-44, 96], [-22, 120], [-48, 190], [-30, 230], [-50, 300], [-28, 360], [-46, 410],
	[600, 300], [620, 340], [596, 380], [626, 420], [604, 470], [622, 520], [20, 40], [44, 70],
	[250, 20], [280, 46], [310, 22], [340, 50], [560, 60], [590, 90], [612, 40],
];

const Tree = ({ x, y }) => (
	<g transform={`translate(${x} ${y})`} className={styles.tree}>
		<path d="M0 10 V2" />
		<path d="M-7 3 C-9 -6 -3 -12 0 -12 C3 -12 9 -6 7 3 Z" />
	</g>
);

const PlantationMap = () => {
	const [selected, setSelected] = useState('furnace');
	const [flows, setFlows] = useState(() => new Set(['ore', 'charcoal']));
	const place = places.find((p) => p.id === selected);
	const number = places.indexOf(place) + 1;

	const toggleFlow = (id) =>
		setFlows((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});

	const step = (delta) => {
		const i = (places.indexOf(place) + delta + places.length) % places.length;
		setSelected(places[i].id);
	};

	const onMarkerKey = (event, id) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			setSelected(id);
		}
	};

	return (
		<section id="plantation" data-tone="iron" className={styles.section} aria-labelledby="plantation-title">
			<div className={storyStyles.inner}>
				<Reveal as="header" className={styles.intro}>
					<p className={styles.kicker}>Interlude</p>
					<h2 id="plantation-title" className={styles.title}>
						The Iron Plantation
					</h2>
					<p className={styles.dek}>
						A charcoal furnace was the heart of a whole community: the mine, the forests, workshops and
						stables, houses for workers and managers, and the ironmaster’s mansion on the hill. Explore the
						plantation, and follow the materials that fed the fire.
					</p>
				</Reveal>

				<div className={styles.layout}>
					<div className={styles.mapColumn}>
						<div className={styles.flows} role="group" aria-label="Show routes">
							{FLOWS.map((f) => (
								<button
									key={f.id}
									type="button"
									className={`${styles.flowChip} ${styles[`chip_${f.id}`]} ${flows.has(f.id) ? styles.flowOn : ''}`}
									aria-pressed={flows.has(f.id)}
									onClick={() => toggleFlow(f.id)}
								>
									<span className={styles.flowSwatch} aria-hidden="true" />
									{f.label}
								</button>
							))}
						</div>

						<div className={styles.sheet}>
							<svg
								viewBox="-70 -60 713 700"
								className={styles.map}
								role="group"
								aria-label="Map of the Cornwall iron plantation"
							>
								<defs>
									<pattern id="pm-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
										<line x1="0" y1="0" x2="0" y2="5" stroke="#3b3027" strokeWidth="1.4" />
									</pattern>
									<pattern id="pm-water" width="22" height="10" patternUnits="userSpaceOnUse">
										<path d="M0 6 q5.5 -4 11 0 t11 0" fill="none" stroke="#5f7f8c" strokeWidth="1" />
									</pattern>
								</defs>

								{/* Neat line and border, like an engraved plate. */}
								<rect x="-62" y="-52" width="697" height="684" className={styles.border} />
								<rect x="-56" y="-46" width="685" height="672" className={styles.borderInner} />

								{TREES.map(([x, y]) => (
									<Tree key={`${x}-${y}`} x={x} y={y} />
								))}

								{/* Hill under the mansion. */}
								<g className={styles.hachure}>
									{Array.from({ length: 22 }, (_, i) => {
										const a = Math.PI * (0.05 + (i / 21) * 0.9);
										const cx = 138;
										const cy = 30;
										return (
											<line
												key={i}
												x1={cx + Math.cos(a) * 46}
												y1={cy + Math.sin(a) * 30}
												x2={cx + Math.cos(a) * 62}
												y2={cy + Math.sin(a) * 42}
											/>
										);
									})}
								</g>

								{ROADS.map((d) => (
									<g key={d}>
										<path d={d} className={styles.roadEdge} />
										<path d={d} className={styles.road} />
									</g>
								))}

								<path
									d="M175.4 577.92l-138.67-.43c.6-29.41 63-53.48 138.67-53.48 76.08 0 138.68 24.33 138.68 53.91v.43z"
									className={styles.pit}
								/>
								<path
									d="M175.4 577.92l-138.67-.43c.6-29.41 63-53.48 138.67-53.48 76.08 0 138.68 24.33 138.68 53.91v.43z"
									fill="url(#pm-water)"
								/>

								{BUILDINGS.map((d) => (
									<path key={d} d={d} className={styles.building} />
								))}
								<rect
									x="532.49"
									y="425.67"
									width="40.2"
									height="61.82"
									transform="rotate(23.07 503.434 151.966)"
									className={styles.building}
								/>
								<path
									d="M348.87 230.65L293.67 306.15 L285.71 299.37 L274.85 329.81 M309.65 264.47L318.95 271.98 M303.69 271.98L312.99 279.48 M298.28 279.48L307.58 286.99 M292.63 286.99L301.93 294.5 M314.3 257.29L323.6 264.79 M319.91 249.78L329.21 257.29 M325.75 242.27L335.05 249.78"
									className={styles.trestle}
								/>

								{/* Modern road names, for orientation. */}
								<text x="402" y="136" className={styles.roadName}>
									Rexmont Road
								</text>
								<text transform="rotate(-69.6 448 300)" x="448" y="300" className={styles.roadName}>
									Boyd Street
								</text>

								{/* Routes. */}
								{FLOWS.map((f) => (
									<path
										key={f.id}
										d={f.d}
										className={`${styles.flow} ${styles[`flow_${f.id}`]} ${flows.has(f.id) ? styles.flowVisible : ''}`}
									/>
								))}

								{/* Destinations beyond the edge of the map. */}
								<g className={styles.offMap}>
									<path d="M410 -18 V-42 M403 -34 L410 -42 L417 -34" className={styles.offArrow} />
									<text x="424" y="-30">North to Lebanon</text>
									<text x="424" y="-15" className={styles.offSub}>
										and the Union Canal
									</text>

									<path d="M-30 560 L-50 586 M-50 576 L-50 586 L-40 586" className={styles.offArrow} />
									<text x="-24" y="604">Hopewell Forge</text>
									<text x="-24" y="619" className={styles.offSub}>
										a few miles southwest
									</text>

									<text x="-50" y="270" className={styles.forestLabel} transform="rotate(-90 -50 270)">
										Forests · charcoal
									</text>
								</g>

								{/* Cartouche and compass. */}
								<g className={styles.cartouche} transform="translate(-46 -38)">
									<rect width="150" height="50" rx="2" />
									<text x="75" y="22" textAnchor="middle" className={styles.cartoucheTitle}>
										Cornwall
									</text>
									<text x="75" y="39" textAnchor="middle" className={styles.cartoucheSub}>
										The Iron Plantation
									</text>
								</g>
								<g className={styles.compass} transform="translate(586 -6)">
									<circle r="24" />
									<path d="M0 -30 L6 0 L0 30 L-6 0 Z" />
									<path d="M0 -30 L6 0 L-6 0 Z" className={styles.compassNorth} />
									<text y="-35" textAnchor="middle">
										N
									</text>
								</g>

								{/* Numbered places. */}
								{places.map((p, i) => (
									<g
										key={p.id}
										className={`${styles.marker} ${p.id === selected ? styles.markerOn : ''}`}
										transform={`translate(${p.x} ${p.y})`}
										role="button"
										tabIndex={0}
										aria-label={`${i + 1}. ${p.name}`}
										aria-pressed={p.id === selected}
										onClick={() => setSelected(p.id)}
										onKeyDown={(e) => onMarkerKey(e, p.id)}
									>
										<circle r="17" className={styles.markerHalo} />
										<circle r="11.5" className={styles.markerDot} />
										<text dy="0.35em" textAnchor="middle" className={styles.markerNum}>
											{i + 1}
										</text>
									</g>
								))}
							</svg>
						</div>
						<p className={styles.mapNote}>
							Schematic map, not to scale. Buildings follow the site’s grounds map; modern roads are shown
							for orientation.
						</p>
					</div>

					<div className={styles.panel} aria-live="polite">
						<div className={styles.panelNav}>
							<button type="button" onClick={() => step(-1)} aria-label="Previous place">
								←
							</button>
							<span>
								{number} of {places.length}
							</span>
							<button type="button" onClick={() => step(1)} aria-label="Next place">
								→
							</button>
						</div>

						<article key={place.id} className={styles.card}>
							<p className={styles.cardRole}>
								<span className={styles.cardNum}>{number}</span>
								{place.role}
							</p>
							<h3 className={styles.cardTitle}>{place.name}</h3>
							<figure className={styles.cardPhoto}>
								<img src={place.photo} alt={place.photoAlt} loading="lazy" />
								<figcaption>Today</figcaption>
							</figure>
							{place.text.map((t) => (
								<p key={t} className={styles.cardText}>
									{t}
								</p>
							))}
							{place.link && (
								<a className={styles.cardLink} href={place.link.href}>
									{place.link.text}
								</a>
							)}
						</article>

						<ul className={styles.flowNotes}>
							{FLOWS.filter((f) => flows.has(f.id)).map((f) => (
								<li key={f.id} className={styles[`note_${f.id}`]}>
									<strong>{f.label}.</strong> {f.note}
								</li>
							))}
						</ul>

						<a className={styles.mapLink} href="/map">
							Planning a visit? Open the interactive grounds map →
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default PlantationMap;
