import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MembershipActions from './membershipActions/MembershipActions';
import TempLogo from '/src/assets/images/temp-logo.png';
import IronFurnaceLogo from '/src/assets/images/temp-logo.png'; // Add the iron furnace logo here
import styles from './Navbar.module.css';
import useResponsive from '/src/hooks/useResponsive';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? 'unset' : 'hidden';
  };

  return (
    <>
      {!isMobile && (
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <div className={styles.navLogoContainer}>
              <Link to="/" className={styles.navLogo}>
                <img src={TempLogo} alt="Cornwall Iron Furnace" />
              </Link>
            </div>
            <div className={styles.navLinks}>
              <Link to="/visit" className={styles.navLink}>VISIT</Link>
              <Link to="/about" className={styles.navLink}>ABOUT</Link>
              <Link to="/events" className={styles.navLink}>EVENTS</Link>
              <Link to="/support" className={styles.navLink}>SUPPORT</Link>
              <Link to="/shop" className={styles.navLink}>SHOP</Link>
            </div>
            <div className={styles.navProfile}>
              <MembershipActions />
            </div>
          </div>
        </nav>
      )}

      {isMobile && (
        <>
          <nav className={styles.navbar}>
            <div className={styles.navContainer}>
              <button className={styles.menuButton} onClick={toggleMenu}>
                ☰
              </button>
              <Link to="/" className={styles.navLogo}>
                <img src={TempLogo} alt="Cornwall Iron Furnace" />
              </Link>
            </div>
          </nav>

          <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
            <button className={styles.closeButton} onClick={toggleMenu}>✕</button>
            <div className={styles.navLinks}>
              <Link to="/visit" className={styles.navLink} onClick={toggleMenu}>VISIT</Link>
              <Link to="/about" className={styles.navLink} onClick={toggleMenu}>ABOUT</Link>
              <Link to="/events" className={styles.navLink} onClick={toggleMenu}>EVENTS</Link>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.navLinks}>
              <Link to="/shop" className={styles.navLink} onClick={toggleMenu}>Online Shop</Link>
              <Link to="/support" className={styles.navLink} onClick={toggleMenu}>Support Us</Link>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.logoContainer}>
              <img src={IronFurnaceLogo} alt="Iron Furnace Logo" className={styles.logo} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
