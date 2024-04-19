import React from "react";
import { Link } from "react-router-dom";
import styles from "./EventDetailCard.module.css";

const EventDetailCard = ({ event }) => {
	const { id, title, start_date, description, link_text } = event || {};
	const defaultDate = "Date not available";
	const path = link_text ? `/events/${id}` : "#";
	const formattedDate = start_date ? formatDate(start_date) : defaultDate;

	console.log("EventDetailCard", event);

	return (
		<Link
			to={path}
			className={styles.linkWrapper}
			style={{
				cursor: path === "#" ? "default" : "pointer"
			}}
		>
			<div className={styles.cardContainer}>
				<h3>{title}</h3>
				<p>{formattedDate}</p>
				{/* Include other event details as needed */}
			</div>
		</Link>
	);
};

export default EventDetailCard;

function formatDate(dateString) {
	const options = { year: 'numeric', month: 'long', day: 'numeric' };
	return new Intl.DateTimeFormat('en-US', options).format(new Date(dateString));
}
