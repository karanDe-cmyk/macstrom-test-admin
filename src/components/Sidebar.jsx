import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Gamepad2,
  Image,
  LayoutDashboard,
  Settings,
  User,
  Bell,
  ClipboardList,
  Crown,
  Monitor,
  Gift,
  Users,
  Radio,
  Globe,
  Wallet,
  Headphones,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const menuItems = [
  {
    label: "Super Admin Panel",
    icon: Crown,
    submenuKey: "super-admin",
    subItems: [
      { label: "Admin Management", path: "/admin-management" },
    ],
  },
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
    permissionKey: "Dashboard"
  },
  {
    label: "Users",
    icon: User,
    submenuKey: "users",
    permissionKey: "Users",
    subItems: [
      { label: "All Users", path: "/users", permissionKey: "All Users" },
      { label: "User Settings", path: "/user-settings", permissionKey: "User Settings" },
      { label: "User KYC",path: "/user-kyc",permissionKey: "User KYC"},
      { label: "KYC Status", path: "/kyc", permissionKey: "KYC Status" },
      { label: "All Withdraw", path: "/all-withdraw", permissionKey: "All Withdraw" },
    ],
  },
  {
    label: "Tournaments Info",
    icon: Users,
    submenuKey: "teams",
    permissionKey: "Tournaments Info",
    subItems: [
      { label: "All Tournaments", path: "/teams", permissionKey: "All Tournaments" },
      { label: "Add Tournament", path: "/add-teams", permissionKey: "Add Tournament" },
      { label: "Games Registration", path: "/games-registation", permissionKey: "Games Registration" },
      {label: "All Transactions", path: "/all-transactions", permissionKey: "All Transactions" },
      { label: "Registration Form Controls", path: "/registation-details", permissionKey: "Registration Form Controls" },
      // { label: "Group Management", path: "/group-management", permissionKey: "Group Management" },
      // { label: "Prize Distribution", path: "/prize-distribution", permissionKey: "Prize Distribution" },
      { label: "Rules&Regulations", path: "/rules-regulations", permissionKey: "Rules&Regulations" },
    ],
  },
  {
    label: "Payment Gateway",
    icon: Wallet,
    path: "/payment-gateway",
    submenuKey: "paymentGateway",
    permissionKey: "Payment Gateway",
    subItems: [
      { label: " IMB Gateway Status", path: "/imb-gateway-status", permissionKey: "IMB Gateway Status" },
      { label: "Gateway Status", path: "/gateway-status", permissionKey: "Gateway Status" },
      { label: "PhonePay Gateway", path: "/phonepay-gateway", permissionKey: "PhonePay Gateway" },
      { label: "User Wallet Ledger", path: "/user-wallet-ledger", permissionKey: "User Wallet Ledger" },
    ],
  },
  {
    label: "Payment Invoice",
    icon: Wallet,
    // path: "/payment-invoice",
    submenuKey: "paymentInvoice",
    permissionKey: "Payment Invoice",
    subItems: [
      { label: "Invoice Details", path: "/generate-invoice", permissionKey: "Generate Invoice" }
    ],
  },
  {
    label: "Images",
    icon: Image,
    path: "/admin/images",
    permissionKey: "Images"
  },
  {
    label: "Games",
    icon: Gamepad2,
    submenuKey: "games",
    permissionKey: "Games",
    subItems: [
      { label: "All Games", path: "/games", permissionKey: "All Games" },
      { label: "Mega Contest", path: "/mega", permissionKey: "Mega Contest" },

    ],
  },
  {
    label: "Website",
    icon: Globe,
    submenuKey: "website",
    permissionKey: "Website",
    subItems: [
      { label: "Stats", path: "/website-stats", permissionKey: "Stats" },
      { label: "Contact Us", path: "/contactus", permissionKey: "Contact Us" },
    ],
  },
  {
    label: "Sponsor Ads",
    icon: Monitor,
    path: "/admin/ads",
    permissionKey: "Sponsor Ads"
  },
  {
    label: "News & Blogs",
    icon: ClipboardList,
    path: "/blogs",
    permissionKey: "News & Blogs"
  },
  {
    label: "Notification Center",
    icon: Bell,
    submenuKey: "notificationCenter",
    permissionKey: "Notification Center",
    subItems: [
      { label: "Notification", path: "/admin/notificationcenter", permissionKey: "Notification" },
      { label: "Email Controls", path: "/email-controls", permissionKey: "Email Controls" }
    ],
  },
  {
    label: "Reports",
    icon: ClipboardList,
    submenuKey: "reports",
    permissionKey: "Reports",
    subItems: [{ label: "Problem & Reports", path: "/Reportss", permissionKey: "Problem & Reports" }],
  },
  // {
  //   label: "Support Desk",
  //   icon: Headphones,
  //   path: "/support",
  // },
 {
    label: "Stream",
    icon: Radio,
    path: "/stream",
    permissionKey: "Stream"
  },
  {
    label: "Refer & Earn",
    icon: Gift,
    path: "/refer-earns",
    permissionKey: "Refer & Earn"
  },
  {
    label: "Ads Management",
    icon: Gift,
    path: "/ads-management",
    permissionKey: "Ads Management"
  },
  {
    label: "App Settings",
    icon: Settings,
    path: "/app-settings",
    permissionKey: "App Settings"
  },
  {
    label: "Setting",
    icon: Settings,
    path: "/settings",
    permissionKey: "Setting"
  },
  {
    label: "Suscription",
    icon: Radio,
    // path: "/suscription",
    permissionKey: "Suscription",
    subItems: [

      { label: "Subscription Plans", path: "/suscription", permissionKey: "Subscription Plans" },
      { label: "Subscription Members", path: "/subscription-members", permissionKey: "Subscription Members" },
    ],
  },
  {
    label: "Bonus",
    icon: Gift,
    path: "/bonus",
    permissionKey: "Bonus"
  },
  {
    label: "Referral System",
    icon: Users,
    path: "/referral-system",
    permissionKey: "Referral System"
  },
];

const Sidebar = () => {
  const [openMenus, setOpenMenus] = useState({});
  const [adminPermissions, setAdminPermissions] = useState({});
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  // Fetch admin permissions based on token
  useEffect(() => {
    const fetchPermissions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get token from localStorage
        const token = localStorage.getItem("authToken");
        
        if (!token) {
          console.error("No token found");
          setAdminPermissions({});
          setUserRole(null);
          setLoading(false);
          return;
        }

        // Decode token to get user info
        const decoded = jwtDecode(token);
        const { userId, role } = decoded;
        
        console.log("Decoded token - UserId:", userId, "Role:", role);
        localStorage.setItem("role", role);
        setUserRole(role);

        // If SuperAdmin, grant all permissions
        if (role === "SuperAdmin") {
          console.log("SuperAdmin - Granted all permissions");
          setAdminPermissions({ all: true });
          setLoading(false);
          return;
        }

        // If Admin, fetch permissions from API
        if (role === "Admin") {
          console.log("Fetching permissions for Admin ID:", userId);
          
          const response = await fetch(
            `https://macstrombattle-api.kglame.com/api/auth/admin/getadminpermissions/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error(`Failed to fetch permissions: ${response.status}`);
          }

          const data = await response.json();
          console.log("API Response:", data);
          
          // Create a flat permissions object with all permissions and sub-permissions
          const permissionsMap = {};
          
          data.permissions.forEach(permission => {
            if (permission.granted) {
              // Add main permission
              permissionsMap[permission.permission] = true;
              
              // Add sub-permissions
              if (permission.subPermissions && permission.subPermissions.length > 0) {
                permission.subPermissions.forEach(subPerm => {
                  if (subPerm.granted) {
                    permissionsMap[subPerm.permission] = true;
                  }
                });
              }
            }
          });
          
          console.log("Final permissions map:", permissionsMap);
          setAdminPermissions(permissionsMap);
        } else {
          // If role is neither SuperAdmin nor Admin, clear permissions
          console.log("Unknown role - clearing permissions");
          setAdminPermissions({});
        }

        setLoading(false);
        setError(null);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        // On error, show no permissions for security
        setAdminPermissions({});
        setUserRole(null);
        setError(error.message || "Failed to load permissions");
        setLoading(false);
      }
    };

    fetchPermissions();
    
    // Re-fetch on token change or when a storage event occurs
    const handleStorageChange = (e) => {
      if (e.key === "token") {
        console.log("Token changed, refetching permissions");
        fetchPermissions();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Check if user has permission for a specific item
  const hasPermission = (permissionKey) => {
    if (userRole === "SuperAdmin") return true;
    if (userRole === "Admin") {
      return adminPermissions[permissionKey] === true;
    }
    return false;
  };

  // Filter menu items and their sub-items based on permissions
  const filterMenuItemsByPermission = (items) => {
    return items
      .filter(item => {
        // Hide Super Admin Panel for non-SuperAdmin users
        if (item.label === "Super Admin Panel" && userRole !== "SuperAdmin") {
          return false;
        }
        
        // For Admins, check permission
        if (userRole === "Admin") {
          // If item has subItems, check if any sub-item has permission
          if (item.subItems) {
            const filteredSubItems = filterMenuItemsByPermission(item.subItems);
            return filteredSubItems.length > 0;
          }
          // For regular items, check direct permission
          return hasPermission(item.permissionKey);
        }
        
        // For SuperAdmin, show everything
        if (userRole === "SuperAdmin") {
          return true;
        }
        
        // If no valid role, show nothing
        return false;
      })
      .map(item => {
        // If item has subItems, filter them too
        if (item.subItems) {
          return {
            ...item,
            subItems: filterMenuItemsByPermission(item.subItems)
          };
        }
        return item;
      });
  };

  const renderMenuItem = (item, depth = 0) => {
    const Icon = item.icon;
    const isSubmenuOpen = openMenus[item.submenuKey];
    const marginClass = depth > 0 ? `ml-${depth * 5}` : "";

    // If item has both path and subItems (like User KYC)
    if (item.path && item.subItems && item.subItems.length > 0) {
      return (
        <div key={item.label}>
          <div className="flex">
            <Link
              to={item.path}
              className={`flex-1 p-2 rounded-l hover:bg-zinc-300 dark:hover:bg-zinc-700 ${marginClass} ${
                location.pathname === item.path
                  ? "text-primary-600 font-medium bg-zinc-300 dark:bg-zinc-700"
                  : ""
              }`}
            >
              {item.label}
            </Link>
            <button
              onClick={() => toggleMenu(item.submenuKey)}
              className="p-2 rounded-r hover:bg-zinc-300 dark:hover:bg-zinc-700 border-l border-zinc-400 dark:border-zinc-600"
            >
              {isSubmenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>
          {isSubmenuOpen && (
            <div className="ml-5 my-2 space-y-1">
              {item.subItems.map((sub) => renderMenuItem(sub, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // If item has only subItems (expandable menu)
    if (item.subItems && item.subItems.length > 0) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleMenu(item.submenuKey)}
            className={`flex w-full items-center justify-between p-2 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 border-b dark:border-zinc-700 ${marginClass}`}
          >
            <span className="flex items-center space-x-2">
              {Icon && <Icon size={18} />}
              <span>{item.label}</span>
            </span>
            {isSubmenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {isSubmenuOpen && (
            <div className="ml-5 my-2 space-y-1">
              {item.subItems.map((sub) => renderMenuItem(sub, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Regular link item
    return (
      <Link
        key={item.label}
        to={item.path}
        className={`block p-3 rounded hover:text-primary-500 hover:bg-zinc-300 dark:hover:bg-zinc-700 ${marginClass} ${
          location.pathname === item.path
            ? "text-primary-600 font-medium bg-zinc-300 dark:bg-zinc-700"
            : ""
        }`}
      >
        {item.label}
      </Link>
    );
  };

  // Filter menu items based on permissions
  const filteredMenuItems = filterMenuItemsByPermission(menuItems);

  if (loading) {
    return (
      <aside className="w-64 bg-green-50 dark:bg-zinc-800 text-zinc-800 dark:text-white border-r dark:border-zinc-700 min-h-screen">
        <div className="p-4 text-2xl font-bold">
          MacStorm <span className="text-green-600">Battle</span>{" "}
          <span className="text-green-800">Admin</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">Loading permissions...</div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="w-64 bg-green-50 dark:bg-zinc-800 text-zinc-800 dark:text-white border-r dark:border-zinc-700 min-h-screen">
        <div className="p-4 text-2xl font-bold">
          MacStorm <span className="text-green-600">Battle</span>{" "}
          <span className="text-green-800">Admin</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">
            <p>Error loading permissions</p>
            <p className="text-xs mt-2">{error}</p>
          </div>
        </div>
      </aside>
    );
  }

  if (filteredMenuItems.length === 0 && userRole === "Admin") {
    return (
      <aside className="w-64 bg-green-50 dark:bg-zinc-800 text-zinc-800 dark:text-white border-r dark:border-zinc-700 min-h-screen">
        <div className="p-4 text-2xl font-bold">
          MacStorm <span className="text-green-600">Battle</span>{" "}
          <span className="text-green-800">Admin</span>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center text-yellow-600">
            <p>No permissions assigned</p>
            <p className="text-xs mt-2">Please contact SuperAdmin</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="overflow-y-auto w-64 bg-green-50 dark:bg-zinc-800 text-zinc-800 dark:text-white border-r dark:border-zinc-700 min-h-screen">
      <div className="p-4 text-2xl font-bold">
        MacStorm <span className="text-green-600">Battle</span>{" "}
        <span className="text-green-800">Admin</span>
      </div>
      <nav className="px-4 space-y-3 my-2 text-sm">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isSubmenuOpen = openMenus[item.submenuKey];

          // Handle items with both path and subItems
          if (item.path && item.subItems && item.subItems.length > 0) {
            return (
              <div key={item.label}>
                <div className="flex">
                  <Link
                    to={item.path}
                    className={`flex-1 flex items-center space-x-2 p-2 rounded-l hover:bg-zinc-300 dark:hover:bg-zinc-700 ${
                      location.pathname === item.path
                        ? "bg-zinc-200 dark:bg-zinc-700 font-medium"
                        : ""
                    }`}
                  >
                    {Icon && <Icon size={18} />}
                    <span>{item.label}</span>
                  </Link>
                  <button
                    onClick={() => toggleMenu(item.submenuKey)}
                    className="p-2 rounded-r hover:bg-zinc-300 dark:hover:bg-zinc-700 border-l border-zinc-400 dark:border-zinc-600"
                  >
                    {isSubmenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  </button>
                </div>
                {isSubmenuOpen && (
                  <div className="ml-5 my-2 space-y-1">
                    {item.subItems.map((sub) => renderMenuItem(sub, 0))}
                  </div>
                )}
              </div>
            );
          }

          // Handle items with only subItems
          if (item.subItems && item.subItems.length > 0) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleMenu(item.submenuKey)}
                  className="flex w-full items-center justify-between p-2 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 border-b dark:border-zinc-700"
                >
                  <span className="flex items-center space-x-2">
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </span>
                  {isSubmenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                {isSubmenuOpen && (
                  <div className="ml-5 my-2 space-y-1">
                    {item.subItems.map((sub) => renderMenuItem(sub, 0))}
                  </div>
                )}
              </div>
            );
          }

          // Handle regular links
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center space-x-2 p-2 rounded hover:bg-zinc-300 dark:hover:bg-zinc-700 ${
                location.pathname === item.path
                  ? "bg-zinc-200 dark:bg-zinc-700 font-medium"
                  : ""
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;