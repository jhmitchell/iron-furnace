import { useEffect, useRef } from 'react';
import styles from './FurnaceDiagram.module.css';

/*
 * A schematic cross-section of the furnace, drawn in a 1100 × 660 viewBox.
 * Both eras are always drawn; the one not selected fades out. A single animation
 * loop turns the wheels and works the bellows, tubs and steam engine.
 */

const GROUND = 580;

// Stack outlines. The core (bosh) survived the rebuilding unchanged.
const STACK = {
	early: '545,250 655,250 700,580 500,580',
	rebuilt: '495,250 705,250 740,580 460,580',
};
const BOSH = 'M578 250 L538 440 L576 515 L576 565 L624 565 L624 515 L662 440 L622 250 Z';
const HILL = 'M0 250 L232 250 C250 252 262 300 268 360 L290 580 L0 580 Z';

// The wheel pit is shared: the Great Wheel was set in the old water-wheel pit.
const WHEEL = { cx: 320, cy: 455 };
const GREAT_R = 105;
const WATER_R = 82;
const PINION = { cx: 217, cy: 514, r: 14 };
const CRANK_R = 40;

const spokes = (r, n, inner = 10) =>
	Array.from({ length: n }, (_, i) => {
		const a = (i / n) * Math.PI * 2;
		return (
			<line
				key={i}
				x1={Math.cos(a) * inner}
				y1={Math.sin(a) * inner}
				x2={Math.cos(a) * (r - 4)}
				y2={Math.sin(a) * (r - 4)}
			/>
		);
	});

const gearTeeth = (r, n) => {
	let d = '';
	for (let i = 0; i < n; i += 1) {
		const a = (i / n) * Math.PI * 2;
		const a2 = a + (Math.PI * 2) / n / 2;
		d += `M${(Math.cos(a) * r).toFixed(1)} ${(Math.sin(a) * r).toFixed(1)} L${(Math.cos(a) * (r + 5)).toFixed(1)} ${(Math.sin(a) * (r + 5)).toFixed(1)} L${(Math.cos(a2) * (r + 5)).toFixed(1)} ${(Math.sin(a2) * (r + 5)).toFixed(1)} L${(Math.cos(a2) * r).toFixed(1)} ${(Math.sin(a2) * r).toFixed(1)} `;
	}
	return d;
};

const buckets = (r, n) =>
	Array.from({ length: n }, (_, i) => {
		const a = (i / n) * 360;
		return <rect key={i} x={r - 12} y={-4} width={14} height={8} transform={`rotate(${a})`} />;
	});

// Pig bed geometry on the casting-house floor, drawn in shallow perspective.
const pigBed = (left) => {
	const start = { x: left + 18, y: 590 };
	const end = { x: 1030, y: 622 };
	const pigs = [];
	const n = 9;
	for (let i = 1; i <= n; i += 1) {
		const t = i / (n + 1);
		const x = start.x + (end.x - start.x) * t;
		const y = start.y + (end.y - start.y) * t;
		pigs.push(`M${x.toFixed(1)} ${y.toFixed(1)} l22 20`);
	}
	return { sow: `M${start.x} ${start.y} L${end.x} ${end.y}`, pigs };
};

const LABEL_SIZE = 17;
const LABEL_H = 30;
const CHAR_W = LABEL_SIZE * 0.56;

/** A callout: on wide screens a text label with a leader line, on narrow ones a numbered marker. */
const Label = ({ label, number, markerR }) => {
	const { text, x, y, lx, ly, arrow, side } = label;

	if (markerR) {
		return (
			<g className={styles.label}>
				<circle className={styles.marker} cx={x} cy={y} r={markerR} />
				<text
					className={styles.markerText}
					x={x}
					y={y}
					dy="0.36em"
					textAnchor="middle"
					style={{ fontSize: markerR * 1.15 }}
				>
					{number}
				</text>
			</g>
		);
	}

	const w = text.length * CHAR_W + 28;
	const boxX = side === 'left' ? lx - w : lx;
	const boxY = ly - LABEL_H / 2 - 4;

	if (arrow) {
		return (
			<g className={styles.label}>
				<path className={styles.labelArrow} d={`M${x + 12} ${y} h-14 m6 -7 l-7 7 l7 7`} />
				<rect className={styles.labelBox} x={x + 18} y={y - LABEL_H / 2} width={w} height={LABEL_H} rx={LABEL_H / 2} />
				<text className={styles.labelText} x={x + 32} y={y + 6}>
					{text}
				</text>
			</g>
		);
	}

	// Leader from the nearest edge of the label to its target.
	let sx = Math.min(Math.max(x, boxX + 14), boxX + w - 14);
	let sy = y < boxY ? boxY : boxY + LABEL_H;
	if (x < boxX) {
		sx = boxX;
		sy = boxY + LABEL_H / 2;
	} else if (x > boxX + w) {
		sx = boxX + w;
		sy = boxY + LABEL_H / 2;
	}

	return (
		<g className={styles.label}>
			<line className={styles.labelLeader} x1={sx} y1={sy} x2={x} y2={y} />
			<circle className={styles.labelDot} cx={x} cy={y} r={4.5} />
			<rect className={styles.labelBox} x={boxX} y={boxY} width={w} height={LABEL_H} rx={LABEL_H / 2} />
			<text className={styles.labelText} x={boxX + 14} y={boxY + LABEL_H / 2 + 6}>
				{text}
			</text>
		</g>
	);
};

const FULL_VIEW = [0, 0, 1100, 660];
const parseView = (v) => (v ? v.split(' ').map(Number) : FULL_VIEW);

const FurnaceSvg = ({ era, step, animate, compact, reduced, titleId, descId, title, description }) => {
	const refs = useRef({});
	const svgRef = useRef(null);
	const viewRef = useRef(FULL_VIEW);

	// On narrow screens the drawing pans and zooms to each step's area.
	const target = compact ? parseView(step.view?.[era]) : FULL_VIEW;
	const targetKey = target.join(' ');
	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return undefined;
		const to = targetKey.split(' ').map(Number);
		const from = viewRef.current;
		const apply = (v) => {
			viewRef.current = v;
			svg.setAttribute('viewBox', v.map((n) => n.toFixed(1)).join(' '));
		};
		if (reduced) {
			apply(to);
			return undefined;
		}
		const start = performance.now();
		let frame;
		const tick = (now) => {
			const t = Math.min(1, (now - start) / 750);
			const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
			apply(from.map((f, i) => f + (to[i] - f) * e));
			if (t < 1) frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [targetKey, reduced]);
	const markerR = compact ? target[2] * 0.026 : 0;
	const set = (name) => (el) => {
		refs.current[name] = el;
	};

	const focus = new Set(step.focus);
	const part = (name, extra = '') =>
		`${styles.part} ${focus.has(name) ? styles.lit : ''} ${extra}`.trim();
	const eraClass = (id) => `${styles.era} ${era === id ? styles.eraOn : ''}`;

	// One loop drives every moving part of the machinery.
	useEffect(() => {
		if (!animate) return undefined;
		let frame = 0;
		let last = performance.now();
		let angle = 0;

		const tick = (now) => {
			const dt = Math.min(64, now - last);
			last = now;
			angle += dt * 0.0006; // about one turn every ten seconds
			const r = refs.current;
			const deg = (angle * 180) / Math.PI;

			// Early era: water wheel and bellows.
			r.waterWheel?.setAttribute('transform', `translate(${WHEEL.cx} ${WHEEL.cy}) rotate(${deg * 1.3})`);
			const lift = (offset) => 4 + 14 * (0.5 + 0.5 * Math.sin(angle * 1.3 * 2 + offset));
			const bellows = (el, baseY, h) => {
				el?.setAttribute(
					'points',
					`490,${baseY - 8} 395,${baseY - h} 395,${baseY + 2} 490,${baseY + 2}`
				);
			};
			bellows(r.bellowsA, 504, lift(0));
			bellows(r.bellowsB, 532, lift(Math.PI));
			const crankA = angle * 1.3;
			r.bellowsRod?.setAttribute('x1', WHEEL.cx + Math.cos(crankA) * 30);
			r.bellowsRod?.setAttribute('y1', WHEEL.cy + Math.sin(crankA) * 30);
			r.bellowsRod?.setAttribute('y2', 504 - lift(0));

			// Rebuilt era: Great Wheel, tubs, engine.
			r.greatWheel?.setAttribute('transform', `translate(${WHEEL.cx} ${WHEEL.cy}) rotate(${deg})`);
			const ratio = GREAT_R / PINION.r;
			r.pinion?.setAttribute('transform', `translate(${PINION.cx} ${PINION.cy}) rotate(${-deg * ratio * 0.35})`);

			const pin = (offset) => ({
				x: WHEEL.cx + Math.cos(angle + offset) * CRANK_R,
				y: WHEEL.cy + Math.sin(angle + offset) * CRANK_R,
			});
			const pA = pin(0);
			const pB = pin(Math.PI);
			const yA = 372 + 14 * Math.sin(angle);
			const yB = 372 - 14 * Math.sin(angle);
			r.rodA?.setAttribute('x1', pA.x);
			r.rodA?.setAttribute('y1', pA.y);
			r.rodA?.setAttribute('y2', yA);
			r.rodB?.setAttribute('x1', pB.x);
			r.rodB?.setAttribute('y1', pB.y);
			r.rodB?.setAttribute('y2', yB);
			r.pistonA?.setAttribute('y', yA - 86);
			r.pistonB?.setAttribute('y', yB - 86);
			r.pistonRodA?.setAttribute('y1', yA - 80);
			r.pistonRodA?.setAttribute('y2', yA);
			r.pistonRodB?.setAttribute('y1', yB - 80);
			r.pistonRodB?.setAttribute('y2', yB);

			// Engine: crank on the flywheel drives a horizontal piston.
			const phi = -angle * ratio * 0.35;
			const cr = 18;
			const cx = PINION.cx + Math.cos(phi) * cr;
			const cy = PINION.cy + Math.sin(phi) * cr;
			const crossX = cx - Math.sqrt(60 * 60 - (cy - PINION.cy) ** 2);
			r.engineRod?.setAttribute('x1', crossX);
			r.engineRod?.setAttribute('x2', cx);
			r.engineRod?.setAttribute('y2', cy);
			r.pistonRod?.setAttribute('x2', crossX);
			r.enginePiston?.setAttribute('x', crossX - 72);

			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [animate]);

	const bed = (left) => pigBed(left);
	const earlyBed = bed(700);
	const rebuiltBed = bed(740);

	return (
		<svg
			ref={svgRef}
			className={`${styles.svg} ${animate ? styles.animated : ''}`}
			viewBox="0 0 1100 660"
			preserveAspectRatio="xMidYMid meet"
			role="img"
			aria-labelledby={`${titleId} ${descId}`}
			data-step={step.id}
		>
			<title id={titleId}>{title}</title>
			<desc id={descId}>{description}</desc>

			<defs>
				<pattern id="fd-stone" width="44" height="22" patternUnits="userSpaceOnUse">
					<rect width="44" height="22" fill="#4a443c" />
					<path d="M0 0.5H44 M0 11.5H44 M14 0V11 M36 11V22" stroke="rgba(232,220,196,0.18)" strokeWidth="1" />
				</pattern>
				<pattern id="fd-earth" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
					<rect width="12" height="12" fill="#211f22" />
					<line x1="0" y1="0" x2="0" y2="12" stroke="rgba(232,220,196,0.09)" strokeWidth="2" />
				</pattern>
				<pattern id="fd-brick" width="16" height="8" patternUnits="userSpaceOnUse">
					<rect width="16" height="8" fill="#5a2f22" />
					<path d="M0 0.5H16 M0 4.5H16 M5 0V4 M13 4V8" stroke="rgba(0,0,0,0.35)" strokeWidth="1" />
				</pattern>
				<pattern id="fd-sand" width="10" height="10" patternUnits="userSpaceOnUse">
					<rect width="10" height="10" fill="#4a3f33" />
					<circle cx="2" cy="3" r="0.8" fill="rgba(255,235,200,0.15)" />
					<circle cx="7" cy="8" r="0.7" fill="rgba(255,235,200,0.12)" />
				</pattern>
				<linearGradient id="fd-heat" gradientUnits="userSpaceOnUse" x1="0" y1="250" x2="0" y2="565">
					<stop offset="0" stopColor="#ff7a2a" stopOpacity="0" />
					<stop offset="0.35" stopColor="#ff7a2a" stopOpacity="0.12" />
					<stop offset="0.62" stopColor="#ff7a2a" stopOpacity="0.5" />
					<stop offset="0.82" stopColor="#ffb25a" stopOpacity="0.8" />
					<stop offset="1" stopColor="#ffe2a8" stopOpacity="0.9" />
				</linearGradient>
				<linearGradient id="fd-iron" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#fff1c2" />
					<stop offset="0.45" stopColor="#ffb347" />
					<stop offset="1" stopColor="#e2611d" />
				</linearGradient>
				<radialGradient id="fd-backglow" cx="0.5" cy="0.6" r="0.5">
					<stop offset="0" stopColor="#ff8a3d" stopOpacity="0.22" />
					<stop offset="1" stopColor="#ff8a3d" stopOpacity="0" />
				</radialGradient>
				<radialGradient id="fd-mouth" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#ffcf86" stopOpacity="0.9" />
					<stop offset="1" stopColor="#ff7a2a" stopOpacity="0" />
				</radialGradient>
				<clipPath id="fd-bosh">
					<path d={BOSH} />
				</clipPath>
				<clipPath id="fd-hill">
					<path d={HILL} />
				</clipPath>
				<filter id="fd-glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="4" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<marker id="fd-air-head" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto">
					<path d="M0 0 L10 5 L0 10 z" fill="#9fd3ff" />
				</marker>
			</defs>

			<ellipse cx="600" cy="470" rx="330" ry="250" fill="url(#fd-backglow)" className={styles.backglow} />

			{/* ---------- Ground and hill ---------- */}
			<rect x="0" y={GROUND} width="1100" height={660 - GROUND} fill="url(#fd-earth)" />
			<line x1="0" y1={GROUND} x2="1100" y2={GROUND} className={styles.groundLine} />

			<g className={part('hill')}>
				<path d={HILL} fill="url(#fd-earth)" />
				<path d="M0 250 L232 250 C250 252 262 300 268 360 L290 580" className={styles.contour} />
			</g>

			{/* The wheel pit, cut into the foot of the hill. */}
			<path d="M236 372 L420 372 L420 580 L236 580 Z" className={styles.pit} />

			{/* Ore arrives from the mine, off to the south. */}
			<g className={part('ore', styles.ghost)}>
				<path d="M20 330 C80 330 110 300 160 280" className={styles.oreTrail} />
			</g>

			{/* ---------- Early era (1742) ---------- */}
			<g className={eraClass('early')} aria-hidden={era !== 'early'}>
				<g className={part('barn')}>
					<path d="M60 250 V196 L125 160 L190 196 V250 Z" className={styles.building} />
					<path d="M52 200 L125 156 L198 200" className={styles.roof} />
					<rect x="108" y="214" width="34" height="36" className={styles.door} />
				</g>

				<g className={part('bridge')}>
					<path d="M232 250 H548" className={styles.deck} />
					<path d="M250 252 L290 272 L330 252 L370 272 L410 252 L450 272 L490 252 L530 272" className={styles.truss} />
					<g className={`${styles.barrow} ${styles.travelEarly}`}>
						<path d="M-14 -10 H10 L6 0 H-10 Z" className={styles.cartBody} />
						<circle cx="8" cy="3" r="4" className={styles.cartWheel} />
						<line x1="-14" y1="-8" x2="-24" y2="-2" className={styles.cartHandle} />
					</g>
				</g>

				<g className={part('flume')}>
					<path d="M110 362 H330" className={styles.flume} />
					<path d="M330 366 C350 368 372 380 384 400" className={styles.water} />
					<path d="M250 572 H420" className={styles.water} />
				</g>

				<g className={part('wheel')}>
					<g ref={set('waterWheel')} transform={`translate(${WHEEL.cx} ${WHEEL.cy})`} className={styles.wood}>
						<circle r={WATER_R} className={styles.rim} />
						<circle r={WATER_R - 12} className={styles.rimInner} />
						<g className={styles.spokes}>{spokes(WATER_R - 12, 12)}</g>
						<g className={styles.buckets}>{buckets(WATER_R, 24)}</g>
						<circle r="9" className={styles.hub} />
					</g>
				</g>

				<g className={part('blowers')}>
					<polygon ref={set('bellowsA')} points="490,496 395,490 395,506 490,506" className={styles.bellows} />
					<polygon ref={set('bellowsB')} points="490,524 395,518 395,534 490,534" className={styles.bellows} />
					<path d="M490 498 L508 524 M490 526 L508 530" className={styles.nozzle} />
					<line ref={set('bellowsRod')} x1={WHEEL.cx + 30} y1={WHEEL.cy} x2="396" y2="490" className={styles.rod} />
				</g>

				<g className={part('air')}>
					<path d="M500 527 H566" className={styles.airFlow} markerEnd="url(#fd-air-head)" />
				</g>

				<g className={part('flames')}>
					<g className={styles.flames} filter="url(#fd-glow)">
						<path d="M582 252 C580 232 592 226 588 204 C600 220 604 232 600 252 Z" />
						<path d="M596 252 C596 226 610 214 606 186 C620 210 622 232 616 252 Z" />
						<path d="M606 252 C610 236 618 230 616 214 C626 228 626 240 620 252 Z" />
					</g>
					<g className={styles.smoke}>
						<circle cx="600" cy="170" r="16" />
						<circle cx="612" cy="140" r="22" />
						<circle cx="596" cy="104" r="28" />
					</g>
				</g>
			</g>

			{/* ---------- Rebuilt era (mid-1800s) ---------- */}
			<g className={eraClass('rebuilt')} aria-hidden={era !== 'rebuilt'}>
				<g className={part('barn')}>
					<path d="M20 250 V154 L117 100 L214 154 V250 Z" className={styles.building} />
					<path d="M8 158 L117 94 L226 158" className={styles.roof} />
					<rect x="98" y="200" width="40" height="50" className={styles.door} />
					<path d="M44 172 v22 h18 v-22 l-9 -10 z M172 172 v22 h18 v-22 l-9 -10 z" className={styles.window} />
				</g>

				{/* Engine room, cut into the hill. */}
				<g className={part('engine')}>
					<rect x="40" y="446" width="200" height="134" clipPath="url(#fd-hill)" className={styles.room} />
					<rect x="58" y="499" width="72" height="30" rx="4" className={styles.cylinder} />
					<rect ref={set('enginePiston')} x="98" y="503" width="8" height="22" className={styles.piston} />
					<line ref={set('pistonRod')} x1="130" y1="514" x2="160" y2="514" className={styles.rod} />
					<line ref={set('engineRod')} x1="160" y1="514" x2={PINION.cx + 18} y2={PINION.cy} className={styles.rod} />
					<g ref={set('pinion')} transform={`translate(${PINION.cx} ${PINION.cy})`} className={styles.metal}>
						<circle r="36" className={styles.flywheel} />
						<g className={styles.spokes}>{spokes(36, 6, 6)}</g>
						<path d={gearTeeth(PINION.r, 12)} className={styles.teeth} />
						<circle r={PINION.r} className={styles.hub} />
					</g>
				</g>

				<g className={part('steamLine')}>
					<path d="M552 226 H234 V440 H120 V499" className={styles.steamPipe} />
				</g>

				<g className={part('wheel')}>
					<g ref={set('greatWheel')} transform={`translate(${WHEEL.cx} ${WHEEL.cy})`} className={styles.wood}>
						<path d={gearTeeth(GREAT_R, 64)} className={styles.teeth} />
						<circle r={GREAT_R} className={styles.rim} />
						<circle r={GREAT_R - 14} className={styles.rimInner} />
						<g className={styles.spokes}>{spokes(GREAT_R - 14, 10, 14)}</g>
						<circle r="14" className={styles.hub} />
						<circle cx={CRANK_R} cy="0" r="5" className={styles.crankPin} />
						<circle cx={-CRANK_R} cy="0" r="5" className={styles.crankPin} />
					</g>
				</g>

				<g className={part('blowers')}>
					<line ref={set('rodA')} x1={WHEEL.cx + CRANK_R} y1={WHEEL.cy} x2="370" y2="372" className={styles.rod} />
					<line ref={set('rodB')} x1={WHEEL.cx - CRANK_R} y1={WHEEL.cy} x2="412" y2="372" className={styles.rod} />
					<line ref={set('pistonRodA')} x1="370" y1="300" x2="370" y2="372" className={styles.rod} />
					<line ref={set('pistonRodB')} x1="412" y1="300" x2="412" y2="372" className={styles.rod} />
					<rect x="350" y="268" width="40" height="92" rx="5" className={styles.tub} />
					<rect x="392" y="268" width="40" height="92" rx="5" className={styles.tub} />
					<rect ref={set('pistonA')} x="353" y="286" width="34" height="6" className={styles.piston} />
					<rect ref={set('pistonB')} x="395" y="286" width="34" height="6" className={styles.piston} />
					<path d="M350 278 H432 M350 350 H432" className={styles.hoops} />
				</g>

				<g className={part('pipe')}>
					<path d="M370 268 V258 H448 V528 H500" className={styles.blastPipe} />
					<path d="M412 268 V258" className={styles.blastPipe} />
					<rect x="440" y="456" width="16" height="22" rx="2" className={styles.valve} />
				</g>

				<g className={part('air')}>
					<path d="M380 254 H448 V528 H566" className={styles.airFlow} markerEnd="url(#fd-air-head)" />
				</g>

				<g className={part('bridge')}>
					<path d="M226 206 L476 196" className={styles.roof} />
					<path d="M232 206 V250 M300 204 V250 M370 201 V250 M440 198 V250" className={styles.post} />
					<path d="M232 250 H476" className={styles.deck} />
				</g>

				<g className={part('chargingRoom')}>
					<path d="M470 250 V152 L602 96 L734 152 V250" className={styles.roomWall} />
					<path d="M456 156 L602 90 L748 156" className={styles.roof} />
					<path
						d="M498 236 v-38 a12 16 0 0 1 24 0 v38 M684 236 v-38 a12 16 0 0 1 24 0 v38"
						className={styles.window}
					/>
					<path d="M470 250 H734" className={styles.deck} />
				</g>

				<g className={part('cart')}>
					<g className={`${styles.cart} ${styles.travelRebuilt}`}>
						<path d="M-16 -16 H16 L12 0 H-12 Z" className={styles.cartBody} />
						<circle cx="-8" cy="3" r="4" className={styles.cartWheel} />
						<circle cx="8" cy="3" r="4" className={styles.cartWheel} />
					</g>
				</g>

				<g className={part('boilers')}>
					<rect x="552" y="206" width="96" height="44" fill="url(#fd-brick)" className={styles.brickwork} />
					<circle cx="584" cy="226" r="13" className={styles.boiler} />
					<circle cx="616" cy="226" r="13" className={styles.boiler} />
					<g className={styles.heatWaves}>
						<path d="M590 250 c-4 -6 4 -10 0 -16" />
						<path d="M610 250 c-4 -6 4 -10 0 -16" />
					</g>
				</g>
				<g className={part('chimney')}>
					<rect x="632" y="58" width="24" height="148" fill="url(#fd-brick)" className={styles.brickwork} />
					<g className={styles.smoke}>
						<circle cx="646" cy="44" r="10" />
						<circle cx="660" cy="22" r="14" />
						<circle cx="676" cy="-4" r="18" />
					</g>
				</g>
			</g>

			{/* ---------- The stack (both eras) ---------- */}
			<g className={part('section', styles.stackGroup)}>
				<polygon points={STACK.early} fill="url(#fd-stone)" className={`${styles.stack} ${eraClass('early')}`} />
				<polygon points={STACK.rebuilt} fill="url(#fd-stone)" className={`${styles.stack} ${eraClass('rebuilt')}`} />
			</g>

			<g className={part('tuyere')}>
				<path
					d="M507 580 L509 548 Q542 520 576 540 L576 580 Z"
					className={`${styles.arch} ${eraClass('early')}`}
				/>
				<path
					d="M466 580 L468 548 Q521 508 576 540 L576 580 Z"
					className={`${styles.arch} ${eraClass('rebuilt')}`}
				/>
			</g>

			<g className={part('castingArch')}>
				<path d="M624 580 L624 538 Q660 516 694 540 L696 580 Z" className={`${styles.arch} ${eraClass('early')}`} />
				<path d="M624 580 L624 536 Q682 506 738 536 L740 580 Z" className={`${styles.arch} ${eraClass('rebuilt')}`} />
			</g>

			{/* The interior, shown in section. */}
			<path d={BOSH} className={styles.bosh} />
			<g clipPath="url(#fd-bosh)">
				<g className={part('charge')}>
					<g className={styles.chargeLayers}>
						{Array.from({ length: 13 }, (_, i) => {
							const y = 214 + i * 30;
							return (
								<g key={i}>
									<rect x="530" y={y} width="140" height="13" className={styles.charcoal} />
									<rect x="530" y={y + 13} width="140" height="10" className={styles.ore} />
									<rect x="530" y={y + 23} width="140" height="7" className={styles.limestone} />
								</g>
							);
						})}
					</g>
				</g>
				<g className={part('heat')}>
					<rect x="530" y="250" width="140" height="320" fill="url(#fd-heat)" className={styles.heat} />
				</g>
				<g className={part('hearth')}>
					<rect x="570" y="516" width="60" height="16" className={styles.slag} />
					<rect x="570" y="532" width="60" height="34" fill="url(#fd-iron)" className={styles.iron} />
				</g>
			</g>
			<path d={BOSH} className={styles.lining} />
			<g className={part('throat')}>
				<ellipse cx="600" cy="252" rx="30" ry="8" fill="url(#fd-mouth)" className={styles.mouth} />
			</g>

			{/* ---------- Casting house and pig bed ---------- */}
			<g className={eraClass('early')}>
				<g className={part('castingHouse')}>
					<path d="M700 580 V408 L930 446 V580" className={styles.roomWall} />
					<path d="M690 404 L944 448" className={styles.roof} />
				</g>
				<g className={part('pigBed')}>
					<polygon points="690,580 1010,580 1070,640 750,640" fill="url(#fd-sand)" className={styles.floor} />
					<path d={earlyBed.sow} className={styles.channel} />
					{earlyBed.pigs.map((d) => (
						<path key={d} d={d} className={styles.channel} />
					))}
					<rect x="742" y="596" width="30" height="14" className={styles.flask} />
					<rect x="778" y="608" width="26" height="12" className={styles.flask} />
				</g>
				<g className={part('molten')}>
					<path d="M624 560 L700 584" pathLength="100" className={styles.molten} />
					<path d={earlyBed.sow} pathLength="100" className={styles.molten} />
					{earlyBed.pigs.map((d) => (
						<path key={d} d={d} pathLength="100" className={`${styles.molten} ${styles.moltenPig}`} />
					))}
				</g>
			</g>
			<g className={eraClass('rebuilt')}>
				<g className={part('castingHouse')}>
					<path d="M740 580 V408 L960 446 V580" className={styles.roomWall} />
					<path d="M730 404 L974 448" className={styles.roof} />
				</g>
				<g className={part('pigBed')}>
					<polygon points="730,580 1040,580 1094,640 790,640" fill="url(#fd-sand)" className={styles.floor} />
					<path d={rebuiltBed.sow} className={styles.channel} />
					{rebuiltBed.pigs.map((d) => (
						<path key={d} d={d} className={styles.channel} />
					))}
					<rect x="782" y="596" width="30" height="14" className={styles.flask} />
					<rect x="818" y="608" width="26" height="12" className={styles.flask} />
				</g>
				<g className={part('molten')}>
					<path d="M624 560 L740 584" pathLength="100" className={styles.molten} />
					<path d={rebuiltBed.sow} pathLength="100" className={styles.molten} />
					{rebuiltBed.pigs.map((d) => (
						<path key={d} d={d} pathLength="100" className={`${styles.molten} ${styles.moltenPig}`} />
					))}
				</g>
			</g>

			{/* ---------- Callouts for the current step ---------- */}
			<g key={`${step.id}-${era}`} className={styles.labels}>
				{step.labels[era].map((label, i) => (
					<Label key={label.text} label={label} number={i + 1} markerR={markerR} />
				))}
			</g>
		</svg>
	);
};

export default FurnaceSvg;
