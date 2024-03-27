// HolidayEntry.js
import React from "react";

const HolidayEntry = ({ date, description }) => {
  return (
    <div style={{ padding: "10px", margin: "5px 0", border: "1px solid #ccc", borderRadius: "5px" }}>
      <h4>{date}</h4>
      <p>{description || "No description available"}</p>
    </div>
  );
}

export default HolidayEntry;
