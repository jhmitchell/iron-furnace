import { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { useAuth, safeRedirectPath } from '/src/features/authentication';
import { LoginForm } from '/src/components/forms';
import logo from '/src/assets/images/window-logo.svg';
import styles from './LoginPage.module.css';

const PAGE_TITLE = 'Sign in | Cornwall Iron Furnace';

const LoginPage = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Where to go after signing in: the admin page that sent the user here (ProtectedRoute
  // passes it in state.from), limited to pages of this site; otherwise the dashboard.
  const destination = safeRedirectPath(location.state?.from);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = PAGE_TITLE;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Already signed in (or just signed in): go straight on.
  if (!loading && user) {
    return <Navigate to={destination} replace />;
  }

  return (
    <main className={styles.page}>
      <div className={styles.column}>
        <section className={styles.card} aria-labelledby="login-heading">
          <header className={styles.header}>
            <img src={logo} alt="" className={styles.logo} width="56" height="41" />
            <p className={styles.eyebrow}>Cornwall Iron Furnace</p>
            <h1 id="login-heading" className={styles.title}>Sign in</h1>
          </header>

          {loading ? (
            <p className={styles.checking} role="status">Checking your sign-in…</p>
          ) : (
            <LoginForm />
          )}
        </section>

        <Link to="/" className={styles.backLink}>
          <MdArrowBack aria-hidden="true" />
          Back to the website
        </Link>
      </div>
    </main>
  );
};

export default LoginPage;
