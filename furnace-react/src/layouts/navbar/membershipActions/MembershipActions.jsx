import React from "react";
import { useAuth } from "../../../features/authentication";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui";
import styles from "./MembershipActions.module.css";

const MembershipActions = () => {
  const { user } = useAuth();

  return (
    <div className={styles.navProfile}>
      {user ? (
        <div className={styles.profileLinks}>
          <Link to="/profile">Welcome, {user.username}</Link>
        </div>
      ) : (
        <span className={styles.membershipLinks}>
          <Link to="/membership" className={styles.navLink}>MEMBERSHIP</Link>
          <a href="https://givebutter.com/supportcifa" className={styles.button} target="_blank" rel="noreferrer noopener">
            <Button text="DONATE" color="orange" />
          </a>
        </span>
      )}
    </div>
  );
};

export default MembershipActions;
