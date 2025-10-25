import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const TournamentGroups = () => {
  const [freefireGroups, setFreefireGroups] = useState([]);
  const [pubgGroups, setPubgGroups] = useState([]);
  const [freefireWinnerGroups, setFreefireWinnerGroups] = useState([]);
  const [pubgWinnerGroups, setPubgWinnerGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('freefire');
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      
      const [freefireResponse, pubgResponse, freefireWinnerResponse, pubgWinnerResponse] = await Promise.all([
        axios.get('https://macstrombattle-api.kglame.com/api/macstrom-tournament/freefire/groups'),
        axios.get('https://macstrombattle-api.kglame.com/api/macstrom-tournament/pubg/groups'),
        axiosInstance.get('/macstrom-tournament/freefire/winner-groups'),
        axiosInstance.get('/macstrom-tournament/pubg/winner-groups')
      ]);
      
      setFreefireGroups(freefireResponse.data);
      setPubgGroups(pubgResponse.data);
      setFreefireWinnerGroups(freefireWinnerResponse.data);
      setPubgWinnerGroups(pubgWinnerResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch groups. Please try again.');
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (groupId, gameType) => {
    navigate(`/group-members/${gameType}/${groupId}`);
  };

  const handleWinnerGroupClick = (groupId, gameType) => {
    navigate(`/winner-group-members/${gameType}/${groupId}`);
  };

  const renderGroups = (groups, gameType) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => handleGroupClick(group.id, gameType)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
          >
            <div
              className={`h-2 ${
                group.isFull ? 'bg-red-500' : 'bg-green-500'
              }`}
            ></div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Group {group.groupNumber}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    group.isFull
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {group.isFull ? 'FULL' : 'OPEN'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  </svg>
                  <span className="text-sm font-medium uppercase">
                    {gameType}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    <span className="font-bold text-gray-800">
                      {group.currentCount}
                    </span>{' '}
                    Players
                  </span>
                </div>

                {group.startDate && (
                  <div className="flex items-center text-gray-600">
                    <svg
                      className="w-5 h-5 mr-2 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm">
                      {new Date(group.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {group.room_id && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">Room ID:</span> {group.room_id}
                    </div>
                    {group.room_password && (
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Password:</span> {group.room_password}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                {(() => {
                  const maxSlots = gameType === 'freefire' ? 50 : 100;
                  const filledPercent = Math.min((group.currentCount / maxSlots) * 100, 100);

                  return (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            group.isFull ? 'bg-red-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${filledPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {group.currentCount}/{maxSlots} slots filled
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWinnerGroups = (groups, gameType) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => handleWinnerGroupClick(group.id, gameType)}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 overflow-hidden"
          >
            <div className="h-2 bg-gradient-to-r from-yellow-400 to-yellow-600"></div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {group.name || `Winners Group ${group.groupNumber}`}
                </h2>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                  WINNERS
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  <span className="text-sm font-medium uppercase">
                    {gameType}
                  </span>
                </div>

                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm">
                    <span className="font-bold text-gray-800">
                      {group.currentCount}
                    </span>{' '}
                    Winners
                  </span>
                </div>

                {group.finalWinner && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-yellow-800">Final Winner</p>
                        <p className="text-sm font-bold text-gray-800">{group.finalWinner.name}</p>
                        <p className="text-xs text-gray-600">{group.finalWinner.teamName}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!group.finalWinner && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-600 text-center">
                      No final winner selected yet
                    </p>
                  </div>
                )}

                {group.room_id && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">Room ID:</span> {group.room_id}
                    </div>
                    {group.room_password && (
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Password:</span> {group.room_password}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                {(() => {
                  const maxSlots = gameType === 'freefire' ? 50 : 100;
                  const filledPercent = Math.min((group.currentCount / maxSlots) * 100, 100);

                  return (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-yellow-400 to-yellow-600"
                          style={{ width: `${filledPercent}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        {group.currentCount}/{maxSlots} slots filled
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchGroups}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentGroups = activeTab === 'freefire' ? freefireGroups : pubgGroups;
  const currentWinnerGroups = activeTab === 'freefire' ? freefireWinnerGroups : pubgWinnerGroups;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Tournament Groups
          </h1>
          <p className="text-gray-600">
            Select a group to view registered participants or winners
          </p>
        </div>

        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('freefire')}
              className={`pb-4 px-6 font-semibold transition-colors ${
                activeTab === 'freefire'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              FreeFire ({freefireGroups.length})
            </button>
            <button
              onClick={() => setActiveTab('pubg')}
              className={`pb-4 px-6 font-semibold transition-colors ${
                activeTab === 'pubg'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              PUBG ({pubgGroups.length})
            </button>
          </div>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Registration Groups
          </h2>
          {renderGroups(currentGroups, activeTab)}
          {currentGroups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No registration groups found for {activeTab.toUpperCase()}
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            🏆 Winner Groups
          </h2>
          {renderWinnerGroups(currentWinnerGroups, activeTab)}
          {currentWinnerGroups.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No winner groups found for {activeTab.toUpperCase()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentGroups;