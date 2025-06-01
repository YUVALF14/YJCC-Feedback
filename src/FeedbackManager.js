import React, { useState, useEffect } from "react";
import "./FeedbackManager.css";

const FeedbackManager = ({ isAdmin }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [accessCode, setAccessCode] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Load feedbacks from localStorage
    const storedFeedbacks = localStorage.getItem("eventFeedbacks");
    if (storedFeedbacks) {
      setFeedbacks(JSON.parse(storedFeedbacks));
    }
  }, []);

  const handleAccessCodeSubmit = (e) => {
    e.preventDefault();
    if (accessCode === "1928") {
      setIsAuthorized(true);
    } else {
      alert("קוד גישה שגוי");
    }
  };

  if (!isAdmin) {
    return <div className="unauthorized">גישה לא מורשית</div>;
  }

  if (!isAuthorized) {
    return (
      <div className="feedback-manager">
        <h2>ניהול משובים</h2>
        <form onSubmit={handleAccessCodeSubmit} className="access-code-form">
          <div className="form-group">
            <label>הכנס קוד גישה למשובים</label>
            <input
              type="password"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              required
            />
          </div>
          <button type="submit">כניסה</button>
        </form>
      </div>
    );
  }

  return (
    <div className="feedback-manager">
      <h2>ניהול משובים</h2>
      <div className="feedbacks-list">
        {feedbacks.map((feedback, index) => (
          <div key={index} className="feedback-item">
            <h3>{feedback.eventName}</h3>
            <p>
              <strong>מאת:</strong> {feedback.participantName}
            </p>
            <p>
              <strong>תאריך:</strong> {feedback.date}
            </p>
            <p>
              <strong>משוב:</strong> {feedback.content}
            </p>
          </div>
        ))}
        {feedbacks.length === 0 && (
          <p className="no-feedbacks">אין משובים עדיין</p>
        )}
      </div>
    </div>
  );
};

export default FeedbackManager;
