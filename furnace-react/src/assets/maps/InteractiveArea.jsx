import React, { useState } from 'react';

const InteractiveArea = ({ children, id, onClick, fillColor, hoverColor }) => {
  const [hover, setHover] = useState(false);

  const style = {
    cursor: 'pointer',
    fill: hover ? hoverColor : fillColor,
  };

  return (
    <g
      id={id}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onClick(id)}
      style={{ cursor: 'pointer' }}
    >
      {React.cloneElement(children, { style })}
    </g>
  );
};

export default InteractiveArea;
