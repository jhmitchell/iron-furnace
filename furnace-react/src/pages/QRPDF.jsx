import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './QRPDF.module.css';

const QRPDF = () => {
  /*
  PDF naming convention:
  The PDF will be available at /signs/{name}
  */

  const { name } = useParams();
  const [pdfExists, setPdfExists] = useState(true);
  const pdfUrl = `/static/qr/${name}.pdf`;

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
        setPdfExists(false);
      });
  }, [name, pdfUrl]);

  return (
    <div>
      {pdfExists ? (
        <iframe src={pdfUrl} className={styles.frame} title="QR PDF" />
      ) : (
        <div className="no-pdf-message">
          <p>Error: Invalid QR code provided.</p>
        </div>
      )}
    </div>
  );
};

export default QRPDF;
