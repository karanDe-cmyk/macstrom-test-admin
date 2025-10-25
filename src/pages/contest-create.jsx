import React, { useState, useEffect } from "react";
import { ArrowLeft, Trash2, Plus, ChevronDown, X } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios"

const DEFAULT_WINNERS = [""];

export default function ContestCreate() {
  const [eventName, setEventName] = useState("");
  const [totalWinners, setTotalWinners] = useState("");
  const [roomSize, setRoomSize] = useState("");
  const [fee, setFee] = useState("");
  const [game, setGame] = useState("BGMI");
  const [map, setMap] = useState("Erangel");
  const [schedule, setSchedule] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
  const [sponsor, setSponsor] = useState("");
  const [prizeDesc, setPrizeDesc] = useState("");
  const [matchPrivateDesc, setMatchPrivateDesc] = useState("");
  const [winners, setWinners] = useState(
    DEFAULT_WINNERS.map((p, i) => ({ id: Date.now() + i, prize: p }))
  );
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New states for banner images
  const [bannerImages, setBannerImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const [filteredImages, setFilteredImages] = useState([]);
  
  // New states for selected image display
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [selectedImageUrl, setSelectedImageUrl] = useState("");
  const [showImagePreview, setShowImagePreview] = useState(false);
  
  // Games state
  const [games, setGames] = useState([]);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  
  const navigate = useNavigate();

  // Fetch banner images from API using axiosInstance
  useEffect(() => {
    const fetchBannerImages = async () => {
      setIsLoadingImages(true);
      try {
        const response = await axiosInstance.get("auth/admin/images");
        
        if (response.data.status === "success" && response.data.data) {
          setBannerImages(response.data.data);
          setFilteredImages(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching banner images:", error);
        toast.error("Failed to load banner images");
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchBannerImages();
  }, []);

  // Fetch games using axiosInstance
  useEffect(() => {
    const fetchGames = async () => {
      setIsLoadingGames(true);
      try {
        const response = await axiosInstance.get("auth/admin/games");
        
        if (response.data.status === "success") {
          setGames(response.data.data);
          if (response.data.data.length > 0) {
            setGame(response.data.data[0].game_name); // default select first game
          }
        }
      } catch (error) {
        console.error("Failed to fetch games:", error);
        toast.error("Failed to load games");
      } finally {
        setIsLoadingGames(false);
      }
    };

    fetchGames();
  }, []);

  // Handle image selection from dropdown
  const handleImageSelect = (image) => {
    setSelectedImageTitle(image.title);
    setSelectedImageUrl(image.imageUrl);
    setBannerUrl(image.imageUrl); // This is what gets sent to backend
    setShowImageDropdown(false);
    setShowImagePreview(true);
  };

  // Filter images based on search input
  const filterImages = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredImages(bannerImages);
      return;
    }

    const filtered = bannerImages.filter(image =>
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.imageUrl.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredImages(filtered);
  };

  // Handle banner title input changes (for searching)
  const handleBannerTitleChange = (value) => {
    setSelectedImageTitle(value);
    filterImages(value);
    
    // If user types something that doesn't match any title exactly, clear the URL
    const exactMatch = bannerImages.find(img => img.title === value);
    if (!exactMatch) {
      setBannerUrl("");
      setSelectedImageUrl("");
      setShowImagePreview(false);
    }
  };

  // Handle input focus
  const handleBannerInputFocus = () => {
    setShowImageDropdown(true);
    filterImages(selectedImageTitle);
  };

  // Clear selected image
  const clearSelectedImage = () => {
    setSelectedImageTitle("");
    setSelectedImageUrl("");
    setBannerUrl("");
    setShowImagePreview(false);
    setShowImageDropdown(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (event) => {
    if (!event.target.closest('.banner-dropdown-container')) {
      setShowImageDropdown(false);
    }
  };

  // Add event listener for clicks outside
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update winners array based on total winners count
  const updateWinnersCount = (count) => {
    const numCount = parseInt(count) || 0;
    if (numCount === winners.length) return;

    if (numCount > winners.length) {
      const newWinners = [...winners];
      for (let i = winners.length; i < numCount; i++) {
        newWinners.push({ id: Date.now() + i, prize: "" });
      }
      setWinners(newWinners);
    } else if (numCount < winners.length && numCount > 0) {
      setWinners(winners.slice(0, numCount));
    } else if (numCount === 0) {
      setWinners([]);
    }
  };

  // Helper to update a winner's prize text
  const updateWinner = (index, value) => {
    setWinners((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], prize: value };
      return copy;
    });
  };

  const addWinner = () => {
    setWinners((prev) => [...prev, { id: Date.now(), prize: "" }]);
    setTotalWinners(String(winners.length + 1));
  };

  const removeWinner = (index) => {
    setWinners((prev) => prev.filter((_, i) => i !== index));
    setTotalWinners(String(Math.max(0, winners.length - 1)));
  };

  const validate = () => {
    const e = {};
    if (!eventName.trim()) e.eventName = "Event name required";
    if (!totalWinners.trim()) e.totalWinners = "Total winners required";
    if (isNaN(totalWinners) || Number(totalWinners) <= 0)
      e.totalWinners = "Total winners must be a positive number";

    if (!roomSize.trim()) e.roomSize = "Room size required";
    if (isNaN(roomSize) || Number(roomSize) <= 0)
      e.roomSize = "Room size must be a positive number";
    
    if (!fee || Number(fee) <= 0) e.fee = "Joining fee must be > 0";
    if (!schedule) e.schedule = "Match schedule required";
    if (winners.length === 0) e.winners = "At least one winner required";
    
    // Updated validation for text-based prizes
    winners.forEach((w, i) => {
      if (!w.prize || w.prize.trim() === "") {
        e[`w_${i}`] = "Prize description required";
      }
    });
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Build prize distribution in required format
  const createDistributionArray = () => {
    return winners.map((winner, index) => {
      // for now assume everything is "item" type with reward text
      return {
        rank: index + 1,
        prize_type: "item",      // you can later let admin choose cash/coupon/item
        reward: winner.prize
      };
    });
  };

  const formatScheduleForAPI = (scheduleString) => {
    const date = new Date(scheduleString);
    return date.toISOString();
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        event_name: eventName,
        room_size: Number(roomSize),
        joining_fee: Number(fee),
        total_winners: Number(totalWinners),
        prize_pool: prizeDesc || "Prize pool not specified",
        distribution: createDistributionArray(), // Now sends text values
        match_schedule: formatScheduleForAPI(schedule),
        game: game,
        team: "SOLO",
        map: map.toUpperCase(),
        banner_image_url: bannerUrl || null,
        prize_description: prizeDesc || null,
        match_sponsor: sponsor || null,
        match_description: description || null,
        match_private_description: matchPrivateDesc || null
      };

      console.log("Submitting payload:", payload);

      // Use axiosInstance for the API call
      const response = await axiosInstance.post("/contest/create", payload);

      console.log("Contest created successfully:", response.data);
      toast.success("Contest created successfully!");

      // Reset form
      setEventName("");
      setTotalWinners("");
      setRoomSize("");
      setFee("");
      setGame(games.length > 0 ? games[0].game_name : "BGMI");
      setMap("Erangel");
      setSchedule("");
      setBannerUrl("");
      setDescription("");
      setSponsor("");
      setPrizeDesc("");
      setMatchPrivateDesc("");
      setSelectedImageTitle("");
      setSelectedImageUrl("");
      setShowImagePreview(false);
      setWinners(DEFAULT_WINNERS.map((p, i) => ({ id: Date.now() + i, prize: p })));
      setErrors({});

      navigate("/solo");

    } catch (error) {
      console.error("Error creating contest:", error);
      
      // Handle axios error response
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          "Failed to create contest";
      
      toast.error(`Failed to create contest: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            type="button"
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            onClick={() => window.history.back()}
            aria-label="Back to contests"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to contests
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Solo Contest</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Name *</label>
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  type="text"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.eventName ? "border-red-400" : "border-gray-300"
                  }`}
                  placeholder="e.g., Solo Championship"
                  disabled={isSubmitting}
                />
                {errors.eventName && <p className="text-xs text-red-600 mt-1">{errors.eventName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Joining Fee (₹) *</label>
                <input
                  value={fee}
                  onChange={(e) => setFee(e.target.value)}
                  type="number"
                  min={1}
                  step={1}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.fee ? "border-red-400" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.fee && <p className="text-xs text-red-600 mt-1">{errors.fee}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Game *</label>
                <select
                  value={game}
                  onChange={(e) => setGame(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isSubmitting || isLoadingGames}
                >
                  {isLoadingGames ? (
                    <option>Loading games...</option>
                  ) : games.length > 0 ? (
                    games.map((g) => (
                      <option key={g.id} value={g.game_name}>
                        {g.game_name}
                      </option>
                    ))
                  ) : (
                    <option>No games available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Map *</label>
                <select
                  value={map}
                  onChange={(e) => setMap(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  disabled={isSubmitting}
                >
                  <option>Erangel</option>
                  <option>Sanhok</option>
                  <option>Miramar</option>
                  <option>Vikendi</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Room Size *</label>
              <input
                value={roomSize}
                onChange={(e) => setRoomSize(e.target.value)}
                type="number"
                min={1}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.roomSize ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="e.g. 10"
                disabled={isSubmitting}
              />
              {errors.roomSize && <p className="text-xs text-red-600 mt-1">{errors.roomSize}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Winners *</label>
              <input
                value={totalWinners}
                onChange={(e) => {
                  setTotalWinners(e.target.value);
                  updateWinnersCount(e.target.value);
                }}
                type="number"
                min={1}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.totalWinners ? "border-red-400" : "border-gray-300"
                }`}
                placeholder="e.g. 2"
                disabled={isSubmitting}
              />
              {errors.totalWinners && <p className="text-xs text-red-600 mt-1">{errors.totalWinners}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Match Schedule *</label>
              <input
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                type="datetime-local"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.schedule ? "border-red-400" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.schedule && <p className="text-xs text-red-600 mt-1">{errors.schedule}</p>}
            </div>

            {/* Prize Distribution Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">Prize Distribution</label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {winners.length} winner{winners.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              {winners.length > 0 ? (
                <div className="space-y-3">
                  {winners.map((w, i) => (
                    <div key={w.id} className="flex items-center space-x-4">
                      <div className="w-12 h-10 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center text-sm font-medium">
                        #{i + 1}
                      </div>
                      <div className="flex-1">
                        <input
                          value={w.prize}
                          onChange={(e) => updateWinner(i, e.target.value)}
                          type="text"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                            errors[`w_${i}`] ? "border-red-400" : "border-gray-300"
                          }`}
                          placeholder={`Prize for rank ${i + 1} (e.g., "₹500", "Trophy + ₹1000", "Gift Card")`}
                          disabled={isSubmitting}
                        />
                        {errors[`w_${i}`] && <p className="text-xs text-red-600 mt-1">{errors[`w_${i}`]}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Enter total winners above to configure prize distribution</p>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Additional Information (Optional)</h3>

              {/* Enhanced Banner Image Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                <div className="space-y-3">
                  {/* Search/Selection Input */}
                  <div className="relative banner-dropdown-container">
                    <input
                      value={selectedImageTitle}
                      onChange={(e) => handleBannerTitleChange(e.target.value)}
                      onFocus={handleBannerInputFocus}
                      type="text"
                      className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Search and select banner image"
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                      {selectedImageTitle && (
                        <button
                          type="button"
                          onClick={clearSelectedImage}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setShowImageDropdown(!showImageDropdown);
                          if (!showImageDropdown) {
                            filterImages(selectedImageTitle);
                          }
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting || isLoadingImages}
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform ${showImageDropdown ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  
                    {/* Dropdown for Banner Images */}
                    {showImageDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {isLoadingImages ? (
                          <div className="px-4 py-2 text-gray-500">Loading images...</div>
                        ) : filteredImages.length > 0 ? (
                          filteredImages.map((image) => (
                            <button
                              key={image.id}
                              type="button"
                              onClick={() => handleImageSelect(image)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                              disabled={isSubmitting}
                            >
                              <img
                                src={image.imageUrl}
                                alt={image.title}
                                className="w-12 h-12 object-cover rounded-md"
                                onError={(e) => {
                                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpolyline points='21,15 16,10 5,21'/%3E%3C/svg%3E";
                                }}
                              />
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{image.title}</div>
                              </div>
                            </button>
                          ))
                        ) : selectedImageTitle.trim() ? (
                          <div className="px-4 py-2 text-gray-500">No images found matching "{selectedImageTitle}"</div>
                        ) : (
                          <div className="px-4 py-2 text-gray-500">No images available</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Image Preview */}
                  {showImagePreview && selectedImageUrl && (
                    <div className="mt-3">
                      <div className="relative inline-block">
                        <img
                          src={selectedImageUrl}
                          alt={selectedImageTitle || "Banner preview"}
                          className="h-32 w-auto rounded-lg border border-gray-300 object-cover"
                          onError={(e) => {
                            console.error("Failed to load image preview");
                            setShowImagePreview(false);
                          }}
                        />
                        <button
                          type="button"
                          onClick={clearSelectedImage}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          disabled={isSubmitting}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      {selectedImageTitle && (
                        <p className="text-sm text-gray-600 mt-2">Selected: {selectedImageTitle}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Match Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Describe your contest..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Match Private Description</label>
                <textarea
                  value={matchPrivateDesc}
                  onChange={(e) => setMatchPrivateDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={2}
                  placeholder="Private details like room codes, special instructions..."
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sponsor</label>
                  <input
                    value={sponsor}
                    onChange={(e) => setSponsor(e.target.value)}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Sponsor name"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prize Description</label>
                  <input
                    value={prizeDesc}
                    onChange={(e) => setPrizeDesc(e.target.value)}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="e.g., Top 5 teams win"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Contest..." : "Create Contest"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}