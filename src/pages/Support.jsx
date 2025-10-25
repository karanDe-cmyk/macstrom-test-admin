import React, { useState } from "react";
import {
  Archive,
  AlertTriangle,
  Send,
  Paperclip,
  Clock4,
  Search,
} from "lucide-react";
import {
  tickets as initialTickets,
  admins,
  cannedReplies,
} from "../data/users";

export default function Support() {
  const [ticketList, setTicketList] = useState(initialTickets);
  const [archivedTickets, setArchivedTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(initialTickets[0]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(admins[0]);
  const [reply, setReply] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Open");
  const [searchTerm, setSearchTerm] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const sourceList = showArchived ? archivedTickets : ticketList;

  const filteredTickets = sourceList.filter((ticket) => {
    const statusMatch =
      statusFilter === "All" || ticket.status === statusFilter.toLowerCase();

    const searchMatch =
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "Mine") {
      return statusMatch && searchMatch && ticket.assignedTo === "You";
    }

    if (activeTab === "SLA") {
      return statusMatch && searchMatch && ticket.assignedTo === "You";
    }

    return statusMatch && searchMatch; // Open tab
  });

  const handleSend = () => {
    if (!reply.trim()) return;
    const newMsg = {
      sender: "Admin",
      time: new Date().toLocaleTimeString(),
      text: reply,
      isAdmin: true,
      attachment: selectedFile ? selectedFile.name : null,
    };
    const updated = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMsg],
    };
    setSelectedTicket(updated);
    const list = showArchived ? archivedTickets : ticketList;
    const setter = showArchived ? setArchivedTickets : setTicketList;
    setter((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    setReply("");
    setSelectedFile(null);
  };

  const getRemainingTime = (ticket) => {
    if (!ticket.createdAt || !ticket.slaHours) return "No SLA";

    const created = new Date(ticket.createdAt);
    const deadline = new Date(
      created.getTime() + ticket.slaHours * 60 * 60 * 1000
    );
    const now = new Date();
    const diffMs = deadline - now;

    const absMinutes = Math.floor(Math.abs(diffMs) / 60000);
    const hours = Math.floor(absMinutes / 60);
    const minutes = absMinutes % 60;

    const formatted = `${hours}h ${minutes}m`;

    return diffMs <= 0 ? `Overdue by ${formatted}` : `${formatted} remaining`;
  };

  const handleArchive = () => {
    setArchivedTickets((prev) => [...prev, selectedTicket]);
    setTicketList((prev) => prev.filter((t) => t.id !== selectedTicket.id));
    setSelectedTicket(ticketList[0] || null);
  };

  const handleRestore = () => {
    setTicketList((prev) => [...prev, selectedTicket]);
    setArchivedTickets((prev) =>
      prev.filter((t) => t.id !== selectedTicket.id)
    );
    setSelectedTicket(archivedTickets[0] || null);
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 text-gray-900 min-h-screen">
  {/* Header */}
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
    <div className="text-lg sm:text-xl font-bold">Support Desk</div>
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
      <div className="relative w-full sm:w-64">
        <Search
          className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500"
          size={16}
        />
        <input
          type="text"
          placeholder="Search by Ticket ID or Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 pr-2 py-2 border rounded text-sm w-full h-[36px]"
        />
      </div>
      <label className="text-sm font-medium">Filter by Status:</label>
      <select
        className="border rounded px-2 py-1 text-sm"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option>All</option>
        <option>High</option>
        <option>Medium</option>
      </select>
    </div>
  </div>

  {/* Layout */}
  <div className=" flex flex-col md:flex-row h-auto md:h-[calc(100%-56px)]">
    {/* Sidebar */}
    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r p-3">
      <div className="flex justify-between text-sm font-medium mb-4">
        {["Open", "Mine", "SLA"].map((tab) => (
          <button
            key={tab}
            className={`px-3 py-1 rounded ${
              activeTab === tab
                ? "bg-black text-white font-semibold"
                : "bg-gray-200"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

<div>
  {/* Desktop Table View */}
  <div className="hidden md:block overflow-x-auto">
    <table className="w-full text-sm mb-4 min-w-[400px]">
      <thead>
        <tr className="border-b">
          <th className="text-left py-2">Ticket</th>
          <th className="text-left py-2">User</th>
          <th className="text-left py-2">Status</th>
          {activeTab === "SLA" && <th className="text-left py-2">Time</th>}
        </tr>
      </thead>
      <tbody>
        {filteredTickets.map((ticket) => (
          <tr
            key={ticket.id}
            onClick={() => setSelectedTicket(ticket)}
            className={`cursor-pointer hover:bg-gray-100 ${
              selectedTicket?.id === ticket.id ? "bg-gray-100" : ""
            }`}
          >
            <td className="py-2 font-medium flex items-center gap-1">
              {ticket.id}
              {archivedTickets.some((t) => t.id === ticket.id) && (
                <span className="text-[10px] text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-full">
                  Archived
                </span>
              )}
            </td>
            <td className="py-2">{ticket.user}</td>
            <td className="py-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                  ticket.status === "high"
                    ? "bg-red-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
              >
                {ticket.status}
              </span>
            </td>
            {activeTab === "SLA" && (
              <td className="py-2 text-sm text-gray-700">
                {ticket.assignedTo ? getRemainingTime(ticket) : "-"}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Mobile Card View */}
  <div className="block md:hidden space-y-4">
    {filteredTickets.map((ticket) => (
      <div
        key={ticket.id}
        onClick={() => setSelectedTicket(ticket)}
        className={`border rounded-lg p-4 shadow-sm cursor-pointer ${
          selectedTicket?.id === ticket.id ? "bg-gray-100" : ""
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold">{ticket.id}</h2>
          {archivedTickets.some((t) => t.id === ticket.id) && (
            <span className="text-[10px] text-yellow-800 bg-yellow-200 px-2 py-0.5 rounded-full">
              Archived
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">
          <span className="font-medium">User:</span> {ticket.user}
        </p>
        <p className="text-sm my-1">
          <span className="font-medium">Status:</span>{" "}
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              ticket.status === "high"
                ? "bg-red-500 text-white"
                : "bg-gray-300 text-black"
            }`}
          >
            {ticket.status}
          </span>
        </p>
        {activeTab === "SLA" && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Time:</span>{" "}
            {ticket.assignedTo ? getRemainingTime(ticket) : "-"}
          </p>
        )}
      </div>
    ))}
  </div>
</div>

    </div>

    {/* Chat Panel */}
    <div className="flex-1 flex flex-col p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
        <div>
          <h2 className="text-base sm:text-lg font-semibold">
            {selectedTicket.subject}
          </h2>
          <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
            <Clock4 size={14} />
            {getRemainingTime(selectedTicket)} • Assigned to:{" "}
            <strong>{selectedTicket.assignedTo || "Unassigned"}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1 text-sm border rounded flex items-center"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive size={14} className="mr-1" />
            {showArchived ? "Back to Active" : "View Archived"}
          </button>

          {!showArchived ? (
            <button
              className="px-3 py-1 text-sm bg-yellow-500 text-white rounded"
              onClick={handleArchive}
            >
              Archive
            </button>
          ) : (
            <button
              className="px-3 py-1 text-sm bg-green-600 text-white rounded"
              onClick={handleRestore}
            >
              Restore
            </button>
          )}

          <button
            className="px-3 py-1 text-sm bg-gray-800 text-white rounded"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete
          </button>

          <button
            className="px-3 py-1 text-sm bg-red-500 text-white rounded flex items-center"
            onClick={() => setShowEscalateModal(true)}
          >
            <AlertTriangle size={14} className="mr-1" /> Escalate
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white rounded p-3 sm:p-4 border flex-1 overflow-y-auto space-y-4">
        {selectedTicket.messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[85%] p-3 rounded ${
              msg.isAdmin
                ? "bg-black text-white ml-auto"
                : "bg-gray-100 text-black"
            }`}
          >
            <div className="text-xs font-semibold">
              {msg.isAdmin ? "Admin" : msg.sender}
              <span className="ml-2 text-gray-400 font-normal">
                {msg.time}
              </span>
            </div>
            <div className="text-sm mt-1">{msg.text}</div>
            {msg.attachment && (
              <div className="text-xs mt-2 text-blue-600 underline">
                📎 {msg.attachment}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="pt-4 mt-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2 gap-2">
          <select
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
            onChange={(e) => setReply(cannedReplies[e.target.value] || "")}
          >
            <option value="">📄 Canned Replies</option>
            {Object.keys(cannedReplies).map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Paperclip size={16} />
            <span>Attach</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </label>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch">
          <input
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="flex-1 border rounded-l sm:rounded-l p-2 text-sm"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSend}
            className="bg-black text-white px-4 py-2 sm:rounded-r mt-2 sm:mt-0"
          >
            <Send size={14} className="mr-1 inline" />
            Send
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Escalate Modal */}
  {showEscalateModal && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-xs sm:max-w-sm">
        <h3 className="font-semibold text-lg mb-2">Escalate Ticket</h3>
        <p className="text-sm text-gray-600 mb-4">
          Assign ticket <strong>{selectedTicket.id}</strong> to:
        </p>
        <select
          className="w-full border p-2 mb-4 rounded text-sm"
          value={selectedAdmin}
          onChange={(e) => setSelectedAdmin(e.target.value)}
        >
          {admins.map((admin) => (
            <option key={admin} value={admin}>
              {admin}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-3">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setShowEscalateModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              const updated = { ...selectedTicket, assignedTo: selectedAdmin };
              setSelectedTicket(updated);
              const setter = showArchived ? setArchivedTickets : setTicketList;
              setter((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
              );
              setShowEscalateModal(false);
            }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  )}

  {/* Delete Modal */}
  {showDeleteModal && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-xs sm:max-w-sm">
        <h3 className="font-semibold text-lg mb-2">Confirm Delete</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete{" "}
          <strong>{selectedTicket.id}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-3 py-1 border rounded"
            onClick={() => setShowDeleteModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded"
            onClick={() => {
              if (showArchived) {
                const remaining = archivedTickets.filter(
                  (t) => t.id !== selectedTicket.id
                );
                setArchivedTickets(remaining);
                setSelectedTicket(remaining[0] || null);
              } else {
                const remaining = ticketList.filter(
                  (t) => t.id !== selectedTicket.id
                );
                setTicketList(remaining);
                setSelectedTicket(remaining[0] || null);
              }
              setShowDeleteModal(false);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )}
</div>

  );
}
