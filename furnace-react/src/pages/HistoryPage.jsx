import { lazy, Suspense } from 'react';
import MainLayout from '/src/layouts/MainLayout';

// The approved history, set in the history story's design. It shares the story's fonts,
// hero and chapter styles, so like /history2 it downloads only when someone opens the page.
const HistoryClassic = lazy(() => import('/src/features/history/HistoryClassic'));

const HistoryPage = () => {
	return (
		<MainLayout>
			<Suspense fallback={<div style={{ minHeight: '100vh', background: '#16161a' }} aria-busy="true" />}>
				<HistoryClassic />
			</Suspense>
		</MainLayout>
	);
};

export default HistoryPage;
