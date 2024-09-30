import React, { useState, useEffect } from "react";
import { FaTrashAlt, FaPencilAlt } from "react-icons/fa";
import { editEvent } from "/src/features/events";
import styles from "./EventEntry.module.css";

const EventEntry = ({ event, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(event.title || "");
  const [description, setDescription] = useState(event.description || "");
  const [date, setDate] = useState(event.event_start ? event.event_start.split("T")[0] : "");
  const [time, setTime] = useState("");
  const [linkText, setLinkText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState(event.image || "");

  const handleEditToggle = () => setIsEditing(!isEditing);

  useEffect(() => {
    if (imageFile) {
      const fileURL = URL.createObjectURL(imageFile);
      setImageURL(fileURL);

      // Cleanup function to revoke the created URL
      return () => {
        URL.revokeObjectURL(fileURL);
      };
    } else {
      setImageURL(event.image || "");
    }
  }, [imageFile, event.image]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedEvent = {};
    if (title !== "") updatedEvent.title = title;
    if (description !== "") updatedEvent.description = description;
    if (linkText !== "") updatedEvent.link_text = linkText;
    if (date !== "" && time !== "") {
      updatedEvent.event_start = `${date}T${time}:00`;
    }

    try {
      await editEvent(event.id, updatedEvent, imageFile, pdfFile);
      setIsEditing(false);

      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
      setLinkText("");
      setImageFile(null);
      setPdfFile(null);
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
          <p className={styles.instructions}>Attach Image</p>
          <input
            type="file"
            accept="image/*"
            className={styles.fileInput}
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <p className={styles.instructions}>Attach PDF and provide link text</p>
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
