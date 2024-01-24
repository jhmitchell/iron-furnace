import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import { HistoryHero, HistoryContent } from '/src/features/history';

const HistoryPage = () => {
	return (
		<MainLayout>
			<HistoryHero />
			<HistoryContent />
		</MainLayout>
	);
};

export default HistoryPage;
