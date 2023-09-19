import React from "react";
import MainLayout from "/src/layouts/MainLayout";
import "./Membership.css";

const Membership = () => {
  return (
    <MainLayout>
      <div className="membership-hero">
        <div className="membership-hero-text">
          <h1>Membership</h1>
          <h3>Join us in preserving the past for the future.</h3>
        </div>
      </div>
    </MainLayout>
  );
};

export default Membership;
