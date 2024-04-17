import React from 'react';
import { useParams } from 'react-router-dom';
import styles from './EventDetailsPage.module.css';

const EventDetailsPage = () => {
  const { id } = useParams();

  const pdfUrl = `/static/event_info/${id}.pdf`;

  return (
    <div>
      {/* Embed PDF within an iframe or use a PDF viewer library */}
      <iframe src={pdfUrl} className={styles.frame} title="Event PDF"></iframe>
    </div>
  );
};

export default EventDetailsPage;
