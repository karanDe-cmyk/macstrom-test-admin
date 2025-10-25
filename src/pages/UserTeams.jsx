import React, { useState } from "react";
import { UsersIcon, EyeIcon, EditIcon, MoreHorizontal, X } from "lucide-react";
import RosterModal from "./RosterModal";

export default function UserTeams() {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: "Phoenix Warriors",
      state: "California",
      votesState: 1250,
      votesNational: 3420,
      members: [
        { id: 1, name: "ProGamer123", role: "Captain", active: true },
        { id: 2, name: "EliteSniper", role: "Player", active: true },
        { id: 3, name: "MobileKing", role: "Player", active: true },
        { id: 4, name: "SkillShot", role: "Player", active: true },
        { id: 5, name: "GameMaster", role: "Sub", active: false },
      ],
    },
    {
      id: 2,
      name: "Thunder Bolts",
      state: "Texas",
      votesState: 1580,
      votesNational: 4200,
      members: [
        { id: 1, name: "SharpShooter", role: "Captain", active: true },
        { id: 2, name: "NightWolf", role: "Player", active: false },
      ],
    },
  ]);

  const [search, setSearch] = useState("");
  const [openTeam, setOpenTeam] = useState(null);
  const [viewTeam, setViewTeam] = useState(null);
  const [editTeam, setEditTeam] = useState(null);
  const [moreMenuId, setMoreMenuId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [newTeam, setNewTeam] = useState({
    name: "",
    state: "",
    votesState: "",
    votesNational: "",
  });

  const handleUpdateMember = (memberIndex) => {
    const updatedTeams = [...teams];
    const teamIndex = teams.findIndex((t) => t.id === openTeam.id);
    updatedTeams[teamIndex].members[memberIndex].active =
      !updatedTeams[teamIndex].members[memberIndex].active;
    setTeams(updatedTeams);
    setOpenTeam({ ...updatedTeams[teamIndex] });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const updated = teams.map((t) =>
      t.id === editTeam.id
        ? {
            ...t,
            name: form.name.value,
            state: form.state.value,
            votesState: +form.votesState.value,
            votesNational: +form.votesNational.value,
          }
        : t
    );
    setTeams(updated);
    setEditTeam(null);
  };

  const handleDeleteConfirm = () => {
    setTeams((prev) => prev.filter((t) => t.id !== teamToDelete.id));
    setTeamToDelete(null);
    setMoreMenuId(null);
  };

  const handleCreateTeam = () => {
    if (!newTeam.name || !newTeam.state) return;
    const id = teams.length + 1;
    const team = {
      id,
      name: newTeam.name,
      state: newTeam.state,
      votesState: parseInt(newTeam.votesState || 0),
      votesNational: parseInt(newTeam.votesNational || 0),
      members: [],
    };
    setTeams([team, ...teams]);
    setNewTeam({ name: "", state: "", votesState: "", votesNational: "" });
    setShowCreateModal(false);
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage team rosters, votes, and performance
          </p>
        </div>
        <div className="space-x-2">
          <button
            className="px-4 py-2 bg-black text-white rounded"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Team
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded p-4 shadow">
        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border dark:bg-zinc-700 px-3 py-2 w-full md:w-1/3 rounded"
          />
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-zinc-700">
              <tr>
                <th className="text-left px-3 py-2">Team ID</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">State</th>
                <th className="text-left px-3 py-2">Votes (State)</th>
                <th className="text-left px-3 py-2">Votes (National)</th>
                <th className="text-left px-3 py-2">Reg Users</th>
                <th className="text-left px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id} className="border-t dark:border-zinc-700">
                  <td className="px-3 py-2">{team.id}</td>
                  <td className="px-3 py-2 font-medium">{team.name}</td>
                  <td className="px-3 py-2">{team.state}</td>
                  <td className="px-3 py-2 text-blue-500">
                    {team.votesState.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 text-purple-500">
                    {team.votesNational.toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    {team.members.filter((m) => m.active).length}
                  </td>
                  <td className="px-3 py-2 space-x-2 relative">
                    <button
                      onClick={() => setOpenTeam(team)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-zinc-700 border rounded hover:bg-gray-200"
                    >
                      <UsersIcon className="w-4 h-4 mr-1" /> Roster
                    </button>
                    <button onClick={() => setViewTeam(team)}>
                      <EyeIcon className="w-5 h-5 inline" />
                    </button>
                    <button onClick={() => setEditTeam(team)}>
                      <EditIcon className="w-5 h-5 inline" />
                    </button>
                    <button onClick={() => setMoreMenuId(team.id)}>
                      <MoreHorizontal className="w-5 h-5 inline" />
                    </button>
                    {moreMenuId === team.id && (
                      <div className="absolute right-0 z-10 bg-white dark:bg-zinc-700 border rounded shadow p-2 mt-2">
                        <button
                          onClick={() => setTeamToDelete(team)}
                          className="text-red-600 dark:text-red-400 block w-full text-left hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="block sm:hidden space-y-3">
          {filteredTeams.map((team) => {
            return (
              <div
                key={team.id}
                className="bg-white dark:bg-zinc-800 rounded shadow p-4"
              >
                <div className="mt-1 space-y-1 text-sm text-gray-700 dark:text-gray-300">
                  <p className="font-semibold">
                    <strong>Team Name: </strong>
                    {team.name}
                  </p>
                  <p>
                    <strong>State: </strong>
                    {team.state}
                  </p>
                  <p>
                    <strong>Team ID:</strong> {team.id}
                  </p>
                  <p>
                    <strong>Votes (State):</strong>{" "}
                    {team.votesState.toLocaleString()}
                  </p>
                  <p>
                    <strong>Votes (National):</strong>{" "}
                    {team.votesNational.toLocaleString()}
                  </p>
                  <p>
                    <strong>Reg Users:</strong>{" "}
                    {team.members.filter((m) => m.active).length}
                  </p>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setOpenTeam(team)}
                      className="bg-gray-100 dark:bg-zinc-700 px-2 py-1 rounded text-xs"
                    >
                      <UsersIcon className="w-4 h-4 inline mr-1" /> Roster
                    </button>
                    <button
                      onClick={() => setViewTeam(team)}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                    >
                      <EyeIcon className="w-4 h-4 inline" /> View
                    </button>
                    <button
                      onClick={() => setEditTeam(team)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
                    >
                      <EditIcon className="w-4 h-4 inline" /> Edit
                    </button>
                    <button
                      onClick={() => setTeamToDelete(team)}
                      className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster Modal */}
      {openTeam && (
        <RosterModal
          team={openTeam}
          onClose={() => setOpenTeam(null)}
          updateMember={handleUpdateMember}
        />
      )}

      {/* View Modal */}
      {viewTeam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{viewTeam.name}</h2>
            <p>State: {viewTeam.state}</p>
            <p>Votes (State): {viewTeam.votesState}</p>
            <p>Votes (National): {viewTeam.votesNational}</p>
            <p>
              Registered Users:{" "}
              {viewTeam.members.filter((m) => m.active).length}
            </p>
            <button
              onClick={() => setViewTeam(null)}
              className="mt-4 block w-full text-center bg-blue-600 text-white py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTeam && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <form
            onSubmit={handleEditSubmit}
            className="bg-white dark:bg-zinc-800 p-6 rounded w-full max-w-md"
          >
            <h2 className="text-xl font-bold mb-4">Edit Team</h2>
            <input
              name="name"
              defaultValue={editTeam.name}
              className="w-full mb-2 px-3 py-2 border rounded dark:bg-zinc-700"
            />
            <input
              name="state"
              defaultValue={editTeam.state}
              className="w-full mb-2 px-3 py-2 border rounded dark:bg-zinc-700"
            />
            <input
              name="votesState"
              defaultValue={editTeam.votesState}
              type="number"
              className="w-full mb-2 px-3 py-2 border rounded dark:bg-zinc-700"
            />
            <input
              name="votesNational"
              defaultValue={editTeam.votesNational}
              type="number"
              className="w-full mb-4 px-3 py-2 border rounded dark:bg-zinc-700"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditTeam(null)}
              className="mt-2 w-full text-sm underline text-center dark:text-gray-300"
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create New Team</h2>
              <button onClick={() => setShowCreateModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Team Name"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
                className="w-full border px-3 py-2 rounded dark:bg-zinc-700"
              />
              <input
                type="text"
                placeholder="State"
                value={newTeam.state}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, state: e.target.value })
                }
                className="w-full border px-3 py-2 rounded dark:bg-zinc-700"
              />
              <input
                type="number"
                placeholder="Votes (State)"
                value={newTeam.votesState}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, votesState: e.target.value })
                }
                className="w-full border px-3 py-2 rounded dark:bg-zinc-700"
              />
              <input
                type="number"
                placeholder="Votes (National)"
                value={newTeam.votesNational}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, votesNational: e.target.value })
                }
                className="w-full border px-3 py-2 rounded dark:bg-zinc-700"
              />
              <button
                onClick={handleCreateTeam}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-zinc-800 p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Confirm Deletion
            </h2>
            <p className="mb-4">
              Are you sure you want to delete{" "}
              <strong>{teamToDelete.name}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 dark:bg-zinc-600 rounded"
                onClick={() => setTeamToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded"
                onClick={handleDeleteConfirm}
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
