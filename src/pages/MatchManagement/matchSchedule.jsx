"use client"

import { useState } from "react"
import "./match-schedule.css"

const matchData = {
  8: [
    { time: "15:00", type: "state" },
    { time: "16:30", type: "state" },
  ],
  10: [{ time: "14:00", type: "national" }],
  12: [{ time: "17:00", type: "national" }],
}

const months = [
  "January 2024",
  "February 2024",
  "March 2024",
  "April 2024",
  "May 2024",
  "June 2024",
  "July 2024",
  "August 2024",
  "September 2024",
  "October 2024",
  "November 2024",
  "December 2024",
]

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate()
}

const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay()
}

export default function MatchSchedule() {
  const [selectedMonth, setSelectedMonth] = useState("January 2024")

  const currentYear = 2024
  const currentMonth = 0 // January (0-indexed)
  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-cell empty-cell"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const matches = matchData[day] || []

      days.push(
        <div key={day} className="calendar-cell">
          <div className="day-number">{day}</div>
          <div className="matches-container">
            {matches.map((match, index) => (
              <div key={index} className={`match-bar ${match.type === "state" ? "state-match" : "national-match"}`}>
                {match.time}
              </div>
            ))}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="match-schedule-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1 className="title">Match Schedule</h1>
          <p className="subtitle">Upcoming and ongoing matches</p>
        </div>

        <div className="header-right">
          {/* Legend */}
          <div className="legend">
            <div className="legend-item">
              <div className="legend-dot state-dot"></div>
              <span className="legend-text">State</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot national-dot"></div>
              <span className="legend-text">National</span>
            </div>
          </div>

          {/* Month Selector */}
          <select className="month-selector" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-container">
        {/* Days of Week Header */}
        <div className="calendar-header">
          {daysOfWeek.map((day) => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">{renderCalendarDays()}</div>
      </div>
    </div>
  )
}
