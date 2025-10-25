import React, { useState } from "react";
import { Eye, EyeOff, GripVertical } from "lucide-react";

const RosterModal = ({ team, onClose, onSave }) => {
  const [members, setMembers] = useState(team.members);

  const toggleActive = (index) => {
    const updated = [...members];
    updated[index].active = !updated[index].active;
    setMembers(updated);
  };

  const handleSave = () => {
    onSave(team.id, members);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Roster Management - {team.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          Drag and drop to reorder members. Toggle active status (max 15 active members).
        </p>
        <p className="text-sm font-medium text-gray-700 mb-4">
          Active Members: {members.filter((m) => m.active).length}/15
        </p>

        <div className="space-y-2">
          {members.map((member, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-4 py-3 rounded border ${
                member.active ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <GripVertical className="text-gray-400" />
                <div className="text-sm">
                  <p className="font-semibold">#{String(index + 1).padStart(2, "0")} {member.name}</p>
                  <span
                    className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded ${
                      member.role === "Captain"
                        ? "bg-purple-100 text-purple-800"
                        : member.role === "Player"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {member.role}
                  </span>
                  {member.active && (
                    <span className="text-xs ml-2 bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
              </div>

              <button onClick={() => toggleActive(index)}>
                {member.active ? (
                  <EyeOff className="text-red-500 hover:text-red-600" />
                ) : (
                  <Eye className="text-green-500 hover:text-green-600" />
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default RosterModal;




