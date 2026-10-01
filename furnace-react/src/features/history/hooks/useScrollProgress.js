import { useEffect, useRef } from 'react';

/**
 * Calls `onProgress(p)` while the page scrolls, where p runs from 0 (the element's
 * top reaches the top of the viewport) to 1 (its bottom reaches the bottom).
 * Works through a callback rather than state so scroll-linked effects don't re-render React.
 */
const useScrollProgress = (onProgress) => {
	const ref = useRef(null);
	const callback = useRef(onProgress);
	callback.current = onProgress;

	useEffect(() => {
		let frame = 0;
		const measure = () => {
			frame = 0;
			const el = ref.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const travel = rect.height - window.innerHeight;
			const p = travel > 0 ? -rect.top / travel : rect.top < 0 ? 1 : 0;
			callback.current(Math.min(1, Math.max(0, p)));
		};
		const onScroll = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};
		measure();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			if (frame) cancelAnimationFrame(frame);
		};
	}, []);

	return ref;
};

export default useScrollProgress;
