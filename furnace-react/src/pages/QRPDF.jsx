import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './QRPDF.module.css';

/*
 * Page for the QR codes on signs at the furnace: /signs/<name>.
 *
 * Each sign is uploaded to the server as /static/qr/<name>.pdf, plus an image of it,
 * /static/qr/<name>.webp, for fast viewing on phones (see deploy/README.md). Phones show
 * the image (pinch to zoom) with a button to open the PDF in the phone's own viewer.
 * Embedding the PDF in the page doesn't work on phones (Android shows nothing), so the
 * embedded PDF is only a fallback when a sign has no image.
 */
const SIGN_NAME = /^[a-z0-9-]+$/;

const QrPdf = () => {
  const { name = '' } = useParams();
  const isValidName = SIGN_NAME.test(name);
  const pdfUrl = `/static/qr/${name}.pdf`;
  const imageUrl = `/static/qr/${name}.webp`;
  // loading | found | missing | error
  const [status, setStatus] = useState(isValidName ? 'loading' : 'missing');
  const [hasImage, setHasImage] = useState(true);

  useEffect(() => {
    if (!isValidName) {
      setStatus('missing');
      return undefined;
    }
    let cancelled = false;
    setStatus('loading');
    setHasImage(true);
    fetch(pdfUrl, { method: 'HEAD' })
      .then((response) => !cancelled && setStatus(response.ok ? 'found' : 'missing'))
      .catch(() => !cancelled && setStatus('error'));
    return () => {
      cancelled = true;
    };
  }, [isValidName, pdfUrl]);

  const homeLink = (
    <Link to="/" className={styles.homeLink}>
      Cornwall Iron Furnace
    </Link>
  );

  if (status === 'loading') {
    return (
      <main className={styles.page}>
        <p role="status" className={styles.message}>Loading the sign…</p>
      </main>
    );
  }

  if (status !== 'found') {
    return (
      <main className={styles.page}>
        <div className={styles.message}>
          <h1>{status === 'error' ? "Couldn't load this sign" : 'Sign not found'}</h1>
          <p>
            {status === 'error'
              ? 'Please check your connection and try again.'
              : 'This QR code doesn’t match a sign on our website.'}
          </p>
          {homeLink}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.toolbar}>
        {homeLink}
        <a className={styles.button} href={pdfUrl}>
          Open as PDF
        </a>
      </div>
      {hasImage ? (
        <a href={pdfUrl} className={styles.posterLink}>
          <img
            className={styles.poster}
            src={imageUrl}
            alt={`Sign: ${name.replace(/-/g, ' ')}. Open the PDF for the full text.`}
            onError={() => setHasImage(false)}
          />
        </a>
      ) : (
        <iframe className={styles.frame} src={pdfUrl} title={`Sign: ${name}`} />
      )}
    </main>
  );
};

export default QrPdf;
