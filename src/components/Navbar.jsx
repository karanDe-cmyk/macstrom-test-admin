import React, { useEffect, useRef, useState } from "react";
import { Menu, User, Edit2, Save, X } from "lucide-react";
import DarkModeToggle from "./DarkModeToggle";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";
import NotificationIcon from "./NotificationIcon";

const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
};

const ProfileModal = ({
  open,
  onClose,
  profileData,
  setProfileData,
  onSave,
  saving,
}) => {
  if (!open) return null;

  const onField = (key) => (e) =>
    setProfileData((p) => ({ ...p, [key]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setProfileData((p) => ({
      ...p,
      profile_image_file: file,
      profile_image_preview: previewUrl,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl mx-2 p-6 relative border border-zinc-200 dark:border-zinc-700">
        <button
          className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-white transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            {profileData?.profile_image_preview || profileData?.profile_image ? (
              <img
                src={
                  profileData?.profile_image_preview ||
                  profileData?.profile_image
                }
                alt="Avatar"
                className="w-20 h-20 rounded-full border object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border bg-pink-200 text-white flex items-center justify-center font-bold text-5xl">
                {getInitials(profileData?.name)}
              </div>
            )}

            {profileData?.role !== "Admin" && (
              <label className="absolute bottom-0 right-0 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-200 rounded-full p-1 cursor-pointer shadow group-hover:scale-105 transition">
                <Edit2 className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <div className="mt-2 text-lg font-semibold text-zinc-800 dark:text-white">
            Profile
          </div>
        </div>

        <div className="space-y-3">
          {["name", "email", "phone"].map((field) => (
            <div key={field} className="flex items-center gap-2">
              <label className="w-28 text-sm text-zinc-700 dark:text-zinc-200">
                {field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type={field === "email" ? "email" : "text"}
                className="flex-1 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none"
                value={profileData?.[field] || ""}
                onChange={onField(field)}
                readOnly={profileData?.role === "Admin" && field !== "phone"}
              />
            </div>
          ))}

          <div className="flex items-center gap-2">
            <label className="w-28 text-sm text-zinc-700 dark:text-zinc-200">
              Role
            </label>
            <input
              className="flex-1 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 outline-none cursor-not-allowed"
              value={profileData?.role || ""}
              disabled
            />
          </div>

          {profileData?.role !== "Admin" && (
            <div className="flex items-center gap-2">
              <label className="w-28 text-sm text-zinc-700 dark:text-zinc-200">
                New Password
              </label>
              <input
                type="password"
                className="flex-1 px-3 py-2 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white outline-none"
                value={profileData?.newPassword || ""}
                onChange={onField("newPassword")}
                placeholder="Leave blank to keep"
              />
            </div>
          )}
        </div>

        {profileData?.role !== "Admin" && (
          <div className="mt-6 flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-60"
              onClick={onSave}
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = ({ onToggleSidebar }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    profile_image: "",
    profile_image_preview: "",
    profile_image_file: null,
    newPassword: "",
  });

  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Get user role from localStorage
  const userRole = localStorage.getItem("role") || "";
  const isSuperAdmin = userRole === "SuperAdmin";

  useEffect(() => {
    fetchUserData();
    if (isSuperAdmin) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchUserData();
  }, []);

  // ✅ Replaced fetch with axiosInstance
  const fetchUserData = async () => {
    try {
      const { data } = await axiosInstance.get("/auth/admin/profile");
      if (data?.success && data?.user) {
        setUserData({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          role: data.user.role || "",
          profile_image: data.user.profile_image || "",
          profile_image_preview: "",
          profile_image_file: null,
          newPassword: "",
        });
      }
    } catch (e) {
      console.error("Failed to fetch user data:", e);
      toast.error("Failed to load profile data");
    }
  };

  const fetchNotifications = async () => {
    if (!isSuperAdmin) return;

    try {
      const response = await axiosInstance.get("/auth/admin/notifications");
      const notificationsData = response.data.notifications || [];
      setNotifications(notificationsData);
      setHasUnreadNotifications(notificationsData.some(notif => !notif.isRead));
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Don't show error toast for notifications to avoid spam
    }
  };

  const openProfile = async () => {
    setProfileOpen(true);
    await fetchUserData();
  };

  const handleNotificationsClick = () => {
    navigate("/notifications");
  };

  // ✅ Replaced fetch PUT with axiosInstance
  const saveProfile = async () => {
    try {
      setSaving(true);

      const formData = new FormData();
      formData.append("name", userData?.name || "");
      formData.append("phone", userData?.phone || "");

      if (userData?.newPassword) {
        formData.append("newPassword", userData.newPassword);
      }
      if (userData?.profile_image_file instanceof File) {
        formData.append("profile_image", userData.profile_image_file);
      }

      const { data: result } = await axiosInstance.put(
        "/auth/admin/profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (result?.success) {
        toast.success("Profile updated!");

        if (userData.profile_image_preview) {
          URL.revokeObjectURL(userData.profile_image_preview);
        }

        setUserData((prev) => ({
          ...prev,
          profile_image: result.user?.profile_image || prev.profile_image,
          profile_image_preview: "",
          profile_image_file: null,
          newPassword: "",
        }));

        setProfileOpen(false);
      } else {
        throw new Error(result?.message || "Failed to save profile");
      }
    } catch (e) {
      console.error("Save profile error:", e);
      toast.error(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const getProfileImageSrc = () => {
    if (userData.profile_image && typeof userData.profile_image === "string") {
      return userData.profile_image;
    }
    if (userData.profile_image_preview) {
      return userData.profile_image_preview;
    }
    return null;
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.removeItem("authToken");
    localStorage.removeItem("deviceId");
    toast.success("Logged out successfully!", { position: "top-center" });
    setTimeout(() => navigate("/login", { replace: true }), 800);
  };

  useEffect(() => {
    return () => {
      if (userData.profile_image_preview) {
        URL.revokeObjectURL(userData.profile_image_preview);
      }
    };
  }, [userData.profile_image_preview]);

  const profileImageSrc = getProfileImageSrc();

  return (
    <header className="h-16 px-4 md:px-6 flex items-center justify-between bg-white dark:bg-zinc-800 border-b dark:border-zinc-700">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700"
        >
          <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
        </button>
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-white">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
        <DarkModeToggle />

        {isSuperAdmin && (
          <NotificationIcon 
            hasUnread={hasUnreadNotifications}
            onClick={handleNotificationsClick}
          />
        )}
        <span className="text-sm text-zinc-600 dark:text-zinc-300">
          {userData?.role || "Admin"}
        </span>

        {profileImageSrc ? (
          <img
            src={profileImageSrc}
            alt="Avatar"
            className="w-8 h-8 rounded-full border cursor-pointer object-cover"
            onClick={() => setDropdownOpen((p) => !p)}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div
            onClick={() => setDropdownOpen((p) => !p)}
            className="w-8 h-8 rounded-full border cursor-pointer bg-pink-200 text-white flex items-center justify-center font-bold text-xl"
          >
            {getInitials(userData?.name)}
          </div>
        )}

        {dropdownOpen && (
          <div className="absolute right-0 top-12 mt-2 w-44 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50">
            <button
              onClick={() => {
                setDropdownOpen(false);
                openProfile();
              }}
              className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-800 dark:text-white rounded-t-lg flex items-center gap-2"
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-red-600 dark:text-red-400 rounded-b-lg"
            >
              Logout
            </button>
          </div>
        )}

        <ProfileModal
          open={profileOpen}
          onClose={() => {
            if (userData.profile_image_preview) {
              URL.revokeObjectURL(userData.profile_image_preview);
            }
            setProfileOpen(false);
            fetchUserData();
          }}
          profileData={userData}
          setProfileData={setUserData}
          onSave={saveProfile}
          saving={saving}
        />
      </div>
    </header>
  );
};

export default Navbar;
