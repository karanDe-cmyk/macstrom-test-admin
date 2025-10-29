// pages/AllGames.jsx
import React, { useEffect, useState } from "react";
import Table from "../components/Table";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function AllGames() {
  const [games, setGames] = useState([]);
  const navigate = useNavigate();
  const BASE_URL = "http://localhost:5000";
  const columns = [
    { key: "id", label: "Sr No." },
    { key: "game_name", label: "Game Name" },
    { key: "game_type", label: "Game Type" },
    { key: "image", label: "Image" },
    { key: "coming_soon", label: "Coming Soon" },
    { key: "actions", label: "Actions" },
  ];

  // Fetch all games
  const fetchGames = async () => {
    try {
      const res = await axiosInstance.get("auth/admin/games");
      const data = res.data.data;

      const mapped = data.map((game, index) => ({
        ...game,
        srNo: index + 1,
        image: `${game.image}`,

        coming_soon: (
          <span
            className={`font-medium ${
              game.coming_soon === true ? "text-green-600" : "text-red-500"
            }`}
          >
            {game.coming_soon === true ? "Yes" : "No"}
          </span>
        ),
      }));

      setGames(mapped);
    } catch (err) {
      console.error("Error fetching games:", err);
      toast.error("Failed to fetch games");
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const handleEdit = (row) => {
    console.log("Edit game:", row);
    // Navigate to edit page or open modal
    navigate(`edit/${row.id}`);
  };

  const handleDelete = async (row) => {
    const confirm = window.confirm(`Are you sure to delete ${row.gameName}?`);
    if (!confirm) return;

    try {
      await axiosInstance.delete(`auth/admin/games/${row.id}`);
      toast.success("Game deleted");
      fetchGames(); // Refresh list
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Failed to delete game");
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          All Games
        </h1>
        <button
          className="bg-neutral-500 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => {
            navigate("/games/create");
          }}
        >
          Add New Game
        </button>
      </div>

      <Table
        columns={columns}
        data={games}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default AllGames;
