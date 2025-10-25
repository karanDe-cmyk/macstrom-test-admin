import React, { useState } from "react";
import { Search, Download ,Crown, RefreshCcw} from "lucide-react";
import { auditLogs } from "../data/users";

const severityColors = {
  Critical: "bg-red-500",
  High: "bg-orange-500",
  Medium: "bg-yellow-400",
  Low: "bg-green-500",
};



export default function AuditLogViewer() {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSeverity = filter === "All" || log.severity === filter;
    const matchesSearch = log.action
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      log.admin.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const exportToCSV = () => {
  if (!filteredLogs.length) return;

  const header = Object.keys(filteredLogs[0]).join(",");
  const rows = filteredLogs.map(log =>
    Object.values(log).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
  );
  const csvContent = [header, ...rows].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "audit_logs.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
         {/* header */}
        <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Crown className="text-purple-800 w-6 h-6" />
            Super Admin Panel
          </h1>
          <p className="text-sm text-gray-500">
            Deep system oversight and administrative controls
          </p>
        </div>
        <button className="flex items-center gap-1 text-sm border px-3 py-1 rounded hover:bg-gray-100">
          <RefreshCcw size={14} /> Refresh Data
        </button>
      </div>

       {/* Audit log */}
       <div className="bg-white rounded-lg border p-4">
      <h3 className="text-xl font-semibold mb-1">📝 Audit Log Viewer</h3>
      <p className="text-sm text-gray-500 mb-4">Data source: admin_audit table</p>

      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div className="relative w-full md:w-1/2">
          <Search className="absolute top-2.5 left-3 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by admin, action, or details..."
            className="w-full pl-10 pr-4 py-2 border rounded-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-3 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300 flex items-center gap-1"
           >
            <Download className="w-4 h-4" />
            Export CSV
        </button>


          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm px-3 py-1.5 border rounded-md"
          >
            <option value="All">All Severity</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredLogs.map((log, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row justify-between gap-2"
          >
            <div>
              <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                {log.action.toUpperCase()}
                <span
                  className={`text-white text-xs px-2 py-0.5 rounded-full ${severityColors[log.severity]}`}
                >
                  {log.severity}
                </span>
              </h4>
              <p className="text-sm text-gray-700">{log.details}</p>
              <p className="text-xs text-gray-500 mt-2">
                Admin: {log.admin} &nbsp;|&nbsp; Resource: {log.resource} &nbsp;|&nbsp;
                IP: {log.ip} &nbsp;|&nbsp; Agent: {log.agent}
              </p>
            </div>
            <span className="text-xs text-gray-500 mt-auto">{log.timestamp}</span>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
