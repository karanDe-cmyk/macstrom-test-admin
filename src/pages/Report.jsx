// Report.jsx
import React, { useState, useEffect } from "react";
import {
  Download,
  Eye,
  Mail,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import Modal from "react-modal";

Modal.setAppElement("#root");

const reportTemplates = [
  { name: "Users List", description: "Detailed list of all registered users" },
  { name: "Revenue Report", description: "Daily revenue summary and growth" },
  { name: "Votes Breakdown", description: "Summary of votes by type" },
  { name: "SLA Compliance", description: "Service level performance" },
  { name: "Bet Liability", description: "Risk and exposure report" },
];

const frequencyOptions = ["Daily", "Weekly", "Monthly"];

const formatDate = (date) => format(date, "MMMM do, yyyy");

export default function Report() {
  const [template, setTemplate] = useState("Users List");
  const [description, setDescription] = useState(
    "Detailed list of all registered users"
  );
  const [startDate, setStartDate] = useState(new Date("2025-06-24"));
  const [endDate, setEndDate] = useState(new Date("2025-07-24"));
  const [formatType, setFormatType] = useState("CSV");
  const [scheduleEmail, setScheduleEmail] = useState(false);
  const [frequency, setFrequency] = useState("Daily");
  const [recipients, setRecipients] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [scheduledReports, setScheduledReports] = useState([
    {
      id: "S001",
      name: "Weekly Active Users",
      template: "User Activity",
      frequency: "Weekly",
      status: "Active",
      recipients: "admin@example.com",
    },
    {
      id: "S002",
      name: "Monthly Purchases",
      template: "Purchases",
      frequency: "Monthly",
      status: "Paused",
      recipients: "finance@example.com",
    },
    ...Array.from({ length: 8 }).map((_, i) => ({
      id: `S00${i + 3}`,
      name: `Auto Report ${i + 1}`,
      template: "Auto Template",
      frequency: ["Daily", "Weekly", "Monthly"][i % 3],
      status: i % 2 === 0 ? "Active" : "Paused",
      recipients: `user${i + 1}@example.com`,
    })),
  ]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const [emailLogs, setEmailLogs] = useState([
    {
      id: "E001",
      subject: "Weekly Report: Active Users",
      sentTo: "admin@example.com",
      date: "2025-07-20",
    },
    {
      id: "E002",
      subject: "Monthly Report: Purchases",
      sentTo: "finance@example.com",
      date: "2025-07-01",
    },
    ...Array.from({ length: 10 }).map((_, i) => ({
      id: `E00${i + 3}`,
      subject: `Auto Email Report ${i + 1}`,
      sentTo: `email${i}@example.com`,
      date: dayjs().subtract(i, "day").format("YYYY-MM-DD"),
    })),
  ]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 5;
  const totalPages = Math.ceil(scheduledReports.length / reportsPerPage);
  const paginatedReports = scheduledReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage
  );

  // Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterFrequency, setFilterFrequency] = useState("");
  const [filterTemplate, setFilterTemplate] = useState("");

  const filteredReports = scheduledReports.filter((r) => {
    return (
      (!searchTerm ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (!filterStatus || r.status === filterStatus) &&
      (!filterFrequency || r.frequency === filterFrequency) &&
      (!filterTemplate || r.template === filterTemplate)
    );
  });

  const handleDelete = (id) => {
    setScheduledReports((prev) => prev.filter((r) => r.id !== id));
  };

  const handleEditSave = () => {
    setScheduledReports((prev) =>
      prev.map((r) => (r.id === editRow.id ? editRow : r))
    );
    setEditModalOpen(false);
  };

  useEffect(() => {
    const match = reportTemplates.find((t) => t.name === template);
    setDescription(match?.description || "");
  }, [template]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <button className="flex items-center gap-2 border rounded px-4 py-1.5">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded p-6 shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-1 font-medium">Report Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="border w-full p-2 rounded"
            >
              {reportTemplates.map((r) => (
                <option key={r.name}>{r.name}</option>
              ))}
            </select>
            <p className="text-gray-500 text-sm mt-1">{description}</p>

            <label className="block mt-4 font-medium mb-1">Date Range</label>
            <div className="flex gap-3">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="border p-2 rounded w-full"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="border p-2 rounded w-full"
              />
            </div>

            <label className="block mt-4 font-medium mb-1">Output Format</label>
            <div className="flex gap-3">
              {["CSV", "PDF"].map((fmt) => (
                <button
                  key={fmt}
                  className={`px-4 py-2 rounded border ${
                    formatType === fmt
                      ? "bg-black text-white"
                      : "bg-white text-black"
                  }`}
                  onClick={() => setFormatType(fmt)}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 mt-1">
              <input
                type="checkbox"
                checked={scheduleEmail}
                onChange={() => setScheduleEmail(!scheduleEmail)}
              />
              Schedule Email Report
            </label>

            {scheduleEmail && (
              <div className="mt-4">
                <label className="block font-medium mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  {frequencyOptions.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>

                <label className="block font-medium mt-4 mb-1">Recipients</label>
                <input
                  type="text"
                  placeholder="email1@example.com, email2@example.com"
                  value={recipients}
                  onChange={(e) => setRecipients(e.target.value)}
                  className="border p-2 rounded w-full"
                />
                <button className="mt-4 flex gap-2 items-center bg-black text-white px-4 py-2 rounded">
                  <Mail size={16} />
                  Save Schedule
                </button>
              </div>
            )}

            <div className="flex gap-4 mt-6">
              <button
                className="border rounded px-4 py-2"
                onClick={() => setPreviewOpen(true)}
              >
                Preview
              </button>
              <button className="bg-black text-white px-4 py-2 rounded flex items-center gap-2">
                <Download size={16} />
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <input
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-60"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option>Active</option>
          <option>Paused</option>
        </select>
        <select
          value={filterFrequency}
          onChange={(e) => setFilterFrequency(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Frequency</option>
          <option>Daily</option>
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
        <select
          value={filterTemplate}
          onChange={(e) => setFilterTemplate(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Templates</option>
          {[...new Set(scheduledReports.map((r) => r.template))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* SCHEDULED REPORTS */}
      <div className="bg-white p-6 shadow rounded mb-6">
        <h3 className="text-lg font-semibold mb-4">Scheduled Reports</h3>
        <table className="w-full text-sm border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Template</th>
              <th className="p-2">Frequency</th>
              <th className="p-2">Status</th>
              <th className="p-2">Recipients</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports
              .slice(
                (currentPage - 1) * reportsPerPage,
                currentPage * reportsPerPage
              )
              .map((report) => (
                <tr key={report.id} className="border-t">
                  <td className="p-2">{report.name}</td>
                  <td className="p-2">{report.template}</td>
                  <td className="p-2">{report.frequency}</td>
                  <td className="p-2">{report.status}</td>
                  <td className="p-2">{report.recipients}</td>
                  <td className="p-2 flex gap-2">
                    <button
                      className="text-blue-600"
                      onClick={() => {
                        setEditRow(report);
                        setEditModalOpen(true);
                      }}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="text-red-600"
                      onClick={() => handleDelete(report.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="mt-4 flex gap-2 justify-end">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              className={`px-3 py-1 border rounded ${
                currentPage === i + 1 ? "bg-black text-white" : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* EMAIL LOGS */}
      <div className="bg-white p-6 shadow rounded">
        <h3 className="text-lg font-semibold mb-4">Email Logs</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Subject</th>
              <th className="p-2">Sent To</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {emailLogs.map((log) => (
              <tr key={log.id} className="border-t">
                <td className="p-2">{log.subject}</td>
                <td className="p-2">{log.sentTo}</td>
                <td className="p-2">{log.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PREVIEW MODAL */}
      <Modal
        isOpen={previewOpen}
        onRequestClose={() => setPreviewOpen(false)}
        className="bg-white p-6 max-w-xl mx-auto mt-24 rounded shadow"
        overlayClassName="fixed inset-0 bg-black/30"
      >
        <h2 className="text-xl font-bold mb-4">Report Preview</h2>
        <p>
          Template: <strong>{template}</strong>
        </p>
        <p>
          Date Range: {formatDate(startDate)} - {formatDate(endDate)}
        </p>
        <p>Format: {formatType}</p>
        <button
          className="mt-4 px-4 py-2 bg-black text-white rounded"
          onClick={() => setPreviewOpen(false)}
        >
          Close
        </button>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={editModalOpen}
        onRequestClose={() => setEditModalOpen(false)}
        className="bg-white p-6 max-w-md mx-auto mt-24 rounded shadow"
        overlayClassName="fixed inset-0 bg-black/30"
      >
        <h2 className="text-xl font-semibold mb-4">Edit Scheduled Report</h2>
        {editRow && (
          <div className="space-y-4">
            <input
              value={editRow.name}
              onChange={(e) =>
                setEditRow({ ...editRow, name: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="Report Name"
            />
            <input
              value={editRow.template}
              onChange={(e) =>
                setEditRow({ ...editRow, template: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="Template"
            />
            <select
              value={editRow.frequency}
              onChange={(e) =>
                setEditRow({ ...editRow, frequency: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              {frequencyOptions.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
            <select
              value={editRow.status}
              onChange={(e) =>
                setEditRow({ ...editRow, status: e.target.value })
              }
              className="border p-2 rounded w-full"
            >
              <option>Active</option>
              <option>Paused</option>
            </select>
            <input
              value={editRow.recipients}
              onChange={(e) =>
                setEditRow({ ...editRow, recipients: e.target.value })
              }
              className="border p-2 rounded w-full"
              placeholder="Recipients"
            />
            <div className="flex gap-2 justify-end">
              <button
                className="border px-4 py-2 rounded"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-black text-white px-4 py-2 rounded"
                onClick={handleEditSave}
              >
                Save
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
