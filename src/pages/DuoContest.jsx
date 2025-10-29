"use client"

import { useState, useEffect } from "react"
import { Plus, Filter, Calendar, Users, DollarSign, Trophy, ArrowLeft, User, Edit2, Save, X } from "lucide-react"
import { useNavigate } from "react-router-dom"

// API configuration
const API_BASE_URL = "http://localhost:5000/api"
const AUTH_TOKEN = localStorage.getItem("authToken") || "your_default_token_here" // Replace with your actual token or logic to get it

// API helper functions
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

const fetchContests = () => apiRequest(`${API_BASE_URL}/duo-contests`)
const fetchTeams = (contestId) => apiRequest(`${API_BASE_URL}/duo-contests/${contestId}/teams`)
const deletePlayer = (contestId, teamNumber, playerNumber) => 
  apiRequest(`${API_BASE_URL}/duo-contests/${contestId}/join/${teamNumber}/${playerNumber}`, {
    method: 'DELETE'
  })
const updateRoom = (contestId, roomData) => 
  apiRequest(`${API_BASE_URL}/duo-contests/${contestId}/room`, {
    method: 'PUT',
    body: JSON.stringify(roomData)
  })

  const deleteContest = (contestId) => 
  apiRequest(`${API_BASE_URL}/duo-contests/delete/${contestId}`, {
    method: 'DELETE',
  })

// Utility functions
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const getStatusBadgeColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'live':
    case 'ongoing':
      return "bg-green-100 text-green-800"
    case 'completed':
      return "bg-gray-100 text-gray-800"
    case 'cancelled':
      return "bg-red-100 text-red-800"
    case 'upcoming':
    default:
      return "bg-blue-100 text-blue-800"
  }
}

const transformContestData = (contest) => ({
  id: contest.contest_id,
  title: contest.event_name,
  description: contest.match_description || "Competitive match",
  image: contest.banner_image_url || "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg",
  status: contest.match_status,
  date: formatDate(contest.match_schedule),
  players: `${contest.joined_count}/${contest.room_size}`,
  entryFee: `₹${contest.joining_fee} Entry`,
  pool: `₹${contest.prize_pool} Pool`,
  game: contest.game,
  map: contest.map,
  mode: contest.team,
  winCriteria: contest.prize_description || "Top winners share prize pool",
  remaining_seats: contest.remaining_seats,
  total_collection: contest.total_collection,
  platform_cut: contest.platform_cut,
  total_winners: contest.total_winners,
  distribution: contest.distribution,
  room_id: contest.room_id || "",
  room_password: contest.room_password || "",
  room_created_by: contest.room_created_by || "",
  extensions: contest.extensions,
  match_sponsor: contest.match_sponsor,
  match_private_description: contest.match_private_description
})

// Contest Detail Component
function ContestDetail({ contest, onBack }) {
  const navigate = useNavigate();
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingPlayer, setDeletingPlayer] = useState(null)
  const [isEditingRoom, setIsEditingRoom] = useState(false)
  const [roomData, setRoomData] = useState({
    room_id: contest.room_id || "",
    room_password: contest.room_password || "",
    room_created_by: contest.room_created_by || ""
  })
  const [savingRoom, setSavingRoom] = useState(false)

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true)
        const teamsData = await fetchTeams(contest.id)
        setTeams(teamsData.teams || {})
        setError(null)
      } catch (err) {
        setError('Failed to load teams data')
        console.error('Failed to fetch teams:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [contest.id])

  const handleDeletePlayer = async (teamNumber, playerNumber) => {
    const playerKey = `${teamNumber}-${playerNumber}`
    try {
      setDeletingPlayer(playerKey)
      await deletePlayer(contest.id, teamNumber, playerNumber)
      
      // Update local teams state by removing the player
      setTeams(prevTeams => {
        const updatedTeams = { ...prevTeams }
        if (updatedTeams[teamNumber]) {
          updatedTeams[teamNumber] = [...updatedTeams[teamNumber]]
          updatedTeams[teamNumber][playerNumber - 1] = null
        }
        return updatedTeams
      })
    } catch (err) {
      console.error('Failed to delete player:', err)
      alert('Failed to delete player. Please try again.')
    } finally {
      setDeletingPlayer(null)
    }
  }

  const handleSaveRoom = async () => {
    try {
      setSavingRoom(true)
      await updateRoom(contest.id, roomData)
      setIsEditingRoom(false)
      alert('Room details updated successfully!')
    } catch (err) {
      console.error('Failed to update room:', err)
      alert('Failed to update room details. Please try again.')
    } finally {
      setSavingRoom(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingRoom(false)
    setRoomData({
      room_id: contest.room_id || "",
      room_password: contest.room_password || "",
      room_created_by: contest.room_created_by || ""
    })
  }

  const renderTeamSlot = (teamId, seatNumber, player) => {
    const playerKey = `${teamId}-${seatNumber}`
    const isDeleting = deletingPlayer === playerKey
    
    if (player && player.game_username) {
      return (
        <div key={playerKey} className="border border-gray-300 rounded-md p-3 mb-2 flex items-center justify-between bg-green-50">
          <span className="text-sm text-gray-800 font-medium">{player.game_username}</span>
          <button 
            onClick={() => handleDeletePlayer(teamId, seatNumber)}
            disabled={isDeleting}
            className="text-red-600 hover:underline text-sm disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Remove'}
          </button>
        </div>
      )
    }
    
    return (
      <div key={playerKey} className="border border-dashed border-gray-300 rounded-md p-3 mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">Seat {seatNumber} Empty</span>
        <button className="text-gray-400 text-sm cursor-not-allowed">Empty</button>
      </div>
    )
  }

  const totalTeams = Object.keys(teams).length || Math.ceil(contest.remaining_seats / 2) || 5

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back to contests */}
        <div className="mb-6">
          <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to contests
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <img
            src={contest.image}
            alt={contest.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-8 flex flex-col justify-end">
            <h1 className="text-4xl font-bold text-white mb-2">{contest.title}</h1>
            <p className="text-white text-lg">{contest.description}</p>
          </div>
        </div>

        {/* Contest Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Schedule</p>
              <p className="text-lg font-medium text-gray-900">{contest.date}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Users className="w-6 h-6 mr-3 text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Players</p>
              <p className="text-lg font-medium text-gray-900">{contest.players}</p>
            </div>
          </div>
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 mr-3 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Entry Fee</p>
              <p className="text-lg font-medium text-gray-900">{contest.entryFee}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Trophy className="w-6 h-6 mr-3 text-zinc-500" />
            <div>
              <p className="text-sm text-gray-500">Prize Pool</p>
              <p className="text-lg font-medium text-gray-900">{contest.pool}</p>
            </div>
          </div>
          <div className="flex items-center col-span-full md:col-span-1">
            <div className="flex space-x-2">
              <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                {contest.game}
              </span>
              <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                {contest.map}
              </span>
              <span className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm font-medium">
                {contest.mode}
              </span>
            </div>
          </div>
        </div>

        {/* Room Details */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Room Details</h3>
            {!isEditingRoom ? (
              <button
                onClick={() => setIsEditingRoom(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveRoom}
                  disabled={savingRoom}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {savingRoom ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {!isEditingRoom ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Room ID</p>
                <p className="text-lg font-medium text-gray-900 font-mono">
                  {roomData.room_id || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Password</p>
                <p className="text-lg font-medium text-gray-900 font-mono">
                  {roomData.room_password || 'Not set'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Created By</p>
                <p className="text-lg font-medium text-gray-900">
                  {roomData.room_created_by || 'Not set'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-2">Room ID</label>
                <input
                  type="text"
                  value={roomData.room_id}
                  onChange={(e) => setRoomData(prev => ({ ...prev, room_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Enter Room ID"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">Password</label>
                <input
                  type="text"
                  value={roomData.room_password}
                  onChange={(e) => setRoomData(prev => ({ ...prev, room_password: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Enter Password"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-2">Created By</label>
                <input
                  type="text"
                  value={roomData.room_created_by}
                  onChange={(e) => setRoomData(prev => ({ ...prev, room_created_by: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter Creator Name"
                />
              </div>
            </div>
          )}
        </div>

        {/* Teams Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Teams ({totalTeams} Teams Available)
          </h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading teams...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: totalTeams }).map((_, index) => {
                const teamId = (index + 1).toString()
                const teamData = teams[teamId] || [null, null]
                
                return (
                  <div key={teamId} className="border border-gray-200 rounded-lg p-4 text-center">
                    <h3 className="font-semibold text-gray-800 mb-3">Team {teamId}</h3>
                    {renderTeamSlot(teamId, 1, teamData[0])}
                    {renderTeamSlot(teamId, 2, teamData[1])}
                  </div>
                )
              })}
            </div>
          )}
        </div>
        {/* Declare Result Button */}
          <div className="flex justify-center mt-8">
            <button
              onClick={() => navigate(`/duo/result/${contest.id}`)}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Declare Result
              
            </button>
          </div>

        

      </div>
      
    </div>
  )


}

// Main Duo Contests List Component
export default function DuoContestsList() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState("All")
  const [selectedContest, setSelectedContest] = useState(null)
  const [contests, setContests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadContests = async () => {
      try {
        setLoading(true)
        const contestsData = await fetchContests()
        const transformedContests = contestsData.map(transformContestData).reverse() 
        setContests(transformedContests)
        setError(null)
      } catch (err) {
        setError('Failed to load contests')
        console.error('Failed to fetch contests:', err)
      } finally {
        setLoading(false)
      }
    }

    loadContests()
  }, [])

    const statusPriority = {
    live: 1,
    upcoming: 2,
    completed: 3,
    cancelled: 4
  }

  const filteredContests = filter === "All" 
  ? [...contests].sort((a, b) => {
      const aPriority = statusPriority[a.status?.toLowerCase()] || 99
      const bPriority = statusPriority[b.status?.toLowerCase()] || 99
      return aPriority - bPriority
    })
  : contests.filter(
      (contest) => contest.status?.toLowerCase() === filter.toLowerCase()
    )

  const handleCardClick = (contest) => {
    setSelectedContest(contest)
  }

  const handleBackClick = () => {
    setSelectedContest(null)
  }
  const handleDeleteContest = async (contestId) => {
  if (!window.confirm("Are you sure you want to delete this contest?")) return;

  try {
    await deleteContest(contestId);
    setContests(prev => prev.filter(c => c.id !== contestId));
    alert("Contest deleted successfully!");
  } catch (err) {
    console.error("Failed to delete contest:", err);
    alert("Failed to delete contest. Please try again.");
  }
};
  // const handleCreateContest = () => {
  //   alert('Navigate to create contest page')
  //   // In your actual app, use: navigate("/duo/create")
  // }

  if (selectedContest) {
    return <ContestDetail contest={selectedContest} onBack={handleBackClick} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contests...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Duo Contests</h1>
            <p className="text-gray-600">Join competitive Duo tournaments and win prizes</p>
          </div>
          <button
                onClick={() => navigate("/duo/create")}
                className="flex items-center px-6 py-3 bg-[#9333EA] text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Contest
            </button>
        
        </div>

        {/* Filter */}
        <div className="flex items-center mb-6">
          <Filter className="w-5 h-5 mr-3 text-gray-500" />
          <div className="flex space-x-4">
            {["All", "Upcoming", "Live", "Completed", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status ? "bg-[#9333EA] text-white" : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Contest Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContests.length > 0 ? (
            filteredContests.map((contest) => (
              <button
                key={contest.id}
                onClick={() => handleCardClick(contest)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 block text-left"
              >
                <div className="relative">
                  <img
                    src={contest.image}
                    alt={contest.title}
                    className="w-full h-48 object-cover rounded-t-xl"
                    onError={(e) => {
                      e.target.src = "https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg"
                    }}
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeColor(contest.status)}`}>
                      {contest.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {/* <h3 className="text-xl font-bold text-gray-900 mb-2">{contest.title}</h3> */}
                   <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-gray-900">{contest.title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDeleteContest(contest.id)
          }}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{contest.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                      {contest.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-green-500" />
                      {contest.players}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-yellow-500" />
                      {contest.entryFee}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Trophy className="w-4 h-4 mr-2 text-zinc-500" />
                      {contest.pool}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {contest.game} • {contest.map}
                    </div>

                    <div className="text-sm font-medium text-blue-600">{contest.winCriteria}

                    </div>
                  </div>
                        
                        
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500 py-8">
              <p>No contests found for "{filter}" status</p>
            </div>
          )}
        </div>
      </div>


    </div>
      
  )
}