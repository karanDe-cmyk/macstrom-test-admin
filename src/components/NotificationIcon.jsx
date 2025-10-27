import React from "react";
import { Bell } from "lucide-react";

const NotificationIcon = ({ hasUnread, onClick }) => {
  return (
    <div className="relative">
      <button
        onClick={onClick}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
        title="Notifications"
      >
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {hasUnread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
        )}
      </button>
    </div>
  );
};

export default NotificationIcon;