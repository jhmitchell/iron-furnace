import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

/**
 * A versatile button component that can render as a button, anchor, or React Router Link.
 * 
 * @param {string} text - Button label text
 * @param {string} color - Color variant: "orange" | "transparent" | "outline"
 * @param {string} size - Size variant: "small" | "medium" | "large"
 * @param {string} to - Internal route (uses React Router Link)
 * @param {string} href - External URL (uses anchor tag)
 * @param {boolean} external - If true and href is provided, opens in new tab
 * @param {function} onClick - Click handler
 * @param {boolean} disabled - Disables the button
 * @param {string} className - Additional CSS classes
 */
const Button = ({ 
  text, 
  color = "orange", 
  size = "medium", 
  to,
  href,
  external = false,
  onClick, 
  disabled,
  className = ""
}) => {
  const classes = `button ${color} ${size} ${disabled ? 'disabled' : ''} ${className}`.trim();
  
  // Render as React Router Link for internal navigation
  if (to) {
    return (
      <Link 
        to={to}
        className={classes}
        onClick={onClick}
      >
        {text}
      </Link>
    );
  }
  
  // Render as anchor for external links
  if (href) {
    return (
      <a 
        href={href}
        className={classes}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {text}
      </a>
    );
  }

  // Default: render as button
  return (
    <button 
      className={classes} 
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {text}
    </button>
  );
};

export default Button;
