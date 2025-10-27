import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Eye, Edit, Trash2, Ban, UserCheck } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../utils/axios";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import EditRequestModal from "../components/EditRequestModal";
import { useNavigate } from "react-router-dom";
import { getUserIdFromToken, getUserNameFromToken } from '../utils/jwtUtils';

const Table = ({ columns, data, onEdit, onDelete, onViewDetails, onBan, userRole }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (
            <tr key={index} className={row?.member_status === 0 ? "bg-red-50 dark:bg-red-900/20" : ""}>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                >
                  {col.key === "actions" ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onViewDetails(row)}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => onEdit(row)}
                        className={`flex items-center justify-center transition-colors ${userRole === "SuperAdmin"
                          ? "text-indigo-600 hover:text-indigo-900"
                          : "text-purple-600 hover:text-purple-900"
                          }`}
                        title={userRole === "SuperAdmin" ? "Edit User" : "Request Edit"}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onBan(row)}
                        disabled={row?.member_status === 0} // YEH LINE ADD KARO
                        className={`transition-colors ${row?.member_status === 0 && userRole === "Admin"
                          ? "text-gray-400 cursor-not-allowed" // Disabled style
                          : "text-orange-600 hover:text-orange-900"
                          }`}
                        title={row?.member_status === 0 ? "User is Banned" : "Ban User"}
                      >
                        {row?.member_status === 0 ? <UserCheck size={18} /> : <Ban size={18} />}
                      </button>
                      <button
                        onClick={() => onDelete(row)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ) : col.key === "member_status" ? (
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${row.member_status === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                    >
                      {row.member_status === 0 ? "Banned" : "Active"}
                    </span>
                  ) : (
                    row[col.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [isBanModalOpen, setIsBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserName, setNewUserName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  // Get user role from localStorage
  const [userRole, setUserRole] = useState("SuperAdmin");

  const columns = [
    { key: "sr_no", label: "Sr No." },
    { key: "member_id", label: "Member ID" },
    { key: "user_name", label: "User Name" },
    { key: "email_id", label: "Email" },
    { key: "wallet_balance", label: "Wallet Balance" },
    { key: "shear_referral_code", label: "Referral Code" },
    { key: "totalUsersReferred", label: "Users Referred" },
    { key: "totalAmountEarned", label: "Amount Earned" },
    { key: "member_status", label: "Status" },
    { key: "actions", label: "Actions" },
  ];

  // Get user role from localStorage on component mount
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role) {
      setUserRole(role);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/v1/user");
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const formattedUsers = data.map((user, index) => ({
        ...user,
        sr_no: index + 1,
        totalUsersReferred: user.referralStats?.totalUsersReferred || 0,
        totalAmountEarned: user.referralStats?.totalAmountEarned || 0,
        wallet_balance: user.wallet_balance || "0.00",
        // Remove is_banned and use member_status directly
        // member_status: user.member_status || 1, // Default to 1 (Active) if not provided
      }));
      setUsers(formattedUsers);
      setTotalUsers(formattedUsers.length);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const filteredUsers = users.filter((user) => {
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (user.user_name && user.user_name.toLowerCase().includes(lowerQuery)) ||
      (user.email_id && user.email_id.toLowerCase().includes(lowerQuery)) ||
      (user.member_id && user.member_id.toString().includes(searchQuery)) ||
      (user.shear_referral_code &&
        user.shear_referral_code.toLowerCase().includes(lowerQuery))
    );
  });

  const totalUsersFiltered = filteredUsers.length;
  const totalPages = Math.ceil(totalUsersFiltered / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const paginatedUsers = currentUsers.map((user, index) => ({
    ...user,
    sr_no: indexOfFirstUser + index + 1,
  }));

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleEdit = (row) => {
    setSelectedUser(row);

    if (userRole === "SuperAdmin") {
      // SuperAdmin directly edit page par jaye
      navigate(`/users/edit/${row.member_id}`);
    } else {
      // Other roles ke liye edit request modal open kare
      setIsEditRequestModalOpen(true);
    }
  };

  const sendEditRequest = async (memberId, reason) => {
    try {
      // Get current admin/user ID from JWT token
      const requested_by = getUserIdFromToken();

      if (!requested_by) {
        toast.error("Unable to identify requester. Please login again.");
        return;
      }

      const response = await axiosInstance.post(`/auth/user/edit-request`, {
        member_id: memberId,
        reason: reason,
        requested_by: requested_by,
      });

      toast.success("Edit request sent successfully to Super Admin");
      return response.data;
    } catch (err) {
      console.error("Edit request error:", err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Failed to send edit request");
      }
      throw err;
    }
  };



  const saveEdit = async () => {
    if (!newUserName || newUserName === selectedUser.user_name) {
      setIsEditModalOpen(false);
      return;
    }
    try {
      await axiosInstance.put(`/auth/user/${selectedUser.member_id}`, {
        user_name: newUserName,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.member_id === selectedUser.member_id
            ? { ...user, user_name: newUserName }
            : user
        )
      );
      toast.success("User updated successfully");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Update error:", err);
      toast.error("Failed to update user");
    }
  };

  const handleDelete = (row) => {
    setSelectedUser(row);
    setIsDeleteModalOpen(true);
  };

  // Super admin delete function
  const deleteUser = async (memberId) => {
    try {
      await axiosInstance.delete(`/auth/user?id=${memberId}`);
      const updatedUsers = users.filter(
        (user) => user.member_id !== memberId
      );
      setUsers(updatedUsers);
      setTotalUsers(updatedUsers.length);
      const newTotalPages = Math.ceil(updatedUsers.length / usersPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      toast.success("User deleted successfully");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete user");
    }
  };

  // Admin delete request function
  const deleteRequest = async (memberId, reason) => {
    try {
      await axiosInstance.post(`/auth/user/delete-request`, {
        member_id: memberId,
        reason: reason || "Requested by admin",
      });
      toast.success("Delete request sent successfully");
    } catch (err) {
      console.error("Delete request error:", err);
      toast.error("Failed to send delete request");
    }
  };

  // Combined delete confirmation handler
  const handleDeleteConfirm = async (memberId, reason) => {
    if (userRole === "SuperAdmin") {
      await deleteUser(memberId);
    } else {
      await deleteRequest(memberId, reason);
    }
  };

  const handleViewDetails = (row) => {
    setSelectedUser(row);
    setIsDetailsModalOpen(true);
  };

  const handleBan = (row) => {
    setSelectedUser(row);
    setIsBanModalOpen(true);
  };

  const confirmBan = async () => {
    try {
      const action = selectedUser.member_status === 0 ? "unban" : "ban";
      action === 'ban' ? await axiosInstance.put(`/v1/user/${selectedUser.member_id}`, {
        member_status: 1
      }) : await axiosInstance.put(`/v1/user/${selectedUser.member_id}`, {
        member_status: 0
      });

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.member_id === selectedUser.member_id
            ? {
              ...user,
              member_status: action === "ban" ? 0 : 1
            }
            : user
        )
      );

      toast.success(`User ${action === "ban" ? "banned" : "unbanned"} successfully`);
      setIsBanModalOpen(false);
    } catch (err) {
      console.error("Ban error:", err);
      toast.error(`Failed to ${selectedUser.member_status === 0 ? "unban" : "ban"} user`);
    }
  };



  const Pagination = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {indexOfFirstUser + 1} to{" "}
            {Math.min(indexOfLastUser, totalUsersFiltered)} of {totalUsersFiltered}{" "}
            results
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
              ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            Previous
          </button>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                1
              </button>
              {startPage > 2 && (
                <span className="px-2 py-2 text-gray-400 dark:text-gray-600">
                  ...
                </span>
              )}
            </>
          )}
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => handlePageChange(number)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === number
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
            >
              {number}
            </button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-2 py-2 text-gray-400 dark:text-gray-600">
                  ...
                </span>
              )}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
              ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };


  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage all registered users and their information
          </p>
        </div>
        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username, email, member ID, or referral code"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {totalUsers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Wallet Balance
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ₹
                  {users
                    .reduce(
                      (sum, user) => sum + parseFloat(user.wallet_balance || 0),
                      0
                    )
                    .toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Referrals
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {users.reduce(
                    (sum, user) => sum + (user.totalUsersReferred || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900">
                <svg
                  className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Earnings
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ₹
                  {users.reduce(
                    (sum, user) => sum + (user.totalAmountEarned || 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              All Users
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
          </div>
          <Table
            columns={columns}
            data={paginatedUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewDetails={handleViewDetails}
            onBan={handleBan}
            userRole={userRole}
          />
          {totalPages > 1 && <Pagination />}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-96 mx-4 transform transition-all">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
                <Edit className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Edit User
              </h2>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Member ID
              </label>
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                  #{selectedUser?.member_id}
                </span>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                User Name
              </label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Enter user name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        user={selectedUser}
        userRole={userRole}
      />

      {isBanModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-96 mx-4 transform transition-all">
            <div className="flex items-center mb-6">
              <div className={`p-3 rounded-full mr-4 ${selectedUser?.member_status === 0
                ? "bg-green-100 dark:bg-green-900"
                : "bg-orange-100 dark:bg-orange-900"
                }`}>
                {selectedUser?.member_status === 0 ? (
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <Ban className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedUser?.member_status === 0 ? "Unban User" : "Ban User"}
              </h2>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300 mb-3">
                Are you sure you want to {selectedUser?.member_status === 0 ? "unban" : "ban"}{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {selectedUser?.user_name}
                </span>
                ?
              </p>
              <div className={`rounded-lg p-4 ${selectedUser?.member_status === 0
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                }`}>
                <p className={`text-sm mb-1 ${selectedUser?.member_status === 0
                  ? "text-green-700 dark:text-green-400"
                  : "text-orange-700 dark:text-orange-400"
                  }`}>
                  <strong>Member ID:</strong> #{selectedUser?.member_id}
                </p>
                <p className={`text-sm ${selectedUser?.member_status === 0
                  ? "text-green-600 dark:text-green-300"
                  : "text-orange-600 dark:text-orange-300"
                  }`}>
                  {selectedUser?.member_status === 0
                    ? "User will be able to access the platform again."
                    : "User will be restricted from accessing the platform."}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsBanModalOpen(false)}
                className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBan}
                className={`px-6 py-3 text-white rounded-lg font-medium transition-colors shadow-lg ${selectedUser?.member_status === 0
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-orange-600 hover:bg-orange-700"
                  }`}
              >
                {selectedUser?.member_status === 0 ? "Unban User" : "Ban User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Request Modal */}
      <EditRequestModal
        isOpen={isEditRequestModalOpen}
        onClose={() => setIsEditRequestModalOpen(false)}
        onConfirm={sendEditRequest}
        user={selectedUser}
      />

      {/* Details Modal */}
      {isDetailsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-4xl mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
                <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                User Details
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Basic Information
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Member ID:</span>{" "}
                    #{selectedUser?.member_id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">User Name:</span>{" "}
                    {selectedUser?.user_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Email:</span>{" "}
                    {selectedUser?.email_id}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Wallet Balance:</span> ₹
                    {selectedUser?.wallet_balance}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Referral Code:</span>{" "}
                    {selectedUser?.shear_referral_code}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Status:</span>{" "}
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${selectedUser?.member_status === 0
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        }`}
                    >
                      {selectedUser?.member_status === 0 ? "Banned" : "Active"}
                    </span>
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Referral Statistics
                </h3>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Total Users Referred:</span>{" "}
                    {selectedUser?.totalUsersReferred || 0}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Total Amount Earned:</span> ₹
                    {selectedUser?.totalAmountEarned || 0}
                  </p>
                </div>
              </div>
            </div>
            {selectedUser?.referralStats?.details &&
              selectedUser.referralStats.details.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Referral Details
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50 dark:bg-gray-600">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            New User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Credited To
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {selectedUser.referralStats.details.map((detail, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              {detail.newUser}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                              ₹{detail.amount}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${detail.creditedTo === "referrer"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  }`}
                              >
                                {detail.creditedTo}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            <div className="flex justify-end">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;