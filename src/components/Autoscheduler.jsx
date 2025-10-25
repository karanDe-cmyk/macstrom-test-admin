import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // calendar style

function AutoSchedulerModal({ onClose }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [startTime, setStartTime] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-2xl shadow-2xl w-[520px] p-6 relative animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">🛠️</span>
          <h2 className="text-xl font-semibold text-gray-800">Auto Scheduler</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Fill in the details to automatically schedule a match.
        </p>

        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Team A</label>
            <input
              type="text"
              value={teamA}
              onChange={(e) => setTeamA(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Team A Name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Team B</label>
            <input
              type="text"
              value={teamB}
              onChange={(e) => setTeamB(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter Team B Name"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Match Date</label>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              className="rounded-lg border shadow-sm p-2"
              tileClassName="hover:bg-blue-100"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-all"
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
          >
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

export default AutoSchedulerModal;
