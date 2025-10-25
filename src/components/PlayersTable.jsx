import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function PlayersTable({ players, onRemovePlayer }) {
  const [removeModal, setRemoveModal] = useState({ open: false, player: null });

  const handleRemovePlayer = async () => {
    const userId =
      removeModal.player.userId ||
      removeModal.player.user_id ||
      removeModal.player.id;
    
    try {
      await onRemovePlayer(userId);
      setRemoveModal({ open: false, player: null });
    } catch (err) {
      toast.error(err.message || "Failed to remove player");
    }
  };

  if (!players || players.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Players Joined</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Player Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Joined At
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player, idx) => (
              <tr key={player.userId || player.user_id || player.id || idx}>
                <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.userId || player.user_id || player.id || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.user_name ||
                    player.name ||
                    player.username ||
                    player.game_username ||
                    "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {player.joined_at || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    onClick={() => setRemoveModal({ open: true, player })}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {removeModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Confirm Removal</h2>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to remove this player from the contest?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setRemoveModal({ open: false, player: null })}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleRemovePlayer}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
