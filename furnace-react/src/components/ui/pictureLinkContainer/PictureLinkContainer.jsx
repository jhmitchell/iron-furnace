import React from 'react';
import styles from './PictureLinkContainer.module.css';

const PictureLinkContainer = ({ children, height }) => (
  <div className={styles.pictureLinkContainer} style={{ height }}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { containerHeight: height })
    )}
  </div>
);

export default PictureLinkContainer;
