import React from 'react';
import { Navbar } from '/src/layouts';

import { SiteMapContent } from '/src/features/siteMap';

const SiteMapPage = () => {
  return (
    <>
      <Navbar />
      <SiteMapContent />
    </>
  );
};

export default SiteMapPage;
