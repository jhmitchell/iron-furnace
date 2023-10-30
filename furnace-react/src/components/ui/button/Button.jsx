import React from "react";
import "./Button.css";

const Button = ({ text, color, size = "medium", onClick, disabled }) => {
  return (
    <button 
      className={`button ${color} ${size} ${disabled ? 'disabled' : ''}`} 
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default Button;
