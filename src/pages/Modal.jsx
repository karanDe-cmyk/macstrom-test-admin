import React, { useState } from "react";
import { X, Eye, Download } from "lucide-react";

const Modal = ({ problem, onClose }) => {
  const [activeTab, setActiveTab] = useState("Details");
  const [comment, setComment] = useState("");

  if (!problem) return null;

  const handleEscalate = () => {
    alert("Problem escalated to higher authority.");
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "Details":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>Status</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>{problem.status}</option>
                </select>
              </div>
              <div>
                <label>Severity</label>
                <select className="w-full border rounded px-3 py-2">
                  <option>{problem.severity}</option>
                </select>
              </div>
            </div>
            <div>
              <label>Description</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                defaultValue={problem.description}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label>User</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={problem.user}
                  readOnly
                />
              </div>
              <div>
                <label>Category</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={problem.category}
                  readOnly
                />
              </div>
            </div>
            <div>
              <label>Assigned To</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={problem.assigned}
                readOnly
              />
            </div>
            <button
              onClick={handleEscalate}
              className="bg-gray-800 text-white px-4 py-2 mt-4 rounded hover:bg-black"
            >
              ↑ Escalate
            </button>
          </div>
        );
      case "Attachments":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 border rounded">
              <span>{problem.attachment || "screenshot.png"}</span>
              <div className="flex space-x-2">
                <button className="flex items-center border px-3 py-1 rounded hover:bg-gray-100">
                  <Eye size={16} className="mr-1" /> View
                </button>
                <button className="flex items-center border px-3 py-1 rounded hover:bg-gray-100">
                  <Download size={16} className="mr-1" /> Download
                </button>
              </div>
            </div>
          </div>
        );
      case "Activity":
        return (
          <div className="space-y-4">
            <div className="border p-3 rounded bg-gray-50">
              <p className="text-sm font-medium">System</p>
              <p className="text-xs text-gray-500">{problem.createdAt}</p>
              <p className="mt-1 text-sm">Ticket created automatically from user report</p>
            </div>
            <div>
              <label>Add Comment</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button
                onClick={() => setComment("")}
                className="bg-gray-500 text-white px-4 py-2 mt-2 rounded hover:bg-gray-700"
              >
                Add Comment
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex justify-center items-start p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-lg p-6 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-bold flex items-center justify-between">
          {problem.title}
          <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
            {problem.severity}
          </span>
        </h2>
        <p className="text-sm text-gray-600">
          Problem #{problem.id} • Created on <strong>{problem.createdAt}</strong>
        </p>

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          {["Details", "Attachments", "Activity"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-black text-black"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default Modal;
