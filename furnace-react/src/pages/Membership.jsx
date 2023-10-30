// src/pages/Membership.jsx
import React from "react";
import MainLayout from "../layouts/MainLayout";
import { MembershipContent } from "/src/features/membership";

const Membership = () => {
  return (
    <MainLayout>
      <div className="membership-page">
        <MembershipContent />
      </div>
    </MainLayout>
  );
};

export default Membership;
