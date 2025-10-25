import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  User,
  Crown,
  Medal,
  ChevronDown,
  ChevronsRight,
} from "lucide-react";
import axiosInstance from "../utils/axios";

// Helper function to get the appropriate prize icon for a rank
const getPrizeIcon = (rank) => {
  switch (rank) {
    case 1:
      return <Crown className="w-5 h-5 text-yellow-400" />;
    case 2:
      return <Medal className="w-5 h-5 text-slate-300" />;
    case 3:
      return <Trophy className="w-5 h-5 text-yellow-600" />;
    default:
      return <Trophy className="w-5 h-5 text-gray-400" />;
  }
};

export default function MegaContest() {
  const location = useLocation();
  const { id } = useParams();
  const [contest, setContest] = useState(location.state?.contest || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openGroup, setOpenGroup] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchContestAndJoined = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          if (isMounted) setError("Not authenticated. Please login.");
          return;
        }

        if (isMounted) setLoading(true);

        let contestData = contest;
        if (!contestData) {
          const res = await axiosInstance.get(`/mega-contests/${id}`);
          // ✅ Corrected data path: access 'contest' object from the response
          contestData = res.data?.data?.contest ?? res.data?.contest;
        }

        if (isMounted) setContest(contestData);
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
  }, [id, contest]);

  // Function to toggle the open/closed state of a team group
  const toggleGroup = (groupKey) => {
    setOpenGroup(openGroup === groupKey ? null : groupKey);
  };

  if (loading && !contest) {
    return <div className="p-8 text-center">Loading contest details...</div>;
  }
  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!contest) {
    return <div className="p-8 text-center">Contest not found.</div>;
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
              alt={contest?.event_name || "Mega Contest"}
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
                // ✅ Corrected to use limit_users from the API response
                value={`${contest?.joined_count ?? 0}/${
                  contest?.limit_users ?? "—"
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
                // ✅ Corrected to use prize_pool and total_winners from API
                value={`₹${contest?.prize_pool} | ${
                  contest.total_winners || "0"
                } winners`}
              />
            </div>
            <div className="flex items-center space-x-4">
              {/* ✅ Corrected to use BGMI as a fallback since game is empty */}
              <Tag text={contest?.game || "BGMI"} color="blue" />
              <Tag text={contest?.map || "Erangel"} color="green" />
              {/* ✅ Added a new Tag for team size */}
              <Tag
                text={`Teams: ${
                  Object.keys(contest?.groups?.A?.teams || {}).length
                }`}
                color="purple"
              />
            </div>
          </div>
        </div>

        {/* Prize Distribution Section */}
        <div className="bg-white p-6 rounded-xl border border-white/70 mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" /> Prize Distribution
          </h2>
          <div className="space-y-4">
            {contest.distribution.map((prize, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-200"
              >
                <div className="flex items-center gap-4">
                  {getPrizeIcon(prize.rank)}
                  <span className="text-lg font-semibold">
                    Rank {prize.rank}
                  </span>
                </div>
                <span className="text-lg font-bold text-blue-700">
                  {prize.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Section - Collapsible Accordion */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users size={20} className="text-indigo-400" /> Contest Teams
          </h2>
          {Object.entries(contest.groups).map(([groupKey, groupData]) => (
            <div
              key={groupKey}
              className="bg-gray-100 rounded-xl border border-slate-700"
            >
              <button
                onClick={() => toggleGroup(groupKey)}
                className="w-full text-left p-4 flex items-center justify-between  rounded-t-xl"
              >
                <span className="text-lg font-bold">Group {groupKey}</span>
                <ChevronDown
                  className={`transform transition-transform duration-300 ${
                    openGroup === groupKey ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openGroup === groupKey ? "max-h-[1000px]" : "max-h-0"
                }`}
              >
                <div className="p-4 border-t border-slate-700">
                  {Object.entries(groupData.teams).map(([teamId, players]) => (
                    <div
                      key={teamId}
                      className="bg-white/70 rounded-lg p-4 mb-4 last:mb-0 shadow-md"
                    >
                      <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-blue-500">
                        <ChevronsRight size={18} /> Team {teamId}
                      </h3>
                      <div className="space-y-2 text-sm">
                        {players.map((player) => (
                          <div
                            key={player.playerId}
                            className="flex items-center gap-2"
                          >
                            <User size={16} className="text-slate-400" />
                            <span>Player ID: {player.playerId}</span>
                            <span className="ml-auto text-slate-400">
                              Points:{" "}
                              <span className="text-white font-medium">
                                {player.points}
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            to={`/mega/${contest.contest_id}/declare-result`}
            className=" px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 "
          >
            Declare Result
          </Link>
        </div>
      </div>
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
