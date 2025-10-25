import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Lock,
  Gift,
  Plus,
  Edit2,
  RefreshCw,
  Ban,
} from "lucide-react";
import axiosInstance from "../utils/axios";

// CreateUserModal component
const CreateUserModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    user_name: "",
    email_id: "",
    mobile_no: "",
    country_code: "+91",
    password: "",
    cpassword: "",
    refer_code: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.first_name.trim()) newErrors.first_name = "Required";
    if (!formData.last_name.trim()) newErrors.last_name = "Required";
    if (!formData.user_name.trim()) newErrors.user_name = "Required";
    if (!formData.email_id.trim()) {
      newErrors.email_id = "Required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email_id)) {
      newErrors.email_id = "Invalid email";
    }
    if (!formData.mobile_no.trim()) {
      newErrors.mobile_no = "Required";
    } else if (!/^\d{10}$/.test(formData.mobile_no)) {
      newErrors.mobile_no = "10 digits required";
    }
    if (!formData.password) {
      newErrors.password = "Required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Min 8 characters";
    }
    if (formData.password !== formData.cpassword) {
      newErrors.cpassword = "Passwords don't match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      setSuccessMessage("");

      try {
        await onCreate(formData);
        setSuccessMessage("User created successfully!");
        setTimeout(() => {
          onClose();
          setSuccessMessage("");
          setFormData({
            first_name: "",
            last_name: "",
            user_name: "",
            email_id: "",
            mobile_no: "",
            country_code: "+91",
            password: "",
            cpassword: "",
            refer_code: "",
          });
        }, 2000);
      } catch (error) {
        console.error("Failed to create user:", error);
        setErrors({ general: error.message || "Failed to create user." });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-3 text-white">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold flex items-center">
              <User className="mr-2 h-4 w-4" />
              Create New User
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {successMessage && (
            <div
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}
          {errors.general && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{errors.general}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  First Name
                </label>
                {errors.first_name && (
                  <span className="text-xs text-red-500">
                    {errors.first_name}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 text-sm rounded border ${
                  errors.first_name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-zinc-600"
                } dark:bg-zinc-700`}
                placeholder="John"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Last Name
                </label>
                {errors.last_name && (
                  <span className="text-xs text-red-500">
                    {errors.last_name}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className={`w-full px-3 py-1.5 text-sm rounded border ${
                  errors.last_name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-zinc-600"
                } dark:bg-zinc-700`}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Username
              </label>
              {errors.user_name && (
                <span className="text-xs text-red-500">{errors.user_name}</span>
              )}
            </div>
            <div className="relative">
              <User className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                className={`w-full pl-8 px-2.5 py-1.5 text-sm rounded border ${
                  errors.user_name
                    ? "border-red-500"
                    : "border-gray-300 dark:border-zinc-600"
                } dark:bg-zinc-700`}
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </label>
              {errors.email_id && (
                <span className="text-xs text-red-500">{errors.email_id}</span>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                className={`w-full pl-8 px-2.5 py-1.5 text-sm rounded border ${
                  errors.email_id
                    ? "border-red-500"
                    : "border-gray-300 dark:border-zinc-600"
                } dark:bg-zinc-700`}
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Mobile
              </label>
              {errors.mobile_no && (
                <span className="text-xs text-red-500">{errors.mobile_no}</span>
              )}
            </div>
            <div className="flex">
              <select
                name="country_code"
                value={formData.country_code}
                onChange={handleChange}
                className="w-16 px-1 py-1.5 text-sm rounded-l border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700"
              >
                <option value="+91">+91</option>
                <option value="+1">+1</option>
                <option value="+44">+44</option>
              </select>
              <div className="relative flex-1">
                <Phone className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="tel"
                  name="mobile_no"
                  value={formData.mobile_no}
                  onChange={handleChange}
                  className={`w-full pl-8 px-2.5 py-1.5 text-sm rounded-r border ${
                    errors.mobile_no
                      ? "border-red-500"
                      : "border-gray-300 dark:border-zinc-600"
                  } dark:bg-zinc-700`}
                  placeholder="9876543210"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Password
                </label>
                {errors.password && (
                  <span className="text-xs text-red-500">
                    {errors.password}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-8 px-2.5 py-1.5 text-sm rounded border ${
                    errors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-zinc-600"
                  } dark:bg-zinc-700`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Confirm
                </label>
                {errors.cpassword && (
                  <span className="text-xs text-red-500">
                    {errors.cpassword}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="password"
                  name="cpassword"
                  value={formData.cpassword}
                  onChange={handleChange}
                  className={`w-full pl-8 px-2.5 py-1.5 text-sm rounded border ${
                    errors.cpassword
                      ? "border-red-500"
                      : "border-gray-300 dark:border-zinc-600"
                  } dark:bg-zinc-700`}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Referral Code (Optional)
            </label>
            <div className="relative">
              <Gift className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                name="refer_code"
                value={formData.refer_code}
                onChange={handleChange}
                className="w-full pl-8 px-2.5 py-1.5 text-sm rounded border border-gray-300 dark:border-zinc-600 dark:bg-zinc-700"
                placeholder="REF123"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function UserSettings() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [filter, setFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    // const fetchUsers = async () => {
    //   try {
    //     setIsLoading(true);
    //     const response = await axiosInstance.get("/auth/user");

    //     // Transform the API response to match our expected format
    //     const transformedUsers = response.data.users.map((user) => ({
    //       id: user.member_id,
    //       name: `${user.first_name} ${user.last_name || ''}`.trim(),
    //       username: user.user_name,
    //       email: user.email_id || 'No email',
    //       role: user.role || "User",
    //       status: user.member_status === 1 ? "Active" : "Banned",
    //       created: user.createdAt
    //         ? new Date(user.createdAt).toISOString().split("T")[0]
    //         : new Date().toISOString().split("T")[0],
    //       editedBy: null,
    //       history: [],
    //       first_name: user.first_name,
    //       last_name: user.last_name,
    //       user_name: user.user_name,
    //       email_id: user.email_id,
    //       mobile_no: user.mobile_no,
    //       member_id: user.member_id
    //     }));

    //     setUsers(transformedUsers);
    //     setError(null);
    //   } catch (err) {
    //     console.error("Failed to fetch users:", err);
    //     setError("Failed to load users. Please try again.");
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

const fetchUsers = async () => {
  try {
    setIsLoading(true);
    const response = await axiosInstance.get("/auth/user");

    console.log("API Response:", response.data);

    // The actual users data is in response.data.data
    const usersData = response.data.data;

    if (!Array.isArray(usersData)) {
      console.error("Unexpected response format:", response.data);
      setError("Unexpected data format received from server");
      setUsers([]);
      return;
    }

    // Transform the API response to match our expected format
    // const transformedUsers = usersData.map((user) => ({
    //   id: user.member_id,
    //   name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.user_name || 'Unknown',
    //   username: user.user_name || 'No username',
    //   email: user.email_id || user.email || 'No email',
    //   role: user.role || "User",
    //   status: user.member_status === 1 ? "Active" : "Banned",
    //   created: user.createdAt
    //     ? new Date(user.createdAt).toISOString().split("T")[0]
    //     : new Date().toISOString().split("T")[0],
    //   editedBy: null,
    //   history: [],
    //   first_name: user.first_name,
    //   last_name: user.last_name,
    //   user_name: user.user_name,
    //   email_id: user.email_id,
    //   mobile_no: user.mobile_no,
    //   member_id: user.member_id
    // }));
    // Transform the API response to match our expected format
    const transformedUsers = usersData.map((user) => ({
      id: user.member_id,
      name: user.user_name || 'Unknown',
      username: user.user_name || 'No username',
      email: user.email_id || 'No email',
      role: user.role || "User",
      // Since member_status is not in GET response, default to Active
      // We'll fetch individual status when needed
      status: "Active",
      created: user.createdAt
        ? new Date(user.createdAt).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      editedBy: null,
      history: [],
      first_name: null,
      last_name: null,
      user_name: user.user_name,
      email_id: user.email_id,
      mobile_no: user.mobile_no,
      member_id: user.member_id,
      wallet_balance: user.wallet_balance,
      shear_referral_code: user.shear_referral_code
    }));

    setUsers(transformedUsers);
    setError(null);
  } catch (err) {
    console.error("Failed to fetch users:", err);
    setError("Failed to load users. Please try again.");
    setUsers([]);
  } finally {
    setIsLoading(false);
  }
};

    fetchUsers();
  }, []);

  const filteredUsers = users
    .filter((u) =>
      filter === "all" ? true : u.status.toLowerCase() === filter.toLowerCase()
    )
    .filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openModal = (user, type) => {
    setSelectedUser(user);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
  };

  const handleEdit = async () => {
    const editedName = document.getElementById("editName").value;
    const editedUsername = document.getElementById("editUsername").value;
    const editedEmail = document.getElementById("editEmail").value;
    const editedRole = document.getElementById("editRole").value;
    const editedStatus = document.getElementById("editStatus").value;

    try {
      setIsLoading(true);
      const response = await axiosInstance.put(
        `/auth/user/${selectedUser.member_id}`,
        {
          first_name: editedName.split(" ")[0],
          last_name: editedName.split(" ")[1] || "",
          user_name: editedUsername,
          email_id: editedEmail,
          role: editedRole,
          member_status: editedStatus === 'Active' ? 1 : 0,
        }
      );

      // Update local state with the edited user
      setUsers(
        users.map((u) =>
          u.id === selectedUser.id
            ? {
                ...u,
                name: editedName,
                username: editedUsername,
                email: editedEmail,
                role: editedRole,
                status: editedStatus,
                editedBy: `Edited by Admin`,
                history: [
                  ...u.history,
                  {
                    editedBy: "Admin",
                    date: new Date().toISOString(),
                    changes: {
                      name: editedName !== u.name ? editedName : undefined,
                      username:
                        editedUsername !== u.username
                          ? editedUsername
                          : undefined,
                      email: editedEmail !== u.email ? editedEmail : undefined,
                      role: editedRole !== u.role ? editedRole : undefined,
                      status:
                        editedStatus !== u.status ? editedStatus : undefined,
                    },
                  },
                ],
              }
            : u
        )
      );

      closeModal();
    } catch (err) {
      console.error("Failed to update user:", err);
      alert("Failed to update user. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await axiosInstance.post(
        `/auth/user/reset-password`,
        { 
          member_id: selectedUser.member_id,
          email: selectedUser.email 
        }
      );

      alert(`Password reset link sent to ${selectedUser.email}`);
      closeModal();
    } catch (err) {
      console.error("Failed to send reset link:", err);
      alert("Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBan = async () => {
    try {
      setIsLoading(true);
      const newStatus = selectedUser.status === "Active" ? 0 : 1;

      await axiosInstance.put(
        `/auth/user/${selectedUser.member_id}`,
        { member_status: newStatus }
      );

      setUsers(
        users.map((u) =>
          u.id === selectedUser.id 
            ? { ...u, status: newStatus === 1 ? "Active" : "Banned" } 
            : u
        )
      );

      closeModal();
    } catch (err) {
      console.error("Failed to update user status:", err);
      alert("Failed to update user status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    const visibleIds = paginatedUsers.map((u) => u.id);
    const allSelected = visibleIds.every((id) => selectedUsers.includes(id));
    setSelectedUsers(allSelected ? [] : [...selectedUsers.filter(id => !visibleIds.includes(id)), ...visibleIds]);
  };

  const handleBulkBan = async () => {
    if (selectedUsers.length === 0) return;
    if (!window.confirm("Ban selected users?")) return;

    try {
      setIsLoading(true);
      await Promise.all(
        selectedUsers.map(async (id) => {
          const user = users.find(u => u.id === id);
          if (user) {
            await axiosInstance.put(
              `/auth/user/${user.member_id}`,
              { member_status: 0 }
            );
          }
        })
      );

      setUsers(
        users.map((u) =>
          selectedUsers.includes(u.id) ? { ...u, status: "Banned" } : u
        )
      );
      setSelectedUsers([]);
    } catch (err) {
      console.error("Failed to ban users:", err);
      alert("Failed to ban some users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const header = [
      "Name",
      "Username", 
      "Email",
      "Role",
      "Status",
      "Created",
      "Edited By",
    ];
    const rows = users.map((u) => [
      u.name,
      u.username,
      u.email,
      u.role,
      u.status,
      u.created,
      u.editedBy || "",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCreateUser = async (newUserData) => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.post(
        "/auth/user/register",
        newUserData
      );

      // Update the local state with the new user
      const newUser = {
        id: response.data.member_id || response.data._id,
        name: `${newUserData.first_name} ${newUserData.last_name}`,
        username: newUserData.user_name,
        email: newUserData.email_id,
        role: "User",
        status: "Active",
        created: new Date().toISOString().split("T")[0],
        editedBy: null,
        history: [],
        ...newUserData,
        member_id: response.data.member_id || response.data._id
      };

      setUsers((prev) => [...prev, newUser]);

      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error(error.response?.data?.message || "Failed to create user. Check your form data.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen dark:bg-zinc-900 text-gray-800 dark:text-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">User Settings</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 rounded border dark:bg-zinc-700"
          />
          <button
            onClick={handleExport}
            className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Export CSV
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "active", "banned"].map((status) => (
          <button
            key={status}
            onClick={() => {
              setFilter(status);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded capitalize ${
              filter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-zinc-600"
            }`}
          >
            {status}
          </button>
        ))}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
        <button
          onClick={handleBulkBan}
          className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          disabled={selectedUsers.length === 0}
        >
          Ban Selected ({selectedUsers.length})
        </button>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="hidden sm:block overflow-x-auto rounded shadow bg-white dark:bg-zinc-800">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-zinc-700">
            <tr>
              <th className="px-4 py-2 text-left">
                <input
                  type="checkbox"
                  onChange={selectAll}
                  checked={
                    paginatedUsers.length > 0 &&
                    paginatedUsers.every((u) => selectedUsers.includes(u.id))
                  }
                />
              </th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Username</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Created</th>
              <th className="px-4 py-2 text-left">Edited By</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="9" className="px-4 py-4 text-center">
                  <div className="flex justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  </div>
                </td>
              </tr>
            ) : paginatedUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelect(user.id)}
                    />
                  </td>
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.username}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 capitalize">
                    {user.role.toLowerCase()}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        user.status === "Active"
                          ? "bg-green-200 dark:bg-green-600 text-green-800 dark:text-white"
                          : "bg-red-200 dark:bg-red-600 text-red-800 dark:text-white"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{user.created}</td>
                  <td className="px-4 py-2">{user.editedBy || "-"}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => openModal(user, "edit")}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => openModal(user, "reset")}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                      title="Reset Password"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => openModal(user, "ban")}
                      className={`px-2 py-1 rounded ${
                        user.status === "Active"
                          ? "bg-red-500 hover:bg-red-600"
                          : "bg-green-500 hover:bg-green-600"
                      } text-white`}
                      title={
                        user.status === "Active" ? "Ban User" : "Activate User"
                      }
                    >
                      <Ban className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile View */}
      <div className="block sm:hidden space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <svg
              className="animate-spin h-5 w-5 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <p className="text-center text-gray-500">No users found</p>
        ) : (
          paginatedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-zinc-800 rounded shadow p-4"
            >
              <div className="mt-3 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Name:</strong> {user.name}
                </p>
                <p>
                  <strong>Username:</strong> {user.username}
                </p>
                <p>
                  <strong>Email:</strong> {user.email}
                </p>
                <p>
                  <strong>Role:</strong> {user.role}
                </p>
                <p>
                  <strong>Status:</strong> {user.status}
                </p>
                <p>
                  <strong>Created:</strong> {user.created}
                </p>
                <p>
                  <strong>Edited By:</strong> {user.editedBy || "-"}
                </p>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => openModal(user, "edit")}
                    className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openModal(user, "reset")}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => openModal(user, "ban")}
                    className={`px-2 py-1 rounded text-xs ${
                      user.status === "Active"
                        ? "bg-red-500"
                        : "bg-green-500"
                    } text-white`}
                  >
                    {user.status === "Active" ? "Ban" : "Activate"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {selectedUser && modalType === "edit" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Edit User</h2>
            <input
              id="editName"
              defaultValue={selectedUser.name}
              placeholder="Full Name"
              className="w-full mb-2 px-3 py-2 border rounded dark:bg-zinc-700"
            />
            <input
              id="editUsername"
              defaultValue={selectedUser.username}
              placeholder="Username"
              className="w-full mb-2 px-3 py-2 border rounded dark:bg-zinc-700"
            />
            <input
              id="editEmail"
              defaultValue={selectedUser.email}
              placeholder="Email"
              className="w-full mb-2 px-3 py-2 border rounded dark:bg-zinc-700"
            />
            <select
              id="editRole"
              defaultValue={selectedUser.role}
              className="w-full mb-2 px-3 py-2 border rounded dark:bg-zinc-700"
            >
              <option>User</option>
              <option>Moderator</option>
              <option>Admin</option>
            </select>
            <select
              id="editStatus"
              defaultValue={selectedUser.status}
              className="w-full mb-3 px-3 py-2 border rounded dark:bg-zinc-700"
            >
              <option>Active</option>
              <option>Banned</option>
            </select>
            <button
              onClick={handleEdit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={closeModal}
              className="mt-3 text-sm underline text-center w-full text-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {selectedUser && modalType === "reset" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to send a password reset link to{" "}
              <strong>{selectedUser.email}</strong>?
            </p>
            <button
              onClick={handleReset}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </button>
            <button
              onClick={closeModal}
              className="mt-3 text-sm underline text-center w-full text-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Ban/Activate Modal */}
      {selectedUser && modalType === "ban" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">
              {selectedUser.status === "Active" ? "Ban User" : "Activate User"}
            </h2>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to{" "}
              {selectedUser.status === "Active" ? "ban" : "activate"}{" "}
              <strong>{selectedUser.name}</strong>?
            </p>
            <button
              onClick={handleBan}
              className={`w-full px-4 py-2 rounded text-white ${
                selectedUser.status === "Active"
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : selectedUser.status === "Active"
                ? "Ban User"
                : "Activate User"}
            </button>
            <button
              onClick={closeModal}
              className="mt-3 text-sm underline text-center w-full text-gray-600 dark:text-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateUser}
      />

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export default UserSettings;