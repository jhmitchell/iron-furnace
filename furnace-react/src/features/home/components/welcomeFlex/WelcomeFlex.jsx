import React from "react";
import { Button, ArrowTextLink } from "/src/components/ui";
import Hours from "../hours/Hours";
import styles from "./WelcomeFlex.module.css";

const WelcomeFlex = () => {
  return (
    <div className={styles.welcomeFlexContainer}>
      <div className={styles.welcomeFlex}>
        <div className={`${styles.welcomeFlexElement} ${styles.welcome}`}>
          <h3>
            Welcome to the historic Cornwall Iron Furnace - the most intact and complete charcoal-fueled ironmaking complex found in America.
            <ArrowTextLink text="LEARN MORE" path="/about" />
          </h3>
        </div>
        <Hours />
      </div>
    </div>
  );
};

export default WelcomeFlex;
