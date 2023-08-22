import React from "react";
import Button from "../../../../components/button/Button";
import "./WelcomeFlex.css";

const WelcomeFlex = () => {
  const onClickCTA = () => {
    console.log("CTA button clicked");
  };

  return (
    <div className="welcome-flex-container">
      <div className="welcome-flex">
        <div className="welcome-flex-element welcome">
          <h2>Welcome</h2>
          <p>
            Welcome to Cornwall Iron Furnace - the most intact and complete charcoal-fueled ironmaking
            complex found in the nation. Whether you're a history enthusiast or a casual visitor, we invite
            you to step back in time with us, exploring the fascinating legacy
            of American ironmaking at the Cornwall Iron Furnace.
          </p>
          <div className="cta-buttons">
            <Button text="PLAN YOUR VISIT" color="blue" onClick={onClickCTA} />
            <Button
              text="LEARN MORE"
              color="transparent"
              onClick={onClickCTA}
            />
          </div>
        </div>
        <div className="welcome-flex-element hours">
          <h2>Hours</h2>
          <div className="hours-content">
            <div className="hours-column">
              <strong>June - August</strong>
              <br />
              Wednesday to Saturday,
              <br />
              9 a.m. to 5 p.m.
              <br />
              Sunday, noon to 5 p.m.
              <br />
            </div>
            <div className="hours-column">
              <strong>September - May</strong>
              <br />
              Thursday to Saturday,
              <br />
              9 a.m. to 5 p.m.
              <br />
              Sunday, noon to 5 p.m.
              <br />
            </div>
          </div>
          <p>Last tour leaves the Visitor’s Center at 3:15 p.m. each day</p>
          <p>
            <strong>CLOSED</strong> Mondays, Tuesdays, and all holidays
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeFlex;
