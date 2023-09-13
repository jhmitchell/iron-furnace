import React from "react";
import "./Button.css";

const Button = ({ text, color, size="medium", onClick }) => {
  return (
    <button className={`button ${color} ${size}`} onClick={onClick}>
      {text}
    </button>
  );
};

export default Button;
