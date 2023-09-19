import React from "react";
import { useAuth } from "../../../features/authentication";
import { Link } from "react-router-dom";
import { Button } from "../../../components/ui";
import "./MembershipActions.css";

const MembershipActions = () => {
  // Import the user object from the useAuth hook
  const { user } = useAuth();

  return (
    <div className="nav-profile">
      {user ? (
        <div className="profile-links">
          <Link to="/profile">Welcome, {user.username}</Link>
        </div>
      ) : (
        <span className="membership-links">
          <Link to="/membership" className="nav-link">MEMBERSHIP</Link>
          <Link to="/membership"><Button text="DONATE" color="orange"/></Link>
        </span>
      )}
    </div>
  );
};

export default MembershipActions;
