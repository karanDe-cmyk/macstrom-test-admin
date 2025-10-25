import React from "react";

const ExportButton = ({ data, filename }) => {
  const exportToCSV = () => {
    const csvRows = [];

    // Extract headers
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(","));

    // Extract data
    data.forEach((item) => {
      const values = headers.map((key) => `"${(item[key] ?? "").toString().replace(/"/g, '""')}"`);
      csvRows.push(values.join(","));
    });

    // Create blob and download
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportToCSV}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
    >
      Export CSV
    </button>
  );
};

export default ExportButton;
