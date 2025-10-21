"use client";
import { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  DollarSign,
  ImageIcon,
  Plus,
  Check,
  Trash,
  Loader2,
} from "lucide-react";
import axiosInstance from "../utils/axios";

// Main Tournament Admin Form Component
export default function AddTeam() {
  // State to hold the form data
  const [formData, setFormData] = useState({
    teamImageFile: null,
    teamImagePreview: null,
    teamName: "",
    lastDate: "",
    registrationAmount: "",
    selectedGame: "",
    rules: [],
  });

  // State for the new rule input
  const [newRule, setNewRule] = useState("");

  // State for loading and status messages
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: "", message: "" });

  // State to store game options fetched from API
  const [games, setGames] = useState([]);

  // Fetch games from API when component mounts
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await axiosInstance.get("/auth/admin/games");
        if (response.data.status === "success") {
          setGames(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
      }
    };
    fetchGames();
  }, []);

  // Handle input changes for main form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prevData) => ({
          ...prevData,
          teamImageFile: file,
          teamImagePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        teamImageFile: null,
        teamImagePreview: null,
      }));
    }
  };

  // Handle adding a new rule
  const handleAddRule = () => {
    if (newRule.trim() !== "") {
      setFormData((prevData) => ({
        ...prevData,
        rules: [...prevData.rules, newRule.trim()],
      }));
      setNewRule("");
    }
  };

  // Handle deleting a rule
  const handleDeleteRule = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      rules: prevData.rules.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage({ type: "", message: "" });

    if (
      !formData.teamName ||
      !formData.lastDate ||
      !formData.registrationAmount ||
      !formData.selectedGame ||
      !formData.teamImageFile
    ) {
      setStatusMessage({
        type: "error",
        message: "Please fill in all required fields.",
      });
      setIsLoading(false);
      return;
    }

    const formPayload = new FormData();
    formPayload.append("name", formData.teamName);
    formPayload.append("lastRegistrationDate", formData.lastDate);
    formPayload.append("registrationAmount", formData.registrationAmount);
    formPayload.append("gameName", formData.selectedGame);
    formPayload.append("gameType", formData.selectedGame); // ✅ Added new field
    formPayload.append("rules", JSON.stringify(formData.rules));
    if (formData.teamImageFile) {
      formPayload.append("image", formData.teamImageFile);
    }

    try {
      const response = await axiosInstance.post("/admin/teams", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Tournament created successfully:", response.data);
      setStatusMessage({
        type: "success",
        message: "Tournament created successfully!",
      });
      setFormData({
        teamImageFile: null,
        teamImagePreview: null,
        teamName: "",
        lastDate: "",
        registrationAmount: "",
        selectedGame: "",
        rules: [],
      });
      setNewRule("");
    } catch (error) {
      console.error("Error creating team:", error);
      const errorMessage =
        error.response?.data?.message || "An unexpected error occurred.";
      setStatusMessage({ type: "error", message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses =
    "w-full p-3 bg-gray-100 text-gray-500 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300";
  const labelClasses = "text-gray-400 font-medium mb-1";
  const iconClasses =
    "absolute left-3 mt-6 transform -translate-y-1/2 text-gray-500";

  return (
    <div className="min-h-screen text-indigo-600 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="gradient-text">Create a New Tournament</span>
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-00 rounded-2xl p-8 shadow-2xl border border-indigo-500"
        >
          {/* Status Message */}
          {statusMessage.message && (
            <div
              className={`p-4 mb-6 rounded-md text-white font-medium ${
                statusMessage.type === "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            >
              {statusMessage.message}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Tournament Name */}
            <div className="relative">
              <label htmlFor="teamName" className={labelClasses}>
                Tournament Name
              </label>
              <Users size={20} className={iconClasses} />
              <input
                type="text"
                id="teamName"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-10`}
              />
            </div>

            {/* Team Image Upload */}
            <div className="relative">
              <label htmlFor="teamImage" className={labelClasses}>
                Tournament Image
              </label>
              <ImageIcon size={20} className={iconClasses} />
              <input
                type="file"
                id="teamImage"
                name="teamImage"
                accept="image/*"
                onChange={handleImageChange}
                required
                className={`${inputClasses} pl-10 file:mr-4 file:py-2 file:px-4
  file:rounded-full file:border-0
  file:text-sm file:font-semibold
  file:bg-indigo-50 file:text-indigo-700
  hover:file:bg-indigo-100`}
              />
              {formData.teamImagePreview && (
                <div className="mt-4 border-2 border-dashed border-gray-600 rounded-lg p-2 flex justify-center items-center">
                  <img
                    src={formData.teamImagePreview}
                    alt="Tournament Preview"
                    className="max-h-40 max-w-full rounded-md object-contain"
                  />
                </div>
              )}
            </div>

            {/* Last Date of Registration */}
            <div className="relative">
              <label htmlFor="lastDate" className={labelClasses}>
                Last Date of Registration
              </label>
              <Calendar size={20} className={iconClasses} />
              <input
                type="date"
                id="lastDate"
                name="lastDate"
                value={formData.lastDate}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-10`}
              />
            </div>

            {/* Registration Amount */}
            <div className="relative">
              <label htmlFor="registrationAmount" className={labelClasses}>
                Registration Amount (₹)
              </label>
              <input
                type="number"
                id="registrationAmount"
                name="registrationAmount"
                value={formData.registrationAmount}
                onChange={handleChange}
                required
                className={inputClasses}
              />
            </div>

            {/* Game Selection Dropdown */}
            <div className="relative">
              <label htmlFor="selectedGame" className={labelClasses}>
                Select Game
              </label>
              <select
                id="selectedGame"
                name="selectedGame"
                value={formData.selectedGame}
                onChange={handleChange}
                required
                className={inputClasses}
              >
                <option value="">-- Select a Game --</option>
                {games.map((game) => (
                  <option key={game.id} value={game.game_name}>
                    {game.game_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rules and Regulations */}
            <div className="md:col-span-2">
              <label className={labelClasses}>Rules and Regulations</label>
              <div className="flex gap-2 mb-2">
                <textarea
                  placeholder="Add a new rule or regulation"
                  value={newRule}
                  onChange={(e) => setNewRule(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddRule();
                    }
                  }}
                  className={`${inputClasses} flex-1 h-fit`}
                />
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="flex items-center justify-center p-3 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                >
                  <Plus size={20} className="text-white" />
                </button>
              </div>

              {/* List of rules */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {formData.rules.map((rule, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-800 p-2 rounded-md"
                  >
                    <Check
                      size={16}
                      className="text-green-400 flex-shrink-0"
                    />
                    <span className="flex-1 text-sm text-white">{rule}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(index)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-md font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 disabled:bg-indigo-400"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Plus size={20} /> Create Tournament
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
