// components/StatCard.jsx
import React from "react";
import { Link } from "react-router-dom";

function StatCard({ icon: Icon, title, value, to = "#" }) {
  return (
    <Link
      to={to}
      className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:bg-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-700 p-4"
    >
      <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-full mr-4">
        <Icon className="w-6 h-6 text-zinc-800 dark:text-white" />
      </div>
      <div>
        <h5 className="text-md font-semibold text-gray-900 dark:text-white">{title}</h5>
        <p className="text-sm text-gray-600 dark:text-gray-400">{value}</p>
      </div>
    </Link>
  );
}

export default StatCard;
