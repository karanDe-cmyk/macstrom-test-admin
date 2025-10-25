import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Directly hardcoded for now (not recommended for production)
const API_BASE = "https://macstrombattle-api.kglame.com";
const token = localStorage.getItem("authToken") || "";

function WithdrawRequests() {
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/user/withdraw`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data.data);
    } catch (err) {
      console.error("Failed to fetch withdrawals", err);
    }
  };
    const updateStatus = async (withdrawal, status) => {
    const userId = withdrawal.userId;
    if (!userId) {
        console.error("No userId found for withdrawal:", withdrawal);
        return;
    }

    try {
    await axios.put(
        `${API_BASE}/api/user/withdraw/user/${userId}/status`,
        { status },
        {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        }
    );

    setRequests((prev) =>
        prev.map((req) => (req.userId === userId ? { ...req, status } : req))
    );



    toast.success(`Withdrawal ${status} successfully!`);
    } catch (err) {
    console.error(`Failed to update status for userId ${userId}`, err);
    const message = err.response?.data?.message || "Something went wrong";
    toast.error(message);
    if (err.response) {
        console.error("Status:", err.response.status);
        console.error("Response:", err.response.data);
    }
    }

    };



    useEffect(() => {
    fetchRequests(); // initial fetch
    }, []);

    useEffect(() => {
    setCurrentPage(1); // reset to page 1 when filters change
    }, [searchQuery, statusFilter]);


    const filteredRequests = requests.filter((req) => {
    const name = req.User?.user_name?.toLowerCase() || "";
    const userId = req.userId?.toString() || "";
    const dateObj = new Date(req.createdAt);
    const dateStr = dateObj.toLocaleDateString("en-IN");
    const status = req.status?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    const matchesSearch =
        name.includes(query) ||
        userId.includes(query) ||
        dateStr.includes(query) ||
        status.includes(query);

    const matchesStatus = statusFilter ? status === statusFilter : true;

    const matchesDate = selectedDate
        ? dateObj.toISOString().split("T")[0] === selectedDate
        : true;

    return matchesSearch && matchesStatus && matchesDate;
    });



    const totalPages = Math.ceil(filteredRequests.length / entriesPerPage);
    const indexOfLast = currentPage * entriesPerPage;
    const indexOfFirst = indexOfLast - entriesPerPage;
    const currentRequests = filteredRequests.slice(indexOfFirst, indexOfLast);



  return (
    <div className="min-h-screen w-full bg-zinc-200 dark:bg-zinc-900 p-4 sm:p-6">
        <div className="max-w-screen-xl mx-auto w-full">
        <ToastContainer position="top-right" autoClose={2000} />
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold dark:text-white">
            Wallet Management
            </h1>
            <button
            onClick={fetchRequests}
            className="bg-black text-white px-4 py-2 rounded hover:bg-zinc-800"
            >
            ⟳ Refresh
            </button>
        </div>

            <div className="mb-4 flex flex-col sm:flex-row gap-4 items-center">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, user ID, status or date..."
                className="w-full sm:max-w-sm px-3 py-2 rounded border border-gray-300
                        bg-white text-black placeholder-gray-500
                        dark:bg-zinc-800 dark:text-white dark:placeholder-gray-400
                        dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300
                        dark:bg-zinc-800 dark:text-white dark:border-gray-600"
            >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
            </select>


            {/* DATE PICKER */}
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded border border-gray-300
                        dark:bg-zinc-800 dark:text-white dark:border-gray-600"
            />

            {/* ENTRIES PER PAGE */}
            <select
                value={entriesPerPage}
                onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
                }}
                className="px-3 py-2 rounded border border-gray-300
                        dark:bg-zinc-800 dark:text-white dark:border-gray-600"
            >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
            </select>
            </div>
        </div>


      <div className="bg-white dark:bg-zinc-800 rounded shadow p-4 overflow-x-auto">
        <table className="min-w-full table-auto text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-white">
            <tr>
                <th className="p-3 text-left">Sl No.</th>
                <th className="p-3 text-left">User</th>
                <th className="p-3 text-left">User ID</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Method</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Time</th>
                <th className="p-3 text-center">Actions</th>
            </tr>
            </thead>
            <tbody>
            {currentRequests.map((req, index) => (
                <tr key={req.id} className="border-t bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100">
                <td className="p-3">{indexOfFirst + index + 1}</td>
                <td className="p-3">{req.User?.user_name || `User ${req.userId}`}</td>
                <td className="p-3">{req.userId}</td>
                <td className="p-3">₹{req.amount}</td>
                <td className="p-3">{req.payment_method || "N/A"}</td>
                <td className="p-3">
                    <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                        req.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : req.status === "rejected"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                    >
                    {req.status}
                    </span>
                </td>
                <td className="p-3">
                    {new Date(req.createdAt).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    })}
                </td>
                <td className="p-3 text-center">
                <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-3 w-full">
                    <button
                    className="w-full sm:w-28 bg-green-400 text-white px-4 py-2 rounded-md font-medium text-sm transition duration-200 hover:bg-green-600 hover:shadow"
                    onClick={() => updateStatus(req, "approved")}
                    disabled={req.status !== "pending"}
                    >
                    Approve
                    </button>
                    <button
                    className="w-full sm:w-28 bg-red-400 text-white px-4 py-2 rounded-md font-medium text-sm transition duration-200 hover:bg-red-600 hover:shadow"
                    onClick={() => updateStatus(req, "rejected")}
                    disabled={req.status === "rejected"}
                    >
                    Reject
                    </button>
                </div>
                </td>

                </tr>
            ))}

            {requests.length === 0 && (
                <tr>
                <td colSpan="8" className="text-center text-zinc-500 py-6">
                    No withdrawal requests found.
                </td>
                </tr>
            )}
            </tbody>
        </table>

        <div className="flex justify-center mt-4 space-x-2">
            <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
            >
            Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => (
            <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-zinc-400 text-white" : ""
                }`}
            >
                {i + 1}
            </button>
            ))}

            <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
            >
            Next
            </button>
        </div>
        </div>

    </div>
  );
}

export default WithdrawRequests;
