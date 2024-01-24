import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import { HistoryHero } from '/src/features/history';

const HistoryPage = () => {
  return (
    <MainLayout>
        <HistoryHero />
    </MainLayout>
  );
};

export default HistoryPage;
