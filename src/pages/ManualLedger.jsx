import React, { useState } from "react";
import { DollarSign, Clock, RefreshCcw, PlusCircle, Crown, XCircle,} from "lucide-react";

export default function ManualLedger() {
  const currentBalance = 2847650.45;
  const pendingTransactions = 15670.0;

  const [lastAdjustment, setLastAdjustment] = useState( {
    amount: "+$500.00",
    type: "Credit",
    admin: "John Smith",
    reason: "Tournament prize correction",
    time: "1/8/2024, 4:52:33 PM",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    type: "Credit",
    reason: "",
    pin: "",
  });

  const handleSubmit = (e) => {
  e.preventDefault();

  const now = new Date();
  const formattedTime = now.toLocaleString();

  setLastAdjustment({
    amount:
      (formData.type === "Credit" ? "+" : "-") +
      `$${parseFloat(formData.amount).toFixed(2)}`,
    type: formData.type,
    admin: "SuperAdmin", // 🔁 Replace with actual admin name if available
    reason: formData.reason,
    time: formattedTime,
  });

  // Clear form and close modal
  setFormData({ amount: "", type: "Credit", reason: "", pin: "" });
  setIsModalOpen(false);
};


  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Crown className="text-purple-800 w-6 h-6" />
            Super Admin Panel
          </h1>
          <p className="text-sm text-gray-500">
            Deep system oversight and administrative controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          
          <button className="flex items-center gap-1 text-sm border px-3 py-1.5 rounded hover:bg-gray-100">
            <RefreshCcw size={14} />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Platform Ledger */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <h3 className="text-xl font-semibold mb-1">💲 Platform Ledger Status</h3>
        <p className="text-sm text-gray-500 mb-4">
          Data source: platform_earnings table
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-100 p-6 rounded-lg flex flex-col items-center">
            <DollarSign className="text-blue-600 w-6 h-6" />
            <p className="text-sm text-gray-500 mt-1">Current Balance</p>
            <h2 className="text-2xl font-bold text-blue-700 mt-1">
              ${currentBalance.toLocaleString()}
            </h2>
          </div>

          <div className="bg-yellow-100 p-6 rounded-lg flex flex-col items-center">
            <Clock className="text-yellow-600 w-6 h-6" />
            <p className="text-sm text-gray-500 mt-1">Pending Transactions</p>
            <h2 className="text-2xl font-bold text-yellow-700 mt-1">
              ${pendingTransactions.toLocaleString()}
            </h2>
          </div>
        </div>

        {/* Last Manual Adjustment */}
        <div className="mt-6 border rounded-md p-4 bg-gray-50">
          <p className="font-medium mb-1">Last Manual Adjustment</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 text-sm text-gray-700 gap-2">
            <p>Amount: {lastAdjustment.amount}</p>
            <p>Type: {lastAdjustment.type}</p>
            <p>Admin: {lastAdjustment.admin}</p>
            <p>Time: {lastAdjustment.time}</p>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Reason: {lastAdjustment.reason}
          </p>
        </div>
      </div>

      {/* Manual Ledger Adjustment */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-lg font-semibold mb-1">📄 Manual Ledger Adjustment</h3>
        <p className="text-sm text-gray-500 mb-4">
          Requires PIN verification. All changes are logged and audited.
        </p>

        <button
          className="w-full bg-black text-white py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-800"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusCircle size={18} />
          Make Ledger Adjustment
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative mx-3">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              <XCircle />
            </button>
            <h2 className="text-lg font-semibold mb-2">
              Manual Ledger Adjustment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Amount ($)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                >
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Reason</label>
                <input
                  type="text"
                  required
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">PIN</label>
                <input
                  type="password"
                  required
                  value={formData.pin}
                  onChange={(e) =>
                    setFormData({ ...formData, pin: e.target.value })
                  }
                  className="w-full border rounded-md px-3 py-2 mt-1 text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-700 text-white py-2 rounded-md hover:bg-purple-800"
              >
                Confirm Adjustment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
