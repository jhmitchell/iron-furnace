import React, { useState } from "react";
import { FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import { editEvent } from "/src/features/events";
import styles from "./EventEntry.module.css";

const EventEntry = ({ event, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(""); // Default to empty string
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [linkText, setLinkText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build an object with only the fields that have values
    const updatedFields = {};
    if (title !== "") updatedFields.title = title;
    if (description !== "") updatedFields.description = description;
    if (linkText !== "") updatedFields.link_text = linkText;
    if (pdfFile) updatedFields.pdf = pdfFile;
    if (date !== "" && time !== "") {
      updatedFields.event_start = `${date}T${time}:00`;
    }

    try {
      await editEvent(event.id, updatedFields);
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing event:", error);
    }
  };

  return (
    <div className={`${styles.card} ${isEditing ? styles.editing : ""}`}>
      <div className={styles.infoContainer}>
        <div className={styles.actions}>
          <button className={styles.actionButton} onClick={handleEditToggle}>
            <FaPencilAlt className={styles.actionIcon} />
          </button>
          <button className={styles.actionButton} onClick={() => onDelete(event.id)}>
            <FaTrashAlt className={styles.actionIcon} />
          </button>
        </div>
        <h4 className={styles.date}>{formatDate(event.event_start)}</h4>
        <p className={styles.description}>{event.title || "No description available"}</p>
      </div>
      {isEditing && (
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <p className={styles.instructions}>
            Modify the event fields below (leave blank to keep current values)
          </p>
          {/* Title Field */}
          <label htmlFor="eventTitle" className={styles.label}>
            Event Title
          </label>
          <input
            id="eventTitle"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.textField}
            placeholder="Event Title"
          />
          {/* Description Field */}
          <label htmlFor="eventDescription" className={styles.label}>
            Event Description
          </label>
          <textarea
            id="eventDescription"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textArea}
            placeholder="Event Description"
          />
          {/* Date Field */}
          <label htmlFor="eventDate" className={styles.label}>
            Event Date
          </label>
          <input
            id="eventDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.textField}
          />
          {/* Time Field */}
          <label htmlFor="eventTime" className={styles.label}>
            Event Time
          </label>
          <input
            id="eventTime"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={styles.textField}
          />
          {/* PDF and Link Text */}
          <p className={styles.instructions}>Attach PDF and provide link text (optional)</p>
          <input
            type="file"
            accept="application/pdf"
            className={styles.fileInput}
            onChange={(e) => setPdfFile(e.target.files[0])}
          />
          <input
            type="text"
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            className={styles.textField}
            placeholder="Link text"
          />
          {/* Submit Button */}
          <button type="submit" className={styles.submitButton}>
            Submit
          </button>
        </form>
      )}
    </div>
  );
};

function formatDate(dateString) {
  if (!dateString) return "";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
}

export default EventEntry;
