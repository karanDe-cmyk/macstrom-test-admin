"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Mail,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
} from "lucide-react";
// Dummy data for email logs
const dummyEmailLogs = [
  {
    id: 1,
    subject: "Welcome to Maccotech",
    content: "Thank you for joining our platform!",
    recipients: ["user1@example.com", "user2@example.com"],
    status: "delivered",
    sentDate: "2025-10-04T10:00:00",
    updatedAt: "2025-10-04T10:00:00"
  },
  {
    id: 2,
    subject: "Your Account Update",
    content: "Your account has been successfully updated.",
    recipients: ["user3@example.com"],
    status: "failed",
    sentDate: "2025-10-03T15:30:00",
    updatedAt: "2025-10-03T15:30:00"
  },
  {
    id: 3,
    subject: "New Feature Announcement",
    content: "We've added exciting new features!",
    recipients: ["user4@example.com", "user5@example.com", "user6@example.com"],
    status: "pending",
    sentDate: "2025-10-04T09:15:00",
    updatedAt: "2025-10-04T09:15:00"
  }
];

export default function EmailNotificationControl() {
  const [emailLogs, setEmailLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    subject: "",
    content: "",
    recipients: "",
  });

  useEffect(() => {
    // Initialize with dummy data
    setEmailLogs(dummyEmailLogs);
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    const timer = setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
    return () => clearTimeout(timer);
  };

  const [isSendModalOpen, setSendModalOpen] = useState(false);
  const [newEmailData, setNewEmailData] = useState({
    subject: "",
    content: "",
    recipients: "",
  });

  const handleSendNewEmail = () => {
    const newEmail = {
      id: emailLogs.length + 1,
      ...newEmailData,
      recipients: newEmailData.recipients.split(",").map((email) => email.trim()),
      status: "delivered",
      sentDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setEmailLogs([newEmail, ...emailLogs]);
    setSendModalOpen(false);
    setNewEmailData({ subject: "", content: "", recipients: "" });
    showNotification("Email sent successfully!");
  };

  const handleResendEmail = async (emailId) => {
    try {
      setIsLoading(true);
      const emailToResend = emailLogs.find((email) => email.id === emailId);
      const newEmail = {
        ...emailToResend,
        id: emailLogs.length + 1,
        sentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setEmailLogs([newEmail, ...emailLogs]);
      showNotification("Email resent successfully!");
    } catch (error) {
      console.error("Error resending email:", error);
      showNotification("Failed to resend email", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmail = async (emailId) => {
    if (!window.confirm("Are you sure you want to delete this email log?")) return;

    try {
      setIsLoading(true);
      setEmailLogs(emailLogs.filter((email) => email.id !== emailId));
      showNotification("Email log deleted successfully!");
    } catch (error) {
      console.error("Error deleting email log:", error);
      showNotification("Failed to delete email log", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmail = (email) => {
    setSelectedEmail(email);
    setEditFormData({
      subject: email.subject || "",
      content: email.content || "",
      recipients: Array.isArray(email.recipients) ? email.recipients.join(", ") : "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateEmail = async () => {
    try {
      setIsLoading(true);
      const updatedEmails = emailLogs.map((email) =>
        email.id === selectedEmail.id
          ? {
              ...email,
              ...editFormData,
              recipients: editFormData.recipients.split(",").map((email) => email.trim()),
              updatedAt: new Date().toISOString(),
            }
          : email
      );
      setEmailLogs(updatedEmails);
      showNotification("Email log updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating email log:", error);
      showNotification("Failed to update email log", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredData = emailLogs.filter((email) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      (email.subject || "").toLowerCase().includes(searchTermLower) ||
      (Array.isArray(email.recipients) && 
        email.recipients.some(recipient => (recipient || "").toLowerCase().includes(searchTermLower))
      ) ||
      (email.status || "").toLowerCase().includes(searchTermLower)
    );
  });

  const paginatedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  const exportToCSV = () => {
    const headers = ["ID", "Subject", "Recipients", "Status", "Sent Date", "Last Updated"];
    const csvContent = [
      headers.join(","),
      ...filteredData.map(
        (row) =>
          `"${row.id || ""}","${row.subject || ""}","${
            Array.isArray(row.recipients) ? row.recipients.join("; ") : ""
          }","${row.status || ""}","${row.sentDate || ""}","${row.updatedAt || ""}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "email_logs.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification("Email logs exported successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Email Notification Control
          </h1>
          <p className="text-gray-600 mb-6">Manage and monitor email notifications with detailed logs</p>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by subject, recipient, or status..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                disabled={isLoading}
                className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="h-5 w-5" />
                Export Logs
              </button>
              <button
                onClick={() => setSendModalOpen(true)}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Mail className="h-5 w-5" />
                Send Email
              </button>
            </div>
          </div>
        </div>

        {/* Send Email Modal */}
        {isSendModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl max-w-2xl w-full m-4">
              <h2 className="text-2xl font-bold mb-4">Send New Email</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newEmailData.subject}
                    onChange={(e) => setNewEmailData({ ...newEmailData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newEmailData.content}
                    onChange={(e) => setNewEmailData({ ...newEmailData, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newEmailData.recipients}
                    onChange={(e) => setNewEmailData({ ...newEmailData, recipients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setSendModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNewEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Send Email
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Email Logs Table */}
        {paginatedData.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                    <th className="px-6 py-4 text-left font-semibold">Subject</th>
                    <th className="px-6 py-4 text-left font-semibold">Recipients</th>
                    <th className="px-6 py-4 text-center font-semibold">Status</th>
                    <th className="px-6 py-4 text-center font-semibold">Sent Date</th>
                    <th className="px-6 py-4 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((email) => (
                    <tr key={email.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-gray-400" />
                          <span className="font-medium text-gray-900">{email.subject}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {Array.isArray(email.recipients) ? (
                            email.recipients.map((recipient, idx) => (
                              <div key={idx} className="text-sm text-gray-600">
                                {recipient || "N/A"}
                              </div>
                            ))
                          ) : (
                            <div className="text-sm text-gray-600">No recipients</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              email.status === "delivered"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : email.status === "failed"
                                ? "bg-red-100 text-red-800 border-red-200"
                                : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }`}
                          >
                            {email.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500">
                        {email.sentDate ? new Date(email.sentDate).toLocaleString() : "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleResendEmail(email.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Resend Email"
                          >
                            <RefreshCw className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEditEmail(email)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Edit Email"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEmail(email.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            title="Delete Log"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {page * rowsPerPage + 1} to{" "}
                  {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length}{" "}
                  entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0 || isLoading}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPage(Math.min(Math.ceil(filteredData.length / rowsPerPage) - 1, page + 1))
                    }
                    disabled={
                      page >= Math.ceil(filteredData.length / rowsPerPage) - 1 || isLoading
                    }
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl mt-8">
            <div className="text-6xl mb-4">📧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No email logs found</h3>
            <p className="text-gray-600">No email logs available at the moment</p>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 shadow-xl max-w-2xl w-full m-4">
              <h2 className="text-2xl font-bold mb-4">Edit Email Log</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={editFormData.subject}
                    onChange={(e) => setEditFormData({ ...editFormData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={editFormData.content}
                    onChange={(e) => setEditFormData({ ...editFormData, content: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipients (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editFormData.recipients}
                    onChange={(e) => setEditFormData({ ...editFormData, recipients: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateEmail}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification.show && (
          <div className="fixed top-4 right-4 z-50">
            <div
              className={`px-6 py-4 rounded-xl shadow-lg text-white ${
                notification.type === "success"
                  ? "bg-green-500"
                  : notification.type === "error"
                  ? "bg-red-500"
                  : "bg-orange-500"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {notification.type === "success" && <CheckCircle className="h-5 w-5" />}
                  {notification.type === "error" && <XCircle className="h-5 w-5" />}
                  {notification.type === "warning" && <AlertCircle className="h-5 w-5" />}
                </div>
                <p className="font-medium">{notification.message}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}