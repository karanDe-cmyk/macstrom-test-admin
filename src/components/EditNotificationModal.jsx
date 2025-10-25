import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

export default function EditNotificationModal({ notification, onSave, onClose }) {
  const [edited, setEdited] = useState({ ...notification });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setShowModal(true);
  }, []);

  const handleChange = (field, value) => {
    setEdited((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave({
      ...edited,
      sentAt: dayjs(edited.sentAt).toISOString(),
    });
    setShowModal(false);
    setTimeout(onClose, 300);
  };

  const handleClose = () => {
    setShowModal(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
      <div
        className={`bg-white rounded shadow-lg p-6 w-full max-w-lg transform transition-all duration-300 ${
          showModal ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">Edit Notification</h2>

        <div className="space-y-4">
          <div>
            <label className="font-medium">Title</label>
            <input
              type="text"
              value={edited.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Status</label>
            <select
              value={edited.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="w-full border rounded p-2 mt-1"
            >
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="font-medium">Audience</label>
            <input
              type="text"
              value={edited.audience}
              onChange={(e) => handleChange("audience", e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          <div>
            <label className="font-medium">Sent At</label>
            <input
              type="datetime-local"
              value={dayjs(edited.sentAt).format("YYYY-MM-DDTHH:mm")}
              onChange={(e) => handleChange("sentAt", e.target.value)}
              className="w-full border rounded p-2 mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">CTR (%)</label>
              <input
                type="number"
                step="0.01"
                value={edited.ctr}
                onChange={(e) => handleChange("ctr", e.target.value)}
                className="w-full border rounded p-2 mt-1"
              />
            </div>

            <div>
              <label className="font-medium">Opens</label>
              <input
                type="number"
                value={edited.opens}
                onChange={(e) => handleChange("opens", e.target.value)}
                className="w-full border rounded p-2 mt-1"
              />
            </div>

            <div>
              <label className="font-medium">Clicks</label>
              <input
                type="number"
                value={edited.clicks}
                onChange={(e) => handleChange("clicks", e.target.value)}
                className="w-full border rounded p-2 mt-1"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded border border-gray-400 text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded bg-black text-white hover:bg-gray-900"
          >
            Save
          </button>
        </div>

        {/* Close icon */}
        <button
          className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl"
          onClick={handleClose}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
