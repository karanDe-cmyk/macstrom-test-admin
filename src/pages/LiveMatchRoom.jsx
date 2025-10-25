import React, { useState } from "react";

const LiveMatchRoom = () => {
  const [killFeed, setKillFeed] = useState([
    { time: "23:45", killer: "PHX_Sniper", victim: "TBT_Warrior", killerTeam: "PHX" },
    { time: "23:12", killer: "TBT_Assassin", victim: "PHX_Bravo", killerTeam: "TBT" },
    { time: "22:58", killer: "PHX_Tank", victim: "TBT_Support", killerTeam: "PHX" },
  ]);

  const [chatMessages, setChatMessages] = useState([
    { time: "23:50", user: "Spectator123", message: "Great play by PHX!" },
    { time: "23:48", user: "GameFan", message: "TBT comeback incoming" },
    { time: "23:45", user: "ProGamer", message: "" },
  ]);

  const [scores, setScores] = useState({
    phoenix: 1,
    thunder: 2,
  });

  const handleScoreChange = (team, value) => {
    setScores((prev) => ({
      ...prev,
      [team]: parseInt(value),
    }));
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Phoenix Warriors vs Thunder Bolts</h2>
          <p className="text-sm text-gray-500">Live match room with kill feed and chat</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">🔴 Live</span>
          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">MATCH789</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kill Feed */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            🎯 Live Kill Feed
          </h3>
          <div className="bg-gray-50 p-2 rounded border max-h-48 overflow-y-auto">
            {killFeed.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm py-1 border-b last:border-b-0"
              >
                <span className="text-gray-500">{item.time}</span>
                <span>
                  <span className={item.killerTeam === "PHX" ? "text-red-500 font-semibold" : "text-blue-500 font-semibold"}>
                    {item.killer}
                  </span>{" "}
                  eliminated{" "}
                  <span className="text-gray-600">{item.victim}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Moderator */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            💬 Chat Moderator
          </h3>
          <div className="bg-gray-50 p-2 rounded border max-h-48 overflow-y-auto space-y-2">
            {chatMessages.map((msg, index) => (
              <div key={index} className="flex justify-between bg-blue-50 p-2 rounded text-sm">
                <div className="text-blue-600 font-semibold">{msg.user}</div>
                <div className="text-gray-600 flex-1 ml-2">{msg.message}</div>
                <div className="text-gray-400 ml-2">{msg.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Manual Score Override */}
      <div className="bg-yellow-50 border mt-6 p-4 rounded">
        <h3 className="font-semibold mb-3">Manual Score Override</h3>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Phoenix Warriors:</span>
            <input
              type="number"
              value={scores.phoenix}
              onChange={(e) => handleScoreChange("phoenix", e.target.value)}
              className="w-16 px-2 py-1 border rounded"
            />
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Update</button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Thunder Bolts:</span>
            <input
              type="number"
              value={scores.thunder}
              onChange={(e) => handleScoreChange("thunder", e.target.value)}
              className="w-16 px-2 py-1 border rounded"
            />
            <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Update</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchRoom;
