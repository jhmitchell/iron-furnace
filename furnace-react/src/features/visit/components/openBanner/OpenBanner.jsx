import React from "react";
import { useHours } from "/src/features/hours";
import styles from "./OpenBanner.module.css";

const OpenBanner = (props) => {
  const { isOpen, message, loading } = useHours();

  if (loading) {
    return null;
  }

  const displayMessage = `${isOpen ? 'OPEN: ' : 'CLOSED: '}${message}`;

  return (
    <div id={props.id} className={`${styles.openBanner} ${isOpen ? styles.open : styles.closed}`}>
      {displayMessage}
    </div>
  );
};

export default OpenBanner;