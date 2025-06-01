import React, { useState } from "react";

const AddParticipantForm = ({ eventId, onAdd }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [entryFeeChecked, setEntryFeeChecked] = useState(false);
  const [acknowledgementChecked, setAcknowledgementChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const submit = () => {
    if (!firstName || !lastName || !phone) {
      alert("יש למלא שם, שם משפחה ומספר וואטסאפ");
      return;
    }

    if (!entryFeeChecked || !acknowledgementChecked || !termsChecked) {
      alert("יש לאשר את כל הסעיפים");
      return;
    }

    const participant = {
      name: `${firstName} ${lastName}`,
      phone,
      notes,
      eventId,
    };

    onAdd(eventId, participant.name, participant.phone, participant.notes);
    setFirstName("");
    setLastName("");
    setPhone("");
    setNotes("");
    setEntryFeeChecked(false);
    setAcknowledgementChecked(false);
    setTermsChecked(false);
  };

  return (
    <div
      style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #ccc" }}
    >
      <div style={{ marginBottom: "0.5rem" }}>
        <input
          placeholder="שם פרטי"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          placeholder="שם משפחה"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <input
          placeholder="מספר וואטסאפ"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <textarea
          placeholder="הערות (לא חובה)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <div style={{ fontSize: "0.9rem", marginBottom: "0.5rem" }}>
        <label>
          <input
            type="checkbox"
            checked={entryFeeChecked}
            onChange={() => setEntryFeeChecked(!entryFeeChecked)}
          />{" "}
          אני מודע/ת לכך שיש דמי כניסה לאירוע
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={acknowledgementChecked}
            onChange={() => setAcknowledgementChecked(!acknowledgementChecked)}
          />{" "}
          אני מבין/ה שצוות YJCC מתחשב בהרשמה שלי לצורך התארגנות
        </label>
        <br />
        <label>
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={() => setTermsChecked(!termsChecked)}
          />{" "}
          אני מסכים/ה ל
          <a href="https://yjcc.cz/terms" target="_blank" rel="noreferrer">
            {" "}
            תקנון YJCC
          </a>
        </label>
      </div>
      <button onClick={submit}>הוסף משתתף</button>
    </div>
  );
};

export default function App() {
  const [events, setEvents] = useState([]);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [participants, setParticipants] = useState({});

  const addEvent = () => {
    const newEvent = {
      id: Date.now(),
      name: eventName,
      date: eventDate,
    };
    setEvents([...events, newEvent]);
    setParticipants({ ...participants, [newEvent.id]: [] });
    setEventName("");
    setEventDate("");
  };

  const addParticipant = (eventId, name, phone, notes = "") => {
    const updated = [...(participants[eventId] || []), { name, phone, notes }];
    setParticipants({ ...participants, [eventId]: updated });
  };

  const sendWhatsApp = (name, phone, eventName) => {
    const msg = `היי ${name}, תודה שהשתתפת באירוע של YJCC - "${eventName}". נשמח לשמוע פידבק קצר כאן:\nhttps://bit.ly/yjcc-feedback`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <div style={{ maxWidth: "700px", margin: "auto", padding: "2rem" }}>
      <h1>🎉 מערכת YJCC</h1>
      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="שם אירוע"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          style={{ marginRight: "0.5rem" }}
        />
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
        />
        <button onClick={addEvent} style={{ marginLeft: "0.5rem" }}>
          הוסף אירוע
        </button>
      </div>

      {events.map((event) => (
        <div
          key={event.id}
          style={{
            border: "1px solid #999",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h3>
            {event.name} – {event.date}
          </h3>
          <h4>משתתפים:</h4>
          <ul>
            {(participants[event.id] || []).map((p, i) => (
              <li key={i}>
                {p.name} – {p.phone} {p.notes && <em>({p.notes})</em>}
                <button
                  onClick={() => sendWhatsApp(p.name, p.phone, event.name)}
                  style={{ marginLeft: "0.5rem" }}
                >
                  שלח וואטסאפ
                </button>
              </li>
            ))}
          </ul>
          <AddParticipantForm eventId={event.id} onAdd={addParticipant} />
        </div>
      ))}
    </div>
  );
}
