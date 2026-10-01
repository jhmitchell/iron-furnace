import { useEffect, useRef } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

const makeEmber = (w, h, scatter) => ({
	x: Math.random() * w,
	y: scatter ? Math.random() * h : h + Math.random() * 40,
	r: 0.6 + Math.random() * 1.8,
	speed: 0.12 + Math.random() * 0.4,
	drift: (Math.random() - 0.5) * 0.2,
	phase: Math.random() * Math.PI * 2,
	life: 0.55 + Math.random() * 0.45,
});

/**
 * Sparks drifting up through the parent element, drawn on a canvas.
 * `intensityRef.current` (0–1) scales how many are alive and how brightly they glow,
 * so a scroll handler can let the fire die down without re-rendering.
 * Renders nothing for visitors who prefer reduced motion.
 */
const Embers = ({ className, count = 46, intensityRef }) => {
	const canvasRef = useRef(null);
	const reduced = usePrefersReducedMotion();

	useEffect(() => {
		if (reduced) return undefined;
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext('2d');
		if (!ctx) return undefined;

		let w = 0;
		let h = 0;
		let embers = [];
		let frame = 0;
		let visible = true;

		const resize = () => {
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth;
			h = canvas.clientHeight;
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			embers = Array.from({ length: count }, () => makeEmber(w, h, true));
		};

		const draw = (t) => {
			frame = 0;
			const intensity = intensityRef ? intensityRef.current : 1;
			ctx.clearRect(0, 0, w, h);
			ctx.globalCompositeOperation = 'lighter';
			const alive = Math.round(embers.length * intensity);

			for (let i = 0; i < embers.length; i += 1) {
				const e = embers[i];
				e.y -= e.speed;
				e.x += e.drift + Math.sin(t / 1400 + e.phase) * 0.15;
				if (e.y < -10 || e.x < -10 || e.x > w + 10) Object.assign(e, makeEmber(w, h, false));
				if (i >= alive) continue;

				// Fade in from the bottom and out toward the top.
				const height = 1 - e.y / h;
				const fade = Math.min(1, (1 - height) * 3) * Math.min(1, height * 6) * e.life;
				const flicker = 0.75 + Math.sin(t / 220 + e.phase * 7) * 0.25;
				const alpha = Math.max(0, fade * flicker * (0.35 + intensity * 0.65));

				const glow = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 5);
				glow.addColorStop(0, `rgba(255, 214, 140, ${alpha})`);
				glow.addColorStop(0.35, `rgba(255, 128, 48, ${alpha * 0.55})`);
				glow.addColorStop(1, 'rgba(255, 80, 20, 0)');
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(e.x, e.y, e.r * 5, 0, Math.PI * 2);
				ctx.fill();
			}
			if (visible) frame = requestAnimationFrame(draw);
		};

		resize();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(canvas);

		// Stop drawing while the canvas is scrolled out of view.
		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible && !frame) frame = requestAnimationFrame(draw);
		});
		io.observe(canvas);

		return () => {
			resizeObserver.disconnect();
			io.disconnect();
			if (frame) cancelAnimationFrame(frame);
		};
	}, [reduced, count, intensityRef]);

	if (reduced) return null;
	return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
};

export default Embers;
