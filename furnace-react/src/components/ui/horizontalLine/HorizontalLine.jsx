import styles from './HorizontalLine.module.css';

const HorizontalLine = ({ className = '' }) => (
  <div className={`${styles.horizontalLine} ${className}`.trim()}></div>
);

export default HorizontalLine;
