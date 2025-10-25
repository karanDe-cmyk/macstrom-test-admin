import React, { useState } from "react";
import { Eye } from "lucide-react";
import Modal from "./Modal";
import ProblemSummary from "./ProblemSummary";
import Dropdown from "../components/Dropdown";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import ExportButton from "../components/ExportButton";

const initialProblems = [
  {
    id: "P001",
    title: "Unable to withdraw winnings",
    user: "rahul_verma",
    category: "Payment",
    severity: "High",
    status: "Open",
    sla: "Urgent",
    timer: "4h",
    date: "2025-07-22",
    assigned: "Unassigned",
    description:
      "User unable to process payout to bank account. Shows error code 504.",
  },
  {
    id: "P002",
    title: "Match result dispute",
    user: "team_mumbai",
    category: "Gameplay",
    severity: "Medium",
    status: "In Progress",
    sla: "On Time",
    timer: "17h",
    date: "2025-07-21",
    assigned: "admin_swati",
    description:
      "User claims incorrect result in match ID 2201, team performance mismatch.",
  },
  {
    id: "P003",
    title: "Account verification failed",
    user: "ananya_singh",
    category: "Account",
    severity: "Low",
    status: "Open",
    sla: "On Time",
    timer: "21h",
    date: "2025-07-20",
    assigned: "Unassigned",
    description: "KYC failed even after uploading proper documents.",
  },
  {
    id: "P004",
    title: "OTP not received",
    user: "deepak_sharma",
    category: "Account",
    severity: "Low",
    status: "Resolved",
    sla: "On Time",
    timer: "12h",
    date: "2025-07-21",
    assigned: "admin_ravi",
    description: "User did not receive OTP on mobile during login.",
  },
  {
    id: "P005",
    title: "Delay in deposit confirmation",
    user: "priya_mehta",
    category: "Payment",
    severity: "Medium",
    status: "Open",
    sla: "On Time",
    timer: "6h",
    date: "2025-07-22",
    assigned: "Unassigned",
    description: "UPI payment done but not reflected in wallet.",
  },
  {
    id: "P006",
    title: "Wrong score update",
    user: "team_kolkata",
    category: "Gameplay",
    severity: "High",
    status: "In Progress",
    sla: "Urgent",
    timer: "3h",
    date: "2025-07-22",
    assigned: "admin_ajay",
    description: "Final score of match updated incorrectly.",
  },
  {
    id: "P007",
    title: "Unable to login",
    user: "nikita_jain",
    category: "Account",
    severity: "High",
    status: "Open",
    sla: "Urgent",
    timer: "2.5h",
    date: "2025-07-22",
    assigned: "admin_sneha",
    description: "Login failing with token expired message.",
  },
  {
    id: "P008",
    title: "Bonus not credited",
    user: "amit_rana",
    category: "Payment",
    severity: "Medium",
    status: "Open",
    sla: "On Time",
    timer: "7.5h",
    date: "2025-07-21",
    assigned: "Unassigned",
    description: "Signup bonus not added even after completing steps.",
  },
  {
    id: "P009",
    title: "Incorrect account details",
    user: "sunita_yadav",
    category: "Account",
    severity: "Low",
    status: "Resolved",
    sla: "On Time",
    timer: "8.0h",
    date: "2025-07-20",
    assigned: "admin_ravi",
    description: "User wants to update email and mobile number.",
  },
  {
    id: "P010",
    title: "Leaderboard error",
    user: "arjun_malik",
    category: "Gameplay",
    severity: "High",
    status: "Open",
    sla: "Urgent",
    timer: "4.5h",
    date: "2025-07-22",
    assigned: "Unassigned",
    description: "Leaderboard points not calculated for recent match.",
  },
  // Adding 10 more
  ...Array.from({ length: 90 }, (_, i) => ({
    id: `P01${i + 1}`,
    title: `Auto-generated problem ${i + 1}`,
    user: `user_${i + 1}`,
    category: ["Gameplay", "Payment", "Account"][i % 3],
    severity: ["High", "Medium", "Low"][i % 3],
    status: ["Open", "In Progress", "Resolved"][i % 3],
    sla: i % 2 === 0 ? "Urgent" : "On Time",
    timer: `${i + 2}h`,
    date: "2025-07-22",
    assigned: i % 2 === 0 ? "admin_swati" : "Unassigned",
    description: `Test problem description ${i + 1}.`,
  })),
];

const adminUsers = [
  "admin_swati",
  "admin_ravi",
  "admin_ajay",
  "admin_sneha",
  "admin_rohan",
];

const ProblemCenter = () => {
  const [problems, setProblems] = useState(initialProblems);
  const [severity, setSeverity] = useState("All Severities");
  const [status, setStatus] = useState("All Statuses");
  const [assignment, setAssignment] = useState("All Problems");
  const [search, setSearch] = useState("");
  const [modalProblem, setModalProblem] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProblems = problems.filter(
    (p) =>
      (severity === "All Severities" || p.severity === severity) &&
      (status === "All Statuses" || p.status === status) &&
      (assignment === "All Problems" ||
        (assignment === "Unassigned" && p.assigned === "Unassigned") ||
        (assignment === "Assigned" && p.assigned !== "Unassigned")) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.user.toLowerCase().includes(search.toLowerCase()))
  );

  const handleAssignChange = (id, newAdmin) => {
    setProblems((prev) =>
      prev.map((p) => (p.id === id ? { ...p, assigned: newAdmin } : p))
    );
  };

  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginated = filteredProblems.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Problem Center</h1>

      <ProblemSummary filteredProblems={filteredProblems} />

      <div className="w-full bg-white p-4 rounded-md shadow-sm mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
            <Dropdown
              label="Severity"
              options={["All Severities", "High", "Medium", "Low"]}
              value={severity}
              onChange={setSeverity}
            />
            <Dropdown
              label="Status"
              options={[
                "All Statuses",
                "Open",
                "In Progress",
                "Resolved",
                "Closed",
              ]}
              value={status}
              onChange={setStatus}
            />
            <Dropdown
              label="Assignment"
              options={["All Problems", "Unassigned", "Assigned"]}
              value={assignment}
              onChange={setAssignment}
            />
          </div>
          <div className="w-full md:w-auto">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
      </div>

      <ExportButton data={filteredProblems} />

      <div className="mt-4">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded shadow">
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                {[
                  "ID",
                  "Title",
                  "User",
                  "Category",
                  "Severity",
                  "Status",
                  "SLA",
                  "Date",
                  "Assigned",
                  "Action",
                ].map((h) => (
                  <th key={h} className="px-4 py-2 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((p) => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{p.id}</td>
                  <td className="px-4 py-2">{p.title}</td>
                  <td className="px-4 py-2 capitalize">{p.user}</td>
                  <td className="px-4 py-2">{p.category}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full text-white ${
                        p.severity === "High"
                          ? "bg-red-500"
                          : p.severity === "Medium"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      {p.severity}
                    </span>
                  </td>
                  <td className="px-4 py-2">{p.status}</td>
                  <td className="px-4 py-2">
                    {p.sla} ({p.timer})
                  </td>
                  <td className="px-4 py-2">{p.date}</td>
                  <td className="px-4 py-2">
                    <select
                      className="border rounded px-2 py-1 text-xs capitalize"
                      value={p.assigned}
                      onChange={(e) => handleAssignChange(p.id, e.target.value)}
                    >
                      <option value="Unassigned">Unassigned</option>
                      {adminUsers.map((admin) => (
                        <option key={admin} value={admin}>
                          {admin}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => setModalProblem(p)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white font-semibold text-xs rounded shadow hover:bg-blue-700 transition"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {paginated.map((p) => (
            <div key={p.id} className="bg-white p-4 rounded shadow space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{p.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded-full text-white ${
                    p.severity === "High"
                      ? "bg-red-500"
                      : p.severity === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {p.severity}
                </span>
              </div>
              <p className="text-sm">User Id: {p.id}</p>
              <p className="text-sm">User: {p.user}</p>
              <p className="text-sm">Category: {p.category}</p>
              <p className="text-sm">Status: {p.status}</p>
              <p className="text-sm">
                SLA: {p.sla} ({p.timer})
              </p>
              <p className="text-sm">Date: {p.date}</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Assigned
                </label>
                <select
                  className="border rounded px-2 py-1 text-xs capitalize w-full"
                  value={p.assigned}
                  onChange={(e) => handleAssignChange(p.id, e.target.value)}
                >
                  <option value="Unassigned">Unassigned</option>
                  {adminUsers.map((admin) => (
                    <option key={admin} value={admin}>
                      {admin}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setModalProblem(p)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white font-semibold text-xs rounded shadow hover:bg-blue-700 transition"
                >
                  <Eye size={14} />
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredProblems.length / itemsPerPage)}
            onPageChange={setCurrentPage}
          />


      {modalProblem && (
        <Modal
          problem={{ ...modalProblem, createdAt: modalProblem.date }}
          onClose={() => setModalProblem(null)}
        />
      )}
    </div>
  );
};

export default ProblemCenter;
