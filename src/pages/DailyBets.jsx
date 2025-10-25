import React, { useState } from "react";
import Bets from "../daliyBets/BetsMarket";
// import LiveLiability from "../daliyBets/LiveLiabilty";
// import Sattlement from "../daliyBets/Sattlement";
const tabs = [
  { key: "overview", label: "Daily Bets" },
  // { key: "markets", label: "TBA" },
  // { key: "liability", label: "TBA" },
  // { key: "settlements", label: "TBA" },
];

const DailyBets = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <div><Bets/></div>;
      // case "markets":
      //   return <div>⚙️ Markets Tab – Odds Configuration Modal Placeholder</div>;
      // case "liability":
      //   return <div>Some Thing Coming soon</div>;
      // case "settlements":
      //   return <div></div>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white">
      <div className="flex space-x-4 border-b py-5">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 px-4 border-b-2 transition-colors duration-200 ${
              activeTab === tab.key
                ? "p-3 border-blue-500 text-blue-600 bg-blue-100 font-semibold"
                : "border-transparent hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-white dark:bg-zinc-800 rounded shadow">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DailyBets;
