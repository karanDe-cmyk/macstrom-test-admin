import React, { useState } from "react";
import { Editor } from "primereact/editor";

const gameOptions = ["BGMI", "Free Fire", "COD"];
const teamOptions = ["Solo", "Duo", "Squad"];

const initialState = {
  game: "",
  matchName: "",
  matchUrl: "",
  matchSchedule: "",
  prizePool: "",
  resultType: "percentage",
  perKill: "",
  team: "",
  entryFee: "",
  totalPlayers: "",
  map: "",
  banner: null,
  prizeDesc: "",
  matchSponsor: "",
  matchDesc: "",
  matchPrivateDesc: "",
};

export default function MatchForm() {
  const [form, setForm] = useState(initialState);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [touched, setTouched] = useState({});
  const errors = {};

  // Game
  if (!form.game) {
    errors.game = "Please select a game.";
  }

  // Match Name
  if (!form.matchName.trim()) {
    errors.matchName = "Enter a match or event name.";
  } else if (form.matchName.length < 3) {
    errors.matchName = "Match name should be at least 3 characters.";
  }

  // Match URL
  if (!form.matchUrl.trim()) {
    errors.matchUrl = "Enter a match URL.";
  } else {
    const urlRegex = /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})/i;
    if (!urlRegex.test(form.matchUrl.trim())) {
      errors.matchUrl = "Enter a valid URL (starting with http or https).";
    }
  }

  // Match Schedule
  if (!form.matchSchedule.trim()) {
    errors.matchSchedule = "Enter the match schedule.";
  } else if (form.matchSchedule.length < 6) {
    errors.matchSchedule = "Schedule seems too short.";
  }

  // Prize Pool
  if (!form.prizePool) {
    errors.prizePool = "Enter the prize pool percentage.";
  } else if (isNaN(Number(form.prizePool))) {
    errors.prizePool = "Prize pool must be a number.";
  } else if (Number(form.prizePool) < 0 || Number(form.prizePool) > 95) {
    errors.prizePool = "Prize pool must be between 0 and 95.";
  }

  // Result Type
  // (optional: always either percentage/fixed due to radio)

  // Per Kill (optional, numeric only if filled in)
  if (form.perKill) {
    if (isNaN(Number(form.perKill))) {
      errors.perKill = "Per kill must be a number.";
    } else if (Number(form.perKill) < 0) {
      errors.perKill = "Per kill percent cannot be negative.";
    }
  }

  // Team
  if (!form.team) {
    errors.team = "Please select a team type.";
  }

  // Entry Fee
  if (!form.entryFee) {
    errors.entryFee = "Enter the entry fee.";
  } else if (isNaN(Number(form.entryFee))) {
    errors.entryFee = "Entry fee must be a number.";
  } else if (Number(form.entryFee) < 0) {
    errors.entryFee = "Entry fee cannot be negative.";
  }

  // Total Players
  if (!form.totalPlayers) {
    errors.totalPlayers = "Enter the total number of players.";
  } else if (isNaN(Number(form.totalPlayers))) {
    errors.totalPlayers = "Total players must be a number.";
  } else if (
    Number(form.totalPlayers) < 2 ||
    Number(form.totalPlayers) > 1000
  ) {
    errors.totalPlayers = "Total players must be between 2 and 1000.";
  }

  // Map
  if (!form.map.trim()) {
    errors.map = "Enter the map name.";
  } else if (form.map.length < 3) {
    errors.map = "Map name should be at least 3 characters.";
  }

  // Banner (Optional: Check file type/size if you want stricter checks)
  if (!form.banner) {
    errors.banner = "Please select a banner image.";
  } else {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(form.banner.type)) {
      errors.banner = "Only JPG, PNG, GIF, or WebP images allowed.";
    } else if (form.banner.size > 400000) {
      errors.banner = "Banner is too large (max 400KB).";
    }
  }

  // No need to validate rich text fields unless required
  if (!form.prizeDesc.trim()) {
    errors.prizeDesc = "Enter a prize description.";
  }
  if (!form.matchDesc.trim()) {
    errors.matchDesc = "Enter a match description.";
  }
  if (!form.matchPrivateDesc.trim()) {
    errors.matchPrivateDesc = "Enter a private match description.";
  }
  if (!form.matchSponsor.trim()) {
    errors.matchSponsor = "Enter a match sponsor.";
  }

  // Handlers
  const handleField = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleNumber = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value.replace(/[^0-9.]/g, "") }));
  };
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleBanner = (e) => {
    const file = e.target.files?.[0];
    setForm((f) => ({ ...f, banner: file }));
    if (file) setBannerPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      game: true,
      matchName: true,
      matchUrl: true,
      matchSchedule: true,
      prizePool: true,
      team: true,
      entryFee: true,
      totalPlayers: true,
      map: true,
    });
    if (Object.keys(errors).length === 0) {
      // API submit
      alert("Form submitted! (Demo)");
    }
  };

  // Class helpers
  const inputClass = (name) =>
    `w-full px-4 py-2 rounded border focus:ring-2 outline-none transition ${
      touched[name] && errors[name]
        ? "border-red-400 focus:ring-red-200"
        : "border-gray-300 focus:ring-blue-200"
    }`;

  const labelClass = "font-semibold block mb-1";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl mx-auto p-8 my-10 space-y-7 text-gray-800 dark:text-white"
      autoComplete="off"
    >
      <h2 className="text-3xl font-bold mb-2 text-blue-700 dark:text-blue-300 tracking-tight">
        Create a New Match
      </h2>
      <p className="text-gray-400 mb-6 text-lg">
        Complete the details below to launch your event.
      </p>
      {/* Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            Game<span className="text-red-500">*</span>
          </label>
          <select
            name="game"
            value={form.game}
            onChange={handleField}
            onBlur={handleBlur}
            className={inputClass("game")}
          >
            <option value="">Select Game</option>
            {gameOptions.map((g) => (
              <option value={g} key={g}>
                {g}
              </option>
            ))}
          </select>
          {touched.game && errors.game && (
            <p className="text-red-400 mt-1 text-xs">{errors.game}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Match/Event Name<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="matchName"
            value={form.matchName}
            onChange={handleField}
            onBlur={handleBlur}
            placeholder="Enter match name"
            className={inputClass("matchName")}
          />
          {touched.matchName && errors.matchName && (
            <p className="text-red-400 mt-1 text-xs">{errors.matchName}</p>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            Match URL<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="matchUrl"
            value={form.matchUrl}
            onChange={handleField}
            onBlur={handleBlur}
            placeholder="https://example.com/"
            className={inputClass("matchUrl")}
          />
          {touched.matchUrl && errors.matchUrl && (
            <p className="text-red-400 mt-1 text-xs">{errors.matchUrl}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Match Schedule<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="matchSchedule"
            value={form.matchSchedule}
            onChange={handleField}
            onBlur={handleBlur}
            placeholder="e.g., 15 July 2025, 8PM"
            className={inputClass("matchSchedule")}
          />
          {touched.matchSchedule && errors.matchSchedule && (
            <p className="text-red-400 mt-1 text-xs">{errors.matchSchedule}</p>
          )}
        </div>
      </div>
      {/* Row: Prize Pool + Result Type */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            Prize Pool (%)<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            max={95}
            name="prizePool"
            value={form.prizePool}
            onChange={handleNumber}
            onBlur={handleBlur}
            placeholder="0-95"
            className={inputClass("prizePool")}
          />
          <p className="text-xs text-gray-400">0 to 95%</p>
          {touched.prizePool && errors.prizePool && (
            <p className="text-red-400 mt-1 text-xs">{errors.prizePool}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>Result Type</label>
          <div className="flex items-center gap-4">
            <label className="flex items-center cursor-pointer gap-2">
              <input
                type="radio"
                name="resultType"
                value="percentage"
                checked={form.resultType === "percentage"}
                onChange={handleField}
              />
              Percentage
            </label>
            <label className="flex items-center cursor-pointer gap-2">
              <input
                type="radio"
                name="resultType"
                value="fixed"
                checked={form.resultType === "fixed"}
                onChange={handleField}
              />
              Fixed
            </label>
          </div>
        </div>
      </div>
      {/* Per Kill % */}
      <div>
        <label className={labelClass}>Per Kill (%)</label>
        <input
          type="number"
          name="perKill"
          value={form.perKill}
          onChange={handleNumber}
          placeholder="Enter % per kill"
          className={inputClass("perKill")}
        />
      </div>
      <hr className="my-6" />
      {/* Team, Fee, Players, Map */}
      <div className="grid md:grid-cols-4 gap-6">
        <div>
          <label className={labelClass}>
            Team<span className="text-red-500">*</span>
          </label>
          <select
            name="team"
            value={form.team}
            onChange={handleField}
            onBlur={handleBlur}
            className={inputClass("team")}
          >
            <option value="">Team Type</option>
            {teamOptions.map((t) => (
              <option value={t} key={t}>
                {t}
              </option>
            ))}
          </select>
          {touched.team && errors.team && (
            <p className="text-red-400 mt-1 text-xs">{errors.team}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Entry Fee (₹)<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="entryFee"
            value={form.entryFee}
            onChange={handleNumber}
            onBlur={handleBlur}
            placeholder="Entry Fee"
            className={inputClass("entryFee")}
          />
          {touched.entryFee && errors.entryFee && (
            <p className="text-red-400 mt-1 text-xs">{errors.entryFee}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Total Players<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="totalPlayers"
            value={form.totalPlayers}
            onChange={handleNumber}
            onBlur={handleBlur}
            placeholder="Players"
            className={inputClass("totalPlayers")}
          />
          {touched.totalPlayers && errors.totalPlayers && (
            <p className="text-red-400 mt-1 text-xs">{errors.totalPlayers}</p>
          )}
        </div>
        <div>
          <label className={labelClass}>
            Map<span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="map"
            value={form.map}
            onChange={handleField}
            onBlur={handleBlur}
            placeholder="Erangel"
            className={inputClass("map")}
          />
          {touched.map && errors.map && (
            <p className="text-red-400 mt-1 text-xs">{errors.map}</p>
          )}
        </div>
      </div>
      {/* Banner Upload */}
      <div>
        <label className={labelClass}>Banner Upload</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleBanner}
          className="block mt-1 w-full text-sm text-gray-500
                     file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 file:text-blue-700
                     hover:file:bg-blue-100"
        />
        {bannerPreview && (
          <img
            src={bannerPreview}
            alt="Banner Preview"
            className="mt-2 w-32 h-32 object-cover rounded border shadow"
          />
        )}
        <p className="text-xs text-gray-400 mt-1">
          Recommended: 150x150px for best view.
        </p>
      </div>
      {/* Rich text editors */}
      <div>
        <label className={labelClass}>Prize Description</label>
        <Editor
          value={form.prizeDesc}
          onTextChange={(e) =>
            setForm((f) => ({ ...f, prizeDesc: e.htmlValue }))
          }
          className="bg-white "
        />
      </div>
      <div>
        <label className={labelClass}>Sponsor</label>
        <Editor
          value={form.matchSponsor}
          onTextChange={(e) =>
            setForm((f) => ({ ...f, matchSponsor: e.htmlValue }))
          }
          className="bg-white "
        />
      </div>
      <div>
        <label className={labelClass}>Match Description</label>
        <Editor
          value={form.matchDesc}
          onTextChange={(e) =>
            setForm((f) => ({ ...f, matchDesc: e.htmlValue }))
          }
          className="bg-white "
        />
      </div>
      <div>
        <label className={labelClass}>
          Private Description{" "}
          <span className="text-gray-400">(Only visible to members)</span>
        </label>
        <Editor
          value={form.matchPrivateDesc}
          onTextChange={(e) =>
            setForm((f) => ({ ...f, matchPrivateDesc: e.htmlValue }))
          }
          className="bg-white "
        />
      </div>
      {/* Submit */}
      <div className="flex justify-end pt-6">
        <button
          type="submit"
          disabled={Object.keys(errors).length > 0}
          className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-2 rounded font-bold text-lg shadow hover:shadow-lg transition"
        >
          Submit Match
        </button>
      </div>
    </form>
  );
}
