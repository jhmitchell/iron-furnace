import React, { useEffect, useState } from "react";
import { getHolidays, setHoliday } from "/src/features/hours";
import HolidayEntry from "../holidayEntry/HolidayEntry";

const HolidaysCard = () => {
	const [holidays, setHolidays] = useState([]);

	const refreshHolidays = async () => {
		try {
			const holidays = await getHolidays();
			setHolidays(holidays);
		} catch (error) {
			console.error("Failed to fetch holidays.");
		}
	};

	const addHoliday = async () => {
		// TODO: Simple prompt for input, change later.
		const date = prompt("Enter the holiday date (YYYY-MM-DD):");
		const description = prompt("Enter the holiday description:");

		if (!date || !description) {
			alert("Both date and description are required.");
			return;
		}

		try {
			await setHoliday(date, description);
			refreshHolidays();
		} catch (error) {
			console.error("Failed to set holiday:", error);
			alert("Failed to add the holiday. Please check the console for more details.");
		}
	};

	useEffect(() => {
		refreshHolidays();
	}, []);

	return (
		<div>
			<h2>Holidays</h2>
			<div style={{ marginBottom: "20px", cursor: "pointer" }} onClick={addHoliday}>
				<span style={{ fontSize: "24px", marginRight: "10px" }}>+</span>
				Add Holiday
			</div>
			<div>
				{holidays.map((holiday, index) => (
					<HolidayEntry key={index} date={holiday.holiday_date} description={holiday.description} />
				))}
			</div>
		</div>
	);
}

export default HolidaysCard;