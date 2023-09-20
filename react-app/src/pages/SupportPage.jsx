import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MainLayout from "/src/layouts/MainLayout";
import SecondaryNavbar from "/src/layouts/secondaryNavbar/SecondaryNavbar";
import { SupportHero, Membership } from "/src/features/support";
import "./SupportPage.css";

const SupportPage = () => {
  const location = useLocation();
  
  // Scroll to the appropriate section when the path changes
  useEffect(() => {
    if (location.pathname === "/support") {
      window.scrollTo(0, 0);
    } else if (location.pathname === "/support/membership") {
      // Scroll to the respective section
      const membershipSection = document.getElementById("membership-section");
      if (membershipSection) {
        membershipSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <MainLayout>
      <SupportHero />
      <SecondaryNavbar >
        <Link to="/support/membership" className="nav-item">MEMBERSHIP</Link>
        <Link to="/support/donate" className="nav-item">DONATE</Link>
      </SecondaryNavbar>
      <Membership />
    </MainLayout>
  );
};

export default SupportPage;
