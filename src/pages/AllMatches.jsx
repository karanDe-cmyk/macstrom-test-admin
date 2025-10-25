import React from "react";
import Table from "../components/Table"; // Reusable Table Component
import { useNavigate } from "react-router-dom"; // For navigation
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Toast notifications

function AllMatches() {
  const navigate = useNavigate();
  const columns = [
    { key: "match_id", label: "Match Id" },
    { key: "game_name", label: "Game Name" },
    { key: "match_name", label: "Match Name" },
    { key: "match_schedule", label: "Match Schedule" },
    { key: "total_player", label: "Total Player" },
    { key: "total_player_joined", label: "Total Player Joined" },
    { key: "win_prize", label: "Win Prize" },
    { key: "entry_fee", label: "Entry Fee" },
    { key: "match_type", label: "Match Type" },
    { key: "actions", label: "Actions" },
    { key: "view", label: "View" },
  ];

  const data = [
    {
      match_id: "M001",
      game_name: "PUBG",
      match_name: "Erangel War",
      match_schedule: "2025-07-20 18:00",
      total_player: 100,
      total_player_joined: 87,
      win_prize: "₹500",
      entry_fee: "₹10",
      match_type: "Solo",
    },
    {
      match_id: "M002",
      game_name: "Free Fire",
      match_name: "Squad Showdown",
      match_schedule: "2025-07-22 21:00",
      total_player: 48,
      total_player_joined: 44,
      win_prize: "₹1000",
      entry_fee: "₹20",
      match_type: "Squad",
    },
  ];

  const handleEdit = (row) => {
    console.log("Edit match:", row.match_id);
    // Navigate or open modal here
  };

  const handleDelete = (row) => {
    console.log("Delete match:", row.match_id);
    toast.success("Match deleted successfully");
    // Show confirmation modal or API call
  };

  const handleView = (row) => {
    console.log("View match:", row.match_id);
    // Show match details modal or navigate
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          All Matches
        </h1>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded" onClick={() => {
            navigate("/matches/create");
          }}>
          Add New Match
        </button>
      </div>

      <Table
        columns={columns}
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
      />
    </div>
  );
}

export default AllMatches;
