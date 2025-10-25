// layouts/AuthLayout.jsx
import React from "react";
import { ToastContainer } from "react-toastify";
import FirebaseNotificationHandler from "../components/FirebaseNotificationHandler";

const AuthLayout = ({ children }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-200 dark:bg-zinc-500 transition-colors duration-300">
      {/* Firebase Notifications */}
      <FirebaseNotificationHandler />
      <ToastContainer />
      {children}
    </div>
  );
};

export default AuthLayout;
