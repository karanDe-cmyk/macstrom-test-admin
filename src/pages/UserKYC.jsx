import React, { useState, useEffect } from "react";
import {
  EyeIcon,
  BanIcon,
  Search,
  Download,
  Trash,
  FolderArchive,
  Ellipsis,
} from "lucide-react";
import UserDetail from "./UserDetail";

// Compute KYC status from docs
const computeKycStatus = (docs) => {
  if (!docs?.length) return "Pending";
  if (docs.some((doc) => doc.status === "Rejected")) return "Rejected";
  if (docs.every((doc) => doc.status === "Verified")) return "Verified";
  return "Pending";
};

export default function UserKYC() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [walletUser, setWalletUser] = useState(null);
  const [assignUser, setAssignUser] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState("");

  const admins = [
    { id: "admin1", name: "Admin One" },
    { id: "admin2", name: "Admin Two" },
    { id: "admin3", name: "Admin Three" },
  ];
  const authToken =localStorage.getItem("authToken");
    
  // API fetching logic
  useEffect(() => {
    const fetchUsersAndTransactions = async () => {
      try {
        const usersResponse = await fetch("https://macstormbattle-backend.onrender.com/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        if (!usersResponse.ok) {
          throw new Error("Failed to fetch user data.");
        }

        const usersData = await usersResponse.json();

        const mappedUsersPromises = usersData.users.map(async (apiUser) => {
          let totalDeposits = 0;
          let totalWithdrawals = 0; // Assuming a similar endpoint for withdrawals

          try {
            const depositResponse = await fetch(
              `https://macstormbattle-backend.onrender.com/api/user/deposit/${apiUser.member_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );

            if (depositResponse.ok) {
              const depositData = await depositResponse.json();
              if (depositData.status && depositData.data) {
                totalDeposits = depositData.data.reduce(
                  (sum, record) => sum + Number(record.amount),
                  0
                );
              }
            } else {
              console.warn(
                `Failed to fetch deposit data for user ${apiUser.member_id}: ${depositResponse.statusText}`
              );
            }

            // You would typically fetch withdrawals from a similar endpoint
            // For now, we'll keep withdrawals at 0 or add placeholder logic if available
            // Example:
            const withdrawalResponse = await fetch(
              `https://macstormbattle-backend.onrender.com/api/user/withdraw/${apiUser.member_id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
                },
              }
            );
            if (withdrawalResponse.ok) {
              const withdrawalData = await withdrawalResponse.json();
              if (withdrawalData.status && withdrawalData.data) {
                totalWithdrawals = withdrawalData.data.reduce(
                  (sum, record) => sum + Number(record.amount),
                  0
                );
              }
            }
           
          } catch (transactionError) {
            console.error(
              `Error fetching transactions for user ${apiUser.member_id}:`,
              transactionError
            );
          }

          return {
            id: apiUser.member_id,
            name: apiUser.user_name || null,
            fullName: `${apiUser.first_name} ${apiUser.last_name}`,
            email: apiUser.email_id || null,
            location: apiUser.location || "Unknown",
            joined: apiUser.createdAt
              ? new Date(apiUser.createdAt).toLocaleDateString()
              : null,
            status: apiUser.status || "Active",
            kycStatus: "Verified", // This should ideally be computed from actual KYC docs if available
            kycDocs: [],
            balance: Number(apiUser.wallet_balance) || 0,
            deposits: totalDeposits,
            withdrawals: totalWithdrawals,
            lastActive: apiUser.updatedAt
              ? new Date(apiUser.updatedAt).toLocaleDateString()
              : null,
            assignedAdmin: null,
            bank: {
              bankName: apiUser.bank_name || "N/A",
              accountNumber: apiUser.account_number || "N/A",
              ifsc: apiUser.ifsc_code || "N/A",
              upiId: apiUser.upi_id || "N/A",
            },
          };
        });

        const finalMappedUsers = await Promise.all(mappedUsersPromises);
        setUsers(finalMappedUsers);
        setError(null);
      } catch (err) {
        console.error("Error fetching users or transactions:", err);
        setError("Failed to load users. Please check the API endpoint and token.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsersAndTransactions();
  }, []); // Empty dependency array to run only once on mount

  const handleBan = async (userId, currentStatus) => {
    const newMemberStatus = currentStatus === "Active" ? 0 : 1;
    const newStatusText = newMemberStatus === 0 ? "Suspended" : "Active";

    try {
      const response = await fetch(
        "https://macstormbattle-backend.onrender.com/api/v1/user/member-status/admin/update",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            user_id: userId,
            member_status: newMemberStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.statusText}`);
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                status: newStatusText,
              }
            : u
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      setError(`Failed to update user status: ${err.message}`);
    }
  };

 const handleDeleteConfirm = async () => {
  if (deleteUser) {
    try {
      const response = await fetch(
        `https://macstormbattle-backend.onrender.com/api/v1/user/${deleteUser.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete user: ${response.statusText}`);
      }

      setUsers((prev) => prev.filter((u) => u.id !== deleteUser.id));
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(`Failed to delete user: ${err.message}`);
    } finally {
      setDeleteUser(null);
    }
  }
};


  const handleKycStatusChange = (userId, newStatus) => {
    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, kycStatus: newStatus } : u
      )
    );
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase().trim();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const exportCSV = () => {
    const header = [
      "Name",
      "Full Name",
      "Email",
      "Location",
      "Joined",
      "Status",
      "KYC Status",
      "Deposits",
      "Withdrawals",
      "Balance",
      "Last Active",
      "Assigned Admin",
    ];
    const rows = users.map((u) => [
      u.name,
      u.fullName,
      u.email,
      u.location,
      u.joined,
      u.status,
      u.kycStatus,
      u.deposits,
      u.withdrawals,
      u.balance,
      u.lastActive,
      u.assignedAdmin || "-",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "UserKYC_Export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (selectedUser) {
    return (
      <UserDetail
        user={selectedUser}
        onBack={() => setSelectedUser(null)}
        onKycStatusUpdate={handleKycStatusChange}
        authToken={authToken} 
      />
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error: {error}
      </div>
    );
  }
  console.log({ filteredUsers });
  return (
    <div className="p-6 min-h-screen bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">User KYC Management</h1>
        <div className="flex gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 pr-10 rounded border dark:bg-zinc-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="w-4 h-4 absolute right-3 top-3 text-gray-400" />
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* User Cards */}
      <div className="space-y-4">
        {filteredUsers.map((user) => {
          return (
            <div
              key={user.id}
              className="flex flex-col md:flex-row items-center justify-between p-4 rounded border shadow-sm bg-white dark:bg-zinc-800"
            >
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {user.name}
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                          : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                      }`}
                    >
                      {user.status}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.kycStatus === "Verified"
                          ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                          : user.kycStatus === "Rejected"
                          ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white"
                      }`}
                    >
                      {user.kycStatus}
                    </span>
                  </div>
                  <p className="text-sm">{user.fullName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📍 {user.location} • Joined {user.joined}
                  </p>
                  {user.assignedAdmin && (
                    <p className="text-xs mt-1 text-blue-600 dark:text-blue-300">
                      🧑 Assigned to: <strong>{user.assignedAdmin}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Right Side - Added Headers */}
              <div className="flex items-center justify-between flex-wrap gap-4 mt-4 md:mt-0 text-sm">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Deposits
                  </span>
                  <span className="text-green-600">
                    ₹{user.deposits.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Withdrawals
                  </span>
                  <span className="text-red-600">
                    ₹{user.withdrawals.toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Balance
                  </span>
                  <span className="text-blue-600">
                    ₹{user.balance.toFixed(2)}
                  </span>
                </div>
                <div className="text-xs text-center text-gray-600 dark:text-gray-400">
                  Last active
                  <br />
                  <strong>{user.lastActive}</strong>
                </div>

                <div className="flex space-x-2">
                  <button onClick={() => setSelectedUser(user)}>
                    <EyeIcon className="w-4 h-4 text-gray-700 dark:text-white" />
                  </button>
                  <button onClick={() => handleBan(user.id)}>
                    <BanIcon
                      className={`w-4 h-4 ${
                        user.status === "Active"
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </button>
                  <button onClick={() => setWalletUser(user)}>
                    <FolderArchive className="w-4 h-4 text-gray-700 dark:text-white" />
                  </button>
                  <button onClick={() => setDeleteUser(user)}>
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                  <button onClick={() => setAssignUser(user)}>
                    <Ellipsis className="w-4 h-4 text-gray-700 dark:text-white" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign Admin Modal */}
      {assignUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4">Assign User Work</h2>
            <p className="mb-4">
              Assign <strong>{assignUser.name}</strong> to an admin:
            </p>
            <select
              value={selectedAdmin}
              onChange={(e) => setSelectedAdmin(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-zinc-700"
            >
              <option value="">Select Admin</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.name}>
                  {admin.name}
                </option>
              ))}
            </select>

            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setAssignUser(null)}
                className="px-4 py-2 rounded border dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // No-op for now, as this functionality is not requested to be wired to an API
                  if (!selectedAdmin) return console.error("Please select an admin."); // Changed alert to console.error
                  setUsers((prev) =>
                    prev.map((u) =>
                      u.id === assignUser.id
                        ? { ...u, assignedAdmin: selectedAdmin }
                        : u
                    )
                  );
                  setAssignUser(null);
                  setSelectedAdmin("");
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Adjustment Modal */}
      {walletUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h2 className="text-lg font-bold mb-1">Wallet Adjustment</h2>
            <p className="text-sm text-gray-500 mb-4">
              Adjust wallet balance for <strong>{walletUser.name}</strong>
            </p>
            <p className="mb-4">
              Current Balance: ${walletUser.balance?.toFixed(2) ?? "0.00"}
            </p>

            {/* Form States */}
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium">Amount</label>
                <input
                  type="number"
                  min="0"
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border rounded"
                  value={walletUser.amount || ""}
                  onChange={(e) =>
                    setWalletUser({
                      ...walletUser,
                      amount: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Type</label>
                <select
                  className="w-full px-3 py-2 border rounded"
                  value={walletUser.type || "credit"}
                  onChange={(e) =>
                    setWalletUser({ ...walletUser, type: e.target.value })
                  }
                >
                  <option value="credit">Credit (+)</option>
                  <option value="debit">Debit (-)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Reason</label>
                <textarea
                  rows={2}
                  placeholder="Enter reason for adjustment"
                  className="w-full px-3 py-2 border rounded"
                  value={walletUser.reason || ""}
                  onChange={(e) =>
                    setWalletUser({ ...walletUser, reason: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">Admin PIN</label>
                <input
                  type="password"
                  placeholder="Enter your admin PIN"
                  className="w-full px-3 py-2 border rounded"
                  value={walletUser.pin || ""}
                  onChange={(e) =>
                    setWalletUser({ ...walletUser, pin: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setWalletUser(null)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const { id, amount, type } = walletUser;
                  if (!amount || amount <= 0) {
                    // Replaced alert with a console.error, as alerts are blocked in the immersive environment.
                    console.error("Enter a valid amount.");
                    return;
                  }

                  setUsers((prevUsers) =>
                    prevUsers.map((u) => {
                      if (u.id !== id) return u;

                      const updatedDeposits = u.deposits || 0;
                      const updatedWithdrawals = u.withdrawals || 0;
                      const updatedBalance = u.balance || 0;

                      if (type === "credit") {
                        return {
                          ...u,
                          deposits: updatedDeposits + amount,
                          balance: updatedBalance + amount,
                        };
                      } else {
                        return {
                          ...u,
                          withdrawals: updatedWithdrawals + amount,
                          balance: updatedBalance - amount,
                        };
                      }
                    })
                  );

                  setWalletUser(null);
                }}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                + Confirm Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded w-full max-w-sm text-center">
            <h2 className="text-lg font-bold mb-4">Confirm Deletion</h2>
            <p className="mb-4">
              Are you sure you want to delete user{" "}
              <strong>{deleteUser.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteUser(null)}
                className="px-4 py-2 rounded border dark:border-zinc-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}