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
        <Link to="/profile">Welcome, {user.username}</Link>
      ) : (
        <span className="membership-links">
          <Link to="/membership">SIGN IN</Link>
          <Link to="/membership"><Button text="BECOME A MEMBER" color="orange"/></Link>
        </span>
      )}
    </div>
  );
};

export default MembershipActions;
