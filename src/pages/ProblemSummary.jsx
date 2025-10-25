import React from "react";

const ProblemSummary = ({ filteredProblems }) => {
  const total = filteredProblems.length;
  const open = filteredProblems.filter(p => p.status === "Open").length;
  const inProgress = filteredProblems.filter(p => p.status === "In Progress").length;
  const resolved = filteredProblems.filter(p => p.status === "Resolved").length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white text-sm">
      <div className="bg-blue-500 p-4 rounded shadow text-center">
        <p className="text-lg font-semibold">{total}</p>
        <p>Total Problems</p>
      </div>
      <div className="bg-yellow-500 p-4 rounded shadow text-center">
        <p className="text-lg font-semibold">{open}</p>
        <p>Open</p>
      </div>
      <div className="bg-orange-500 p-4 rounded shadow text-center">
        <p className="text-lg font-semibold">{inProgress}</p>
        <p>In Progress</p>
      </div>
      <div className="bg-green-500 p-4 rounded shadow text-center">
        <p className="text-lg font-semibold">{resolved}</p>
        <p>Resolved</p>
      </div>
    </div>
  );
};

export default ProblemSummary;
