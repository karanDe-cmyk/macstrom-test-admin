import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function RoomDetailsCard({ roomData, onSave }) {
  const [editingRoom, setEditingRoom] = useState(false);
  const [roomForm, setRoomForm] = useState(roomData);

  const handleSaveRoom = async () => {
    try {
      await onSave(roomForm);
      setEditingRoom(false);
    } catch (err) {
      toast.error(err.message || "Failed to update room details");
    }
  };

  return (
    <div className="my-8 bg-white rounded-2xl shadow-xl p-5 border border-gray-100 transition-all duration-300 hover:shadow-2xl">
      <div className="flex flex-wrap justify-between">
        <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
          <span className="inline-block w-2 h-6 bg-purple-600"></span>
          Room Details
        </h2>
        <button
          onClick={() => setEditingRoom(true)}
          className="px-5 py-2 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-200"
        >
          Edit
        </button>
      </div>
      <div className="flex flex-wrap gap-8 text-gray-700 items-center justify-self-start">
        <div>
          <span className="font-medium">Room ID:</span>
          <span className="ml-2">{roomForm.room_id || "—"}</span>
        </div>
        <div>
          <span className="font-medium">Room Password:</span>
          <span className="ml-2">{roomForm.room_password || "—"}</span>
        </div>
        <div>
          <span className="font-medium">Created By:</span>
          <span className="ml-2">{roomForm.room_created_by || "—"}</span>
        </div>
      </div>

      {editingRoom && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">Edit Room Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Room ID</label>
                <input
                  type="text"
                  value={roomForm.room_id}
                  onChange={(e) =>
                    setRoomForm({ ...roomForm, room_id: e.target.value })
                  }
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Room Password</label>
                <input
                  type="text"
                  value={roomForm.room_password}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      room_password: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Created By</label>
                <input
                  type="text"
                  value={roomForm.room_created_by}
                  onChange={(e) =>
                    setRoomForm({
                      ...roomForm,
                      room_created_by: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2.5 rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditingRoom(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRoom}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
