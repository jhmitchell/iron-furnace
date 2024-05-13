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
          <Link to="/support/donate" className={styles.button}>
            <Button text="DONATE" color="orange" />
          </Link>
        </span>
      )}
    </div>
  );
};

export default MembershipActions;
