import { useState, useEffect } from "react";
import {
  Eye,
  Pencil,
  ShieldCheck,
  Crown,
  RefreshCcw,
  Trash2,
} from "lucide-react";
import axiosInstance from "../../utils/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminManagement = () => {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [editPermissionsModal, setEditPermissionsModal] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingIsActive, setEditingIsActive] = useState(true);
  const [editingPermissions, setEditingPermissions] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${days} day${days > 1 ? "s" : ""} ago`;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Admin",
    permissions: [],
  });

  const [permissionInput, setPermissionInput] = useState("");
  const [subPermissionInput, setSubPermissionInput] = useState("");
  const [selectedParentIndex, setSelectedParentIndex] = useState(null);
  const [editPermissionInput, setEditPermissionInput] = useState("");
  const [editSubPermissionInput, setEditSubPermissionInput] = useState("");
  const [editSelectedParentIndex, setEditSelectedParentIndex] = useState(null);

  const token = localStorage.getItem("authToken");

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/auth/admin/getadmins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(response.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleViewPermissions = (permissions) => {
    setSelectedPermissions(permissions?.length ? permissions : []);
    setShowPermissionsModal(true);
  };

  const addPermission = () => {
    if (!permissionInput.trim()) {
      toast.error("Permission name cannot be empty");
      return;
    }

    const exists = newAdmin.permissions.find(
      (p) => p.permission.toLowerCase() === permissionInput.trim().toLowerCase()
    );

    if (exists) {
      toast.error("Permission already exists");
      return;
    }

    setNewAdmin({
      ...newAdmin,
      permissions: [
        ...newAdmin.permissions,
        {
          permission: permissionInput.trim(),
          granted: true,
          subPermissions: [],
        },
      ],
    });
    setPermissionInput("");
  };

  const removePermission = (index) => {
    const updated = newAdmin.permissions.filter((_, i) => i !== index);
    setNewAdmin({ ...newAdmin, permissions: updated });
  };

  const addSubPermission = (parentIndex) => {
    if (!subPermissionInput.trim()) {
      toast.error("Sub-permission name cannot be empty");
      return;
    }

    const updated = [...newAdmin.permissions];
    const parent = updated[parentIndex];

    const exists = parent.subPermissions?.find(
      (sp) =>
        sp.permission.toLowerCase() === subPermissionInput.trim().toLowerCase()
    );

    if (exists) {
      toast.error("Sub-permission already exists");
      return;
    }

    if (!parent.subPermissions) {
      parent.subPermissions = [];
    }

    parent.subPermissions.push({
      permission: subPermissionInput.trim(),
      granted: true,
    });

    setNewAdmin({ ...newAdmin, permissions: updated });
    setSubPermissionInput("");
    setSelectedParentIndex(null);
  };

  const removeSubPermission = (parentIndex, subIndex) => {
    const updated = [...newAdmin.permissions];
    updated[parentIndex].subPermissions = updated[
      parentIndex
    ].subPermissions.filter((_, i) => i !== subIndex);
    setNewAdmin({ ...newAdmin, permissions: updated });
  };

  const togglePermissionGranted = (index) => {
    const updated = [...newAdmin.permissions];
    updated[index].granted = !updated[index].granted;
    setNewAdmin({ ...newAdmin, permissions: updated });
  };

  const toggleSubPermissionGranted = (parentIndex, subIndex) => {
    const updated = [...newAdmin.permissions];
    updated[parentIndex].subPermissions[subIndex].granted =
      !updated[parentIndex].subPermissions[subIndex].granted;
    setNewAdmin({ ...newAdmin, permissions: updated });
  };

  // Edit form permission functions
  const addEditPermission = () => {
    if (!editPermissionInput.trim()) {
      toast.error("Permission name cannot be empty");
      return;
    }

    const exists = editingPermissions.find(
      (p) =>
        p.permission.toLowerCase() === editPermissionInput.trim().toLowerCase()
    );

    if (exists) {
      toast.error("Permission already exists");
      return;
    }

    setEditingPermissions([
      ...editingPermissions,
      {
        permission: editPermissionInput.trim(),
        granted: true,
        subPermissions: [],
      },
    ]);
    setEditPermissionInput("");
  };

  const removeEditPermission = (index) => {
    const updated = editingPermissions.filter((_, i) => i !== index);
    setEditingPermissions(updated);
  };

  const addEditSubPermission = (parentIndex) => {
    if (!editSubPermissionInput.trim()) {
      toast.error("Sub-permission name cannot be empty");
      return;
    }

    const updated = [...editingPermissions];
    const parent = updated[parentIndex];

    const exists = parent.subPermissions?.find(
      (sp) =>
        sp.permission.toLowerCase() ===
        editSubPermissionInput.trim().toLowerCase()
    );

    if (exists) {
      toast.error("Sub-permission already exists");
      return;
    }

    if (!parent.subPermissions) {
      parent.subPermissions = [];
    }

    parent.subPermissions.push({
      permission: editSubPermissionInput.trim(),
      granted: true,
    });

    setEditingPermissions(updated);
    setEditSubPermissionInput("");
    setEditSelectedParentIndex(null);
  };

  const removeEditSubPermission = (parentIndex, subIndex) => {
    const updated = [...editingPermissions];
    updated[parentIndex].subPermissions = updated[
      parentIndex
    ].subPermissions.filter((_, i) => i !== subIndex);
    setEditingPermissions(updated);
  };

  const toggleEditPermissionGranted = (index) => {
    const updated = [...editingPermissions];
    updated[index].granted = !updated[index].granted;
    setEditingPermissions(updated);
  };

  const toggleEditSubPermissionGranted = (parentIndex, subIndex) => {
    const updated = [...editingPermissions];
    updated[parentIndex].subPermissions[subIndex].granted =
      !updated[parentIndex].subPermissions[subIndex].granted;
    setEditingPermissions(updated);
  };

  const submitEditPermissions = async () => {
    const updatedAdmin = {
      name: editingName,
      isActive: editingIsActive,
      permissions: editingPermissions,
    };

    try {
      await axiosInstance.put(
        `/auth/admin/updateadmin/${editingAdminId}`,
        updatedAdmin,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Admin updated successfully");
      setEditPermissionsModal(false);
      setEditingAdminId(null);
      setEditPermissionInput("");
      setEditSubPermissionInput("");
      setEditSelectedParentIndex(null);
      fetchAdmins();
    } catch (error) {
      toast.error("Failed to update admin");
      console.error("Update error:", error);
    }
  };

  const handleEditPermissions = (admin) => {
    setEditingAdminId(admin.id);
    setEditingName(admin.name || "");
    setEditingIsActive(admin.isActive ?? true);

    const perms = (admin.permissions || []).map((p) => ({
      permission: p.permission,
      granted: p.granted,
      subPermissions: p.subPermissions || [],
    }));
    setEditingPermissions(perms);
    setSelectedAdmin(admin);
    setEditPermissionsModal(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!adminToDelete) return;

    try {
      await axiosInstance.delete(
        `/auth/admin/deleteadmin/${adminToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Admin deleted successfully");
      setShowDeleteModal(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete admin");
    }
  };

  if (loading) return <h1>loading....</h1>;

  return (
    <div className="container mx-auto p-4 sm:p-6 bg-gray-50 text-gray-900 min-h-screen dark:bg-zinc-900 dark:text-white">
      <ToastContainer />
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Crown className="text-purple-800 w-6 h-6" />
           Admin Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Deep system oversight and administrative controls
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1 text-sm border px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 dark:border-zinc-600"
          >
            ➕ Create Admin
          </button>
          <button
            onClick={fetchAdmins}
            className="flex items-center gap-1 text-sm border px-3 py-1 rounded hover:bg-gray-100 dark:hover:bg-zinc-700 dark:border-zinc-600"
          >
            <RefreshCcw size={14} /> Refresh Data
          </button>
        </div>
      </div>

      {/* Admin List */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg border dark:border-zinc-700 p-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          Admin Management
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Data source: <code>Admins</code>, <code>admin_permissions</code>{" "}
          tables
        </p>

        {admins.map((admin) => (
          <div
            key={admin.id}
            className="bg-gray-50 dark:bg-zinc-700 p-4 rounded border dark:border-zinc-600 shadow-sm flex justify-between flex-wrap items-center mb-2"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-zinc-600" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{admin.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {admin.role}
                  </span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-300">
                  {admin.email}
                </div>
                <div
                  className="text-xs text-gray-400 dark:text-gray-300"
                  title={
                    admin.lastLogin
                      ? formatDate(admin.lastLogin)
                      : formatDate(admin.createdAt)
                  }
                >
                  {admin.lastLogin
                    ? `Last login: ${getRelativeTime(admin.lastLogin)}`
                    : `Created on: ${getRelativeTime(admin.createdAt)}`}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center m-5 gap-4 text-sm">
              <button
                onClick={() => handleViewPermissions(admin.permissions)}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                {admin.permissions?.length > 0
                  ? "Permissions"
                  : "No permissions"}
              </button>

              <Eye
                className="w-4 h-4 cursor-pointer text-gray-600 hover:text-black dark:hover:text-white"
                onClick={() => {
                  setSelectedAdmin(admin);
                  setIsViewOpen(true);
                }}
              />
              <Pencil
                className={`w-4 h-4 cursor-pointer ${
                  admin.status === "Banned"
                    ? "text-gray-400 opacity-50 cursor-not-allowed"
                    : "text-blue-500 hover:text-blue-700"
                }`}
                onClick={() => {
                  if (admin.status !== "Banned") {
                    handleEditPermissions(admin);
                  }
                }}
              />

              <Trash2
                className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-700"
                onClick={() => {
                  setAdminToDelete(admin);
                  setShowDeleteModal(true);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {isViewOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-800 dark:text-white p-6 rounded-lg shadow-md w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold mb-4">View Admin Details</h2>
            <div className="mb-3">
              <strong>Name:</strong> {selectedAdmin.name}
            </div>
            <div className="mb-3">
              <strong>Email:</strong> {selectedAdmin.email}
            </div>
            <div className="mb-3">
              <strong>Role:</strong> {selectedAdmin.role}
            </div>

            <div className="mb-3">
              <strong>Activity:</strong>{" "}
              <span
                title={
                  selectedAdmin.lastLogin
                    ? formatDate(selectedAdmin.lastLogin)
                    : formatDate(selectedAdmin.createdAt)
                }
              >
                {selectedAdmin.lastLogin
                  ? `Last login: ${getRelativeTime(selectedAdmin.lastLogin)}`
                  : `Created on: ${getRelativeTime(selectedAdmin.createdAt)}`}
              </span>
            </div>

            <div className="mb-3">
              <strong>Permissions:</strong>
              <ul className="list-disc pl-5 text-sm mt-1">
                {(selectedAdmin.permissions || []).map((perm, i) => (
                  <li key={i}>
                    {perm.permission} - {perm.granted ? "Granted" : "Revoked"}
                    {perm.subPermissions && perm.subPermissions.length > 0 && (
                      <ul className="list-circle pl-5">
                        {perm.subPermissions.map((sub, j) => (
                          <li key={j}>
                            {sub.permission} -{" "}
                            {sub.granted ? "Granted" : "Revoked"}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 dark:text-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="w-6 h-6" />
                Create New Admin
              </h2>
              <p className="text-sm text-purple-100 mt-1">
                Set up a new administrator with custom permissions
              </p>
            </div>

            <div className="p-6">
              {/* Basic Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <ShieldCheck className="w-5 h-5" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter admin name"
                      value={newAdmin.name}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, name: e.target.value })
                      }
                      className="border dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      value={newAdmin.email}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, email: e.target.value })
                      }
                      className="border dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      placeholder="+1234567890"
                      value={newAdmin.phone}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, phone: e.target.value })
                      }
                      className="border dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Password *
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newAdmin.password}
                      onChange={(e) =>
                        setNewAdmin({ ...newAdmin, password: e.target.value })
                      }
                      className="border dark:border-zinc-600 bg-white dark:bg-zinc-700 text-black dark:text-white w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <ShieldCheck className="w-5 h-5" />
                  Permissions Management
                </h3>

                {/* Add Permission Input */}
                <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Add New Permission
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Dashboard, Users, Analytics"
                      value={permissionInput}
                      onChange={(e) => setPermissionInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addPermission()}
                      className="flex-1 border dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addPermission}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {newAdmin.permissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No permissions added yet</p>
                      <p className="text-sm">
                        Add permissions to control admin access
                      </p>
                    </div>
                  ) : (
                    newAdmin.permissions.map((perm, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-zinc-700 border dark:border-zinc-600 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={perm.granted}
                              onChange={() => togglePermissionGranted(index)}
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {perm.permission}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                perm.granted
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {perm.granted ? "Granted" : "Revoked"}
                            </span>
                          </div>
                          <button
                            onClick={() => removePermission(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Sub-permissions */}
                        <div className="ml-7 mt-3">
                          <div className="flex gap-2 mb-2">
                            {selectedParentIndex === index ? (
                              <>
                                <input
                                  type="text"
                                  placeholder="Add sub-permission"
                                  value={subPermissionInput}
                                  onChange={(e) =>
                                    setSubPermissionInput(e.target.value)
                                  }
                                  onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    addSubPermission(index)
                                  }
                                  className="flex-1 border dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white px-3 py-1.5 rounded text-sm"
                                  autoFocus
                                />
                                <button
                                  onClick={() => addSubPermission(index)}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => setSelectedParentIndex(null)}
                                  className="bg-gray-400 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setSelectedParentIndex(index)}
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                + Add Sub-permission
                              </button>
                            )}
                          </div>

                          {perm.subPermissions?.map((sub, subIndex) => (
                            <div
                              key={subIndex}
                              className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-2 rounded mb-1"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={sub.granted}
                                  onChange={() =>
                                    toggleSubPermissionGranted(index, subIndex)
                                  }
                                  className="w-3 h-3 accent-blue-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {sub.permission}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  removeSubPermission(index, subIndex)
                                }
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-700">
                <button
                  className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition font-medium"
                  onClick={() => {
                    setIsCreateOpen(false);
                    setNewAdmin({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "Admin",
                      permissions: [],
                    });
                    setPermissionInput("");
                    setSubPermissionInput("");
                    setSelectedParentIndex(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2.5 rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium shadow-lg"
                  onClick={async () => {
                    if (
                      !newAdmin.name ||
                      !newAdmin.email ||
                      !newAdmin.phone ||
                      !newAdmin.password
                    ) {
                      toast.error("Please fill in all required fields");
                      return;
                    }

                    const payload = {
                      name: newAdmin.name,
                      email: newAdmin.email,
                      phone: newAdmin.phone,
                      password: newAdmin.password,
                      role: newAdmin.role,
                      permissions: newAdmin.permissions,
                    };

                    try {
                      await axiosInstance.post(
                        "/auth/admin/createadmin",
                        payload,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                          },
                        }
                      );

                      toast.success("Admin created successfully!");
                      fetchAdmins();
                      setIsCreateOpen(false);
                      setNewAdmin({
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                        role: "Admin",
                        permissions: [],
                      });
                      setPermissionInput("");
                      setSubPermissionInput("");
                      setSelectedParentIndex(null);
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message ||
                          "Failed to create admin"
                      );
                    }
                  }}
                >
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              Admin Permissions
            </h2>
            {selectedPermissions.length > 0 ? (
              <ul className="list-disc pl-5 text-gray-700 dark:text-gray-200">
                {selectedPermissions.map((perm, idx) => (
                  <li key={idx}>
                    {perm.permission.replace(/_/g, " ")}{" "}
                    <span
                      className={
                        perm.granted
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }
                    >
                      : {perm.granted ? "Granted" : "Revoked"}
                    </span>
                    {perm.subPermissions && perm.subPermissions.length > 0 && (
                      <ul className="list-circle pl-5">
                        {perm.subPermissions.map((sub, j) => (
                          <li key={j}>
                            {sub.permission}{" "}
                            <span
                              className={
                                sub.granted
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-500 dark:text-red-400"
                              }
                            >
                              : {sub.granted ? "Granted" : "Revoked"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No permissions assigned.
              </p>
            )}
            <div className="mt-6 text-right">
              <button
                onClick={() => setShowPermissionsModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {editPermissionsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-xl">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Pencil className="w-6 h-6" />
                Edit Admin Details
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                Update administrator information and permissions
              </p>
            </div>

            <div className="p-6">
              {/* Basic Info */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Admin Name *
                </label>
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full px-4 py-2.5 border dark:border-zinc-600 rounded-lg dark:bg-zinc-700 dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                  placeholder="Enter admin name"
                />
              </div>

              {/* Permissions Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <ShieldCheck className="w-5 h-5" />
                  Permissions Management
                </h3>

                {/* Add Permission Input */}
                <div className="bg-gray-50 dark:bg-zinc-700 p-4 rounded-lg mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Add New Permission
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Dashboard, Users, Analytics"
                      value={editPermissionInput}
                      onChange={(e) => setEditPermissionInput(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && addEditPermission()
                      }
                      className="flex-1 border dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={addEditPermission}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Permissions List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {editingPermissions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No permissions assigned</p>
                      <p className="text-sm">
                        Add permissions to control admin access
                      </p>
                    </div>
                  ) : (
                    editingPermissions.map((perm, index) => (
                      <div
                        key={index}
                        className="bg-white dark:bg-zinc-700 border dark:border-zinc-600 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={perm.granted}
                              onChange={() => toggleEditPermissionGranted(index)}
                              className="w-4 h-4 accent-blue-600"
                            />
                            <span className="font-medium text-gray-800 dark:text-gray-200">
                              {perm.permission}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                perm.granted
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }`}
                            >
                              {perm.granted ? "Granted" : "Revoked"}
                            </span>
                          </div>
                          <button
                            onClick={() => removeEditPermission(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Sub-permissions */}
                        <div className="ml-7 mt-3">
                          <div className="flex gap-2 mb-2">
                            {editSelectedParentIndex === index ? (
                              <>
                                <input
                                  type="text"
                                  placeholder="Add sub-permission"
                                  value={editSubPermissionInput}
                                  onChange={(e) =>
                                    setEditSubPermissionInput(e.target.value)
                                  }
                                  onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    addEditSubPermission(index)
                                  }
                                  className="flex-1 border dark:border-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-white px-3 py-1.5 rounded text-sm"
                                  autoFocus
                                />
                                <button
                                  onClick={() => addEditSubPermission(index)}
                                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() =>
                                    setEditSelectedParentIndex(null)
                                  }
                                  className="bg-gray-400 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  setEditSelectedParentIndex(index)
                                }
                                className="text-blue-600 dark:text-blue-400 text-sm hover:underline"
                              >
                                + Add Sub-permission
                              </button>
                            )}
                          </div>

                          {perm.subPermissions?.map((sub, subIndex) => (
                            <div
                              key={subIndex}
                              className="flex items-center justify-between bg-gray-50 dark:bg-zinc-800 p-2 rounded mb-1"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={sub.granted}
                                  onChange={() =>
                                    toggleEditSubPermissionGranted(
                                      index,
                                      subIndex
                                    )
                                  }
                                  className="w-3 h-3 accent-blue-600"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                  {sub.permission}
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  removeEditSubPermission(index, subIndex)
                                }
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t dark:border-zinc-700">
                <button
                  onClick={() => {
                    setEditPermissionsModal(false);
                    setEditPermissionInput("");
                    setEditSubPermissionInput("");
                    setEditSelectedParentIndex(null);
                  }}
                  className="bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 px-6 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-zinc-600 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={submitEditPermissions}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition font-medium shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{adminToDelete?.name}</span>? This
              action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded hover:bg-gray-400"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleDeleteConfirmed}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;