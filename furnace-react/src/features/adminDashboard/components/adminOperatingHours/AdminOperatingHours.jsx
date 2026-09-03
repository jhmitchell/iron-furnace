import React from 'react';
import HoursCard from '../hoursCard/HoursCard';
import HolidaysCard from '../holidaysCard/HolidaysCard';
import { AdminPage, AdminCard, ui } from '../ui';

const AdminOperatingHours = () => {
	return (
		<AdminPage
			title="Operating Hours"
			description="The weekly schedule drives the open/closed status shown on the home page and visit page. Holidays and special closures override it for a single day."
		>
			<div className={ui.grid2}>
				<AdminCard title="Weekly hours" description="Days without hours are shown as closed.">
					<HoursCard />
				</AdminCard>
				<AdminCard title="Holidays & special closures" description="The site shows as closed on these dates, with the reason.">
					<HolidaysCard />
				</AdminCard>
			</div>
		</AdminPage>
	);
};

export default AdminOperatingHours;
