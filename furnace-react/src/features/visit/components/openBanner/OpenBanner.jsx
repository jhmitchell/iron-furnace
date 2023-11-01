import React from "react";
import { useHours } from "/src/features/hours";
import "./OpenBanner.css";

/**
 * The OpenBanner component renders a banner indicating whether the site is open or closed.
 *
 * @returns {React.Element} JSX element
 */
const OpenBanner = (props) => {
  const { isOpen, message, loading } = useHours();

  if (loading) {
    // Alternatively, return a loader
    return null; 
  }

  const displayMessage = `${isOpen ? 'OPEN: ' : 'CLOSED: '}${message}`;

  return (
    <div id={props.id} className={`open-banner ${isOpen ? "open" : "closed"}`}>{displayMessage}</div>
  );
};

export default OpenBanner;
