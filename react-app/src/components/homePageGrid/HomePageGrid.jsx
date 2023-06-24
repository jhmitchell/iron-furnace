import React from 'react';
import './HomePageGrid.css';

const HomePageGrid = () => {
  return (
    <div className="home-grid-container">
      <div className="home-grid">
        <div className="home-grid-element-var1 about">
          <h2>Welcome!</h2>
          <p>Please visit us during the following hours:</p>
        </div>
        <div className="home-grid-element-var2 hours">
          <h2>Hours of Operation</h2>
          <p>Open Wednesday through Sunday, 9:00 a.m. to 4:00 p.m.</p>
          <p>Guided tours are offered at 10:00 a.m., 12:00 p.m., and 2:00 p.m.</p>
          <p>Self-guided tours are available during regular business hours.</p>
          <p>For more information, please call 717-272-9711.</p>
        </div>
        <div className="home-grid-element-var1">
        </div>
        <div className="home-grid-element-var2">
        </div>
        <div className="home-grid-element-var1">
          <h2>Test</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Nulla euismod, nisl vitae aliquam ultricies, nunc nisl 
            aliquet nunc, vitae aliqua
          </p> 
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Nulla euismod, nisl vitae aliquam ultricies, nunc nisl 
            aliquet nunc, vitae aliqua
          </p> 
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Nulla euismod, nisl vitae aliquam ultricies, nunc nisl 
            aliquet nunc, vitae aliqua
          </p> 
        </div>
      </div>
    </div>
  );
}

export default HomePageGrid;
