import React, { useState } from "react";
import { FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import { editEvent } from "/src/features/events";
import styles from "./EventEntry.module.css";

const EventEntry = ({ event, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [linkText, setLinkText] = useState(event.link_text || "");
  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [pdfFile, setPdfFile] = useState(null);

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await editEvent(event.id, title, description, pdfFile, linkText);
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
        <h4 className={styles.date}>{formatDate(event.start_date)}</h4>
        <p className={styles.description}>{event.title || "No description available"}</p>
      </div>
      <form className={styles.editForm} onSubmit={handleSubmit}>
        <p className={styles.instructions}>Modify the event title and description below</p>
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
          required
        />
        <label htmlFor="eventDescription" className={styles.label}>
          Event Description
        </label>
        <textarea
          id="eventDescription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textArea}
          placeholder="Event Description"
          required
        />
        <p className={styles.instructions}>Attach pdf and provide link text (optional)</p>
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
        <button type="submit" className={styles.submitButton}>
          Submit
        </button>
      </form>
    </div>
  );
};

function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Intl.DateTimeFormat("en-US", options).format(new Date(dateString));
}

export default EventEntry;
