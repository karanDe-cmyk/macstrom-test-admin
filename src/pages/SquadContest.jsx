import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";

const MAX_TEAMS = 25;

const makeDefaultTeams = () =>
  Array.from({ length: MAX_TEAMS }, (_, i) => {
    const teamNumber = i + 1;
    return {
      id: teamNumber,
      name: `Team ${teamNumber}`,
      seats: Array.from({ length: 4 }, (_, s) => ({
        id: `${teamNumber}-${s + 1}`,
        teamNumber,
        seatNumber: s + 1,
        label: `Seat ${s + 1}`,
        status: "Empty",
        playerId: null,
      })),
    };
  });

/**
 * Map contest.teams object and joinedUsers array into front-end teams.
 * Handles different API shapes:
 * - joinedUsers entries might be { team_id, seat_number, game_username, member_id }
 * - or { team_number, seat_number, username, user_id }
 */
function mapTeamsWithPlayers(contestTeamsObj, joinedUsers = []) {
  const teamNumbers =
    contestTeamsObj && Object.keys(contestTeamsObj).length
      ? Object.keys(contestTeamsObj)
          .map(Number)
          .sort((a, b) => a - b)
      : Array.from({ length: MAX_TEAMS }, (_, i) => i + 1);

  return teamNumbers.map((teamNumber) => {
    const seatsFromContest = (contestTeamsObj &&
      contestTeamsObj[String(teamNumber)]) || [null, null, null, null];

    return {
      id: teamNumber,
      name: `Team ${teamNumber}`,
      seats: seatsFromContest.map((seatVal, idx) => {
        const seatNumber = idx + 1;

        // find player in joinedUsers robustly
        const player =
          Array.isArray(joinedUsers) &&
          joinedUsers.find((u) => {
            const t =
              u.team_id ?? u.team_number ?? u.team ?? u.teamId ?? u.teamNumber;
            const s = u.seat_number ?? u.seat_number ?? u.seatNumber ?? u.seat;
            return Number(t) === Number(teamNumber) && Number(s) === seatNumber;
          });

        const username =
          player?.game_username ||
          player?.username ||
          player?.name ||
          (seatVal &&
            (seatVal.game_username || seatVal.username || seatVal.name)) ||
          "Empty";

        const playerId =
          player?.member_id ?? player?.user_id ?? player?.id ?? null;

        return {
          id: `${teamNumber}-${seatNumber}`,
          teamNumber,
          seatNumber,
          label: `Seat ${seatNumber}`,
          status: username,
          playerId,
        };
      }),
    };
  });
}

export default function SquadContest() {
  const location = useLocation();
  const { id } = useParams(); // /squad/:id
  const [contest, setContest] = useState(location.state?.contest || null);
  const [teams, setTeams] = useState(makeDefaultTeams());
  const [loading, setLoading] = useState(!contest);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null); // { teamNumber, seatNumber }
  const [editingRoom, setEditingRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({
    room_id: "",
    room_password: "",
    room_created_by: "",
  });

  const handleSaveRoom = async () => {
    try {
      await axiosInstance.put(`/squid-contests/${id}/room`, roomForm);
      toast.success("Room details updated successfully");

      // Update local contest data
      setContest((prev) => ({
        ...prev,
        ...roomForm,
      }));
      setEditingRoom(false);
    } catch (err) {
      console.error("Failed to update room:", err);
      toast.error(
        err.response?.data?.message || "Failed to update room details."
      );
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchContestAndJoined = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          if (isMounted) setError("Not authenticated. Please login.");
          return;
        }

        let contestData = contest;
        if (!contestData) {
          if (isMounted) setLoading(true);
          const res = await axiosInstance.get(`/squid-contests/${id}`);
          contestData = res.data?.data ?? res.data;
          if (isMounted) setContest(contestData);
        }

        const joinedRes = await axiosInstance.get(
          `/squid-contests/${id}/joined-users`
        );
        // support shapes: { joined_users: [...] } or { data: [...] } or [...]
        const joinedUsers =
          joinedRes.data?.joined_users ??
          joinedRes.data?.data ??
          joinedRes.data ??
          [];

        const mapped = mapTeamsWithPlayers(contestData?.teams, joinedUsers);
        if (isMounted) setTeams(mapped);
      } catch (err) {
        console.error("fetchContestAndJoined error:", err);
        if (isMounted)
          setError(
            err.response?.data?.message || "Failed to load contest data."
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchContestAndJoined();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, contest]);

  const handleRemoveSeat = async (teamNumber, seatNumber) => {
    try {
      await axiosInstance.delete(
        `/squid-contests/${id}/join/${teamNumber}/${seatNumber}`
      );
      toast.success("Player removed");

      // Refresh latest contest + joined users
      await refreshJoinedUsers();
    } catch (err) {
      console.error("Failed to remove player:", err);
      toast.error("Failed to remove player.");
    }
  };

  const refreshJoinedUsers = async () => {
    try {
      const [contestRes, joinedRes] = await Promise.all([
        axiosInstance.get(`/squid-contests/${id}`),
        axiosInstance.get(`/squid-contests/${id}/joined-users`),
      ]);

      const contestData = contestRes.data?.data ?? contestRes.data;
      setContest(contestData);

      const joinedUsers =
        joinedRes.data?.joined_users ??
        joinedRes.data?.data ??
        joinedRes.data ??
        [];

      const mapped = mapTeamsWithPlayers(contestData?.teams, joinedUsers);
      setTeams(mapped);
    } catch (err) {
      console.error("refreshContestData error:", err);
    }
  };

  if (loading && !contest) {
    return <div className="p-8 text-center">Loading contest details...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
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
        {/* Hero */}
        <div className="bg-white rounded-xl shadow-lg mb-8 overflow-hidden">
          <div className="relative">
            <img
              src={
                contest?.banner_image_url ||
                "https://images.pexels.com/photos/735911/pexels-photo-735911.jpeg"
              }
              alt={contest?.event_name || "Squad Contest"}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{contest?.event_name}</h1>
              <p className="text-lg opacity-90">{contest?.match_description}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Stat
                icon={<Calendar className="w-5 h-5 mr-3 text-blue-500" />}
                label="Schedule"
                value={
                  contest?.match_schedule
                    ? new Date(contest.match_schedule).toLocaleString()
                    : "—"
                }
              />
              <Stat
                icon={<Users className="w-5 h-5 mr-3 text-green-500" />}
                label="Players"
                value={`${contest?.joined_count ?? 0}/${
                  contest?.room_size ?? "—"
                }`}
              />
              <Stat
                icon={<DollarSign className="w-5 h-5 mr-3 text-yellow-500" />}
                label="Entry Fee"
                value={`₹${contest?.joining_fee ?? "—"}`}
              />
              <Stat
                icon={<Trophy className="w-5 h-5 mr-3 text-purple-500" />}
                label="Prize Pool"
                value={contest?.prize_description || "—"}
              />
            </div>

            <div className="flex items-center space-x-4">
              <Tag text={contest?.game || "BGMI"} color="blue" />
              <Tag text={contest?.map || "Erangel"} color="green" />
              <Tag text={contest?.team || "SQUAD"} color="purple" />
            </div>
          </div>
        </div>

        <div className="my-8 bg-white rounded-2xl shadow-xl p-5 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          <div className="flex flex-wrap justify-between">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <span className="inline-block w-2 h-6 bg-purple-600"></span>
              Room Details
            </h2>
            <button
              onClick={() => {
                setRoomForm({
                  room_id: contest?.room_id || "",
                  room_password: contest?.room_password || "",
                  room_created_by: contest?.room_created_by || "",
                });
                setEditingRoom(true);
              }}
              className=" px-5 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200"
            >
              Edit
            </button>
          </div>

          <div className="flex flex-wrap gap-8 text-gray-700 items-center justify-self-start">
            <div>
              <span className="font-medium">Room ID:</span>
              <span className="ml-2">{contest?.room_id || "—"}</span>
            </div>
            <div>
              <span className="font-medium">Room Password:</span>
              <span className="ml-2">{contest?.room_password || "—"}</span>
            </div>
            <div>
              <span className="font-medium">Created By:</span>
              <span className="ml-2">{contest?.room_created_by || "—"}</span>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingRoom && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
              <h2 className="text-lg font-semibold mb-4">Edit Room Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">Room ID</label>
                  <input
                    type="text"
                    value={roomForm.room_id}
                    onChange={(e) =>
                      setRoomForm({ ...roomForm, room_id: e.target.value })
                    }
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Room Password</label>
                  <input
                    type="text"
                    value={roomForm.room_password}
                    onChange={(e) =>
                      setRoomForm({
                        ...roomForm,
                        room_password: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-lg"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-600">Created By</label>
                  <input
                    type="text"
                    value={roomForm.room_created_by}
                    onChange={(e) =>
                      setRoomForm({
                        ...roomForm,
                        room_created_by: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditingRoom(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRoom}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teams */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">
              Team Players ({Math.ceil(contest?.remaining_seats ?? 0)} /{" "}
              {Math.ceil(contest?.room_size ?? 0)} Remaining to join)
            </h2>
            <div className="text-md text-gray-500">
              Total {contest.room_size / 4} teams
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="border-2 rounded-lg p-4 transition-all border-gray-200 bg-gray-50 relative"
              >
                <div className="flex items-center mb-3">
                  <h3 className="font-medium text-gray-900">{team.name}</h3>
                </div>
                <div className="space-y-2">
                  {team.seats.map((s) => (
                    <div
                      key={s.id}
                      className="p-2 rounded border text-sm border-dashed border-gray-300 bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs text-gray-500">
                            {s.label}
                          </span>
                          <div className="text-sm text-black">{s.status}</div>
                        </div>

                        <button
                          className="text-xs text-red-600 hover:underline"
                          onClick={() => {
                            setSelectedSeat({
                              teamNumber: team.id,
                              seatNumber: s.seatNumber,
                            });
                            setShowModal(true);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to={`/squad/${contest.contest_id}/declare-result`}
            className=" px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 "
          >
            Declare Result
          </Link>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Confirm Removal</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove this player from the seat?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                onClick={async () => {
                  if (selectedSeat) {
                    await handleRemoveSeat(
                      selectedSeat.teamNumber,
                      selectedSeat.seatNumber
                    );
                  }
                  setShowModal(false);
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Small helper components */
function Stat({ icon, label, value }) {
  return (
    <div className="flex items-center">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function Tag({ text, color = "gray" }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    purple: "bg-purple-100 text-purple-800",
    gray: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-3 py-1 ${colorMap[color]} rounded-full text-sm font-medium`}
    >
      {text}
    </span>
  );
}
