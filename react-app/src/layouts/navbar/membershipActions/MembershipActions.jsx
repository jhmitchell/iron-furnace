import React from "react";
import { useAuth } from "../../../features/authentication";
import { Link } from "react-router-dom";

const MembershipActions = () => {
  // Import the user object from the useAuth hook
  const { user } = useAuth();

  return (
    <div className="nav-profile">
      {user ? (
        <Link to="/profile">Welcome, {user.username}</Link>
      ) : (
        <span>
          <Link to="/membership">SIGN IN</Link>
          <Link to="/membership">BECOME A MEMBER</Link>
        </span>
      )}
    </div>
  );
};

export default MembershipActions;
