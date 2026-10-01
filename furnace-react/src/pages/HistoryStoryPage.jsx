import { lazy, Suspense, useEffect } from 'react';
import MainLayout from '/src/layouts/MainLayout';

// The new history story, served at /history2 while it is reviewed. It carries its own
// fonts, drawings and animation code, so it is split into a separate file that only
// downloads when someone opens this page.
const HistoryStory = lazy(() => import('/src/features/history/HistoryStory'));

const HistoryStoryPage = () => {
	// Keep the preview out of search results until it replaces /history.
	useEffect(() => {
		const meta = document.createElement('meta');
		meta.name = 'robots';
		meta.content = 'noindex';
		document.head.appendChild(meta);
		return () => meta.remove();
	}, []);

	return (
		<MainLayout>
			<Suspense fallback={<div style={{ minHeight: '100vh', background: '#16161a' }} aria-busy="true" />}>
				<HistoryStory />
			</Suspense>
		</MainLayout>
	);
};

export default HistoryStoryPage;
