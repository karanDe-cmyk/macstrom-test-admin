import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";

const ITEMS_PER_PAGE = 10;

const LoginHistory = () => {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchLoginHistory();
  }, [currentPage]);

  const fetchLoginHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axiosInstance.get(
        `/auth/admin/login-history?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );

      const apiData = response.data;

      setLoginHistory(apiData.data || []);
      setTotalItems(apiData.total || 0);
      setTotalPages(
        Math.ceil((apiData.total || 0) / (apiData.limit || ITEMS_PER_PAGE))
      );
    } catch (err) {
      setError("Failed to fetch login history");
      console.error("Error fetching login history:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    // Use 'en-US' or a locale that suits your audience
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return "Unknown";
    if (userAgent.includes("Postman")) return "API Client (Postman)";
    if (userAgent.includes("Edg")) return "Edge";
    if (userAgent.includes("Chrome") && !userAgent.includes("Edg"))
      return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari") && !userAgent.includes("Chrome"))
      return "Safari";
    return "Other Browser";
  };

  const getDeviceType = (userAgent) => {
    if (!userAgent) return "Unknown Device";
    if (userAgent.includes("Postman")) return "API Client";
    if (
      userAgent.includes("Mobile") ||
      userAgent.includes("Android") ||
      userAgent.includes("iPhone")
    )
      return "Mobile";
    if (userAgent.includes("iPad") || userAgent.includes("Tablet"))
      return "Tablet";
    if (userAgent.includes("Windows")) return "Windows Desktop";
    if (userAgent.includes("Macintosh") || userAgent.includes("Mac OS"))
      return "Mac Desktop";
    if (userAgent.includes("Linux")) return "Linux Desktop";
    return "Desktop";
  };

  // --- Pagination Handlers ---

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px] bg-white rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-md">
        <div className="flex items-start">
          <div className="text-red-600 flex-shrink-0 mt-0.5">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-red-800">
              Connection Error
            </h3>
            <p className="text-red-700 mt-1 text-sm">
              {error}. Please try again.
            </p>
            <button
              onClick={fetchLoginHistory}
              className="mt-3 bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition duration-150 shadow-sm"
            >
              Retry Fetching
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Component Render ---
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-gray-100/50 dark:shadow-gray-900/50 transition duration-300 m-5">
  {/* Header */}
  <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between sm:items-center">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight mb-2 sm:mb-0">
    Login History
    </h2>
    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-700 px-3 py-1.5 rounded-full">
      Total Sessions:{" "}
      <span className="font-semibold text-gray-700 dark:text-gray-200">{totalItems}</span>
    </div>
  </div>

  {/* Table/List Container */}
  <div className="overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 hidden sm:table">
      {" "}
      {/* Hidden on mobile, shown on SM+ */}
      <thead className="bg-gray-50/70 dark:bg-gray-700/70">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Device & Browser
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            IP Address
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Login Time
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Expires At
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
        {loginHistory.map((session) => {
          const isActive = new Date(session.expiresAt) > new Date();
          return (
            <tr
              key={session.id}
              className="hover:bg-indigo-50/30 dark:hover:bg-indigo-900/20 transition duration-100"
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {/* Device Icon */}
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                    {getDeviceType(session.userAgent).includes("Mobile") ||
                    getDeviceType(session.userAgent).includes("Tablet") ? (
                      <svg
                        className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {getDeviceType(session.userAgent)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {getBrowserInfo(session.userAgent)}
                    </div>
                    {session.deviceId && (
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        ID: {session.deviceId}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                {session.ipAddress}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {formatDate(session.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {formatDate(session.expiresAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                    isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  {isActive ? "Active" : "Expired"}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>

  {/* Mobile-Specific List View (Visible below SM size) */}
  <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700 px-6 pt-4 pb-1">
    {loginHistory.map((session) => {
      const isActive = new Date(session.expiresAt) > new Date();
      return (
        <div key={session.id} className="py-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                {/* Simplified Mobile Icon */}
                <svg
                  className="h-5 w-5 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 17l-3-3m0 0l3-3m-3 3h12a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <div className="text-base font-semibold text-gray-800 dark:text-white">
                  {getDeviceType(session.userAgent)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getBrowserInfo(session.userAgent)} @ {session.ipAddress}
                </div>
              </div>
            </div>
            <span
              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                isActive
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}
            >
              {isActive ? "Active" : "Expired"}
            </span>
          </div>
            <div className="py-3 text-gray-500 dark:text-gray-400 text-xs">
              <span className="font-medium  text-gray-700 dark:text-gray-300">Device ID:</span>{" "}
              {session.deviceId || "N/A"}
              <br />
            </div>
          <div className="my-3 grid grid-cols-2 gap-3 text-xs">
            <div className="py-3 text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Login:</span>{" "}
              {formatDate(session.createdAt)}
              <br />
            </div>
            <div className="py-3 text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Expires:</span>{" "}
              {formatDate(session.expiresAt)}
              <br />
            </div>
          </div>
        </div>
      );
    })}
  </div>

  {/* Empty State */}
  {loginHistory.length === 0 && (
    <div className="text-center py-16 px-6">
      <svg
        className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
        No Login Sessions Found
      </h3>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        There is no recent login history to display for your account.
      </p>
    </div>
  )}

  {/* Pagination */}
  {totalPages > 1 && (
    <div className="px-6 sm:px-8 py-4 border-t border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{currentPage}</span>{" "}
          of{" "}
          <span className="font-semibold text-gray-800 dark:text-gray-200">{totalPages}</span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
              currentPage === 1
                ? "bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            ← Previous
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-150 ${
              currentPage === totalPages
                ? "bg-gray-50 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
};

export default LoginHistory;
