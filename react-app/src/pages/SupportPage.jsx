import React from "react";
import MainLayout from "/src/layouts/MainLayout";
import { SupportHero, Membership } from "/src/features/support";
import "./SupportPage.css";

const SupportPage = () => {
  return (
    <MainLayout>
      <SupportHero />
      <Membership />
    </MainLayout>
  );
};

export default SupportPage;
