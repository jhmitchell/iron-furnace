import React from 'react';
import MainLayout from '/src/layouts/MainLayout';
import { AssociatesContent, AssociatesHero } from '/src/features/about';
import { InfoBlock, TextLink } from '/src/components/ui';
import styles from './AssociatesPage.module.css';

const AssociatesPage = () => {
	return (
		<MainLayout>
			<AssociatesHero />
			<AssociatesContent />
		</MainLayout>
	);
};

export default AssociatesPage;
