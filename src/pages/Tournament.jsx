"use client";
import { useState } from "react";
import { Trophy, Calendar, Users, DollarSign, Check, Plus, Image, X, Trash } from "lucide-react";

// Main Admin Form Component
export default function Tournament() {
  // State to hold the form data
  const [formData, setFormData] = useState({
    name: "",
    game: "",
    prize: "",
    participants: "",
    lastDate: "",
    status: "Registration Open", // Default value
    image: "",
    description: [],
  });

    const [newPoint, setNewPoint] = useState("");


  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

    // Handle adding a new description point
  const handleAddPoint = () => {
    if (newPoint.trim() !== "") {
      setFormData((prevData) => ({
        ...prevData,
        description: [...prevData.description, newPoint.trim()],
      }));
      setNewPoint(""); // Clear the input field
    }
  };
  
  // Handle deleting a description point
  const handleDeletePoint = (index) => {
    setFormData((prevData) => ({
      ...prevData,
      description: prevData.description.filter((_, i) => i !== index),
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, you would send this data to a backend or database.
    // For now, we'll just log it to the console.
    console.log("Form Data Submitted:", {
      ...formData,
      // Convert description from a comma-separated string to an array
      description: formData.description.split(",").map(item => item.trim()),
    });
    // Use a custom modal or message box instead of alert()
    // For now, let's log a message to the console instead of an alert.
    console.log("Tournament data has been submitted! Check the console for the data.");
  };

  const inputClasses = "w-full p-3 bg-gray-100 text-gray-500 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300";
  const labelClasses = "text-gray-400 font-medium mb-1";
  const iconClasses = "absolute left-3 mt-6 transform -translate-y-1/2 text-gray-500";

  return (
    <div className="min-h-screen text-white p-8">
      <div className="max-w-3xl mx-auto">

        <form
          onSubmit={handleSubmit}
          className="bg-gray-100 rounded-2xl p-8 shadow-2xl border border-indigo-500"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Tournament Name */}
            <div className="relative">
              <label htmlFor="name" className={labelClasses}>Tournament Name</label>
              <Trophy size={20} className={iconClasses} />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-10`}
              />
            </div>
            
            {/* Game Name */}
            <div className="relative">
              <label htmlFor="game" className={labelClasses}>Game</label>
              <Trophy size={20} className={iconClasses} />
              <select
                id="game"
                name="game"
                value={formData.game}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-10`}
              >
                <option className="text-gray-500" value="bgmi">Bgmi</option>
                <option className="text-gray-500" value="free fire">Free Fire</option>
              </select>
            </div>

            {/* Prize */}
            <div className="relative">
              <label htmlFor="prize" className={labelClasses}>Prize Amount (₹)</label>
              <DollarSign size={20} className={iconClasses} />
              <input
                type="number"
                id="prize"
                name="prize"
                value={formData.prize}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-10`}
              />
            </div>

            {/* Last Date */}
            <div className="relative">
              <label htmlFor="lastDate" className={labelClasses}>Last Date</label>
              <Calendar size={20} className={iconClasses} />
              <input
                type="date"
                id="lastDate"
                name="lastDate"
                placeholder="e.g., Dec 15"
                value={formData.lastDate}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-10`}
              />
            </div>
            
            {/* Status */}
            <div className="relative">
              <label htmlFor="status" className={labelClasses}>Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className={inputClasses}
              >
                <option className="text-gray-500" value="Registration Open">Registration Open</option>
                <option className="text-gray-500" value="Coming Soon">Coming Soon</option>
              </select>
            </div>

            {/* Image URL */}
            <div className="md:col-span-2 relative">
              <label htmlFor="image" className={labelClasses}>Image URL</label>
              <Image size={20} className={iconClasses} />
              <input
                type="text"
                id="image"
                name="image"
                placeholder="https://example.com/image.png"
                value={formData.image}
                onChange={handleChange}
                required
                className={`${inputClasses} pl-10`}
              />
            </div>

            {/* Description - new Add/Delete functionality */}
            <div className="md:col-span-2">
              <label className={labelClasses}>Description Points</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Add a new feature point"
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPoint();
                    }
                  }}
                  className={`${inputClasses} flex-1`}
                />
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="flex items-center justify-center p-3 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* List of points */}
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {formData.description.map((point, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-800 p-2 rounded-md">
                    <Check size={16} className="text-green-400 flex-shrink-0" />
                    <span className="flex-1 text-sm">{point}</span>
                    <button
                      type="button"
                      onClick={() => handleDeletePoint(index)}
                      className="text-red-400 hover:text-red-500 transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.8 }}
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
            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-md font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={20} />
            Create Tournament
          </button>
        </form>
      </div>
    </div>
  );
}
