import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './EventDetailsPage.module.css';

const EventDetailsPage = () => {
  const { id } = useParams();
  const [pdfExists, setPdfExists] = useState(true); // State to track PDF existence
  const pdfUrl = `/static/event_info/${id}.pdf`;

  useEffect(() => {
    // Check if the PDF exists by making a HEAD request
    fetch(pdfUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          setPdfExists(true);
        } else {
          setPdfExists(false);
        }
      })
      .catch(error => {
        console.error('Error checking PDF:', error);
        setPdfExists(false); // Assume no PDF if error occurs
      });
  }, [id, pdfUrl]);

  return (
    <div>
      {pdfExists ? (
        <iframe src={pdfUrl} className={styles.frame} title="Event PDF" />
      ) : (
        <div className="no-pdf-message">
          <p>No PDF has been uploaded for this event yet.</p>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
