// layouts/MainLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FirebaseNotificationHandler from "../components/FirebaseNotificationHandler";
import { ToastContainer } from "react-toastify";

const MainLayout = ({ children, isSidebarOpen, setIsSidebarOpen }) => {
  return (
    <div className="flex min-h-screen bg-neutral-200 dark:bg-zinc-500 transition-colors duration-300">
      {isSidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <FirebaseNotificationHandler />
        <ToastContainer />
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
