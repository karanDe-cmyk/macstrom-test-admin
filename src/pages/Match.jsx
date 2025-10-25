import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Match.css'; // Optional: your CSS file for modal + styling
import LiveMatchRoom from './LiveMatchRoom';
const localizer = momentLocalizer(moment);

const initialMatches = [
  {
    id: 1,
    title: 'Match 1',
    start: new Date(2025, 6, 28, 14, 0),
    end: new Date(2025, 6, 28, 16, 0),
    type: 'Squad',
  },
  {
    id: 2,
    title: 'Match 2',
    start: new Date(2025, 6, 29, 18, 0),
    end: new Date(2025, 6, 29, 20, 0),
    type: 'Solo',
  },
];

const matchTypes = ['Solo', 'Duo', 'Squad'];

const Match = () => {
  const [matches, setMatches] = useState(initialMatches);
  const [showLiveMatchRoom, setShowLiveMatchRoom] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [newMatch, setNewMatch] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: '',
  });
  const handleOpenLiveMatchRoom = () => {
    setShowLiveMatchRoom(true);
  };

  const handleCloseLiveMatchRoom = () => {
    setShowLiveMatchRoom(false);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMatch((prev) => ({ ...prev, [name]: value }));
  };

  const handleSchedule = () => {
    const { title, date, startTime, endTime, type } = newMatch;
    const start = new Date(`${date}T${startTime}`);
    const end = new Date(`${date}T${endTime}`);
    const newEvent = {
      id: matches.length + 1,
      title,
      start,
      end,
      type,
    };
    setMatches([...matches, newEvent]);
    setShowScheduleModal(false);
    setNewMatch({ title: '', date: '', startTime: '', endTime: '', type: '' });
  };

  const eventStyleGetter = (event) => {
    const bgColor = event.type === 'Solo' ? '#1976d2' : event.type === 'Duo' ? '#43a047' : '#f57c00';
    return {
      style: {
        backgroundColor: bgColor,
        color: 'white',
        borderRadius: '4px',
        padding: '4px',
        border: 'none',
      },
    };
  };

  return (
    <div className="match-container">
      <h2>Match Management</h2>

      {/* Stats */}
      <div className="match-stats">
        <div className="stat-box">
          <h4>Total Matches</h4>
          <p>{matches.length}</p>
        </div>
        <div className="stat-box">
          <h4>Upcoming Matches</h4>
          <p>{matches.filter(m => new Date(m.start) > new Date()).length}</p>
        </div>
        <div className="stat-box">
          <h4>Completed Matches</h4>
          <p>{matches.filter(m => new Date(m.end) < new Date()).length}</p>
        </div>
      </div>

      {/* Buttons */}
      
        <div className="match-actions">
          <button onClick={() => setShowScheduleModal(true)}>Schedule Match</button>
        </div>
        <div style={{ padding: '20px' }} className="match-actions">
          
          <button onClick={handleOpenLiveMatchRoom}>Open Live Match Room</button>

          {showLiveMatchRoom && (
            <LiveMatchRoom onClose={handleCloseLiveMatchRoom} />
          )}
        </div>
      
      {/* Calendar */}
      <div style={{ height: '600px', marginTop: '20px' }}>
        <Calendar
          localizer={localizer}
          events={matches}
          startAccessor="start"
          endAccessor="end"
          eventPropGetter={eventStyleGetter}
        />
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Schedule Match</h3>
            <label>Match Title</label>
            <input
              type="text"
              name="title"
              value={newMatch.title}
              onChange={handleInputChange}
            />

            <label>Date</label>
            <input
              type="date"
              name="date"
              value={newMatch.date}
              onChange={handleInputChange}
            />

            <label>Start Time</label>
            <input
              type="time"
              name="startTime"
              value={newMatch.startTime}
              onChange={handleInputChange}
            />

            <label>End Time</label>
            <input
              type="time"
              name="endTime"
              value={newMatch.endTime}
              onChange={handleInputChange}
            />

            <label>Match Type</label>
            <select name="type" value={newMatch.type} onChange={handleInputChange}>
              <option value="">Select</option>
              {matchTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <div className="modal-actions">
              <button onClick={handleSchedule}>Save</button>
              <button onClick={() => setShowScheduleModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Match;
