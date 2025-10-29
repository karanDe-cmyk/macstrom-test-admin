import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import RoomDetailsCard from "../components/RoomDetailsCard";
import PlayersTable from "../components/PlayersTable";
import PrizeDistributionTable from "../components/PrizeDistributionTable";

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

export default function ContestDetail() {
  const [contest, setContest] = useState(null);
  const [prizeDistribution, setPrizeDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [roomForm, setRoomForm] = useState({
    room_id: "",
    room_password: "",
    room_created_by: "",
  });
  // API states and functions are now handled in their respective components
  const { id: contestId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContest = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");
        // Fetch contest, prize, and room first
        const [contestRes, prizeRes, roomRes] = await Promise.all([
          fetch(
            `http://localhost:5000/api/contest/${contestId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `http://localhost:5000/api/prize/${contestId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          fetch(
            `http://localhost:5000/api/contest/admin/${contestId}/room`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        if (!contestRes.ok) throw new Error("Failed to load contest");
        const contestData = await contestRes.json();
        setContest(contestData);
        if (prizeRes.ok) setPrizeDistribution(await prizeRes.json());
        if (roomRes.ok) {
          const room = await roomRes.json();
          setRoomForm({
            room_id: room.room_id || "",
            room_password: room.room_password || "",
            room_created_by: room.room_created_by || "",
          });
        }
        // Only fetch solo players if contest is solo
        if (contestData?.team?.toLowerCase() === "solo") {
          const soloRes = await fetch(
            `http://localhost:5000/api/match/${contestId}/participants`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!soloRes.ok) {
            console.error('Failed to fetch solo players');
          }
        }
      } catch (err) {
        setError(err.message || "Failed to load contest");
      } finally {
        setLoading(false);
      }
    };
    fetchContest();
  }, [contestId]);

  const handleSaveRoom = async (roomData) => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `http://localhost:5000/api/contest/${contestId}/room`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(roomData),
        }
      );
      setRoomForm(roomData);
    } catch (err) {
      throw new Error(err.message || "Failed to update room details");
    }
  };

  const handleRemovePlayer = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      await fetch(
        `http://localhost:5000/api/contest/${contestId}/remove-player/${userId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      // Update the local state to remove the player
      setContest(prevContest => ({
        ...prevContest,
        joined_users: prevContest.joined_users.filter(
          p => (p.userId || p.user_id || p.id) !== userId
        )
      }));
    } catch (err) {
      throw new Error(err.message || "Failed to remove player");
    }
  };

  if (loading)
    return <div className="p-8 text-center">Loading contest details...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!contest)
    return (
      <div className="p-8 text-center text-red-600">Contest not found</div>
    );

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6 justify-between">
          <button
            type="button"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => navigate(-1)}
            aria-label="Back to contests"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
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
              alt={contest?.event_name || "Contest"}
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
                icon={
                  <svg
                    className="w-5 h-5 mr-3 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                }
                label="Schedule"
                value={
                  contest?.match_schedule
                    ? new Date(contest.match_schedule).toLocaleString()
                    : "—"
                }
              />
              <Stat
                icon={
                  <svg
                    className="w-5 h-5 mr-3 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V7a4 4 0 00-8 0v2a4 4 0 00-3 3.87V18a2 2 0 002 2h10a2 2 0 002-2v-2.13A4 4 0 0017 13z"
                    />
                  </svg>
                }
                label="Players"
                value={`${contest?.joined_count ?? 0}/${
                  contest?.room_size ?? "—"
                }`}
              />
              <Stat
                icon={
                  <svg
                    className="w-5 h-5 mr-3 text-yellow-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 7v7"
                    />
                  </svg>
                }
                label="Entry Fee"
                value={`₹${contest?.joining_fee ?? "—"}`}
              />
              <Stat
                icon={
                  <svg
                    className="w-5 h-5 mr-3 text-purple-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 21h8M12 17v4m0-4a4 4 0 100-8 4 4 0 000 8zm0-8V3m0 4v4"
                    />
                  </svg>
                }
                label="Prize Pool"
                value={
                  contest?.prize_description || `₹${contest?.prize_pool || "—"}`
                }
              />
            </div>
            <div className="flex items-center space-x-4">
              <Tag text={contest?.game || "Game"} color="blue" />
              <Tag text={contest?.map || "Map"} color="green" />
              <Tag text={contest?.team || "TEAM"} color="purple" />
            </div>
          </div>
        </div>

        <RoomDetailsCard 
        roomData={roomForm}
        onSave={handleSaveRoom}
      />

      <PlayersTable 
        players={contest?.joined_users}
        onRemovePlayer={handleRemovePlayer}
      />

      <PrizeDistributionTable
        prizes={prizeDistribution}
      />

        {/* Actions */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
          <Link
            to={`/solo/${contest.id}/declare-result`}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
          >
            Declare Result
          </Link>
        </div>
      </div>
    </div>
  );
}
