import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Trophy,
  Gamepad,
  Crown,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  ArrowLeft,
  Check,
  X,
  ChevronDown,
  Loader2,
} from "lucide-react";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";

const DeclareResult = () => {
  const { id } = useParams(); // contest id from /route/:id
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [declaring, setDeclaring] = useState(false);
  const [error, setError] = useState(null);
  const [declared, setDeclared] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // real data from API
  const [contestData, setContestData] = useState(null);
  // joinedUsers mapped to: { memberId, playerName, teamId, seatNumber }
  const [joinedUsers, setJoinedUsers] = useState([]);

  // winners = [{ rank, amount, teamId, players:[{ memberId, playerName, teamId }] }]
  const [winners, setWinners] = useState([]);

  const dropdownRefs = useRef({});

  /* ---------------- Utils ---------------- */

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        activeDropdown !== null &&
        !dropdownRefs.current[activeDropdown]?.contains(e.target)
      ) {
        setActiveDropdown(null);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const getStatusBadge = (status) => {
    const s = String(status || "").toUpperCase();
    const isLive = s === "LIVE";
    return (
      <span
        className={`px-3 py-1 text-sm font-semibold rounded-full ${
          isLive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
        }`}
      >
        {s || "—"}
      </span>
    );
  };

  const prizeDistributionFromContest = (contest) => {
    // contest.distribution can be { "1": 50, "2": 30, "3": 20 } (percent)
    // or absolute amounts. We detect percent if sum <= 100.
    const dist = contest?.distribution || { 1: 100 };
    const entries = Object.entries(dist)
      .map(([rank, value]) => ({ rank: Number(rank), value: Number(value) }))
      .sort((a, b) => a.rank - b.rank);

    const sum = entries.reduce(
      (s, e) => s + (Number.isFinite(e.value) ? e.value : 0),
      0
    );
    const isPercent = sum <= 100 && (contest?.prize_pool ?? 0) > 0;

    return entries.map((e) => ({
      rank: e.rank,
      amount: isPercent
        ? Math.round((Number(contest.prize_pool || 0) * e.value) / 100)
        : Number(e.value) || 0,
    }));
  };

  /* ---------------- Fetch ---------------- */

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const contestRes = await axiosInstance.get(`/squid-contests/${id}`);
      const contest = contestRes.data?.data ?? contestRes.data ?? null;
      setContestData(contest);

      // If winners exist, contest is declared
      if (
        contest &&
        Array.isArray(contest.winners) &&
        contest.winners.length > 0
      ) {
        setDeclared(true);
        // Map API winners to UI state
        setWinners(
          contest.winners.map((w, idx) => ({
            rank: idx + 1,
            amount: w.players[0]?.amount || 0,
            teamId: w.team_id,
            players: w.players.map((p) => ({
              memberId: p.member_id,
              playerName: p.username,
              teamId: w.team_id,
              amount: p.amount,
            })),
          }))
        );
      } else {
        // Not declared, fetch joined users and set up for declaration
        const joinedRes = await axiosInstance.get(
          `/squid-contests/${id}/joined-users`
        );
        const raw =
          joinedRes.data?.joined_users ??
          joinedRes.data?.data ??
          joinedRes.data ??
          [];
        const mapped = (Array.isArray(raw) ? raw : []).map((u) => ({
          memberId: u.member_id,
          playerName: u.game_username,
          teamId: u.team_id,
          seatNumber: u.seat_number,
        }));
        setJoinedUsers(mapped);

        // initialize winners *once* using contest distribution
        const distribution = prizeDistributionFromContest(contest);
        setWinners(
          distribution.map((p) => ({
            rank: p.rank,
            amount: p.amount,
            teamId: null,
            players: Array.from({ length: 4 }, () => ({
              memberId: "",
              playerName: "",
              teamId: null,
            })),
          }))
        );
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load contest.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /* ---------------- Dropdown / Inputs ---------------- */

  const handleSelectTeam = (rank, teamId) => {
    // Find all users of that team
    const teamPlayers = joinedUsers.filter(
      (u) => Number(u.teamId) === Number(teamId)
    );

    setWinners((prev) =>
      prev.map((w) =>
        w.rank === rank
          ? {
              ...w,
              teamId,
              players: teamPlayers.map((p) => ({
                memberId: p.memberId,
                playerName: p.playerName,
                teamId: p.teamId,
              })),
            }
          : w
      )
    );

    // update searchTerms with usernames for autocomplete fields
    teamPlayers.forEach((p, idx) => {
      const key = `${rank}-${idx}`;
      setSearchTerms((prev) => ({ ...prev, [key]: p.playerName }));
    });

    setActiveDropdown(null);
    setSelectedIndex(-1);
  };

  const handleRemovePlayer = (rank, playerIndex) => {
    setWinners((prev) =>
      prev.map((w) => {
        if (w.rank !== rank) return w;

        const updatedPlayers = w.players.map((p, idx) =>
          idx === playerIndex
            ? { memberId: "", playerName: "", teamId: null }
            : p
        );

        // If no players left, clear locked teamId
        const hasAny = updatedPlayers.some((p) => p.memberId);
        return {
          ...w,
          teamId: hasAny ? w.teamId : null,
          players: updatedPlayers,
        };
      })
    );

    const key = `${rank}-${playerIndex}`;
    setSearchTerms((prev) => ({ ...prev, [key]: "" }));
  };

  const getFilteredUsers = (searchTerm, rank) => {
    const term = (searchTerm || "").toLowerCase();

    // IDs of all selected members across all ranks
    const selectedIds = new Set(
      winners.flatMap((w) =>
        w.players.filter((p) => p.memberId).map((p) => String(p.memberId))
      )
    );

    // Collect all locked teamIds from other ranks
    const lockedTeamIdsOtherRanks = new Set(
      winners
        .filter((w) => w.rank !== rank && w.teamId)
        .map((w) => String(w.teamId))
    );

    // If this rank already has a locked team
    const currentRankData = winners.find((w) => w.rank === rank);
    const lockedTeamId = currentRankData?.teamId || null;

    return (
      joinedUsers
        // Hide already selected players
        .filter((u) => !selectedIds.has(String(u.memberId)))
        // Hide players from other ranks' locked teams
        .filter((u) => !lockedTeamIdsOtherRanks.has(String(u.teamId)))
        // Apply search term
        .filter((u) =>
          term ? u.playerName.toLowerCase().includes(term) : true
        )
        // If this rank is locked to a team, show only that team
        .filter((u) =>
          lockedTeamId ? Number(u.teamId) === Number(lockedTeamId) : true
        )
    );
  };

  const handlePlayerNameChange = (rank, playerIndex, value) => {
    const key = `${rank}-${playerIndex}`;
    setSearchTerms((prev) => ({ ...prev, [key]: value }));

    setWinners((prev) => {
      return prev.map((w) => {
        if (w.rank === rank) {
          const updatedPlayers = w.players.map((p, idx) =>
            idx === playerIndex
              ? { memberId: "", playerName: value, teamId: null }
              : p
          );

          // Clear teamId if no players left in this rank
          const hasAny = updatedPlayers.some((p) => p.memberId);
          return {
            ...w,
            teamId: hasAny ? w.teamId : null,
            players: updatedPlayers,
          };
        }
        return w;
      });
    });

    setActiveDropdown(key);
    setSelectedIndex(-1);
  };

  const handlePlayerSelect = (rank, playerIndex, user) => {
    const key = `${rank}-${playerIndex}`;
    setWinners((prev) =>
      prev.map((w) =>
        w.rank === rank
          ? {
              ...w,
              teamId: w.teamId ?? user.teamId, // lock team on first selection
              players: w.players.map((p, idx) =>
                idx === playerIndex
                  ? {
                      memberId: user.memberId,
                      playerName: user.playerName,
                      teamId: user.teamId,
                    }
                  : p
              ),
            }
          : w
      )
    );

    setSearchTerms((prev) => ({ ...prev, [key]: user.playerName }));
    setActiveDropdown(null);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e, rank, playerIndex) => {
    const key = `${rank}-${playerIndex}`;
    const filteredUsers = getFilteredUsers(searchTerms[key] || "", rank);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredUsers.length - 1));
      setActiveDropdown(key);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handlePlayerSelect(rank, playerIndex, filteredUsers[selectedIndex]);
    } else if (e.key === "Escape") {
      setActiveDropdown(null);
      setSelectedIndex(-1);
    }
  };

  /* ---------------- Validation + Declare ---------------- */

  const validateForm = () => {
    // build map rank -> players (selected)
    const usedMembers = new Set();
    for (const w of winners) {
      const chosen = w.players.filter((p) => p.memberId && p.playerName);
      if (chosen.length === 0) {
        // allow skipping a rank entirely; continue
        continue;
      }
      // ensure same team per rank
      const teamSet = new Set(chosen.map((p) => String(p.teamId)));
      if (teamSet.size > 1) {
        toast.error(`Rank #${w.rank}: All players must be from the same team`);
        return false;
      }
      // prevent duplicates across all ranks
      for (const p of chosen) {
        const key = String(p.memberId);
        if (usedMembers.has(key)) {
          toast.error("Duplicate members are not allowed across positions");
          return false;
        }
        usedMembers.add(key);
      }
    }

    // require at least one rank filled
    const totalPicked = winners.reduce(
      (sum, w) => sum + w.players.filter((p) => p.memberId).length,
      0
    );
    if (totalPicked === 0) {
      toast.info("Select at least one winner");
      return false;
    }

    return true;
  };

  const buildDeclarePayload = () => {
    // API expects ordered array by rank:
    // [{ team_id, players: [{ member_id, username }] }, ...]
    const payload = [];

    const sorted = [...winners].sort((a, b) => a.rank - b.rank);
    for (const w of sorted) {
      const chosen = w.players.filter((p) => p.memberId && p.playerName);
      if (chosen.length === 0) continue;

      const teamId = Number(w.teamId || chosen[0].teamId);
      const players = chosen.map((p) => ({
        member_id: Number(p.memberId),
        username: p.playerName,
      }));

      payload.push({ team_id: teamId, players });
    }
    return payload;
  };

  // calculate total prize distributed
  const totalPrizeDistributed = winners.reduce((sum, winner) => {
    return sum + winner.players.reduce((teamSum, p) => teamSum + p.amount, 0);
  }, 0);

  const handleDeclareResults = async () => {
    if (!validateForm()) return;

    setDeclaring(true);
    try {
      const body = buildDeclarePayload();
      await axiosInstance.post(`/squid-contests/${id}/declare`, body, {
        headers: { "Content-Type": "application/json" },
      });

      setDeclared(true);
      toast.success("Results declared successfully!");

      // Optional: refetch data after declare
      await fetchAll();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to declare results");
      toast.error(err?.response?.data?.message || "Failed to declare results");
      navigate(`/squad/${id}/declare-result`);
    } finally {
      setDeclaring(false);
    }
  };

  /* ---------------- Render helpers ---------------- */

  //   const getDeclaredWinners = () => {
  //     const declaredList = [];
  //     winners.forEach((w) => {
  //       w.players.forEach((p) => {
  //         if (p.memberId && p.playerName) {
  //           declaredList.push({ ...p, rank: w.rank, amount: w.amount });
  //         }
  //       });
  //     });
  //     return declaredList;
  //   };

  // const getTotalDistributed = () => {
  //   if (!Array.isArray(winners) || winners.length === 0) return 0;

  //   let total = 0;
  //   winners.forEach((w) => {
  //     const playerCount = Array.isArray(w.players) ? w.players.length : 0;
  //     total += (Number(w.amount) || 0);
  //   });
  //   console.log("Total Distributed:", winners);

  //   return total;
  // };

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading contest details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <X className="h-6 w-6 text-red-600" />
              <h2 className="ml-3 text-lg font-semibold text-red-800">Error</h2>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const prettyDate = contestData?.match_schedule
    ? new Date(contestData.match_schedule).toLocaleDateString()
    : "—";
  const prettyTime = contestData?.match_schedule
    ? new Date(contestData.match_schedule).toLocaleTimeString()
    : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center mb-6 justify-between">
          <button
            type="button"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => window.history.back()}
            aria-label="Back to contests"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to contests
          </button>
        </div>

        {/* Success Alert */}
        {declared && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Check className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-green-800 font-semibold">
                Results declared successfully
              </span>
            </div>
          </div>
        )}

        {/* Contest Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {contestData?.event_name || "Contest"}
                </h1>
                <div className="flex items-center space-x-4 text-blue-100">
                  <span className="bg-blue-800/50 px-2 py-1 rounded text-sm font-medium">
                    ID: {contestData?.contest_id ?? id}
                  </span>
                  {getStatusBadge(contestData?.match_status)}
                </div>
              </div>
              <Crown className="h-12 w-12 text-yellow-300" />
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Gamepad className="h-5 w-5 mr-3 text-blue-500" />
                <span className="font-medium">Game:</span>
                <span className="ml-2">{contestData?.game || "—"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-red-500" />
                <span className="font-medium">Map:</span>
                <span className="ml-2">{contestData?.map || "—"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-green-500" />
                <span className="font-medium">Date:</span>
                <span className="ml-2">{prettyDate}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-3 text-purple-500" />
                <span className="font-medium">Time:</span>
                <span className="ml-2">{prettyTime}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <DollarSign className="h-5 w-5 mr-3 text-yellow-500" />
                <span className="font-medium">Prize Pool:</span>
                <span className="ml-2 font-bold text-green-600">
                  ₹{(contestData?.prize_pool ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center text-gray-700">
                <Users className="h-5 w-5 mr-3 text-indigo-500" />
                <span className="font-medium">Room Size:</span>
                <span className="ml-2">{contestData?.room_size ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prize Distribution & Winner Declaration */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center mb-6">
            <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">
              Prize Distribution & Winner Declaration
            </h2>
          </div>

          <div className="space-y-6">
            {winners.map((winner,index) => (
              <div
                key={winner.rank}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center mb-4">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mr-4 ${getRankColor(index + 1)} text-white`}>
                    #{winner.rank}
                  </div>
                  {/* --- New: Select Team Dropdown --- */}
                  {!declared && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Winning Team
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                        value={winner.teamId || ""}
                        onChange={(e) =>
                          handleSelectTeam(winner.rank, Number(e.target.value))
                        }
                      >
                        <option value="">-- Choose Team --</option>
                        {[...new Set(joinedUsers.map((u) => u.teamId))]
                          // filter out already selected teams except the current slot’s own
                          .filter(
                            (tid) =>
                              !winners.some(
                                (w) =>
                                  w.teamId === tid && w.rank !== winner.rank
                              )
                          )
                          .map((tid) => (
                            <option key={tid} value={tid}>
                              Team {tid}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  {/* Prize Amount */}
                  <div className="flex-1 text-right">
                    <div className="text-sm font-medium text-gray-700 mb-1">
                      Prize Amount
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{winner.amount.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Players Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {winner.players.map((player, playerIndex) => {
                    const key = `${winner.rank}-${playerIndex}`;
                    const term = searchTerms[key] || player.playerName || "";
                    const suggestions =
                      activeDropdown === key
                        ? getFilteredUsers(term, winner.rank)
                        : [];

                    return (
                      <div
                        key={playerIndex}
                        className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                            {playerIndex + 1}
                          </div>

                          <div className="flex-1 space-y-2">
                            {/* Member ID */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Member ID
                              </label>
                              <input
                                type="text"
                                value={player.memberId || ""}
                                readOnly
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-50 text-gray-600"
                                placeholder="Auto-filled"
                                disabled={declared}
                              />
                            </div>

                            {/* Player Name Input */}
                            <div
                              className="relative"
                              ref={(el) => (dropdownRefs.current[key] = el)}
                            >
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Player (in-game)
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  value={term}
                                  readOnly={declared}
                                  onChange={
                                    declared
                                      ? undefined
                                      : (e) =>
                                          handlePlayerNameChange(
                                            winner.rank,
                                            playerIndex,
                                            e.target.value
                                          )
                                  }
                                  onKeyDown={
                                    declared
                                      ? undefined
                                      : (e) =>
                                          handleKeyDown(
                                            e,
                                            winner.rank,
                                            playerIndex
                                          )
                                  }
                                  onFocus={
                                    declared
                                      ? undefined
                                      : () => setActiveDropdown(key)
                                  }
                                  disabled={declared}
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                  placeholder="Search player..."
                                />
                                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                              </div>

                              {/* Dropdown */}
                              {activeDropdown === key && !declared && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                                  {suggestions.length > 0 ? (
                                    suggestions.map((user, index) => (
                                      <div
                                        key={`${user.teamId}-${user.memberId}`}
                                        onClick={() =>
                                          handlePlayerSelect(
                                            winner.rank,
                                            playerIndex,
                                            user
                                          )
                                        }
                                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                                          index === selectedIndex
                                            ? "bg-blue-100 text-blue-800"
                                            : "text-gray-800"
                                        }`}
                                      >
                                        <div className="font-medium text-sm">
                                          {user.playerName}{" "}
                                          <span className="text-xs text-gray-500">
                                            • Team {user.teamId} Seat{" "}
                                            {user.seatNumber}
                                          </span>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          Member #{user.memberId}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="px-3 py-2 text-gray-500 text-xs">
                                      No players found
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* --- New: Remove Button --- */}
                          {!declared && player.memberId && (
                            <button
                              type="button"
                              onClick={() =>
                                handleRemovePlayer(winner.rank, playerIndex)
                              }
                              className="text-red-500 hover:text-red-700 ml-2 mt-6"
                              title="Remove player"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Locked team hint */}
                        {winner.teamId && (
                          <div className="mt-2 text-xs text-gray-500">
                            Team locked for this rank:{" "}
                            <span className="font-semibold">
                              Team {winner.teamId}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          {!declared && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleDeclareResults}
                disabled={declaring}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {declaring ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5 mr-2" />
                    Declaring Results...
                  </>
                ) : (
                  <>
                    <Trophy className="h-5 w-5 mr-2" />
                    Declare Results
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Post-Declaration Summary */}
        {declared && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Result Summary
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-blue-600 text-2xl font-bold">
                  {contestData.total_winners}
                </div>
                <div className="text-blue-800 font-medium">
                  Winners Declared
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-green-600 text-2xl font-bold">
                  ₹{totalPrizeDistributed.toLocaleString()}
                </div>
                <div className="text-green-800 font-medium">
                  Prize Distributed
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-purple-600 text-2xl font-bold">
                  {Object.keys(contestData?.distribution || { 1: 100 }).length}
                </div>
                <div className="text-purple-800 font-medium">
                  Total Positions
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-orange-600 text-2xl font-bold">
                  {contestData?.joined_count ?? 0}
                </div>
                <div className="text-orange-800 font-medium">
                  Joined Players
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeclareResult;

const getRankColor = (rank) => {
  switch (rank) {
    case 1:
      return "bg-yellow-500 text-white"; // Gold
    case 2:
      return "bg-gray-400 text-white"; // Silver
    case 3:
      return "bg-orange-500 text-white"; // Bronze
    default:
      return "bg-blue-300 text-black"; // Others
  }
};