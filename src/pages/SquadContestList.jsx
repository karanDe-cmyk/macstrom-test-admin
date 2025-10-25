import React, { useState, useEffect } from "react";
import {
  Plus,
  Filter as FilterIcon,
  Calendar,
  Users,
  DollarSign,
  Trophy,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axios";



function SquadContestsList() {
  const [filter, setFilter] = useState("All");
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingContests, setDeletingContests] = useState(new Set());

  // Fetch contests from API
  useEffect(() => {
    const fetchContests = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setError("You must be logged in to view contests.");
          setLoading(false);
          return;
        }
        setLoading(true);
        const res = await axiosInstance.get("/squid-contests");
        setContests(res.data || []); // Adjust based on API response format
      } catch (err) {
        console.error(err);
        setError("Failed to load contests");
      } finally {
        setLoading(false);
      }
    };

    fetchContests();
  }, []);

  // Delete contest function
  const handleDeleteContest = async (contestId, e) => {
    e.preventDefault(); // Prevent link navigation
    e.stopPropagation(); // Stop event bubbling
    
    if (!window.confirm("Are you sure you want to delete this contest?")) {
      return;
    }

    setDeletingContests(prev => new Set([...prev, contestId]));
    
    try {
      await axiosInstance.delete(`/squid-contests/delete/${contestId}`);
      
      // Remove the deleted contest from the state
      setContests(prevContests => 
        prevContests.filter(contest => contest.contest_id !== contestId)
      );
      
      // Show success message (optional)
      alert("Contest deleted successfully!");
      
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete contest. Please try again.");
    } finally {
      setDeletingContests(prev => {
        const newSet = new Set(prev);
        newSet.delete(contestId);
        return newSet;
      });
    }
  };

  const filteredContests = contests
    .filter(contest => {
      // If "All" is selected, show all contests including cancelled ones
      if (filter === "All") {
        return true; // Show all contests
      }
      // For other filters, apply specific filtering
      return contest.match_status && 
             contest.match_status.toLowerCase() === filter.toLowerCase();
    });

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Squad Contests
            </h1>
            <p className="text-gray-600">
              Join competitive Squad tournaments and win prizes
            </p>
          </div>
          <Link
            to="/squad/create"
            className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Contest
          </Link>
        </div>

        {/* Filter */}
        <div className="flex items-center mb-6">
          <FilterIcon className="w-5 h-5 mr-3 text-gray-500" />
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
                className={`px-4 py-2 my-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === status.value
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
                // Define status priority (live first, then upcoming, then others)
                const getPriority = (status) => {
                  status = (status || '').toLowerCase();
                  if (status === 'live') return 0;
                  if (status === 'upcoming') return 1;
                  if (status === 'completed') return 2;
                  return 3; // for any other status
                };

                // First sort by status priority
                const statusDiff = getPriority(a.match_status) - getPriority(b.match_status);
                if (statusDiff !== 0) return statusDiff;

                // If status is the same, sort by match schedule (nearest first)
                return new Date(a.match_schedule) - new Date(b.match_schedule);
              })
              .map((contest) => (
                <div
                  key={contest.contest_id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
                >
                  <Link
                    to={`/squad/${contest.contest_id}`}
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
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            contest.match_status === "live"
                              ? "bg-green-100 text-green-800"
                              : contest.match_status === "completed"
                              ? "bg-gray-100 text-gray-800"
                              : contest.match_status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {contest.match_status || "Upcoming"}
                        </span>
                      </div>

                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{contest.event_name}</h3>
                      <button
                        onClick={(e) => handleDeleteContest(contest.contest_id, e)}
                        disabled={deletingContests.has(contest.contest_id)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingContests.has(contest.contest_id) ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {contest.match_description}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                          {new Date(contest.match_schedule).toLocaleString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          {contest.room_size || 0} Players
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 text-yellow-500" />₹
                          {contest.joining_fee} Entry
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Trophy className="w-4 h-4 mr-2 text-zinc-500" />
                          {contest.prize_description}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          {contest.game} • {contest.map}
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {contest.match_sponsor}
                        </div>
                      </div>
                    </div>
                  </Link>
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

export default SquadContestsList;