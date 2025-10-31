"use client"

import { useState, useEffect, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Gamepad2,
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  Loader2,
  X,
} from "lucide-react"
import axiosInstance from "../utils/axios"

// API Configuration
// const API_BASE_URL = "https://macstrombattle-api.kglame.com/api"
// const AUTH_TOKEN = localStorage.getItem("authToken") || "your_default_token_here" // Replace with your actual token or logic to get it

// API helper functions
// const apiRequest = async (url, options = {}) => {
//   try {
//     const response = await fetch(url, {
//       ...options,
//       headers: {
//         Authorization: `Bearer ${AUTH_TOKEN}`,
//         "Content-Type": "application/json",
//         ...options.headers,
//       },
//     })

//     if (!response.ok) {
//       const errorData = await response.text()
//       console.error("API Error Response:", errorData)
//       throw new Error(`HTTP error! status: ${response.status}`)
//     }

//     return await response.json()
//   } catch (error) {
//     console.error("API request failed:", error)
//     throw error
//   }
// }

export const fetchContestTeams = async (contestId) => {
  const { data } = await axiosInstance.get(`/duo-contests/${contestId}/teams`);
  return data;
};

// ✅ Fetch Duo Contest details
export const fetchContestDetails = async (contestId) => {
  const { data } = await axiosInstance.get(`/duo-contests/${contestId}`);
  return data;
};

// ✅ Fetch contest results
export const fetchContestResults = async (contestId) => {
  const { data } = await axiosInstance.get(`/duo-contests/${contestId}/results`);
  return data;
};

// ✅ Declare results (POST)
export const declareResults = async (contestId, resultsData) => {
  const { data } = await axiosInstance.post(`/duo-contests/${contestId}/declare`, resultsData);
  return data;
};


// Rank badge component
const RankBadge = ({ rank }) => {
  const getBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500"
      case 2:
        return "bg-gray-400"
      case 3:
        return "bg-orange-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getBadgeColor(rank)}`}
    >
      {rank}
    </div>
  )
}

export default function DuoContestResultDeclaration() {
  const [contest, setContest] = useState(null)
  const [teams, setTeams] = useState({})
  const [winners, setWinners] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDeclared, setIsDeclared] = useState(false)
  const [error, setError] = useState(null)
  const [allPlayers, setAllPlayers] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [declaredResults, setDeclaredResults] = useState([])
  const [searchTerms, setSearchTerms] = useState({})
  const [showDropdowns, setShowDropdowns] = useState({})
  const [isContestCompleted, setIsContestCompleted] = useState(false)

  const navigate = useNavigate()
  const { id } = useParams()
  const contestId = id

  // Initialize winners for top 5 teams
  const initializeWinners = useCallback(() => {
    const prizeDistribution = [40000, 25000, 15000, 12000, 8000]
    return prizeDistribution.map((amount, index) => ({
      rank: index + 1,
      team_id: null,
      team_search: "",
      player1: {
        member_id: "",
        username: "",
        team_id: null,
      },
      player2: {
        member_id: "",
        username: "",
        team_id: null,
      },
      winning_amount: amount,
    }))
  }, [])

  // Convert teams object to flat array of players and teams
  const convertTeamsToPlayersAndTeams = (teamsData) => {
    const players = []
    const teamsArray = []

    Object.entries(teamsData).forEach(([teamId, teamPlayers]) => {
      // Create team object
      const teamInfo = {
        team_id: Number.parseInt(teamId),
        players: teamPlayers.filter(player => player && player.member_id),
        team_name: `Team ${teamId}`
      }
      teamsArray.push(teamInfo)

      // Add players
      teamPlayers.forEach((player) => {
        if (player && player.member_id) {
          players.push({
            ...player,
            team_id: Number.parseInt(teamId),
          })
        }
      })
    })
    return { players, teams: teamsArray }
  }

  const populateWinnersWithResults = useCallback(
    (results) => {
      const initialWinners = initializeWinners()

      if (!results || results.length === 0) {
        return initialWinners
      }

      return initialWinners.map((winner, index) => {
        if (index < results.length && results[index]) {
          const result = results[index]
          const player1 = result.players && result.players[0] ? result.players[0] : null
          const player2 = result.players && result.players[1] ? result.players[1] : null

          return {
            ...winner,
            team_id: result.team_id || null,
            team_search: `Team ${result.team_id}`,
            player1: {
              member_id: player1 ? player1.member_id.toString() : "",
              username: player1 ? player1.username : "",
              team_id: result.team_id || null,
            },
            player2: {
              member_id: player2 ? player2.member_id.toString() : "",
              username: player2 ? player2.username : "",
              team_id: result.team_id || null,
            },
          }
        }
        return winner
      })
    },
    [initializeWinners],
  )

  // Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const fetchContestAndResults = useCallback(async () => {
    if (!contestId) {
      setError("Contest ID is required")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Fetch contest details, teams data, and check for existing results
      const [contestData, teamsData] = await Promise.all([fetchContestDetails(contestId), fetchContestTeams(contestId)])

      // Set contest data from API response
      setContest(contestData)
      setTeams(teamsData.teams || {})

      // Check if contest is completed
      const isCompleted = contestData.match_status === "completed" || contestData.match_status === "finished"
      setIsContestCompleted(isCompleted)

      // Convert teams to flat array of players and teams
      const { players, teams } = convertTeamsToPlayersAndTeams(teamsData.teams || {})
      setAllPlayers(players)
      setAllTeams(teams)

      // Try to fetch existing results
      try {
        const resultsData = await fetchContestResults(contestId)
        if (resultsData && resultsData.length > 0) {
          setIsDeclared(true)
          setDeclaredResults(resultsData)
          const populatedWinners = populateWinnersWithResults(resultsData)
          setWinners(populatedWinners)

          const searchTermsInit = {}
          resultsData.forEach((result, index) => {
            const rank = index + 1
            searchTermsInit[`${rank}-team`] = `Team ${result.team_id}`
            if (result.players && result.players[0]) {
              searchTermsInit[`${rank}-1`] = result.players[0].username || ""
            }
            if (result.players && result.players[1]) {
              searchTermsInit[`${rank}-2`] = result.players[1].username || ""
            }
          })
          setSearchTerms(searchTermsInit)

          showToast("Results have already been declared for this contest", "info")
        } else {
          // No results declared yet
          setIsDeclared(false)
          setWinners(initializeWinners())
        }
      } catch (resultsError) {
        // If fetching results fails, assume no results are declared
        console.log("No existing results found or error fetching results:", resultsError)
        setIsDeclared(false)
        setWinners(initializeWinners())
      }
    } catch (err) {
      if (err.message.includes("Results already declared")) {
        setIsDeclared(true)
        setError(null)
        showToast("Results have already been declared for this contest", "info")
      } else {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch contest details"
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [contestId, initializeWinners, populateWinnersWithResults])

  // Handle team selection
  const selectTeam = (rank, team) => {
    if (isDeclared) return

    setWinners((prev) =>
      prev.map((winner) => {
        if (winner.rank === rank) {
          const player1 = team.players[0] || { member_id: "", username: "" }
          const player2 = team.players[1] || { member_id: "", username: "" }

          return {
            ...winner,
            team_id: team.team_id,
            team_search: team.team_name,
            player1: {
              member_id: player1.member_id ? player1.member_id.toString() : "",
              username: player1.game_username || "",
              team_id: team.team_id,
            },
            player2: {
              member_id: player2.member_id ? player2.member_id.toString() : "",
              username: player2.game_username || "",
              team_id: team.team_id,
            },
          }
        }
        return winner
      })
    )

    // Update search terms
    setSearchTerms((prev) => ({
      ...prev,
      [`${rank}-team`]: team.team_name,
      [`${rank}-1`]: team.players[0]?.game_username || "",
      [`${rank}-2`]: team.players[1]?.game_username || "",
    }))

    // Hide dropdown
    setShowDropdowns((prev) => ({ ...prev, [`${rank}-team`]: false }))
  }

  // Handle team search
  const handleTeamSearchChange = (rank, value) => {
    if (isDeclared) return

    const key = `${rank}-team`
    setSearchTerms((prev) => ({ ...prev, [key]: value }))
    setShowDropdowns((prev) => ({ ...prev, [key]: value.length > 0 }))

    // Update winner team search
    setWinners((prev) =>
      prev.map((winner) => {
        if (winner.rank === rank) {
          return { ...winner, team_search: value }
        }
        return winner
      })
    )
  }

  // Clear team selection
  const clearTeam = (rank) => {
    if (isDeclared) return

    setWinners((prev) =>
      prev.map((winner) => {
        if (winner.rank === rank) {
          return {
            ...winner,
            team_id: null,
            team_search: "",
            player1: { member_id: "", username: "", team_id: null },
            player2: { member_id: "", username: "", team_id: null },
          }
        }
        return winner
      })
    )

    // Clear search terms
    setSearchTerms((prev) => ({
      ...prev,
      [`${rank}-team`]: "",
      [`${rank}-1`]: "",
      [`${rank}-2`]: "",
    }))
  }

  // Clear individual player
  const clearPlayer = (rank, playerNumber) => {
    if (isDeclared) return

    setWinners((prev) =>
      prev.map((winner) => {
        if (winner.rank === rank) {
          return {
            ...winner,
            [`player${playerNumber}`]: { member_id: "", username: "", team_id: winner.team_id },
          }
        }
        return winner
      })
    )

    // Clear search term
    setSearchTerms((prev) => ({
      ...prev,
      [`${rank}-${playerNumber}`]: "",
    }))
  }

  // Get filtered teams
  const getFilteredTeams = (rank, searchTerm) => {
    if (isDeclared) return []

    // Filter out already selected teams in other ranks
    const selectedTeamIds = winners
      .filter((w) => w.rank !== rank && w.team_id)
      .map((w) => w.team_id)

    let availableTeams = allTeams.filter((team) => !selectedTeamIds.includes(team.team_id))

    // Filter by search term
    if (searchTerm) {
      availableTeams = availableTeams.filter((team) =>
        team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return availableTeams.slice(0, 10)
  }

  // Update player selection with search functionality
  const updatePlayerByUsername = (rank, playerNumber, username) => {
    if (isDeclared) return

    setWinners((prev) =>
      prev.map((winner) => {
        if (winner.rank === rank) {
          const selectedUser = allPlayers.find((user) => user.game_username === username)
          const updatedWinner = { ...winner }
          if (selectedUser) {
            updatedWinner[`player${playerNumber}`] = {
              member_id: selectedUser.member_id.toString(),
              username: selectedUser.game_username,
              team_id: selectedUser.team_id,
            }
          } else {
            // If exact match not found, just store the username for now
            updatedWinner[`player${playerNumber}`] = {
              member_id: "",
              username: username,
              team_id: winner.team_id,
            }
          }
          return updatedWinner
        }
        return winner
      }),
    )

    // Update search term
    const key = `${rank}-${playerNumber}`
    setSearchTerms((prev) => ({ ...prev, [key]: username }))
  }

  // Handle search input changes
  const handleSearchChange = (rank, playerNumber, value) => {
    if (isDeclared) return

    const key = `${rank}-${playerNumber}`
    setSearchTerms((prev) => ({ ...prev, [key]: value }))
    setShowDropdowns((prev) => ({ ...prev, [key]: value.length > 0 }))

    // Update the winner with the typed value
    updatePlayerByUsername(rank, playerNumber, value)
  }

  // Select player from dropdown
  const selectPlayerFromDropdown = (rank, playerNumber, player) => {
    if (isDeclared) return

    const key = `${rank}-${playerNumber}`
    updatePlayerByUsername(rank, playerNumber, player.game_username)
    setShowDropdowns((prev) => ({ ...prev, [key]: false }))
  }

  // Get filtered players based on search term
  const getFilteredPlayers = (rank, playerNumber, searchTerm) => {
    if (isDeclared) return []

    const winner = winners.find((w) => w.rank === rank)
    if (!winner) return []

    let availablePlayers = [...allPlayers]

    // If team is selected, filter by team
    if (winner.team_id) {
      availablePlayers = availablePlayers.filter((user) => user.team_id === winner.team_id)
    } else {
      // If this is player2 and player1 is selected, filter by same team
      if (playerNumber === 2 && winner.player1.team_id) {
        availablePlayers = availablePlayers.filter((user) => user.team_id === winner.player1.team_id)
      }
    }

    // Filter out already selected players in other ranks
    const selectedPlayerIds = winners
      .filter((w) => w.rank !== rank)
      .flatMap((w) => [w.player1.member_id, w.player2.member_id])
      .filter((id) => id !== "")

    availablePlayers = availablePlayers.filter((user) => !selectedPlayerIds.includes(user.member_id.toString()))

    // Filter by search term
    if (searchTerm) {
      availablePlayers = availablePlayers.filter((user) =>
        user.game_username.toLowerCase().startsWith(searchTerm.toLowerCase()),
      )
    }

    return availablePlayers.slice(0, 10)
  }

  const validateWinners = () => {
    const filledWinners = winners.filter((w) => w.player1.member_id !== "" && w.player2.member_id !== "")

    if (filledWinners.length === 0) {
      return "At least one complete winning team must be declared"
    }

    // Check for duplicate players
    const allPlayerIds = filledWinners.flatMap((w) => [w.player1.member_id, w.player2.member_id])
    const uniquePlayerIds = new Set(allPlayerIds)
    if (allPlayerIds.length !== uniquePlayerIds.size) {
      return "Duplicate players are not allowed"
    }

    // Check if players in same rank are from same team
    for (const winner of filledWinners) {
      if (winner.player1.team_id !== winner.player2.team_id) {
        return `Rank ${winner.rank}: Both players must be from the same team`
      }
    }

    return null
  }

  const declareResultsHandler = async () => {
    if (isDeclared) {
      showToast("Results have already been declared for this contest", "error")
      return
    }

    if (!isContestCompleted) {
      showToast("Contest must be completed before declaring results", "error")
      return
    }

    const validationError = validateWinners()
    if (validationError) {
      setError(validationError)
      showToast(validationError, "error")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare data for API in the exact format required
      const resultsData = winners
        .filter((w) => w.player1.member_id !== "" && w.player2.member_id !== "")
        .map((winner) => ({
          team_id: winner.player1.team_id,
          players: [
            {
              member_id: Number.parseInt(winner.player1.member_id),
              username: winner.player1.username,
            },
            {
              member_id: Number.parseInt(winner.player2.member_id),
              username: winner.player2.username,
            },
          ],
        }))

      console.log("Declaring results with data:", resultsData)
      await declareResults(contestId, resultsData)

      setIsDeclared(true)
      setDeclaredResults(resultsData)
      showToast("Contest results declared successfully!", "success")
    } catch (err) {
      let errorMessage = "Failed to declare results"
      if (err.message.includes("Results already declared")) {
        errorMessage = "Results have already been declared for this contest"
        setIsDeclared(true)
        // Re-fetch the results to display them
        fetchContestAndResults()
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      setError(errorMessage)
      showToast(errorMessage, "error")
      console.error("Declaration error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }

  // Navigate back to contest expanded page
  const handleBackToContest = () => {
    navigate(`/duoContests`)
  }

  const isDeclareButtonDisabled = isDeclared || !isContestCompleted || isSubmitting

  useEffect(() => {
    fetchContestAndResults()
  }, [fetchContestAndResults])

  if (isLoading && !contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-700">Loading contest details...</h3>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!contest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Contest Not Found</h2>
            <p className="text-gray-500 mb-6">The requested contest could not be loaded.</p>
            <button
              onClick={handleBackToContest}
              className="flex items-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Contest
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ${toast.type === "success"
            ? "bg-green-500 text-white"
            : toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
            }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" && <CheckCircle className="w-5 h-5" />}
            {toast.type === "error" && <AlertTriangle className="w-5 h-5" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Back Button */}
          <div>
            <button
              onClick={handleBackToContest}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Contest Details
            </button>
          </div>

          {/* Contest Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg text-white p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-medium">
                    Contest #{contest.contest_id || contest.id}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${contest.match_status === "live"
                      ? "bg-red-500 animate-pulse"
                      : isDeclared
                        ? "bg-green-500"
                        : isContestCompleted
                          ? "bg-yellow-500"
                          : "bg-gray-500"
                      }`}
                  >
                    {isDeclared ? "RESULTS DECLARED" : contest.match_status?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold">{contest.event_name}</h1>
                <div className="flex flex-wrap gap-4 text-sm opacity-90">
                  <div className="flex items-center gap-1">
                    <Gamepad2 className="w-4 h-4" />
                    <span>{contest.game}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{contest.map}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(contest.match_schedule)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90 mb-1">Total Prize Pool</p>
                <div className="flex items-center justify-end gap-2">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <span className="text-3xl font-bold">₹{contest.prize_pool?.toLocaleString() || "0"}</span>
                </div>
                <p className="text-sm opacity-90">{contest.total_winners || 5} Winners</p>
              </div>
            </div>
          </div>

          {/* Success Alert */}
          {isDeclared && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-green-800">Results Declared</h4>
                  <p className="text-green-700">
                    Contest results have been successfully declared for {contest.event_name}!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contest Status Warning */}
          {!isContestCompleted && !isDeclared && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Contest Not Completed</h4>
                  <p className="text-yellow-700">Results can only be declared after the contest is completed.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Winners Declaration */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">Prize Distribution & Winner Declaration</h2>
            </div>
            <p className="text-gray-600 mb-6">
              {isDeclared ? "Declared winning teams and prize amounts" : "Fill in winner details to declare results"}
            </p>

            <div className="space-y-6">
              {winners.map((winner) => (
                <div key={winner.rank} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <RankBadge rank={winner.rank} />
                    <span className="px-3 py-1 bg-black text-white rounded-full text-sm font-medium">
                      Rank {winner.rank}
                    </span>
                    <div className="ml-auto text-right">
                      <p className="text-sm text-gray-500">Prize Amount</p>
                      <p className="text-2xl font-bold text-green-600">₹{winner.winning_amount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Team Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Team</label>
                    <div className="relative">
                      <div className="flex">
                        <input
                          type="text"
                          value={searchTerms[`${winner.rank}-team`] || winner.team_search}
                          onChange={(e) => handleTeamSearchChange(winner.rank, e.target.value)}
                          onFocus={() =>
                            !isDeclared && setShowDropdowns((prev) => ({ ...prev, [`${winner.rank}-team`]: true }))
                          }
                          onBlur={() =>
                            setTimeout(
                              () => setShowDropdowns((prev) => ({ ...prev, [`${winner.rank}-team`]: false })),
                              200,
                            )
                          }
                          disabled={isDeclared}
                          placeholder={isDeclared ? "Selected Team" : "Search and select team..."}
                          className={`flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none ${isDeclared ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500"
                            }`}
                        />
                        {winner.team_id && !isDeclared && (
                          <button
                            onClick={() => clearTeam(winner.rank)}
                            className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Team Dropdown */}
                      {showDropdowns[`${winner.rank}-team`] && !isDeclared && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {getFilteredTeams(winner.rank, searchTerms[`${winner.rank}-team`]).map((team) => (
                            <div
                              key={team.team_id}
                              onMouseDown={() => selectTeam(winner.rank, team)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium">{team.team_name}</div>
                              <div className="text-sm text-gray-500">
                                {team.players.length} players: {team.players.map(p => p.game_username).join(", ")}
                              </div>
                            </div>
                          ))}
                          {getFilteredTeams(winner.rank, searchTerms[`${winner.rank}-team`]).length === 0 && (
                            <div className="px-3 py-2 text-gray-500 text-center">No teams found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Player 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Player 1 - User ID</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={winner.player1.member_id}
                          readOnly
                          placeholder={isDeclared ? "User ID" : "User ID will appear here"}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-100 focus:outline-none"
                        />
                        {winner.player1.member_id && !isDeclared && (
                          <button
                            onClick={() => clearPlayer(winner.rank, 1)}
                            className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Player 1 - Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerms[`${winner.rank}-1`] || winner.player1.username}
                          onChange={(e) => handleSearchChange(winner.rank, 1, e.target.value)}
                          onFocus={() =>
                            !isDeclared && setShowDropdowns((prev) => ({ ...prev, [`${winner.rank}-1`]: true }))
                          }
                          onBlur={() =>
                            setTimeout(
                              () => setShowDropdowns((prev) => ({ ...prev, [`${winner.rank}-1`]: false })),
                              200,
                            )
                          }
                          disabled={isDeclared}
                          placeholder={isDeclared ? "Player Name" : "Type player name..."}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isDeclared ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500"
                            }`}
                        />

                        {/* Dropdown for player 1 */}
                        {showDropdowns[`${winner.rank}-1`] && !isDeclared && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {getFilteredPlayers(winner.rank, 1, searchTerms[`${winner.rank}-1`]).map((player) => (
                              <div
                                key={player.member_id}
                                onMouseDown={() => selectPlayerFromDropdown(winner.rank, 1, player)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{player.game_username}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {player.member_id} | Team {player.team_id}
                                </div>
                              </div>
                            ))}
                            {getFilteredPlayers(winner.rank, 1, searchTerms[`${winner.rank}-1`]).length === 0 && (
                              <div className="px-3 py-2 text-gray-500 text-center">No players found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Player 2 - User ID</label>
                      <div className="flex">
                        <input
                          type="text"
                          value={winner.player2.member_id}
                          readOnly
                          placeholder={isDeclared ? "User ID" : "User ID will appear here"}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-100 focus:outline-none"
                        />
                        {winner.player2.member_id && !isDeclared && (
                          <button
                            onClick={() => clearPlayer(winner.rank, 2)}
                            className="px-3 py-2 bg-red-500 text-white rounded-r-lg hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Player 2 - Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={searchTerms[`${winner.rank}-2`] || winner.player2.username}
                          onChange={(e) => handleSearchChange(winner.rank, 2, e.target.value)}
                          onFocus={() =>
                            !isDeclared && setShowDropdowns((prev) => ({ ...prev, [`${winner.rank}-2`]: true }))
                          }
                          onBlur={() =>
                            setTimeout(
                              () => setShowDropdowns((prev) => ({ ...prev, [`${winner.rank}-2`]: false })),
                              200,
                            )
                          }
                          disabled={isDeclared}
                          placeholder={isDeclared ? "Player Name" : "Type player name..."}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${isDeclared ? "bg-gray-100 cursor-not-allowed" : "focus:ring-2 focus:ring-blue-500"
                            }`}
                        />

                        {/* Dropdown for player 2 */}
                        {showDropdowns[`${winner.rank}-2`] && !isDeclared && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {getFilteredPlayers(winner.rank, 2, searchTerms[`${winner.rank}-2`]).map((player) => (
                              <div
                                key={player.member_id}
                                onMouseDown={() => selectPlayerFromDropdown(winner.rank, 2, player)}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                              >
                                <div className="font-medium">{player.game_username}</div>
                                <div className="text-sm text-gray-500">
                                  ID: {player.member_id} | Team {player.team_id}
                                </div>
                              </div>
                            ))}
                            {getFilteredPlayers(winner.rank, 2, searchTerms[`${winner.rank}-2`]).length === 0 && (
                              <div className="px-3 py-2 text-gray-500 text-center">No players found</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            {!isDeclared ? (
              <button
                onClick={declareResultsHandler}
                disabled={isDeclareButtonDisabled}
                className={`flex items-center px-8 py-3 rounded-lg transition-all duration-200 ${isDeclareButtonDisabled
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Declaring Results...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5 mr-2" />
                    {!isContestCompleted ? "Contest Not Completed" : "Declare Results"}
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleBackToContest}
                className="flex items-center px-8 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Users className="w-5 h-5 mr-2" />
                Back to Contest Details
              </button>
            )}
          </div>

          {/* Declaration Summary */}
          {isDeclared && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Declaration Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {winners.filter((w) => w.player1.member_id !== "" && w.player2.member_id !== "").length}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Teams Declared</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ₹
                    {winners
                      .filter((w) => w.player1.member_id !== "" && w.player2.member_id !== "")
                      .reduce((sum, w) => sum + w.winning_amount, 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Prize Money Distributed</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-600">{contest.total_winners || 5}</div>
                  <div className="text-sm text-purple-600 font-medium">Total Winners</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">{contest.joined_count || 0}</div>
                  <div className="text-sm text-orange-600 font-medium">Total Teams</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}