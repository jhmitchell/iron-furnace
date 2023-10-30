import React from "react";
import { Link } from "react-router-dom";
import "./MediaCard.css";

const MediaCard = ({ image, title, subtitle, description, path, children }) => {
  return (
    <Link to={path} className="media-card">
      <div className="media-image" style={{ backgroundImage: `url(${image})` }}></div>
      <div className="media-details">
        <h3 className="media-title">{title}</h3>
        <p className="media-subtitle">{subtitle}</p>
        {description && <p className="media-description">{description}</p>}
        {children}
      </div>
    </Link>
  );
};

export default MediaCard;
