"use client";
import React, { useEffect, useState } from 'react';
import { Users, Trophy, Loader2, CheckCircle, XCircle } from 'lucide-react';
import axiosInstance from '../utils/axios';


export default function WebsiteStats() {
  const [activePlayers, setActivePlayers] = useState('');
  const [tournaments, setTournaments] = useState('');
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch current stats from the public API
  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/public/stats');
      const data = response.data;
      setActivePlayers(data.activePlayers || '');
      setTournaments(data.tournaments || '');
      setStatus({ message: '', type: '' });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      setStatus({ message: "Failed to load stats. Please check the server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ message: "Updating stats...", type: "info" });

    const payload = {};
    if (activePlayers) {
      payload.activePlayers = activePlayers;
    }
    if (tournaments) {
      payload.tournaments = tournaments;
    }

    try {
      await axiosInstance.patch('/admin/stats', payload);
      setStatus({ message: "Stats updated successfully!", type: "success" });
      // Re-fetch the data to ensure the UI is consistent
      fetchStats();
    } catch (error) {
      console.error("Failed to update stats:", error);
      const errorMessage = error.response?.data?.message || "An unexpected error occurred.";
      setStatus({ message: `Update failed: ${errorMessage}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const statusIcons = {
    info: <Loader2 className="animate-spin text-blue-800" />,
    success: <CheckCircle className="text-green-800" />,
    error: <XCircle className="text-red-800" />,
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 p-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
          <span className="gradient-text">Admin</span> Stats Panel
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Update the active player count and tournament stats.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div
            className="bg-white rounded-2xl shadow-sm p-6 text-center"
          >
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? <span className="animate-pulse">...</span> : activePlayers || 'N/A'}
            </div>
            <div className="text-gray-600">Active Players</div>
          </div>
          <div
            className="bg-white rounded-2xl shadow-sm p-6 text-center"
          >
            <Trophy className="w-8 h-8 text-cyan-600 mx-auto mb-2" />
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? <span className="animate-pulse">...</span> : tournaments || 'N/A'}
            </div>
            <div className="text-gray-600">Tournaments</div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label htmlFor="players" className="block text-sm font-medium text-gray-700 mb-2">
              Active Players
            </label>
            <input
              id="players"
              type="text"
              value={activePlayers}
              onChange={(e) => setActivePlayers(e.target.value)}
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 2.5M+"
            />
          </div>
          <div>
            <label htmlFor="tournaments" className="block text-sm font-medium text-gray-700 mb-2">
              Tournaments
            </label>
            <input
              id="tournaments"
              type="text"
              value={tournaments}
              onChange={(e) => setTournaments(e.target.value)}
              className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., 500+"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Update Stats"}
          </button>
        </form>

        {status.message && (
          <div
            className={`mt-6 p-4 rounded-lg flex items-center gap-2 ${
              status.type === 'success' ? 'bg-green-100 text-green-800' :
              status.type === 'error' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}
          >
            {statusIcons[status.type]}
            <span>{status.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
