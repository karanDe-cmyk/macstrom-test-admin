"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, useParams } from "react-router-dom"
import { ArrowLeft, Calendar, Users, DollarSign, Trophy, Edit2, Save, X } from "lucide-react"
import { fetchTeams, deletePlayer, updateRoom } from "../../services/apiHelpers"

export default function ContestDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { contestId } = useParams()

  const contest = location.state?.contest // contest passed from list page
  const [teams, setTeams] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingPlayer, setDeletingPlayer] = useState(null)
  const [isEditingRoom, setIsEditingRoom] = useState(false)
  const [roomData, setRoomData] = useState({
    room_id: contest?.room_id || "",
    room_password: contest?.room_password || "",
    room_created_by: contest?.room_created_by || ""
  })
  const [savingRoom, setSavingRoom] = useState(false)

  // Fetch teams for this contest
  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoading(true)
        const teamsData = await fetchTeams(contestId)
        setTeams(teamsData.teams || {})
        setError(null)
      } catch (err) {
        setError("Failed to load teams data")
      } finally {
        setLoading(false)
      }
    }
    loadTeams()
  }, [contestId])

  const handleDeletePlayer = async (teamNumber, playerNumber) => {
    const playerKey = `${teamNumber}-${playerNumber}`
    try {
      setDeletingPlayer(playerKey)
      await deletePlayer(contest.id, teamNumber, playerNumber)
      setTeams(prev => {
        const updated = { ...prev }
        if (updated[teamNumber]) {
          updated[teamNumber] = [...updated[teamNumber]]
          updated[teamNumber][playerNumber - 1] = null
        }
        return updated
      })
    } catch (err) {
      alert("Failed to delete player")
    } finally {
      setDeletingPlayer(null)
    }
  }

  const handleSaveRoom = async () => {
    try {
      setSavingRoom(true)
      await updateRoom(contest.id, roomData)
      setIsEditingRoom(false)
      alert("Room updated")
    } catch {
      alert("Failed to update room")
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
        <div key={playerKey} className="border p-3 mb-2 flex items-center justify-between bg-green-50 rounded-md">
          <span>{player.game_username}</span>
          <button 
            onClick={() => handleDeletePlayer(teamId, seatNumber)}
            disabled={isDeleting}
            className="text-red-600 text-sm"
          >
            {isDeleting ? "Deleting..." : "Remove"}
          </button>
        </div>
      )
    }

    return (
      <div key={playerKey} className="border-dashed border p-3 mb-2 flex justify-between rounded-md">
        <span>Seat {seatNumber} Empty</span>
      </div>
    )
  }

  if (!contest) return <p className="text-center py-8">No contest data. Please go back.</p>

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 mb-4">
        <ArrowLeft className="w-5 h-5 mr-2" /> Back
      </button>

      {/* Contest banner */}
      <div className="relative bg-white rounded-xl shadow-lg overflow-hidden mb-8">
        <img src={contest.image} alt={contest.title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-end">
          <h1 className="text-3xl font-bold text-white">{contest.title}</h1>
          <p className="text-white">{contest.description}</p>
        </div>
      </div>

      {/* Teams */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-bold mb-4">Teams</h2>
        {loading ? <p>Loading teams...</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(teams).map(teamId => (
              <div key={teamId} className="border p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Team {teamId}</h3>
                {renderTeamSlot(teamId, 1, teams[teamId][0])}
                {renderTeamSlot(teamId, 2, teams[teamId][1])}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
