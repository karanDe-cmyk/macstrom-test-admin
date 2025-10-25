import React, { useState } from "react";
import {
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Activity,
  Settings,
  PauseCircle,
  LineChart,
} from "lucide-react";
import {
  LineChart as RechartLine,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Bets = () => {
  const [activeTab, setActiveTab] = useState("markets");

  const tabs = ["markets", "liability", "settlements"];

  const summary = [
    { label: "Active Markets", value: 3, icon: <Activity className="text-blue-500" /> },
    { label: "Total Stake", value: "₹23,500", icon: <DollarSign className="text-green-600" /> },
    { label: "Total Exposure", value: "₹19,200", icon: <AlertTriangle className="text-yellow-500" /> },
    { label: "Profit Margin", value: "18.3%", icon: <TrendingUp className="text-green-600" /> },
  ];

  const matches = [
    {
      title: "Team Messi vs Team Ronaldo",
      date: "1/15/2025, 11:45:00 PM",
      stake: "₹15,000",
      exposure: "₹12,000",
      profit: "₹3,000",
      exposurePct: 80,
      status: "Live",
      markets: [
        {
          name: "Match Winner",
          odds: "Team A: 1.85   Team B: 1.95",
        },
        {
          name: "Total Kills Over/Under",
          odds: "Line: 25",
        },
      ],
    },
    {
      title: "Team Alpha vs Team Beta",
      date: "1/15/2025, 11:30:00 PM",
      stake: "₹15,000",
      exposure: "₹12,000",
      profit: "₹3,000",
      exposurePct: 80,
      status: "Live",
      markets: [
        {
          name: "Match Winner",
          odds: "Team A: 1.85   Team B: 1.95",
        },
        {
          name: "Total Kills Over/Under",
          odds: "Line: 25",
        },
      ],
    },
    {
      title: "Team Messi vs Team Ronaldo",
      date: "1/16/2025, 1:30:00 AM",
      stake: "₹8,500",
      exposure: "₹7,200",
      profit: "₹1,300",
      exposurePct: 84.7,
      status: "Upcoming",
      markets: [],
    },
    {
      title: "Team Nasir vs Team Momo",
      date: "1/16/2025, 1:30:00 AM",
      stake: "₹8,500",
      exposure: "₹7,200",
      profit: "₹1,300",
      exposurePct: 84.7,
      status: "Upcoming",
      markets: [],
    },
    {
      title: "Team Rohit vs Team Dhoni",
      date: "1/16/2025, 1:30:00 AM",
      stake: "₹8,500",
      exposure: "₹7,200",
      profit: "₹1,300",
      exposurePct: 84.7,
      status: "Upcoming",
      markets: [],
    },
    {
      title: "Team Messi vs Team Neymar",
      date: "1/16/2025, 1:30:00 AM",
      stake: "₹8,500",
      exposure: "₹7,200",
      profit: "₹1,300",
      exposurePct: 84.7,
      status: "Upcoming",
      markets: [],
    },
  ];

  const chartData = [
    { time: "18:00", stake: 5000, exposure: 4200 },
    { time: "18:15", stake: 8000, exposure: 7000 },
    { time: "18:30", stake: 12000, exposure: 10000 },
    { time: "18:45", stake: 15000, exposure: 12500 },
    { time: "19:00", stake: 18000, exposure: 15000 },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-1">Daily Bets</h1>
      <p className="text-gray-500 mb-6">Manage betting markets and monitor liability</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {summary.map((item) => (
          <div key={item.label} className="bg-white p-4 rounded shadow flex items-center space-x-4">
            <div className="text-xl">{item.icon}</div>
            <div>
              <div className="text-sm text-gray-500">{item.label}</div>
              <div className="font-semibold text-lg">{item.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeTab === tab ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {tab === "markets" ? "Markets" : tab === "liability" ? "Live Liability" : "Settlements"}
          </button>
        ))}
      </div>

      {/* Markets Tab */}
      {activeTab === "markets" && (
        <div className="space-y-6">
          {matches.map((match) => (
            <div key={match.title} className="bg-white rounded shadow p-2">
              <div className="flex justify-between items-center mb-1">
                <h2 className="font-semibold text-lg">{match.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  match.status === "Live" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                }`}>
                  {match.status}
                </span>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {match.date} • Stake: {match.stake} • Exposure: {match.exposure}
              </div>

              {match.markets.map((mkt) => (
                <div key={mkt.name} className="bg-gray-50 p-3 rounded mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium">{mkt.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{mkt.odds}</div>
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-1 bg-white border px-3 py-1 rounded text-sm hover:bg-gray-100">
                      <Settings size={14} /> <span>Configure</span>
                    </button>
                    <button className="flex items-center space-x-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                      <PauseCircle size={14} /> <span>Halt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Live Liability Tab */}
      {activeTab === "liability" && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-lg font-semibold flex items-center mb-1">
              <TrendingUp className="mr-2" /> Live Liability
            </h2>
            <p className="text-sm text-gray-500 mb-4">Real-time stake vs exposure tracking</p>
            <ResponsiveContainer width="100%" height={300}>
              <RechartLine data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Line type="monotone" dataKey="exposure" stroke="#ef4444" name="Exposure" />
                <Line type="monotone" dataKey="stake" stroke="#3b82f6" name="Stake" />
              </RechartLine>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <div key={match.title} className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">{match.title}</h3>
                <div className="text-sm space-y-1">
                  <div>Total Stake: <span className="font-medium">{match.stake}</span></div>
                  <div>Exposure: <span className="text-red-500">{match.exposure}</span></div>
                  <div>Potential Profit: <span className="text-green-600">{match.profit}</span></div>
                </div>
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-red-500 rounded"
                      style={{ width: `${match.exposurePct}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-center text-gray-500 mt-1">
                    {match.exposurePct}% exposure
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Settlements Placeholder */}
  {activeTab === "settlements" && (
  <div className="space-y-6">
    {/* Settlement Summary */}
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-1">Settlement Summary</h2>
      <p className="text-gray-500 mb-4">Completed match settlements and anomalies</p>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="text-gray-500 border-b">
              <th className="py-2 pr-4">Match</th>
              <th className="py-2 pr-4">Total Bets</th>
              <th className="py-2 pr-4">Stake</th>
              <th className="py-2 pr-4">Payout</th>
              <th className="py-2 pr-4">Platform P&L</th>
              <th className="py-2 pr-4">Settled At</th>
              <th className="py-2">Anomalies</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2 pr-4">Team Alpha vs Team Beta</td>
              <td className="py-2 pr-4">156</td>
              <td className="py-2 pr-4">₹15,000</td>
              <td className="py-2 pr-4">₹13,500</td>
              <td className="py-2 pr-4 text-green-600">₹1,500</td>
              <td className="py-2 pr-4">1/15/2024, 1:00:00 AM</td>
              <td className="py-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">Clean</span>
              </td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Team Gamma vs Team Delta</td>
              <td className="py-2 pr-4">89</td>
              <td className="py-2 pr-4">₹8,500</td>
              <td className="py-2 pr-4">₹9,200</td>
              <td className="py-2 pr-4 text-red-500">-₹700</td>
              <td className="py-2 pr-4">1/15/2024, 2:45:00 AM</td>
              <td className="py-2">
                <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">1 anomalies</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    {/* Settlement Anomalies */}
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold flex items-center text-yellow-600 mb-3">
        ⚠️ <span className="ml-2 text-black">Settlement Anomalies</span>
      </h2>

      <div className="border rounded bg-yellow-50 px-4 py-3">
        <h3 className="font-semibold mb-1">Team Gamma vs Team Delta</h3>
        <p className="text-sm">
          <span className="font-semibold text-yellow-700">Large Payout:</span> Single bet won ₹3,500 &nbsp;
          <span className="text-blue-600 underline cursor-pointer">User: U12345</span>
        </p>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Bets;
