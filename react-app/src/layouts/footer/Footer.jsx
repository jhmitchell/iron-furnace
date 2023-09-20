import React from "react";
import { FaFacebookSquare, FaInstagram, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-left">
            <div className="footer-contact">
              <div className="footer-contact-left">
                <div className="footer-logo">
                  <div className="footer-logo-image" />
                  {/*
                  <div className="footer-logo-text">
                    <div className="logo-text-historic">THE HISTORIC</div>
                    <div className="logo-text-cornwall">CORNWALL</div>
                    <div className="logo-text-ironfurnace">IRON FURNACE</div>
                  </div>
                  */}
                </div>
              </div>
              <div className="footer-contact-right">
                <div className="footer-address">
                  Physical Address:
                  <br />
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
                  <a
                    href="https://www.facebook.com/CornwallIronFurnace/"
                    className="footer-link socials"
                  >
                    <FaFacebookSquare size={32} />
                  </a>
                  <a
                    href="https://www.instagram.com/cornwall_iron_furnace/?hl=en"
                    className="footer-link socials"
                  >
                    <FaInstagram size={32} />
                  </a>
                  <a
                    href="https://www.youtube.com/@cornwallironfurnace6291"
                    className="footer-link socials"
                  >
                    <FaYoutube size={32} />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-right">
            <div className="footer-right-title">
              <p>
                You can help preserve the beauty and history of the Cornwall
                Iron Furnace by supporting us with your tax-deductible
                donations.
              </p>
              <Button text="DONATE TODAY" color="orange" />
            </div>
            <div className="horizontal-line" />
            <div className="footer-right-links">
              <div>
                <Link className="footer-link">Visitor Information</Link>
                <div className="footer-sublinks">
                  <Link className="footer-sublink">Hours & Admission</Link>
                  <Link className="footer-sublink">Special Events</Link>
                  <Link className="footer-sublink">Museum Map</Link>
                  <Link className="footer-sublink">Accessibility</Link>
                </div>
              </div>
              <div>
                <Link className="footer-link">Support Us</Link>
                <div className="footer-sublinks">
                  <Link className="footer-sublink">Membership</Link>
                  <Link className="footer-sublink">Donate</Link>
                  <Link className="footer-sublink">Corporate Sponsorship</Link>
                  <Link className="footer-sublink">Volunteer</Link>
                </div>
              </div>
              <div>
                <Link className="footer-link">Shop</Link>
                <div className="footer-sublinks">
                  <Link className="footer-sublink">Books</Link>
                  <Link className="footer-sublink">Apparel</Link>
                </div>
              </div>
              <div>
                <Link className="footer-link">Contact Us</Link>
                <div className="footer-sublinks">
                  <Link className="footer-sublink">Private Events</Link>
                  <Link className="footer-sublink">Group Tours</Link>
                  <Link className="footer-sublink">School Tours</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-ack">
          {/* 
            Note: The PHMC logo is a GIF with a transparent background.
            The file and configuration are specified in the PHMC style
            guide. Please consult the guide if changing the layout. 
          */}
          <div className="PHMC-logo footer-ack-element">
            <div className="PHMC-logo-image" />
            <div className="PHMC-logo-text">
              Pennsylvania <br />
              Historical & Museum <br />
              Commission
            </div>
          </div>
          <p className="footer-ack-element">
            Cornwall Iron Furnace is administered by the Pennsylvania Historical
            & Museum Commission: <br />
            Josh Shapiro, Governor | Hayley Haldeman, Chair | Andrea Lowery,
            Executive Director
          </p>
          <p className="footer-ack-element">
            The Cornwall Iron Furnace Associates, Inc. is a non-profit
            organization that works in partnership with the PHMC, supporting the
            mission of preservation and education at this National Historic
            Site.
          </p>
        </div>
        <div className="footer-bottom">
          <div className="horizontal-line" />
          <div className="footer-copyright">
            <p>&copy; 2023 Cornwall Iron Furnace | All Rights Reserved</p>
            <p>
              Designed & Developed by John Mitchell | Powered by{" "}
              <span className="quadra">quadra</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
