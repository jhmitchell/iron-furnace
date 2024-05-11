import React from "react";
import { TextLink } from "/src/components/ui";
import { FaExclamationTriangle } from "react-icons/fa";
import styles from "./ConstructionMessageBanner.module.css";

const ConstructionMessageBanner = () => {
  return (
    <div className={styles.banner}>
      <FaExclamationTriangle className={styles.icon} />
      <span className={styles.message}>
        Website Under Construction -{' '}
        <TextLink to="/new-website-announcement">
          Learn more about our upcoming features
        </TextLink>
      </span>
    </div>
  );
};

export default ConstructionMessageBanner;