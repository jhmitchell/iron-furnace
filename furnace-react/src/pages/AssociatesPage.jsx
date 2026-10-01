import MainLayout from '/src/layouts/MainLayout';
import { AssociatesContent, AssociatesHero } from '/src/features/about';

const AssociatesPage = () => {
	return (
		<MainLayout>
			<AssociatesHero />
			<AssociatesContent />
		</MainLayout>
	);
};

export default AssociatesPage;
