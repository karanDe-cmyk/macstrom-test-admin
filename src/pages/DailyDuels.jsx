import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";

function DailyDuels() {
  const [tab, setTab] = useState("pending");
  const [selectedDuel, setSelectedDuel] = useState(null); 
  const [duels, setDuels] = useState({ pending: [], verified: [], webhooks: [] });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken") || "your_default_token_here"; // Replace with your actual token or logic to get it
  const completedToday = duels.verified.filter((d) => {
    const date = d.completedAt ? new Date(d.completedAt) : null;
    if (!date) return false;
    return date.toDateString() === new Date().toDateString();
  }).length;

  useEffect(() => {
    const fetchDuels = async () => {
      try {
        const pendingRes = await axios.get("http://localhost:5000/api/duels?status=pending", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const verifiedRes = await axios.get("http://localhost:5000/api/duels?status=verified", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const combined = [...verifiedRes.data, ...pendingRes.data];
        const webhooks = combined
          .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
          .map((d, i) => ({
            duelId: i + 1,
            event: d.title,
            winner: d.winner || "N/A",
            timestamp: d.completedAt || d.startTime,
            status: d.status
          }));


        setDuels({
          pending: pendingRes.data,
          verified: verifiedRes.data,
          webhooks
        });
      } catch (err) {
        console.error("Error fetching duels:", err);
      }
    };

    fetchDuels();
  }, []);





  
const renderSummaryStats = () => {
  const active = duels.pending.length;

  console.log("🧪 Verified Duels CompletedAt:");
  duels.verified.forEach((d, i) => {
    console.log(
      `#${i + 1}: completedAt=${d.completedAt}, startTime=${d.startTime}, status=${d.status}`
    );
  });

  const completedToday = duels.verified.filter((d) => {
    const duelDate = new Date(d.completedAt || d.startTime)
      .toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const today = new Date()
      .toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    return duelDate === today;
  }).length;


  const earnings = duels.verified.reduce((sum, d) => {
    const entry = Number(d.entryFee) || 0;
    const joined = Number(d.joinedPlayers) || 0;
    return sum + 0.7 * entry * joined;
  }, 0);


  const pendingVerifications = duels.pending.filter((d) => d.status?.toLowerCase() === "pending").length;


  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow text-center">
        <p className="text-sm text-gray-500">Active Duels</p>
        <p className="text-2xl font-bold dark:text-white">{active}</p>
      </div>
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow text-center">
        <p className="text-sm text-gray-500">Completed Today</p>
        <p className="text-2xl font-bold text-green-600">{completedToday}</p>
      </div>
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow text-center">
        <p className="text-sm text-gray-500">Total Earnings</p>
        <p className="text-2xl font-bold dark:text-white">₹{earnings.toFixed(0)}</p>
      </div>
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 shadow text-center">
        <p className="text-sm text-gray-500">Pending Verification</p>
        <p className="text-2xl font-bold text-yellow-500">{pendingVerifications}</p>
      </div>
    </div>
  );
};
const renderCard = (duel) => {
  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/duels/${duel.id}`, 
        { status: "verified" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedDuel = res.data;
      setDuels((prev) => {
        const updatedPending = prev.pending.filter((d) => d.id !== updatedDuel.id);
        const updatedVerified = [...prev.verified, updatedDuel];
        return { ...prev, pending: updatedPending, verified: updatedVerified };
      });
      toast.success("Duel verified successfully!");
    } catch (err) {
      console.error("Failed to verify duel:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      key={duel.id}
      className="bg-white dark:bg-zinc-800 rounded-lg shadow-md p-4 flex flex-col justify-between h-full"
    >
      {/* Banner */}
      {duel.banner && (
        <img
          src={`http://localhost:5000/api/${duel.banner}`}
          alt="Duel Banner"
          className="w-full h-40 object-cover rounded mb-3"
        />
      )}

      {/* Duel Info */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{duel.title}</h2>
          <span className="text-xs font-medium px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-white">
            {duel.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
          <p><strong>Type:</strong> {duel.type}</p>
          <p><strong>Players:</strong> {duel.joinedPlayers} 👥 </p>
          <p><strong>Entry Fee:</strong> ₹{duel.entryFee}</p>
          <p><strong>Prize Pool:</strong> 🏆 ₹{duel.prizePool}</p>
          <p className="col-span-2">
            <strong>Start Time:</strong>{" "}
            {new Date(duel.startTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
          </p>
          {duel.winner && (
            <p className="col-span-2">
              <strong>Winner:</strong> {duel.winner}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-3 flex gap-2 flex-wrap">
        <button
          className="px-3 py-1 text-sm bg-gray-200 rounded"
          onClick={() => setSelectedDuel(duel)}
        >
          View
        </button>

        <button
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded"
          onClick={() => navigate(`/admin/duels/createduel?id=${duel.id}`)}
        >
          Edit
        </button>

        <button
          className="px-3 py-1 text-sm bg-red-500 text-white rounded"
          onClick={async () => {
            if (!window.confirm("Delete this duel?")) return;
            await axios.delete(`http://localhost:5000/api/duels/${duel.id}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Duel deleted!");
            setDuels(prev => ({
              ...prev,
              pending: prev.pending.filter(d => d.id !== duel.id),
              verified: prev.verified.filter(d => d.id !== duel.id),
            }));
          }}
        >
          Delete
        </button>
        
        {duel.status?.toLowerCase() === "pending" && (
          <button
            className="px-3 py-1 text-sm bg-green-500 text-white rounded"
            onClick={handleVerify}
          >
            Verify
          </button>
        )}

      </div>
    </div>
  );
};
  const renderWebhooksTable = () => (
    <div className="w-full px-2 sm:px-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-zinc-700">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-auto text-sm text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="border-b dark:border-zinc-700">
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-white">Duel ID</th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-white">Event</th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-white">Winner</th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-white">Timestamp</th>
                <th className="px-4 py-2 font-medium text-zinc-700 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {duels.webhooks.map((event, idx) => (
                <tr key={idx} className="border-b dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700">
                  <td className="px-4 py-2 dark:text-white">{event.duelId}</td>
                  <td className="px-4 py-2 dark:text-white">{event.event}</td>
                  <td className="px-4 py-2 dark:text-white">{event.winner}</td>
                  <td className="px-4 py-2 dark:text-white">
                    {new Date(event.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                  </td>
                  <td className={`px-4 py-2 font-semibold ${
                    event.status?.toLowerCase() === "verified" ? "text-green-600" : "text-yellow-600"
                  }`}>
                    {event.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden flex flex-col gap-3">
          {duels.webhooks.map((event, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 dark:border-zinc-700 p-3 bg-gray-50 dark:bg-zinc-900">
              <p className="text-xs text-gray-500">Duel ID</p>
              <p className="font-medium dark:text-white mb-1">{event.duelId}</p>
              
              <p className="text-xs text-gray-500">Event</p>
              <p className="dark:text-white mb-1">{event.event}</p>

              <p className="text-xs text-gray-500">Winner</p>
              <p className="dark:text-white mb-1">{event.winner}</p>

              <p className="text-xs text-gray-500">Timestamp</p>
              <p className="dark:text-white mb-1">
                {new Date(event.timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
              </p>

              <p className="text-xs text-gray-500">Status</p>
              <p className={`font-semibold ${
                event.status?.toLowerCase() === "verified" ? "text-green-600" : "text-yellow-600"
              }`}>
                {event.status}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );



console.log("Tab:", tab);
console.log("pending duels:", duels.pending);
console.log("Completed duels:", duels.verified);  

  return (
    <div className="p-6 min-h-screen">
      {/* Header + Button */}
    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Daily Duels
        </h1>
        <h5 className="text-sm text-gray-500 dark:text-gray-100 mt-1">
          Manage daily duel events and monitor results
        </h5>
      </div>

      {tab !== "webhooks" && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/duels/createduel")}
              className="bg-black text-white px-4 py-2 rounded hover:bg-zinc-700"
            >
              + Create Duel
            </button>
          </div>
        )}
      </div>

      {/* Show under heading for webhooks */}
      {tab === "webhooks" && (
        <div className="mb-4">
          <button
            onClick={() => navigate("/admin/duels/createduel")}
            className="bg-black text-white px-4 py-2 rounded hover:bg-zinc-700"
          >
            + Create Duel
          </button>
        </div>
      )}

        {renderSummaryStats()}

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["pending", "verified", "webhooks"].map((t) => (
          <button
            key={t}
            className={`px-4 py-2 rounded ${
              tab === t
                ? "bg-zinc-800 text-white"
                : "bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white"
            }`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="flex items-center gap-2 text-blue-600 mb-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
          <span>Processing...</span>
        </div>
      )}

      {successMsg && (
        <p className="text-green-600 font-medium mb-2"> {successMsg}</p>
      )}

      {/* Content */}
      <div className="space-y-4">
        {/* Cards or webhook table here */}
      </div>


      {/* Content */}
      <div className="space-y-4">
        {tab === "pending" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {duels.pending.map(renderCard)}
          </div>
        )}

        {tab === "verified" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {[...duels.verified]
              .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
              .map(renderCard)}
          </div>
        )}


        {tab === "webhooks" && renderWebhooksTable()}

      </div>

      {/* View Details Modal */}
      {selectedDuel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 transition-opacity duration-200 ease-out">
         <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg w-full max-w-md space-y-4 transform transition-transform duration-300 scale-100">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Duel Details</h2>
            <div className="text-sm text-gray-800 dark:text-gray-100 space-y-1">
              <p><strong>Title:</strong> {selectedDuel.title}</p>
              <p><strong>Type:</strong> {selectedDuel.type}</p>
              <p><strong>Players:</strong> {selectedDuel.players}</p>
              <p><strong>Entry Fee:</strong> ₹{selectedDuel.entryFee}</p>
              <p><strong>Prize Pool:</strong> ₹{selectedDuel.prizePool}</p>
              <p><strong>Status:</strong> {selectedDuel.status}</p>
              <p>
                <strong>Start Time:</strong>{" "}
                {new Date(selectedDuel.startTime).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                })}
              </p>
              {selectedDuel.winner && <p><strong>Winner:</strong> {selectedDuel.winner}</p>}
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setSelectedDuel(null)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-zinc-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />

    </div>
  );
}



export default DailyDuels;
