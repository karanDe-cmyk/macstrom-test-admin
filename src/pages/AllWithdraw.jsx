"use client";

import { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";

const WithdrawalTable = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/user/withdraw");
      const data = response.data;

      if (data.status && Array.isArray(data.data)) {
        setWithdrawals(data.data);
      } else {
        console.error("Unexpected response format:", data);
        setWithdrawals([]);
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = (withdrawalId, newStatus) => {
    console.log(`Action clicked: ${newStatus} for withdrawal ID: ${withdrawalId}`);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = withdrawals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(withdrawals.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          statusClasses[status] || "bg-gray-100 text-gray-800 border-gray-200"
        }`}
      >
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
      </span>
    );
  };

  const ActionButtons = ({ withdrawal }) => {
    if (withdrawal.status === "approved" || withdrawal.status === "rejected") {
      return (
        <span className="text-xs text-gray-500 italic">
          {withdrawal.status === "approved"
            ? "Already Approved"
            : "Already Rejected"}
        </span>
      );
    }

    return (
      <div className="flex space-x-2">
        <button
          onClick={() => handleStatusUpdate(withdrawal.id, "approved")}
          className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={() => handleStatusUpdate(withdrawal.id, "rejected")}
          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Withdrawal Requests</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {withdrawals.length} requests
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sr. No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.map((withdrawal, index) => {
                const serialNo = indexOfFirstItem + index + 1;
                return (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{serialNo}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{withdrawal.User?.user_name || "N/A"}</div>
                      <div className="text-sm text-gray-500">{withdrawal.User?.email_id || "No email"}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{withdrawal.amount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {withdrawal.payment_method?.toUpperCase() || "N/A"}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(withdrawal.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(withdrawal.createdAt)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {withdrawal.description}
                    </td>
                    <td className="px-6 py-4">
                      <ActionButtons withdrawal={withdrawal} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet View */}
        <div className="block lg:hidden divide-y divide-gray-200">
          {currentItems.map((withdrawal, index) => {
            const serialNo = indexOfFirstItem + index + 1;
            return (
              <div key={withdrawal.id} className="p-4 hover:bg-gray-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-800">
                    #{serialNo} — ₹{withdrawal.amount}
                  </span>
                  {getStatusBadge(withdrawal.status)}
                </div>
                <div className="text-sm text-gray-700">
                  <p>
                    <span className="font-medium">User:</span>{" "}
                    {withdrawal.User?.user_name || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {withdrawal.User?.email_id || "No email"}
                  </p>
                  <p>
                    <span className="font-medium">Payment:</span>{" "}
                    {withdrawal.payment_method?.toUpperCase() || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Created:</span>{" "}
                    {formatDate(withdrawal.createdAt)}
                  </p>
                  {withdrawal.description && (
                    <p className="mt-1 text-gray-600 text-sm">
                      <span className="font-medium">Note:</span>{" "}
                      {withdrawal.description}
                    </p>
                  )}
                </div>
                <div className="mt-3">
                  <ActionButtons withdrawal={withdrawal} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(indexOfLastItem, withdrawals.length)}
            </span>{" "}
            of <span className="font-medium">{withdrawals.length}</span> results
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-l bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              ‹
            </button>

            {[...Array(totalPages)].map((_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => paginate(pageNumber)}
                  className={`px-3 py-1 border text-sm font-medium ${
                    currentPage === pageNumber
                      ? "bg-blue-50 border-blue-500 text-blue-600"
                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-r bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalTable;
