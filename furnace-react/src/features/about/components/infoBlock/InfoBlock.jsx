import React from "react";
import styles from "./InfoBlock.module.css";

const InfoBlock = ({ children, id }) => {
    return (
        <div className={styles.infoBlock} id={id}>
            <div className={styles.infoBlockContent}>
                {children}
            </div>
        </div>
    );
};

export default InfoBlock;