import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

/** True when the visitor has asked their system for less motion. */
const usePrefersReducedMotion = () => {
	const [reduced, setReduced] = useState(
		() => typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches
	);

	useEffect(() => {
		const mq = window.matchMedia?.(QUERY);
		if (!mq) return undefined;
		const update = () => setReduced(mq.matches);
		mq.addEventListener('change', update);
		return () => mq.removeEventListener('change', update);
	}, []);

	return reduced;
};

export default usePrefersReducedMotion;
