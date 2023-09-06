import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="column1">
            <div className="footer-logo">{/* Insert logo here */}</div>
            <div className="footer-address">
              94 Rexmont Rd
              <br />
              Cornwall, PA 17016
            </div>
            <div className="footer-phone">717-272-9711</div>
            <div className="footer-mailing">
              Mailing Address:
              <br />
              PO Box 251
              <br />
              Cornwall, PA 17016
            </div>
            <div className="footer-socials">
              {/* Social Media Icons for Facebook, Instagram, YouTube */}
            </div>
          </div>
          <div className="column2">
            <p>
              You can help preserve the beauty and history by supporting us with
              your trax-deductible donations
            </p>
            <div className="column2-links">
              <div>
                <Link>Visitor Information</Link>
                {/* Additional info */}
              </div>
              <div>
                <Link>Support Us</Link>
                {/* Additional info */}
              </div>
              <div>
                <Link>Shop</Link>
                {/* Additional info */}
              </div>
              <div>
                <Link>Contact Us</Link>
                {/* Additional info */}
              </div>
            </div>
            <div className="footer-right-bottom">
              <p>
                Cornwall Iron Furnace is administered by the Pennsylvania
                Historical & Museum Commission:
              </p>
              <p>
                Josh Shaprio, Governor | Hayley Haldeman, Chair Andrea Lowery,
                Executive Director Pennsylvania Historical & Museum Commission
              </p>
              <p>
                The Cornwall Iron Furnace Associates, Inc. is a non-profit
                organization that works in partnership with the PHMC, supporting
                the mission of preservation and education at this National
                Historic Site.
              </p>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="horizontal-line" />
          <div className="footer-copyright">
            <p>
              Copyright &copy; 2023 Cornwall Iron Furnace | All Rights Reserved
            </p>
            <p>
              Designed & developed by John Mitchell | Powered by{" "}
              <span className="quadra">quadra</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
