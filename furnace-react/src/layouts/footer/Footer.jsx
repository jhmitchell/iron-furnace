import React from "react";
import { FaFacebookSquare, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.contact}>
              <div className={styles.contactLeft}>
                <div className={styles.logo}>
                  <Link to="/">
                    <div className={styles.logoImage} />
                  </Link>
                </div>
              </div>
              <div className={styles.contactRight}>
                <div className={styles.address}>
                  Physical Address:
                  <br />
                  94 Rexmont Rd
                  <br />
                  Cornwall, PA 17016
                </div>
                <div className={styles.phone}>717-272-9711</div>
                <div className={styles.mailing}>
                  Mailing Address:
                  <br />
                  PO Box 251
                  <br />
                  Cornwall, PA 17016
                </div>
                <div className={styles.socials}>
                  <a
                    href="https://www.facebook.com/CornwallIronFurnace/"
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`${styles.link} ${styles.socialsLink}`}
                  >
                    <FaFacebookSquare size={32} />
                  </a>
                  <a
                    href="https://www.instagram.com/cornwall_iron_furnace/?hl=en"
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`${styles.link} ${styles.socialsLink}`}
                  >
                    <FaInstagram size={32} />
                  </a>
                  <a
                    href="https://www.youtube.com/@cornwallironfurnace6291"
                    target="_blank"
                    rel="noreferrer noopener"
                    className={`${styles.link} ${styles.socialsLink}`}
                  >
                    <FaYoutube size={32} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.rightTitle}>
              <p>
                You can help preserve the beauty and history of the Cornwall
                Iron Furnace by supporting us with your tax-deductible
                donations.
              </p>
              <Button text="DONATE TODAY" color="orange" />
            </div>
            <div className={styles.horizontalLine} />
            <div className={styles.rightLinks}>
              <div>
                <Link className={styles.link}>Visitor Information</Link>
                <div className={styles.sublinks}>
                  <Link to="/visit/hours" className={styles.sublink}>
                    Hours & Admission
                  </Link>
                  <Link to="/visit/tours" className={styles.sublink}>
                    Tours
                  </Link>
                  <Link className={styles.sublink}>Special Events</Link>
                  <Link to="/visit/accessibility" className={styles.sublink}>
                    Accessibility
                  </Link>
                </div>
              </div>
              <div>
                <Link to="/support" className={styles.link}>
                  Support Us
                </Link>
                <div className={styles.sublinks}>
                  <Link to="/support/membership" className={styles.sublink}>
                    Membership
                  </Link>
                  <Link to="/support/donate" className={styles.sublink}>
                    Donate
                  </Link>
                  <Link to="/support/volunteer" className={styles.sublink}>
                    Volunteer
                  </Link>
                  <Link to="/support/sponsorship" className={styles.sublink}>
                    Corporate Sponsorship
                  </Link>
                </div>
              </div>
              <div>
                <Link className={styles.link}>Shop</Link>
                <div className={styles.sublinks}>
                  <Link className={styles.sublink}>Books</Link>
                  <Link className={styles.sublink}>Apparel</Link>
                </div>
              </div>
              <div>
                <Link className={styles.link}>Contact Us</Link>
                <div className={styles.sublinks}>
                  <Link className={styles.sublink}>Private Events</Link>
                  <Link className={styles.sublink}>Group Tours</Link>
                  <Link className={styles.sublink}>School Tours</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.ack}>
          <div className={styles.phmcLogo}>
            <a
              href="https://www.phmc.pa.gov/"
              target="_blank"
              rel="noopener"
              className={styles.phmcLogoImage}
            />
            <div className={styles.phmcLogoText}>
              Pennsylvania <br />
              Historical & Museum <br />
              Commission
            </div>
          </div>
          <p className={styles.ackElement}>
            Cornwall Iron Furnace is administered by the Pennsylvania Historical
            & Museum Commission: <br />
            Josh Shapiro, Governor | Hayley Haldeman, Chair | Andrea Lowery,
            Executive Director
          </p>
          <p className={styles.ackElement}>
            The Cornwall Iron Furnace Associates, Inc. is a non-profit
            organization that works in partnership with the PHMC, supporting the
            mission of preservation and education at this National Historic
            Site.
          </p>
        </div>
        <div className={styles.bottom}>
          <div className={styles.horizontalLine} />
          <div className={styles.copyright}>
            <p>&copy; 2024 Cornwall Iron Furnace | All Rights Reserved</p>
            <p>
              Designed & Developed by John Mitchell | Powered by{" "}
              <span className={styles.quadra}>quadra</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;