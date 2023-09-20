import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "/src/layouts/MainLayout";
import SecondaryNavbar from "/src/layouts/secondaryNavbar/SecondaryNavbar";
import { SupportHero, Membership } from "/src/features/support";
import "./SupportPage.css";

const SupportPage = () => {
  return (
    <MainLayout>
      <SupportHero />
      <SecondaryNavbar >
        <Link to="/support/membership" className="nav-item">MEMBERSHIP</Link>
      </SecondaryNavbar>
      <Membership />
    </MainLayout>
  );
};

export default SupportPage;
