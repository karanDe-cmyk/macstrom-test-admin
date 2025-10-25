import {ServerCog, Cpu, HardDrive, Crown, RefreshCcw,} from "lucide-react";
import { metrics } from "../data/users";

const SystemHealth = () => {
  return (
    <div className="p-6 bg-gray-50 text-gray-900 min-h-screen">
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
        <button className="flex items-center gap-1 text-sm border px-3 py-1 rounded hover:bg-gray-100">
          <RefreshCcw size={14} /> Refresh Data
        </button>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-lg border p-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ServerCog className="w-6 h-6 text-gray-700" />
            System Health Monitor
          </h3>
          <p className="text-sm text-gray-500">
            Data source: Prometheus /metrics via Grafana API
          </p>
        </div>

        {/* Main Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 mt-4">
          {metrics.map((metric, i) => {
            const Icon = metric.icon;
            return (
               <div key={i} className="bg-white border rounded-lg p-4 flex flex-col items-center justify-center">
               <Icon className={`w-6 h-6 ${metric.color}`} />
               <span className={`text-xs font-medium mt-1 px-2 py-0.5 rounded-full ${metric.status === "healthy"? "bg-green-100 text-green-700": "bg-red-100 text-red-700"}`}>
                {metric.status}
               </span>
               <h3 className="text-2xl font-bold mt-2">{metric.value}</h3>
               <p className="text-sm text-gray-500">{metric.title}</p>
               </div>
              );
            })}

        </div>

        {/* Performance & Network */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-gray-700">
              <Cpu className="w-4 h-4 text-blue-500" />
              Performance Metrics
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between">
                <span>API Response Time (avg):</span>
                <span className="font-semibold text-gray-800">0ms</span>
              </li>
              <li className="flex justify-between">
                <span>API Response Time (p95):</span>
                <span className="font-semibold text-gray-800">0ms</span>
              </li>
              <li className="flex justify-between">
                <span>Error Rate:</span>
                <span className="font-semibold text-gray-800">0%</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-4 text-gray-700">
              <HardDrive className="w-4 h-4 text-purple-500" />
              Network & Storage
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex justify-between">
                <span>Network Inbound:</span>
                <span className="font-semibold text-gray-800">1.2 GB/s</span>
              </li>
              <li className="flex justify-between">
                <span>Network Outbound:</span>
                <span className="font-semibold text-gray-800">0.8 GB/s</span>
              </li>
              <li className="flex justify-between">
                <span>Disk Usage:</span>
                <span className="font-semibold text-gray-800">0%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
