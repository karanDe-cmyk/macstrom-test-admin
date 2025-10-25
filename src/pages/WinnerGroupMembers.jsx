import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const WinnerGroupMembers = () => {
  const { gameType, groupId } = useParams();
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [settingWinner, setSettingWinner] = useState(false);
  const [deletingWinner, setDeletingWinner] = useState(null);

  useEffect(() => {
    fetchGroupMembers();
  }, [gameType, groupId]);

  const fetchGroupMembers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/macstrom-tournament/${gameType}/winner-groups/${groupId}`
      );
      setGroupData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch group members. Please try again.');
      console.error('Error fetching group members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetFinalWinner = async (userId) => {
    if (!window.confirm('Are you sure you want to set this user as the final winner?')) {
      return;
    }

    try {
      setSettingWinner(true);
      await axiosInstance.post(
        `/macstrom-tournament/${gameType}/winner-groups/${groupId}/final-winner`,
        { userId: parseInt(userId) }
      );
      
      // Refresh the data
      await fetchGroupMembers();
      alert('Final winner set successfully!');
    } catch (err) {
      console.error('Error setting final winner:', err);
      alert('Failed to set final winner. Please try again.');
    } finally {
      setSettingWinner(false);
    }
  };

  const handleDeleteWinner = async (member) => {
    if (!window.confirm('Are you sure you want to remove this winner from the group?')) {
      return;
    }

    try {
      setDeletingWinner(member.id);
      await axiosInstance.delete(
        `/macstrom-tournament/${gameType}/groups/${member.originalGroup.id}/winner`
      );
      
      // Refresh the data
      await fetchGroupMembers();
      alert('Winner removed successfully!');
    } catch (err) {
      console.error('Error deleting winner:', err);
      alert('Failed to remove winner. Please try again.');
    } finally {
      setDeletingWinner(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
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
            onClick={fetchGroupMembers}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!groupData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Groups
          </button>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {groupData.name || `Winners Group ${groupData.groupNumber}`}
            </h1>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center">
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
                <span className="text-sm font-medium uppercase">{gameType}</span>
              </div>
              <div className="flex items-center">
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
                  <span className="font-bold text-gray-800">{groupData.currentCount}</span> Winners
                </span>
              </div>
            </div>

            {groupData.room_id && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">Room ID:</span> {groupData.room_id}
                </div>
                {groupData.room_password && (
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">Password:</span> {groupData.room_password}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Final Winner Card */}
          {groupData.finalWinner && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl shadow-lg p-6 mb-6 text-white">
              <div className="flex items-center">
                <svg
                  className="w-12 h-12 mr-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold opacity-90">🏆 Final Winner</p>
                  <p className="text-2xl font-bold">{groupData.finalWinner.name}</p>
                  <p className="text-sm opacity-90">{groupData.finalWinner.teamName}</p>
                  <p className="text-xs opacity-75">{groupData.finalWinner.email}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Group Members ({groupData.members?.length || 0})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupData.members && groupData.members.length > 0 ? (
            groupData.members.map((member, index) => (
              <div
                key={member.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  member.isFinalWinner ? 'ring-4 ring-yellow-400' : ''
                }`}
              >
                {member.isFinalWinner && (
                  <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-center py-2 text-sm font-bold">
                    🏆 FINAL WINNER
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {member.user.name}
                      </h3>
                      <p className="text-sm text-gray-600">{member.user.email}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-purple-500"
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
                        <span className="font-semibold">Team:</span> {member.user.teamName}
                      </span>
                    </div>

                    {member.user.inGameUsername && (
                      <div className="flex items-center text-gray-600">
                        <svg
                          className="w-4 h-4 mr-2 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-sm">
                          <span className="font-semibold">IGN:</span> {member.user.inGameUsername}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span className="text-sm">
                        <span className="font-semibold">Original Group:</span>{' '}
                        {member.originalGroup.groupNumber}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-600">
                      <svg
                        className="w-4 h-4 mr-2 text-blue-500"
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
                        <span className="font-semibold">Joined:</span>{' '}
                        {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {!member.isFinalWinner && (
                      <button
                        onClick={() => handleSetFinalWinner(member.user.id)}
                        disabled={settingWinner || groupData.finalWinner}
                        className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                          groupData.finalWinner
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                        }`}
                      >
                        {settingWinner ? 'Setting...' : 'Set as Final Winner'}
                      </button>
                    )}

                    {member.isFinalWinner && (
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3 text-center">
                        <p className="text-yellow-800 font-bold text-sm">
                          Current Champion
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handleDeleteWinner(member)}
                      disabled={deletingWinner === member.id}
                      className="w-full py-2 rounded-lg font-semibold transition-colors bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed"
                    >
                      {deletingWinner === member.id ? 'Removing...' : 'Remove Winner'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No members found in this group</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WinnerGroupMembers;