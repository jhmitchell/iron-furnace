import useInView from '../../hooks/useInView';
import styles from './Reveal.module.css';

/**
 * Fades its children up into place the first time they scroll into view.
 * Used for headings, notes and figures; running text is left static so it can be read at once.
 */
const Reveal = ({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) => {
	const [ref, inView] = useInView({ threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

	return (
		<Tag
			ref={ref}
			className={`${styles.reveal} ${inView ? styles.shown : ''} ${className}`}
			style={delay ? { transitionDelay: `${delay}ms` } : undefined}
			{...rest}
		>
			{children}
		</Tag>
	);
};

export default Reveal;
