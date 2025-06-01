import React from "react";
import "./RegistrationConfirmation.css";

const RegistrationConfirmation = ({ eventDetails, participantName }) => {
  return (
    <div className="registration-confirmation">
      <div className="confirmation-content">
        <h2>🎉 ההרשמה הושלמה בהצלחה! 🎉</h2>

        <div className="confirmation-details">
          <h3>היי {participantName}!</h3>
          <p>נרשמת בהצלחה לאירוע:</p>
          <h4>{eventDetails.title}</h4>

          <div className="event-info">
            <p>
              <strong>תאריך:</strong> {eventDetails.date}
            </p>
            <p>
              <strong>שעה:</strong> {eventDetails.time}
            </p>
            <p>
              <strong>מיקום:</strong> {eventDetails.location}
            </p>
          </div>

          <div className="confirmation-message">
            <p>תודה שנרשמת! נשמח לראותך 😊</p>
            <p>קיבלת אישור גם בוואטסאפ</p>
            <p>לשאלות ובירורים:</p>
            <p className="contact">+972542230342</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationConfirmation;
