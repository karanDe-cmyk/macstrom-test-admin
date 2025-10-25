import { Edit, MoveLeftIcon, Save, X } from "lucide-react";
import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { toast } from "react-toastify";

function MegaContestForm() {
  const [formData, setFormData] = useState({
    event_name: "",
    game: "",
    map: "",
    match_schedule: "",
    limit_users: 0,
    joining_fee: "",
    platform_cut: "",
banner_image_url:"",
    totalWinners: 0,
    default_player_points: "",
    // --- FIXED: Changed distribution to prizeDistribution for consistency
    prizeDistribution: [{ rank: 1, percentage: 100 }],
    playerPool: [
      {
        group: "A",
        groupName: "Group A",
        teams: [
          { name: "Team 1", players: [] },
          { name: "Team 2", players: [] },
          { name: "Team 3", players: [] },
        ],
      },
      {
        group: "B",
        groupName: "Group B",
        teams: [
          { name: "Team 4", players: [] },
          { name: "Team 5", players: [] },
          { name: "Team 6", players: [] },
        ],
      },
    ],
    selectionConfig: {
      teamSize: 10,
      maxTeamsPerJoin: 10,
      perSourceTeamMax: 3,
      maxTeamsPerUser: 10,
    },
  });

  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("auth/user");
      const data = Array.isArray(res.data.users) ? res.data.users : [];
      const formattedUsers = data.map((user, index) => ({
        ...user,
        member_id: user.member_id || index + 1,
      }));
      setUsers(formattedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // --- FIXED: The useEffect to watch formData.totalWinners
  useEffect(() => {
    const numWinners = Number(formData.totalWinners);
    if (numWinners > 0) {
      const newPrizeDistribution = Array.from(
        { length: numWinners },
        (_, i) => ({
          rank: i + 1,
          percentage: 0,
        })
      );
      // Set a default value for the first rank
      if (newPrizeDistribution.length > 0) {
        newPrizeDistribution[0].percentage = 100;
      }
      setFormData((prevData) => ({
        ...prevData,
        prizeDistribution: newPrizeDistribution,
      }));
    }
  }, [formData.totalWinners]);

  // --- FIXED: Updated prize distribution calculation
  const distributedPercentage = formData.prizeDistribution.reduce(
    (sum, prize) => sum + Number(prize.percentage),
    0
  );

  const handleOpenModal = (team) => {
    setCurrentTeam(team);
    setSelectedPlayers([...team.players]);
    setIsModalOpen(true);
  };

  const handleSaveSelection = () => {
    const newPlayerPool = formData.playerPool.map((group) => {
      const newTeams = group.teams.map((team) =>
        team.name === currentTeam.name
          ? { ...team, players: selectedPlayers }
          : team
      );
      return { ...group, teams: newTeams };
    });
    setFormData({ ...formData, playerPool: newPlayerPool });
    setIsModalOpen(false);
  };

  const handlePlayerToggle = (player) => {
    setSelectedPlayers((prev) => {
      const isSelected = prev.find((p) => p.member_id === player.member_id);
      if (isSelected) {
        return prev.filter((p) => p.member_id !== player.member_id);
      } else {
        if (prev.length >= 4) {
          toast.warn("You can only select up to 4 players per team.");
          return prev;
        }
        return [...prev, player];
      }
    });
  };

  // --- NEW LOGIC: Create a master list of all selected players ---
  const allSelectedPlayers = formData.playerPool.flatMap((group) =>
    group.teams.flatMap((team) => team.players)
  );

  // --- Filter the available users based on the master list ---
  const availableUsers = users.filter(
    (user) => !allSelectedPlayers.some((p) => p.member_id === user.member_id)
  );

  // --- Apply search term to the available users list ---
  const filteredUsers = availableUsers.filter((user) =>
    user.user_name?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // --- FIXED: Handle changes for prize distribution inputs
  const handlePrizeChange = (index, e) => {
    const { name, value } = e.target;
    const newPrizeDistribution = [...formData.prizeDistribution];
    newPrizeDistribution[index][name] = value;
    setFormData((prevData) => ({
      ...prevData,
      prizeDistribution: newPrizeDistribution,
    }));
  };

  // Handle changes in input fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedGroups = {};
    formData.playerPool.forEach((group) => {
      formattedGroups[group.group] = {
        teams: {},
      };
      group.teams.forEach((team) => {
        const teamKey = team.name.replace("Team ", "");
        formattedGroups[group.group].teams[teamKey] = team.players.map((p) => ({
          playerId: Number(p.member_id),
        }));
      });
    });

    const apiPayload = {
      ...formData,
      event_name: formData.event_name,
      limit_users: Number(formData.limit_users),
      joining_fee: Number(formData.joining_fee),
      platform_cut: Number(formData.platform_cut),
      banner_image_url: formData.banner_image_url,
      total_winners: Number(formData.totalWinners),
      match_schedule: formData.match_schedule,
      default_player_points: Number(formData.default_player_points),
      groups: formattedGroups,
      selection_config: Number(formData.selectionConfig),
      distribution: formData.prizeDistribution.map((d) => ({
        rank: d.rank,
        percent: Number(d.percentage),
      })),
    };

    try {
      const response = await axiosInstance.post("/mega-contests", apiPayload);
      if (response.status === 201) {
        toast.success("Contest created successfully!");
      } else {
        toast.error(
          `Failed to create contest: ${
            response.data.message || response.statusText
          }`
        );
      }
    } catch (error) {
      toast.error(`An error occurred: ${error.message}`);
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
const [games, setGames] = useState([]);
const [isLoadingGames, setIsLoadingGames] = useState(false);
useEffect(() => {
  const fetchGames = async () => {
    setIsLoadingGames(true);
    try {
      const res = await axiosInstance.get("auth/admin/games");
      if (res.data.status === "success") {
        setGames(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            game: res.data.data[0].game_name, // default select first
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch games:", err);
      toast.error("Failed to fetch games");
    } finally {
      setIsLoadingGames(false);
    }
  };
  fetchGames();
}, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="flex items-center mb-8">
            <button
              onClick={() => window.history.back()}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <MoveLeftIcon size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Contest
              </h1>
              <p className="text-gray-600 mt-1">
                Set up a new fantasy contest with custom rules and prizes
              </p>
            </div>
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Contest Details Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Contest Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="event_name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Event Name
                  </label>
                  <input
                    type="text"
                    id="event_name"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
  <label
    htmlFor="game"
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Game
  </label>
  <select
    id="game"
    name="game"
    value={formData.game}
    onChange={handleChange}
    disabled={isLoadingGames}
    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map *
                  </label>
                  <select
                    value={formData.map}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option>Erangel</option>
                    <option>Sanhok</option>
                    <option>Miramar</option>
                    <option>Vikendi</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="match_schedule"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Match Schedule
                  </label>
                  <input
                    type="datetime-local"
                    id="match_schedule"
                    name="match_schedule"
                    value={formData.match_schedule.slice(0, 16)}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        match_schedule: e.target.value + ":00.000Z",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="mt-6">
                  <label
                    htmlFor="banner_image_url"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Banner Image URL
                  </label>
                  <input
                    type="url"
                    id="banner_image_url"
                    name="banner_image_url"
                    value={formData.banner_image_url}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div className="mt-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Public Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Capacity & Fees Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Capacity &amp; Fees
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label
                    htmlFor="limit_users"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    User Limit
                  </label>
                  <input
                    type="number"
                    id="limit_users"
                    name="limit_users"
                    value={formData.limit_users}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="joining_fee"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Joining Fee (₹)
                  </label>
                  <input
                    type="number"
                    id="joining_fee"
                    name="joining_fee"
                    value={formData.joining_fee}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="platform_cut"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Platform Cut (%)
                  </label>
                  <input
                    type="number"
                    id="platform_cut"
                    name="platform_cut"
                    min={0}
                    max={100}
                    value={formData.platform_cut}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="totalWinners"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Total Winners
                  </label>
                  <input
                    type="number"
                    id="totalWinners"
                    name="totalWinners"
                    // --- FIXED: Updated value to formData.totalWinners
                    value={formData.totalWinners}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min={1}
                  />
                </div>
              </div>
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-medium text-gray-900">
                    Prize Distribution
                  </h4>
                  <div className="text-sm text-gray-500 font-medium">
                    <span className="text-purple-600">₹ Total Pool | </span>
                    <span
                      className={
                        distributedPercentage === 100
                          ? "text-emerald-600"
                          : "text-red-500"
                      }
                    >
                      {100 - distributedPercentage}%
                    </span>
                    Remaining
                  </div>
                </div>
                <div className="space-y-3">
                  {/* --- FIXED: Updated map to formData.prizeDistribution --- */}
                  {formData.prizeDistribution.map((prize, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <label htmlFor={`rank-${index}`} className="sr-only">
                          Rank {index + 1}
                        </label>
                        <input
                          type="number"
                          id={`rank-${index}`}
                          name="rank"
                          placeholder="Rank"
                          value={prize.rank}
                          onChange={(e) => handlePrizeChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label
                          htmlFor={`percentage-${index}`}
                          className="sr-only"
                        >
                          Percentage for Rank {index + 1}
                        </label>
                        <input
                          type="number"
                          id={`percentage-${index}`}
                          name="percentage"
                          placeholder="Percentage"
                          value={prize.percentage}
                          onChange={(e) => handlePrizeChange(index, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Player Pool Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Player Pool Selection
              </h3>
              {formData.playerPool.map((group, groupIndex) => (
                <div key={group.group} className="mb-8">
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-8 h-8 ${
                        group.group === "A"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-emerald-100 text-emerald-800"
                      } rounded-full flex items-center justify-center text-sm font-bold mr-3`}
                    >
                      {group.group}
                    </div>
                    <input
                      type="text"
                      className="text-md font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none px-2 py-1"
                      placeholder={`Group ${group.group} Name`}
                      value={group.groupName}
                      onChange={(e) => {
                        const newPlayerPool = [...formData.playerPool];
                        newPlayerPool[groupIndex].groupName = e.target.value;
                        setFormData({ ...formData, playerPool: newPlayerPool });
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {group.teams.map((team, teamIndex) => (
                      <div
                        key={team.name}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <input
                            type="text"
                            className="font-medium text-gray-900 bg-transparent border-b border-gray-300 focus:border-purple-500 focus:outline-none px-2 py-1 flex-1 mr-2"
                            placeholder={`Team ${team.name} Name`}
                            value={team.name}
                            onChange={(e) => {
                              const newPlayerPool = [...formData.playerPool];
                              newPlayerPool[groupIndex].teams[teamIndex].name =
                                e.target.value;
                              setFormData({
                                ...formData,
                                playerPool: newPlayerPool,
                              });
                            }}
                          />
                          <button
                            type="button"
                            className={`inline-flex items-center px-3 py-1 text-sm ${
                              group.group === "A"
                                ? "bg-purple-600 hover:bg-purple-700"
                                : "bg-emerald-600 hover:bg-emerald-700"
                            } text-white rounded-md`}
                            onClick={() => handleOpenModal(team)}
                          >
                            <Edit size={15} className="mr-1" />
                            Select
                          </button>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {team.players.length}/4 players selected
                        </div>
                        <div className="space-y-2">
                          {team.players.map((player) => (
                            <div
                              key={player.member_id}
                              className="text-sm bg-gray-100 p-2 rounded-md"
                            >
                              {player.user_name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Selection Rules Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Selection Rules
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="teamSize"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Team Size
                  </label>
                  <input
                    type="number"
                    id="teamSize"
                    name="teamSize"
                    value={formData.selectionConfig.teamSize}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectionConfig: {
                          ...formData.selectionConfig,
                          teamSize: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="maxTeamsPerJoin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Max Teams Per Join
                  </label>
                  <input
                    type="number"
                    id="maxTeamsPerJoin"
                    name="maxTeamsPerJoin"
                    value={formData.selectionConfig.maxTeamsPerJoin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectionConfig: {
                          ...formData.selectionConfig,
                          maxTeamsPerJoin: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="perSourceTeamMax"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Per Source Team Max
                  </label>
                  <input
                    type="number"
                    id="perSourceTeamMax"
                    name="perSourceTeamMax"
                    value={formData.selectionConfig.perSourceTeamMax}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        selectionConfig: {
                          ...formData.selectionConfig,
                          perSourceTeamMax: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="default_player_points"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Player Points
                  </label>
                  <input
                    type="number"
                    id="default_player_points"
                    name="default_player_points"
                    value={formData.default_player_points}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <Save size={20} className="mr-1" />
                {isSubmitting ? "Creating..." : "Create Contest"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Select Players for {currentTeam.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search players..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Players List */}
              <div className="border border-gray-200 rounded-md p-4 max-h-80 overflow-y-auto">
                <h4 className="font-medium text-gray-700 mb-3">
                  Available Players
                </h4>
                <ul className="space-y-2">
                  {/* Use the newly filtered list here */}
                  {filteredUsers.map((user) => (
                    <li
                      key={user.member_id}
                      className={`p-2 rounded-md cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100`}
                      onClick={() => handlePlayerToggle(user)}
                    >
                      {user.user_name}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Selected Players List */}
              <div className="border border-gray-200 rounded-md p-4 max-h-80 overflow-y-auto">
                <h4 className="font-medium text-gray-700 mb-3">
                  Selected ({selectedPlayers.length}/4)
                </h4>
                <ul className="space-y-2">
                  {selectedPlayers.map((player) => (
                    <li
                      key={player.member_id}
                      className="p-2 rounded-md bg-purple-600 text-white flex justify-between items-center"
                    >
                      <span>{player.user_name}</span>
                      <button
                        onClick={() => handlePlayerToggle(player)}
                        className="text-purple-200 hover:text-white"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={handleSaveSelection}
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                disabled={selectedPlayers.length !== 4}
              >
                Save Players
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MegaContestForm;
