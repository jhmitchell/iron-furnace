import React from "react";
import MainLayout from "../layouts/MainLayout";
import { AccessibilityContent } from "/src/features/accessibility";

const Accessibility = () => {
  return (
    <MainLayout>
      <div className="accessibility-page">
        <AccessibilityContent />
      </div>
    </MainLayout>
  );
};

export default Accessibility;
