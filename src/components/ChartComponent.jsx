import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const ChartComponent = ({ title, data }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded shadow w-full">
    <div className="flex justify-between items-center mb-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <select className="text-xs p-1 rounded bg-gray-100 dark:bg-gray-700">
        <option>Daily</option>
        <option>Monthly</option>
        <option>Yearly</option>
      </select>
    </div>
    <Line data={data} options={{ responsive: true, plugins: { legend: { display: false } } }} />
  </div>
);

export default ChartComponent;
