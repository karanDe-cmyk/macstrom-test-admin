import { Calendar, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDisplayDate } from "../utils/dateUtils";
import axiosInstance from "../utils/axios";

function ContestList() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [deletingContestId, setDeletingContestId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContests = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("authToken");

        const { data } = await axiosInstance.get("/contest", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setContests(data || []);
      } catch (err) {
        console.error("❌ Error fetching contests:", err);
        setError(err.response?.data?.message || err.message || "Failed to load contests");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  const handleDeleteContest = async (contestId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Are you sure you want to delete this contest? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingContestId(contestId);
      const token = localStorage.getItem("authToken");

      await axiosInstance.delete(`/contest/${contestId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Remove deleted contest from UI immediately
      setContests(prev => prev.filter(contest => contest.id !== contestId));

      alert("✅ Contest deleted successfully!");
    } catch (err) {
      console.error("❌ Delete contest error:", err);
      alert(`Failed to delete contest: ${err.response?.data?.message || err.message}`);
    } finally {
      setDeletingContestId(null);
    }
  };


  const filteredContests = contests
    .filter(contest => {
      const status = contest.match_status?.toLowerCase();
      // If a specific filter is selected, show only that status
      if (filter !== "All") {
        return status === filter.toLowerCase();
      }
      // For "All" filter, show all contests including cancelled ones
      return true;
    });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              All Contests
            </h1>
            <p className="text-gray-600">
              Join competitive tournaments and win prizes
            </p>
          </div>
          <button
            onClick={() => navigate("/solo/create")}
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            Create Contest
          </button>
        </div>

        {/* Filter */}
        <div className="flex items-center mb-6">
          <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-7 7V21a1 1 0 01-2 0v-7.293l-7-7A1 1 0 013 6V4z" /></svg>
          <div className="flex flex-wrap space-x-4">
            {[
              { label: "All", value: "All" },
              { label: "Live", value: "live" },
              { label: "Upcoming", value: "upcoming" },
              { label: "Completed", value: "completed" },
              { label: "Cancelled", value: "cancelled" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={`px-4 py-2 my-1 rounded-lg text-sm font-medium transition-colors ${filter === status.value
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading & Error */}
        {loading && (
          <div className="text-center text-gray-500">Loading contests...</div>
        )}
        {error && <div className="text-center text-red-500">{error}</div>}

        {/* Contest Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContests
              .slice()
              .sort((a, b) => {
                // Sort by status priority
                const getPriority = (status) => {
                  status = (status || '').toLowerCase();
                  if (status === 'live') return 0;
                  if (status === 'upcoming') return 1;
                  if (status === 'completed') return 2;
                  return 3;
                };

                const prioA = getPriority(a.match_status);
                const prioB = getPriority(b.match_status);

                if (prioA !== prioB) return prioA - prioB;

                // If same status, sort by schedule (nearest first for live/upcoming, latest first for others)
                const dateA = new Date(a.match_schedule?.replace(/,/g, ''));
                const dateB = new Date(b.match_schedule?.replace(/,/g, ''));

                // For live and upcoming, show nearest first
                if (prioA <= 1) return dateA - dateB;
                // For completed and others, show latest first
                return dateB - dateA;
              })
              .map((contest) => (
                <div
                  key={contest.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative group"
                >
                  <Link
                    to={`/solo/${contest.id}`}
                    state={{ contest }}
                    className="block"
                  >
                    <div className="relative">
                      <img
                        src={
                          contest.banner_image_url ||
                          "https://via.placeholder.com/400x200"
                        }
                        alt={contest.event_name}
                        className="w-full h-48 object-cover rounded-t-xl"
                      />
                      <div className="absolute top-4 left-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${contest.match_status === "live"
                              ? "bg-green-100 text-green-800"
                              : contest.match_status === "completed"
                                ? "bg-gray-100 text-gray-800"
                                : contest.match_status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                        >
                          {contest.match_status ? contest.match_status.charAt(0).toUpperCase() + contest.match_status.slice(1) : "Upcoming"}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {contest.event_name}
                        </h3>
                        <button
                          onClick={(e) => handleDeleteContest(contest.id, e)}
                          disabled={deletingContestId === contest.id}
                          className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deletingContestId === contest.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {contest.match_description}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        {formatDisplayDate(contest.match_schedule)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {contest.game} {contest.map ? `• ${contest.map}` : ""}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {contest.match_sponsor}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Delete Button
                  <button
                    onClick={(e) => handleDeleteContest(contest.id, e)}
                    disabled={deletingContestId === contest.id}
                    className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                    title="Delete Contest"
                  >
                    {deletingContestId === contest.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button> */}
                </div>
              ))}
            {filteredContests.length === 0 && (
              <div className="col-span-full text-center text-gray-500">
                No contests found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ContestList;