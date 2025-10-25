import { Link } from "react-router-dom";
import React, { useState, useEffect, useContext } from "react";
import {
  Plus,
  Download,
  Search,
  Edit,
  Trash2,
  X,
  Gift,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Save,
  Users,
  CheckCircle,
  AlertCircle,
  Moon,
  Sun,
} from "lucide-react";

import ThemeContext from '../contexts/ThemeContext';
import axiosInstance from "../utils/axios";

const API_BASE_URL = "https://macstrombattle-api.kglame.com/api";

// Dark Mode Toggle Component
const DarkModeToggle = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="p-2 sm:p-3 rounded-full bg-gray-200 dark:bg-gray-800 transition-colors duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {darkMode ? (
        <Sun className="text-yellow-400 w-5 h-5 sm:w-6 sm:h-6" />
      ) : (
        <Moon className="text-gray-700 dark:text-gray-300 w-5 h-5 sm:w-6 sm:h-6" />
      )}
    </button>
  );
};

// Toast Component
const Toast = ({ message, type = "success", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const icon = type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center p-4 text-white rounded-lg shadow-lg transition-all duration-300 ${bgColor} ${
        isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
    >
      {icon}
      <span className="ml-2 font-medium">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="ml-4 text-white hover:text-gray-200"
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Confirmation Modal Component
const ConfirmationModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm">
      <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-3 mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Confirm Action</h3>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <X size={24} />
        </button>
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// Team Card Component
const TeamCard = ({ team, onEdit, onDelete, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract text fields from benefits and howToPlay arrays
  const benefitTexts = Array.isArray(team.benefits)
    ? team.benefits.map((b) => b.text)
    : [];
  const howToPlayTexts = Array.isArray(team.howToPlay)
    ? team.howToPlay.map((h) => h.text)
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-600 transition-all duration-300 hover:shadow-lg">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <img
              src={
                team.imageUrl ||
                `https://placehold.co/60x60/4F46E5/FFFFFF?text=${team.name.charAt(0).toUpperCase()}`
              }
              alt="Team avatar"
              className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-600"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://placehold.co/60x60/4F46E5/FFFFFF?text=${team.name
                  .charAt(0)
                  .toUpperCase()}`;
              }}
            />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {team.id}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(team)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
              title="Edit team"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={() => onDelete(team.id)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
              title="Delete team"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Registration Amount</p>
            <p className="font-medium text-gray-900 dark:text-white"> ₹{team.registrationAmount || "0"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Registration Date</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {team.lastRegistrationDate
                ? new Date(team.lastRegistrationDate).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Game Type</p>
            <p className="font-medium text-gray-900 dark:text-white">{team.gameType || "N/A"}</p>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors duration-200"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={16} className="mr-1" /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" /> Show Details
              </>
            )}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <Gift size={16} className="text-purple-600 dark:text-purple-400 mr-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">Benefits</h4>
              </div>
              {benefitTexts.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 pl-2">
                  {benefitTexts.slice(0, 3).map((text, index) => (
                    <li key={index}>{text}</li>
                  ))}
                  {benefitTexts.length > 3 && (
                    <li className="text-blue-600 dark:text-blue-400">+{benefitTexts.length - 3} more</li>
                  )}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No benefits added</p>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <BookOpen size={16} className="text-green-600 dark:text-green-400 mr-2" />
                <h4 className="font-medium text-gray-900 dark:text-white">How to Play</h4>
              </div>
              {howToPlayTexts.length > 0 ? (
                <ol className="list-decimal list-inside text-sm text-gray-700 dark:text-gray-300 pl-2">
                  {howToPlayTexts.slice(0, 3).map((text, index) => (
                    <li key={index}>{text}</li>
                  ))}
                  {howToPlayTexts.length > 3 && (
                    <li className="text-blue-600 dark:text-blue-400">+{howToPlayTexts.length - 3} more</li>
                  )}
                </ol>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No instructions added</p>
              )}
            </div>

            <button
              onClick={() => onViewDetails(team)}
              className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm flex items-center justify-center"
            >
              <Edit size={16} className="mr-2" />
              Manage Benefits & How to Play
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Team Edit Modal Component (Edit basic team info and rules)
const TeamEditModal = ({ team, onClose, onSave }) => {
  const [name, setName] = useState(team.name || "");
  const [registrationAmount, setRegistrationAmount] = useState(team.registrationAmount || "");
  const [lastRegistrationDate, setLastRegistrationDate] = useState(
    team.lastRegistrationDate ? new Date(team.lastRegistrationDate).toISOString().substr(0, 10) : ""
  );
  const [rules, setRules] = useState(
    Array.isArray(team.rules) ? team.rules.map((rule) => rule.text) : []
  );
  const [newRule, setNewRule] = useState("");
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  // const handleSave = async () => {
  //   setIsSaving(true);
  //   setError(null);
  //   try {
  //     const updatedTeam = {
  //       ...team,
  //       name,
  //       registrationAmount: Number(registrationAmount),
  //       lastRegistrationDate: lastRegistrationDate ? new Date(lastRegistrationDate).toISOString() : null,
  //       rules: rules.map((text, order) => ({
  //         id: team.rules[order]?.id || null, // Preserve existing rule IDs if they exist
  //         teamId: team.id,
  //         text: String(text), // Ensure text is a string
  //         order,
  //         createdAt: team.rules[order]?.createdAt || new Date().toISOString(),
  //         updatedAt: new Date().toISOString(),
  //       })),
  //     };
  //     const response = await axiosInstance.put(`/admin/teams/${team.id}`, updatedTeam);
  //     onSave(response.data);
  //   } catch (e) {
  //     console.error("Failed to save team info:", e);
  //     setError("Failed to save team information. Please try again.");
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  const handleSave = async () => {
  setIsSaving(true);
  setError(null);
  try {
    // Convert registrationAmount to a number, but preserve 0 explicitly
    const parsedRegistrationAmount =
      registrationAmount === "" ? null : Number(registrationAmount);

    const updatedTeam = {
      ...team,
      name,
      registrationAmount: parsedRegistrationAmount,
      lastRegistrationDate: lastRegistrationDate ? new Date(lastRegistrationDate).toISOString() : null,
      rules: rules.map((text, order) => ({
        id: team.rules[order]?.id || null,
        teamId: team.id,
        text: String(text),
        order,
        createdAt: team.rules[order]?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })),
    };

    const response = await axiosInstance.put(`/admin/teams/${team.id}`, updatedTeam);
    onSave(response.data);
  } catch (e) {
    console.error("Failed to save team info:", e);
    setError("Failed to save team information. Please try again.");
  } finally {
    setIsSaving(false);
  }
};
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-4 mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Tournament Info</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
              Tournament Name
            </label>
            <input
              id="teamName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="registrationAmount" className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
              Registration Amount
            </label>
            <input
              id="registrationAmount"
              type="number"
              min="0"
              value={registrationAmount}
              onChange={(e) => setRegistrationAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="lastRegistrationDate" className="block text-gray-700 dark:text-gray-300 mb-1 font-medium">
              Registration Date
            </label>
            <input
              id="lastRegistrationDate"
              type="date"
              value={lastRegistrationDate}
              onChange={(e) => setLastRegistrationDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center mb-4">
              <BookOpen size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Rules</h4>
            </div>

            <div className="flex mb-4">
              <input
                type="text"
                value={newRule}
                onChange={(e) => setNewRule(e.target.value)}
                placeholder="Add a new rule..."
                className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                onKeyPress={(e) => e.key === "Enter" && addRule()}
              />
              <button
                onClick={addRule}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {rules.length > 0 ? (
                <ol className="space-y-2">
                  {rules.map((rule, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-sm flex-grow text-gray-900 dark:text-white">{rule}</span>
                      <button
                        onClick={() => removeRule(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove rule"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No rules added yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-200"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Benefits and How to Play Modal Component
const BenefitsHowToPlayModal = ({ team, onClose, onSave }) => {
  const [benefits, setBenefits] = useState(
    Array.isArray(team.benefits) ? team.benefits.map((item) => item.text) : []
  );
  const [howToPlay, setHowToPlay] = useState(
    Array.isArray(team.howToPlay) ? team.howToPlay.map((item) => item.text) : []
  );
  const [newBenefit, setNewBenefit] = useState("");
  const [newHowToPlay, setNewHowToPlay] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        const benefitsResponse = await axiosInstance.get(`/admin/teams/${team.id}/benefits`);
        setBenefits(benefitsResponse.data.map((item) => item.text));

        const howToPlayResponse = await axiosInstance.get(`/admin/teams/${team.id}/how-to-play`);
        setHowToPlay(howToPlayResponse.data.map((item) => item.text));
      } catch (error) {
        console.error("Failed to fetch Tournament details:", error);
        setError("Failed to load Tournament details. Please try again.");
      }
    };
    fetchTeamDetails();
  }, [team.id]);

  const addBenefit = () => {
    if (newBenefit.trim()) {
      setBenefits([...benefits, newBenefit.trim()]);
      setNewBenefit("");
    }
  };
  const removeBenefit = (index) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };
  const addHowToPlay = () => {
    if (newHowToPlay.trim()) {
      setHowToPlay([...howToPlay, newHowToPlay.trim()]);
      setNewHowToPlay("");
    }
  };
  const removeHowToPlay = (index) => {
    setHowToPlay(howToPlay.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await axiosInstance.put(`/admin/teams/${team.id}/benefits`, { benefits });
      await axiosInstance.put(`/admin/teams/${team.id}/how-to-play`, { howToPlay });

      setSuccess("Tournament details updated successfully!");
      setTimeout(() => {
        onSave({ ...team, benefits: benefits.map((text) => ({ text })), howToPlay: howToPlay.map((text) => ({ text })) });
      }, 1000);
    } catch (error) {
      console.error("Failed to save:", error);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-600 pb-4 mb-4">
          <div className="flex items-center">
            <img
              src={
                team.imageUrl ||
                `https://placehold.co/50x50/4F46E5/FFFFFF?text=${team.name.charAt(0).toUpperCase()}`
              }
              alt="Team avatar"
              className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-indigo-100 dark:border-indigo-600"
            />
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Team: {team.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">ID: {team.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-md text-sm">{success}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center mb-4">
              <Gift size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">Benefits</h4>
            </div>

            <div className="flex mb-4">
              <input
                type="text"
                value={newBenefit}
                onChange={(e) => setNewBenefit(e.target.value)}
                placeholder="Add a new benefit..."
                className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 p-2 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                onKeyPress={(e) => e.key === "Enter" && addBenefit()}
              />
              <button
                onClick={addBenefit}
                className="px-4 py-2 bg-purple-600 text-white rounded-r-md hover:bg-purple-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {benefits.length > 0 ? (
                <ul className="space-y-2">
                  {benefits.map((benefit, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-sm flex-grow text-gray-900 dark:text-white">{benefit}</span>
                      <button
                        onClick={() => removeBenefit(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove benefit"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No benefits added yet</p>
              )}
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center mb-4">
              <BookOpen size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white">How to Play</h4>
            </div>

            <div className="flex mb-4">
              <input
                type="text"
                value={newHowToPlay}
                onChange={(e) => setNewHowToPlay(e.target.value)}
                placeholder="Add a new step..."
                className="flex-1 rounded-l-md border border-gray-300 dark:border-gray-600 p-2 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                onKeyPress={(e) => e.key === "Enter" && addHowToPlay()}
              />
              <button
                onClick={addHowToPlay}
                className="px-4 py-2 bg-green-600 text-white rounded-r-md hover:bg-green-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {howToPlay.length > 0 ? (
                <ol className="space-y-2">
                  {howToPlay.map((step, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center bg-white dark:bg-gray-800 p-3 rounded-md border border-gray-200 dark:border-gray-600"
                    >
                      <span className="text-sm flex-grow text-gray-900 dark:text-white">{step}</span>
                      <button
                        onClick={() => removeHowToPlay(index)}
                        className="text-red-500 hover:text-red-700 ml-2"
                        title="Remove step"
                      >
                        <X size={16} />
                      </button>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">No instructions added yet</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors duration-200 flex items-center"
          >
            <Save size={16} className="mr-1" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Teams Component
const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const fetchTeams = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axiosInstance.get("/admin/teams");
      const teamsData = Array.isArray(data) ? data : [data];

      const teamsWithDetails = await Promise.all(
        teamsData.map(async (team) => {
          try {
            let benefitsData = [];
            try {
              const res = await axiosInstance.get(`/admin/teams/${team.id}/benefits`);
              benefitsData = res.data;
            } catch (e) {
              benefitsData = [];
            }

            let howToPlayData = [];
            try {
              const res = await axiosInstance.get(`/admin/teams/${team.id}/how-to-play`);
              howToPlayData = res.data;
            } catch (e) {
              howToPlayData = [];
            }

            return {
              ...team,
              benefits: benefitsData,
              howToPlay: howToPlayData,
            };
          } catch (e) {
            console.error(`Failed to fetch details for Tournament ${team.id}:`, e);
            return { ...team, benefits: [], howToPlay: [] };
          }
        })
      );

      setTeams(teamsWithDetails);
    } catch (e) {
      console.error("Failed to fetch teams:", e);
      setError("Failed to load teams. Please ensure the API is running and the URL is correct.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleDeleteTeam = (id) => {
    setConfirmAction(() => async () => {
      try {
        const response = await axiosInstance.delete(`/admin/teams/${id}`);
        if (response.status !== 200) throw new Error(`HTTP error! status: ${response.status}`);
        setTeams((prev) => prev.filter((team) => team.id !== id));
        addToast("Tournament deleted successfully!", "success");
      } catch (e) {
        console.error("Failed to delete team:", e);
        addToast("Failed to delete team. Please try again.", "error");
        setError("Failed to delete the team. Please try again.");
      } finally {
        setShowConfirmModal(false);
      }
    });
    setShowConfirmModal(true);
  };

  const handleViewBenefits = (team) => {
    setSelectedTeam(team);
    setShowBenefitsModal(true);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setShowEditModal(true);
  };

  const handleSaveBenefits = (updatedTeam) => {
    setTeams((prev) => prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team)));
    setShowBenefitsModal(false);
    addToast("Tournament benefits and instructions updated successfully!", "success");
  };

  const handleSaveEdit = (updatedTeam) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === updatedTeam.id
          ? {
              ...team,
              name: updatedTeam.name,
              registrationAmount: updatedTeam.registrationAmount,
              lastRegistrationDate: updatedTeam.lastRegistrationDate,
              rules: updatedTeam.rules,
              benefits: team.benefits,
              howToPlay: team.howToPlay,
            }
          : team
      )
    );
    setShowEditModal(false);
    addToast("Tournament information updated successfully!", "success");
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8 font-sans antialiased text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>

      {showEditModal && selectedTeam && (
        <TeamEditModal
          team={selectedTeam}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}

      {showBenefitsModal && selectedTeam && (
        <BenefitsHowToPlayModal
          team={selectedTeam}
          onClose={() => setShowBenefitsModal(false)}
          onSave={handleSaveBenefits}
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          message="Are you sure you want to delete this team?"
          onConfirm={confirmAction}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="mr-3 text-indigo-600 dark:text-indigo-400" /> Tournaments Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage tournament details, registration, benefits and rules</p>
          </div>
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm rounded-md shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200">
              <Download className="w-4 h-4 mr-2" />
              Export Tournament
            </button>
            <Link to="/add-teams" className="flex items-center px-4 py-2 bg-indigo-600 text-white text-sm rounded-md shadow-sm hover:bg-indigo-700 transition-colors duration-200">
              <Plus className="w-4 h-4 mr-2" />
              Create Tournament
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-sm overflow-hidden p-6 transition-colors duration-300">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Tournament Details</h2>
            <div className="relative w-full md:w-64">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search tournaments..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 transition-colors duration-300"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
              <p>Loading teams...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500 dark:text-red-400">{error}</div>
          ) : filteredTeams.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              {searchTerm ? "No teams found matching your search." : "No teams available."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onEdit={handleEditTeam}
                  onDelete={handleDeleteTeam}
                  onViewDetails={handleViewBenefits}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Teams;
