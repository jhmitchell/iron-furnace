import React from "react";
import { Button } from "../../../../components/ui";
import Hours from '../hours/Hours';
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
            <Button text="PLAN YOUR VISIT" color="orange" onClick={onClickCTA} />
            <Button
              text="LEARN MORE"
              color="transparent"
              onClick={onClickCTA}
            />
          </div>
        </div>
        <Hours />
      </div>
    </div>
  );
};

export default WelcomeFlex;
