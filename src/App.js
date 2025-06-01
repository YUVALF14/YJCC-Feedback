import React from "react";
import "./App.css";

class App extends React.Component {
  state = {
    events: [],
    eventName: "",
    eventDate: "",
    eventTime: "",
    participants: [],
    accessCode: "",
    isAuthenticated: false,
    userType: null, // 'admin' או 'participant'
    showError: false,
    displayDate: "",
  };

  componentDidMount() {
    // Check for events that need notifications every minute
    this.checkEventsInterval = setInterval(
      this.checkEventsForNotifications,
      60000
    );

    // Load saved events from localStorage
    const savedEvents = localStorage.getItem("events");
    if (savedEvents) {
      this.setState({ events: JSON.parse(savedEvents) });
    }
  }

  componentWillUnmount() {
    clearInterval(this.checkEventsInterval);
  }

  // Save events to localStorage whenever they change
  componentDidUpdate(prevProps, prevState) {
    if (prevState.events !== this.state.events) {
      localStorage.setItem("events", JSON.stringify(this.state.events));
    }
  }

  checkEventsForNotifications = () => {
    const now = new Date();
    this.state.events.forEach((event) => {
      const eventDate = new Date(event.date + "T" + event.time);
      const timeDiff = eventDate - now;

      // 24 hours before event
      if (
        timeDiff > 0 &&
        timeDiff <= 24 * 60 * 60 * 1000 &&
        !event.reminderSent
      ) {
        event.participants.forEach((participant) => {
          if (participant.hasConfirmed) {
            this.sendWhatsApp(
              participant.phone,
              `תזכורת: האירוע "${event.name}" יתקיים מחר בשעה ${event.time}! מחכים לך! 🎉`
            );
          }
        });
        this.updateEvent(event.id, { reminderSent: true });
      }

      // 12 hours after event
      if (timeDiff < -12 * 60 * 60 * 1000 && !event.feedbackSent) {
        event.participants.forEach((participant) => {
          if (participant.hasAttended) {
            this.sendWhatsApp(
              participant.phone,
              `היי! תודה שהגעת לאירוע "${event.name}"! נשמח לשמוע את דעתך: https://feedback-form.com/${event.id}`
            );
          }
        });
        this.updateEvent(event.id, { feedbackSent: true });
      }
    });
  };

  updateEvent = (eventId, updates) => {
    this.setState((prevState) => ({
      events: prevState.events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      ),
    }));
  };

  // Verify access code
  verifyCode = () => {
    const { accessCode } = this.state;
    if (accessCode === "291147") {
      this.setState({
        isAuthenticated: true,
        showError: false,
        userType: "admin",
      });
    } else if (accessCode === "1405") {
      this.setState({
        isAuthenticated: true,
        showError: false,
        userType: "participant",
      });
    } else {
      this.setState({ showError: true });
    }
  };

  // Add new event (admin only)
  addEvent = () => {
    const { eventName, eventDate, eventTime } = this.state;

    if (!eventName || !eventDate || !eventTime) {
      alert("נא למלא את כל השדות");
      return;
    }

    const newEvent = {
      id: Date.now(),
      name: eventName,
      date: eventDate,
      time: eventTime,
      participants: [],
      reminderSent: false,
      feedbackSent: false,
      maxParticipants: 50,
      isOpen: true,
    };

    this.setState((prevState) => ({
      events: [...prevState.events, newEvent],
      eventName: "",
      eventDate: "",
      eventTime: "",
    }));
  };

  // Toggle event registration status (admin only)
  toggleEventStatus = (eventId) => {
    this.setState((prevState) => ({
      events: prevState.events.map((event) =>
        event.id === eventId ? { ...event, isOpen: !event.isOpen } : event
      ),
    }));
  };

  // Self-registration for participants
  registerToEvent = (eventId, name, phone) => {
    if (!name || !phone) {
      alert("נא למלא את כל השדות");
      return;
    }

    this.setState((prevState) => ({
      events: prevState.events.map((event) => {
        if (event.id === eventId) {
          if (!event.isOpen) {
            alert("ההרשמה לאירוע זה סגורה");
            return event;
          }
          if (event.participants.length >= event.maxParticipants) {
            alert("האירוע מלא");
            return event;
          }
          if (event.participants.some((p) => p.phone === phone)) {
            alert("כבר נרשמת לאירוע זה");
            return event;
          }
          return {
            ...event,
            participants: [
              ...event.participants,
              {
                name,
                phone,
                hasPaid: false,
                hasConfirmed: true,
                hasAttended: false,
                selfRegistered: true,
              },
            ],
          };
        }
        return event;
      }),
    }));
  };

  // Add participant to event
  addParticipant = (eventId, name, phone) => {
    if (!name || !phone) {
      alert("נא למלא שם וטלפון");
      return;
    }

    this.setState((prevState) => ({
      events: prevState.events.map((event) => {
        if (event.id === eventId) {
          return {
            ...event,
            participants: [
              ...event.participants,
              {
                name,
                phone,
                hasPaid: false,
                hasConfirmed: false,
                hasAttended: false,
              },
            ],
          };
        }
        return event;
      }),
    }));
  };

  // Update participant status
  updateParticipantStatus = (eventId, participantIndex, field, value) => {
    this.setState((prevState) => ({
      events: prevState.events.map((event) => {
        if (event.id === eventId) {
          const updatedParticipants = [...event.participants];
          updatedParticipants[participantIndex] = {
            ...updatedParticipants[participantIndex],
            [field]: value,
          };
          return { ...event, participants: updatedParticipants };
        }
        return event;
      }),
    }));
  };

  // Send WhatsApp message
  sendWhatsApp = (phone, message) => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`);
  };

  // Format date to European style (DD/MM/YYYY)
  formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Format date input to European format
  handleDateChange = (e) => {
    const dateValue = e.target.value;
    this.setState({ eventDate: dateValue });
  };

  renderLoginScreen() {
    const { accessCode, showError } = this.state;
    return (
      <div className="login-container">
        <div className="login-box animate-fade-in">
          <div className="yjcc-logo">YJCC</div>
          <h1>ברוכים הבאים למערכת האירועים</h1>
          <p>קהילת הישראלים הצעירה בפראג</p>
          <div className="input-group">
            <input
              type="password"
              value={accessCode}
              onChange={(e) => this.setState({ accessCode: e.target.value })}
              placeholder="הקלידו קוד גישה"
              onKeyPress={(e) => e.key === "Enter" && this.verifyCode()}
            />
            <button onClick={this.verifyCode} className="animate-pulse">
              כניסה
            </button>
          </div>
          {showError && (
            <p className="error-message animate-shake">קוד גישה שגוי</p>
          )}
          <div className="contact-section">
            <p>רוצים להצטרף לקהילה או יש לכם שאלות?</p>
            <button
              className="contact-button"
              onClick={() =>
                window.open(`https://wa.me/972542230342`, "_blank")
              }
            >
              <div className="contact-button-content">
                <span className="contact-icon">💬</span>
                <span className="contact-text">דברו איתנו בווצאפ</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  renderParticipantView() {
    const { events } = this.state;
    const openEvents = events.filter((event) => event.isOpen);

    return (
      <div className="app-container">
        <header className="app-header animate-slide-down">
          <div className="header-content">
            <div className="yjcc-logo-small">YJCC</div>
            <h1>הרשמה לאירועים</h1>
          </div>
          <button
            className="logout-button"
            onClick={() =>
              this.setState({
                isAuthenticated: false,
                accessCode: "",
                userType: null,
              })
            }
          >
            יציאה
          </button>
        </header>

        <div className="contact-info">
          <p>יש לך שאלה? צריך עזרה?</p>
          <button
            className="whatsapp-contact-button"
            onClick={() => window.open(`https://wa.me/972542230342`, "_blank")}
          >
            <span className="icon">💬</span>
            צור קשר בווצאפ
          </button>
        </div>

        <div className="events-list">
          {openEvents.length === 0 ? (
            <div className="no-events-message">
              <h2>אין אירועים פתוחים להרשמה כרגע</h2>
              <p>בקרו אותנו שוב בקרוב!</p>
            </div>
          ) : (
            openEvents.map((event) => (
              <div key={event.id} className="event-card animate-slide-up">
                <h2>{event.name}</h2>
                <p className="event-date">
                  <span className="icon">📅</span>
                  תאריך: {this.formatDate(event.date)} |
                  <span className="icon">⏰</span>
                  שעה: {event.time}
                </p>
                <p className="event-status">
                  <span className="icon">👥</span>
                  מקומות פנויים:{" "}
                  {event.maxParticipants - event.participants.length} מתוך{" "}
                  {event.maxParticipants}
                </p>

                <div className="participant-form">
                  <input
                    type="text"
                    placeholder="שם מלא"
                    id={`name-${event.id}`}
                  />
                  <input
                    type="tel"
                    placeholder="מספר ווצאפ"
                    id={`phone-${event.id}`}
                  />
                  <div className="form-checkboxes">
                    <label className="form-checkbox">
                      <input type="checkbox" id={`terms-${event.id}`} />
                      <span>
                        אני מאשר/ת את דמי ההשתתפות באירוע ומבין/ה שצוות ה-YJCC
                        מתארגן ולוקח בחשבון את הגעתי
                      </span>
                    </label>
                  </div>
                  <button
                    onClick={() => {
                      const name = document.getElementById(
                        `name-${event.id}`
                      ).value;
                      const phone = document.getElementById(
                        `phone-${event.id}`
                      ).value;
                      const terms = document.getElementById(
                        `terms-${event.id}`
                      ).checked;

                      if (!terms) {
                        alert("נא לאשר את תנאי ההשתתפות");
                        return;
                      }

                      this.registerToEvent(event.id, name, phone);
                    }}
                  >
                    הירשם לאירוע
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  renderAdminView() {
    const { events, eventName, eventDate, eventTime } = this.state;

    return (
      <div className="app-container">
        <header className="app-header animate-slide-down">
          <div className="header-content">
            <div className="yjcc-logo-small">YJCC</div>
            <h1>ניהול אירועים</h1>
          </div>
          <button
            className="logout-button"
            onClick={() =>
              this.setState({
                isAuthenticated: false,
                accessCode: "",
                userType: null,
              })
            }
          >
            יציאה
          </button>
        </header>

        <div className="event-form animate-fade-in">
          <input
            type="text"
            value={eventName}
            onChange={(e) => this.setState({ eventName: e.target.value })}
            placeholder="שם האירוע"
          />
          <input
            type="date"
            value={eventDate}
            onChange={this.handleDateChange}
          />
          <input
            type="time"
            value={eventTime}
            onChange={(e) => this.setState({ eventTime: e.target.value })}
          />
          <button onClick={this.addEvent}>הוסף אירוע</button>
        </div>

        <div className="events-list">
          {events.map((event) => (
            <div key={event.id} className="event-card animate-slide-up">
              <div className="event-header">
                <h2>{event.name}</h2>
                <button
                  className={`status-toggle ${
                    event.isOpen ? "open" : "closed"
                  }`}
                  onClick={() => this.toggleEventStatus(event.id)}
                >
                  {event.isOpen ? "פתוח להרשמה" : "סגור להרשמה"}
                </button>
              </div>
              <p className="event-date">
                <span className="icon">📅</span>
                תאריך: {this.formatDate(event.date)} |
                <span className="icon">⏰</span>
                שעה: {event.time}
              </p>
              <p className="event-status">
                <span className="icon">👥</span>
                נרשמו: {event.participants.length} מתוך {event.maxParticipants}
              </p>

              <div className="participants-list">
                <h3>משתתפים:</h3>
                {event.participants.map((participant, index) => (
                  <div key={index} className="participant-item animate-fade-in">
                    <div className="participant-info">
                      <span className="participant-name">
                        {participant.name} - {participant.phone}
                        {participant.selfRegistered && (
                          <span className="self-registered-badge">
                            נרשם עצמאית
                          </span>
                        )}
                      </span>
                      <div className="participant-status">
                        <label className="status-checkbox">
                          <input
                            type="checkbox"
                            checked={participant.hasPaid}
                            onChange={(e) =>
                              this.updateParticipantStatus(
                                event.id,
                                index,
                                "hasPaid",
                                e.target.checked
                              )
                            }
                          />
                          <span>שילם</span>
                        </label>
                        <label className="status-checkbox">
                          <input
                            type="checkbox"
                            checked={participant.hasConfirmed}
                            onChange={(e) =>
                              this.updateParticipantStatus(
                                event.id,
                                index,
                                "hasConfirmed",
                                e.target.checked
                              )
                            }
                          />
                          <span>אישר הגעה</span>
                        </label>
                        <label className="status-checkbox">
                          <input
                            type="checkbox"
                            checked={participant.hasAttended}
                            onChange={(e) =>
                              this.updateParticipantStatus(
                                event.id,
                                index,
                                "hasAttended",
                                e.target.checked
                              )
                            }
                          />
                          <span>הגיע</span>
                        </label>
                      </div>
                    </div>
                    <button
                      className="whatsapp-button"
                      onClick={() =>
                        this.sendWhatsApp(
                          participant.phone,
                          `היי ${participant.name}! מזמינים אותך לאירוע "${
                            event.name
                          }" שיתקיים בתאריך ${this.formatDate(
                            event.date
                          )} בשעה ${event.time}. נשמח לראותך! 🎉`
                        )
                      }
                    >
                      שלח הודעת WhatsApp
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { isAuthenticated, userType } = this.state;
    if (!isAuthenticated) return this.renderLoginScreen();
    return userType === "admin"
      ? this.renderAdminView()
      : this.renderParticipantView();
  }
}

export default App;
