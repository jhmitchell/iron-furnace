import React from "react";
import Button from "../button/Button";
import "./HomePageGrid.css";

const HomePageGrid = () => {
  const onClickCTA = () => {
    console.log("CTA button clicked");
  };

  return (
    <div className="home-grid-container">
      <div className="home-grid">
        {/*
        <div className="home-grid-element events">
        <h2>Calendar</h2>
          <p>
            <strong>June 19, 2021</strong>
            <br />
            <em>Ironmaster's Mansion Tours</em>
            <br />
            11:00 a.m. to 3:00 p.m.
          </p>
        </div>
        */}
        <div className="home-grid-element welcome">
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
        <div className="home-grid-element hours">
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

export default HomePageGrid;
