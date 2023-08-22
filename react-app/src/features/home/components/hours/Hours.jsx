import "./Hours.css";

const Hours = () => {
  return (
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
  );
};

export default Hours;
