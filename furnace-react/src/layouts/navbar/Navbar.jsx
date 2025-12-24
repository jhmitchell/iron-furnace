import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaFacebookSquare, FaInstagram, FaYoutube } from 'react-icons/fa';
import MembershipActions from './membershipActions/MembershipActions';
import TempLogo from '/src/assets/images/temp-logo.png';
import styles from './Navbar.module.css';
import useResponsive from '/src/hooks/useResponsive';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isMobile } = useResponsive();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    document.body.style.overflow = menuOpen ? 'unset' : 'hidden';
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = 'unset';
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
              <a
                href="https://www.storepatrailsofhistory.com/6/#/Admission"
                className={styles.navLink}
                target="_blank"
                rel="noreferrer noopener"
              >
                ONLINE TICKETS
              </a>
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
              <button 
                className={styles.menuButton} 
                onClick={toggleMenu}
                aria-label="Open menu"
              >
                <HiMenuAlt3 />
              </button>
              <Link to="/" className={styles.navLogo}>
                <img src={TempLogo} alt="Cornwall Iron Furnace" />
              </Link>
            </div>
          </nav>

          {/* Backdrop overlay */}
          <div 
            className={`${styles.backdrop} ${menuOpen ? styles.visible : ''}`}
            onClick={closeMenu}
          />

          {/* Mobile menu */}
          <div className={`${styles.mobileMenu} ${menuOpen ? styles.open : ''}`}>
            <button 
              className={styles.closeButton} 
              onClick={closeMenu}
              aria-label="Close menu"
            >
              <HiX />
            </button>

            <div className={styles.mobileMenuContent}>
              {/* Primary navigation */}
              <nav className={styles.primaryNav}>
                <Link 
                  to="/visit" 
                  className={styles.primaryLink} 
                  onClick={closeMenu}
                  style={{ '--i': 0 }}
                >
                  Visit
                </Link>
                <Link 
                  to="/about" 
                  className={styles.primaryLink} 
                  onClick={closeMenu}
                  style={{ '--i': 1 }}
                >
                  About
                </Link>
                <Link 
                  to="/events" 
                  className={styles.primaryLink} 
                  onClick={closeMenu}
                  style={{ '--i': 2 }}
                >
                  Events
                </Link>
                <Link 
                  to="/support" 
                  className={styles.primaryLink} 
                  onClick={closeMenu}
                  style={{ '--i': 3 }}
                >
                  Support
                </Link>
              </nav>

              {/* Secondary navigation */}
              <div className={styles.secondaryNav}>
                <a
                  href="https://www.storepatrailsofhistory.com/6/#/Admission"
                  className={styles.secondaryLink}
                  onClick={closeMenu}
                  target="_blank"
                  rel="noreferrer noopener"
                  style={{ '--i': 4 }}
                >
                  Buy Tickets
                </a>
                <Link 
                  to="/history" 
                  className={styles.secondaryLink} 
                  onClick={closeMenu}
                  style={{ '--i': 5 }}
                >
                  Our History
                </Link>
                <Link 
                  to="/accessibility" 
                  className={styles.secondaryLink} 
                  onClick={closeMenu}
                  style={{ '--i': 6 }}
                >
                  Accessibility
                </Link>
              </div>

              {/* Footer with socials */}
              <div className={styles.mobileMenuFooter} style={{ '--i': 7 }}>
                <div className={styles.socialLinks}>
                  <a
                    href="https://www.facebook.com/CornwallIronFurnace/"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Facebook"
                  >
                    <FaFacebookSquare />
                  </a>
                  <a
                    href="https://www.instagram.com/cornwall_iron_furnace/"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Instagram"
                  >
                    <FaInstagram />
                  </a>
                  <a
                    href="https://www.youtube.com/@cornwallironfurnace6291"
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="YouTube"
                  >
                    <FaYoutube />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
