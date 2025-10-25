import React from "react";

const SearchBar = ({ searchTerm, onSearch }) => {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-1">Search</label>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="Search by title, user, category..."
        className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-500"
      />
    </div>
  );
};

export default SearchBar;
