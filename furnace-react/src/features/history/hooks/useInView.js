import { useEffect, useRef, useState } from 'react';

/**
 * Reports whether an element has scrolled into view.
 * With `once` (the default) it stays true after the first time.
 */
const useInView = ({ threshold = 0.15, rootMargin = '0px', once = true } = {}) => {
	const ref = useRef(null);
	const [inView, setInView] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return undefined;
		if (typeof IntersectionObserver === 'undefined') {
			setInView(true);
			return undefined;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					if (once) observer.disconnect();
				} else if (!once) {
					setInView(false);
				}
			},
			{ threshold, rootMargin }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold, rootMargin, once]);

	return [ref, inView];
};

export default useInView;
