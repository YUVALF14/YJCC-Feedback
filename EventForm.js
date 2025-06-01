import React, { useState } from "react";
import "./EventForm.css";

const EventForm = ({ onSubmit, initialData }) => {
  const [event, setEvent] = useState(
    initialData || {
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      participantLimit: "",
      showAvailablePlaces: false,
      price: "",
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(event);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEvent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>כותרת האירוע</label>
        <input
          type="text"
          name="title"
          value={event.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>תאריך</label>
        <input
          type="date"
          name="date"
          value={event.date}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>שעה</label>
        <input
          type="time"
          name="time"
          value={event.time}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>מיקום</label>
        <input
          type="text"
          name="location"
          value={event.location}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>תיאור</label>
        <textarea
          name="description"
          value={event.description}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>מגבלת משתתפים</label>
        <input
          type="number"
          name="participantLimit"
          value={event.participantLimit}
          onChange={handleChange}
          min="1"
          required
        />
      </div>

      <div className="form-group">
        <label>מחיר</label>
        <input
          type="number"
          name="price"
          value={event.price}
          onChange={handleChange}
          min="0"
          required
        />
      </div>

      <div className="form-group checkbox">
        <label>
          <input
            type="checkbox"
            name="showAvailablePlaces"
            checked={event.showAvailablePlaces}
            onChange={handleChange}
          />
          הצג מספר מקומות פנויים
        </label>
      </div>

      <button type="submit" className="submit-button">
        {initialData ? "עדכן אירוע" : "צור אירוע"}
      </button>
    </form>
  );
};

export default EventForm;
