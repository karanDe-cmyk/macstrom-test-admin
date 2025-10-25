import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axios";


function CreateDuel() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const duelId = params.get("id"); // If editing
  const token = localStorage.getItem("authToken") || "your_default_token_here"; // Replace with your actual token or logic to get it
  const [form, setForm] = useState({
    title: "",
    entryFee: "",
    prizePool: "",
    type: "Solo",
    players: "",
    joinedPlayers: 0,
    startTime: "",
    banner: null,
  });

  // ✅ If editing, fetch duel details
  useEffect(() => {
    if (duelId) {
      axiosInstance.get(`/duels/${duelId}`)
        .then(res => {
          const d = res.data;
          setForm({
            title: d.title || "",
            entryFee: d.entryFee || "",
            prizePool: d.prizePool || "",
            type: d.type || "Solo",
            players: d.maxPlayers || "",  // ✅ use maxPlayers from API
            joinedPlayers: d.joinedPlayers || 0,
            startTime: d.startTime ? d.startTime.slice(0, 16) : "",
            banner: null,
          });

        })
        .catch(err => console.error("Failed to fetch duel", err));
    }
  }, [duelId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "banner") {
      setForm(prev => ({ ...prev, banner: files[0] }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => data.append(key, val));
      data.set("players", `0/${form.players}`);

      if (duelId) {
      await axiosInstance.put(`/duels/${duelId}`, data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });

        toast.success(" Duel updated!");
      } else {
      await axiosInstance.post("/duels", data, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        },
      });

        toast.success(" Duel created!");
      }

      navigate("/admin/duels");
    } catch (err) {
      console.error("Error saving duel:", err);
      toast.error("❌ Failed to save duel.");
    }
  };
  

return (
  <div className="p-6 sm:p-10 bg-gray-50 dark:bg-zinc-900 min-h-screen flex justify-center items-start">
    <div className="w-full max-w-5xl bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-zinc-700">
      
      {/* Main heading */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">
        {duelId ? "Edit Duel" : "Create Duel"}
      </h1>

      <form onSubmit={handleSubmit}>
        {/* Grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Entry Fee</label>
            <input
              type="number"
              name="entryFee"
              value={form.entryFee}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Prize Pool</label>
            <input
              type="number"
              name="prizePool"
              value={form.prizePool}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            >
              <option value="Solo">Solo</option>
              <option value="Duo">Duo</option>
              <option value="Squad">Squad</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Max Players</label>
            <input
              type="number"
              name="players"
              value={form.players}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Joined Players</label>
            <input
              type="number"
              name="joinedPlayers"
              value={form.joinedPlayers}
              onChange={handleChange}
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Time</label>
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Banner</label>
            <input
              type="file"
              name="banner"
              onChange={handleChange}
              accept="image/*"
              className="w-full p-3 border rounded-md bg-gray-50 dark:bg-zinc-700 dark:text-white dark:border-zinc-600 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate("/admin/duels")}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 dark:text-white rounded-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          >
            {duelId ? "Update Duel" : "Create Duel"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

}

export default CreateDuel;
