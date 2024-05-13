import React from "react";
import { useAuth } from "/src/features/authentication";
import { Button, StyledLink } from "/src/components/ui";
import { Link } from "react-router-dom";
import "./MembershipActions.css";

const MembershipActions = () => {
  // Import the user object from the useAuth hook
  const { user } = useAuth();

  return (
    <div className="nav-profile">
      {user ? (
        <div className="profile-links">
          <StyledLink to="/profile">Welcome, {user.username}</StyledLink>
        </div>
      ) : (
        <span className="membership-links">
          <StyledLink to="/membership" className="nav-link">MEMBERSHIP</StyledLink>
          <Link to="/support/donate"><Button text="DONATE" color="orange"/></Link>
        </span>
      )}
    </div>
  );
};

export default MembershipActions;
