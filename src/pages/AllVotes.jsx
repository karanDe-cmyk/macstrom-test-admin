import React, { useState, useEffect } from "react";
import {
  BarChart2, // For Analytics Report
  Clock, // For Time Filter
  FileText, // For Total Votes
  CheckCircle, // For Active Polls
  AlertTriangle, // For Suspicious
  ShieldOff, // For Fraud Detected
  Users, // For Participation
  Award, // For Top Voted
  MapPin, // For State Voting
  Globe, // For National Voting
  Lock, // For Lock Voting
  XCircle, // For Invalidate Votes
  ChevronDown, // For dropdowns
} from "lucide-react";

const AllVotes = () => {
  const [votes, setVotes] = useState(null); // This will hold actual vote data later
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("Last 24 Hours");
  const [votingType, setVotingType] = useState("State Voting"); // 'State Voting' or 'National Voting'
  const [selectedState, setSelectedState] = useState("No states available"); // For state filter

  // Simulated API call for initial data load
  useEffect(() => {
    setTimeout(() => {
      // For demonstration, we'll keep votes empty initially.
      // In a real app, you'd fetch data here.
      setVotes([]);
      setLoading(false);
    }, 1000);
  }, []);

  // Mock data for stats cards
  const stats = {
    totalVotes: 0,
    activePolls: 0,
    suspicious: 0,
    fraudDetected: 0,
    participation: 0.00,
    topVoted: "N/A",
  };

  // Mock data for states (can be fetched from API)
  const states = ["No states available", "California", "Texas", "Florida"];

return (
    <section className="px-4 py-8 sm:px-12 sm:py-10 max-w-7xl mx-auto w-full bg-gray-50 min-h-screen space-y-8">
      {/* 🔹 Voting Center Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Voting Center</h2>
          <p className="text-gray-600 text-base">Monitor vote analytics and fraud control</p>
        </div>

        <div className="mt-2 sm:mt-0 flex gap-1 items-center">
          {/* Time Filter Dropdown */}
          <div className="relative">
            <select
              className="appearance-none px-4 py-2 border border-gray-300 bg-white text-sm text-gray-800 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-8 cursor-pointer"
              value={timeFilter}
              onChange={e => setTimeFilter(e.target.value)}
            >
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>

          {/* Analytics Report Button */}
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm text-gray-800 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
            <BarChart2 className="w-4 h-4 mr-2 text-gray-600" />
            Analytics Report
          </button>
        </div>
      </div>

      {/* 🔹 Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-4" style={{ rowGap: '2.5rem', columnGap: '1.2rem' }}>
        {/* Total Votes Card */}
        <div className="bg-white px-2 py-4 rounded-lg border border-gray-200 flex items-center gap-1 min-h-0" style={{minHeight:'70px', maxWidth:'230px'}}>
          <div className="flex flex-col items-start justify-center leading-tight">
            <div className="flex items-center mb-0.5">
              <FileText size={20} className="text-blue-500 ml-1" />
              <div className="flex flex-col ml-2">
                <p className="text-sm text-gray-500">Total Votes</p>
                <p className="text-lg font-bold text-gray-900">{stats.totalVotes}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Active Polls Card */}
        <div className="bg-white px-2 py-4 rounded-lg border border-gray-200 flex items-center gap-1 min-h-0" style={{minHeight:'70px', maxWidth:'230px'}}>
          <div className="flex flex-col items-start justify-center leading-tight">
            <div className="flex items-center mb-0.5">
              <CheckCircle size={20} className="text-green-500 ml-1" />
              <div className="flex flex-col ml-2">
                <p className="text-sm text-gray-500">Active Polls</p>
                <p className="text-lg font-bold text-gray-900">{stats.activePolls}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Suspicious Card */}
        <div className="bg-white px-2 py-4 rounded-lg border border-gray-200 flex items-center gap-1 min-h-0" style={{minHeight:'70px', maxWidth:'230px'}}>
          <div className="flex flex-col items-start justify-center leading-tight">
            <div className="flex items-center mb-0.5">
              <AlertTriangle size={20} className="text-yellow-500 ml-1" />
              <div className="flex flex-col ml-2">
                <p className="text-sm text-gray-500">Suspicious</p>
                <p className="text-lg font-bold text-gray-900">{stats.suspicious}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Fraud Detected Card */}
        <div className="bg-white px-2 py-4 rounded-lg border border-gray-200 flex items-center gap-1 min-h-0" style={{minHeight:'70px', maxWidth:'230px'}}>
          <div className="flex flex-col items-start justify-center leading-tight">
            <div className="flex items-center mb-0.5">
              <ShieldOff size={20} className="text-red-500 ml-1" />
              <div className="flex flex-col ml-2">
                <p className="text-sm text-gray-500">Fraud Detected</p>
                <p className="text-lg font-bold text-gray-900">{stats.fraudDetected}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Participation Card */}
        <div className="bg-white px-2 py-4 rounded-lg border border-gray-200 flex items-center gap-1 min-h-0" style={{minHeight:'70px', maxWidth:'230px'}}>
          <div className="flex flex-col items-start justify-center leading-tight">
            <div className="flex items-center mb-0.5">
              <Users size={20} className="text-purple-500 ml-1" />
              <div className="flex flex-col ml-2">
                <p className="text-sm text-gray-500">Participation</p>
                <p className="text-lg font-bold text-gray-900">{stats.participation.toFixed(2)}%</p>
              </div>
            </div>
          </div>
        </div>
        {/* Top Voted Card */}
        <div className="bg-white px-2 py-4 rounded-lg border border-gray-200 flex items-center gap-1 min-h-0" style={{minHeight:'70px', maxWidth:'230px'}}>
          <div className="flex flex-col items-start justify-center leading-tight">
            <div className="flex items-center mb-0.5">
              <Award size={20} className="text-orange-500 ml-1" />
              <div className="flex flex-col ml-2">
                <p className="text-sm text-gray-500">Top Voted</p>
                <p className="text-lg font-bold text-gray-900">{stats.topVoted}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Voting Type Tabs and State Filter - style removed as per user request */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${votingType === 'State Voting' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setVotingType('State Voting')}
        >
          <MapPin size={18} /> State Voting
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${votingType === 'National Voting' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          onClick={() => setVotingType('National Voting')}
        >
          <Globe size={18} /> National Voting
        </button>
        {votingType === 'State Voting' && (
          <div className="relative ml-4 w-56">
            <select
              className="appearance-none w-full px-4 py-2 border border-gray-300 bg-white text-sm text-gray-800 rounded-md shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 pr-8 cursor-pointer"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
            >
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        )}
      </div>

      {/* 🔹 Vote Content Area */}
      {loading ? (
        // Loader
        <div className="flex items-center space-x-2 justify-center min-h-[120px] w-full bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="w-4 h-4 rounded-full bg-blue-500 animate-ping" />
          <span className="text-blue-700 text-sm">Loading votes...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2" style={{ rowGap: '1rem', columnGap: '1rem' }}>
          {/* State Voting Results */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">State Voting Results</h3>
                <p className="text-gray-600 text-sm">State-level voting breakdown</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full inline-block ml-2">Active</span>
            </div>

            {/* Placeholder for results */}
            <div className="flex flex-col items-center justify-center min-h-[40px] text-gray-500">
              <p>No data available</p>
            </div>

            <div className="flex gap-2 mt-3">
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm text-gray-800 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                <XCircle className="w-4 h-4 mr-2 text-red-600" />
                Invalidate Votes
              </button>
              <button className="inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm text-gray-800 rounded-md shadow-sm hover:bg-gray-100 transition-colors">
                <Lock className="w-4 h-4 mr-2 text-gray-600" />
                Lock Voting
              </button>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Detailed Results</h3>
            <p className="text-gray-600 text-sm mb-4">Vote breakdown with fraud detection</p>
            <div className="flex flex-col items-center justify-center min-h-[40px] text-gray-500">
              <p>No data available</p>
            </div>
          </div>

          {/* Fraud Detection Heuristics */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-2">
            <div className="flex items-center gap-3 mb-2">
              <ShieldOff size={28} className="text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">Fraud Detection Heuristics</h2>
            </div>
            <p className="text-gray-600 text-sm mb-4">Automated fraud detection alerts and analysis</p>
            <div className="flex flex-col items-center justify-center min-h-[30px] text-gray-500">
              <p>No fraud heuristics data available.</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AllVotes;
