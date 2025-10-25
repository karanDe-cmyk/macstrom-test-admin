import { PenBox, Trash } from "lucide-react";
import React from "react";

const Table = ({ columns = [], data = [], onEdit, onDelete }) => {
  return (
    <div className="w-full">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white sticky top-0 z-10">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 font-semibold whitespace-nowrap">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-center text-zinc-500">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-gray-50 dark:hover:bg-zinc-800 transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                      {col.key === "actions" ? (
                        <div className="flex space-x-2">
                          <PenBox
                            size={20}
                            onClick={() => onEdit?.(row)}
                            className="text-blue-500 cursor-pointer hover:text-blue-600"
                          />
                          <Trash
                            size={20}
                            onClick={() => onDelete?.(row)}
                            className="text-red-500 cursor-pointer hover:text-red-600"
                          />
                        </div>
                      ) : col.key === "image" ? (
                        <img
                          src={row[col.key]}
                          alt="game"
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : col.key === "status" ? (
                        <span
                          className={`font-medium ${
                            row[col.key] === "Active" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {row[col.key]}
                        </span>
                      ) : (
                        row[col.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Accordion View */}
      <div className="md:hidden space-y-4">
        {data.length === 0 ? (
          <p className="text-center text-zinc-500">No data available</p>
        ) : (
          data.map((row, rowIndex) => (
            <div
              key={row.id || rowIndex}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow p-4 space-y-2 border border-gray-200 dark:border-zinc-700"
            >
              {columns.map((col) =>
                col.key === "actions" ? (
                  <div key={col.key} className="flex justify-end gap-3">
                    <PenBox
                      size={20}
                      onClick={() => onEdit?.(row)}
                      className="text-blue-500 cursor-pointer hover:text-blue-600"
                    />
                    <Trash
                      size={20}
                      onClick={() => onDelete?.(row)}
                      className="text-red-500 cursor-pointer hover:text-red-600"
                    />
                  </div>
                ) : col.key === "view" ? null : (
                  <div key={col.key} className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{col.label}</span>
                    <span className="text-gray-600 dark:text-gray-400 text-right max-w-[60%] truncate">
                      {col.key === "image" ? (
                        <img
                          src={row[col.key]}
                          alt="game"
                          className="w-10 h-10 rounded object-cover"
                        />
                      ) : col.key === "status" ? (
                        <span
                          className={`font-medium ${
                            row[col.key] === "Active" ? "text-green-600" : "text-red-500"
                          }`}
                        >
                          {row[col.key]}
                        </span>
                      ) : (
                        row[col.key]
                      )}
                    </span>
                  </div>
                )
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Table;
