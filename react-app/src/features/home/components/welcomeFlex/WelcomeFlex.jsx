import React from "react";
import { Button } from "../../../../components/ui";
import { ArrowTextLink } from "../../../../components/ui";
import Hours from "../hours/Hours";
import "./WelcomeFlex.css";

const WelcomeFlex = () => {
  return (
    <div className="welcome-flex-container">
      <div className="welcome-flex">
        <div className="welcome-flex-element welcome">
          {/*<h2>Welcome</h2>*/}
          <h3>
            Welcome to the historic Cornwall Iron Furnace - the most intact and complete
            charcoal-fueled ironmaking complex found in America.
            <ArrowTextLink text="LEARN MORE" path="/visit" />
          </h3>
          {/*
          <div className="cta-buttons">
            <Button text="PLAN YOUR VISIT" color="orange" onClick={onClickCTA} />
            <Button
              text="LEARN MORE"
              color="transparent"
              onClick={onClickCTA}
            />
          </div>
        */}
        </div>
        <Hours />
      </div>
    </div>
  );
};

export default WelcomeFlex;
