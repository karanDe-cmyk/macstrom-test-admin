import React, { useState, useEffect } from "react";
import {
  Play,
  Square,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axios";

const StreamManager = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // ✅ for navigation

  // Fetch all streams
  const fetchStreams = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await axiosInstance.get("/stream");
      setStreams(response.data.rows || []);
    } catch (err) {
      console.error("Failed to fetch streams:", err);
      setError(
        err.response?.data?.message || `Failed to fetch streams: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Start new stream
  const handleStartStream = async () => {
    setActionLoading("start");
    try {
      await axiosInstance.post("/stream/start", {});
      await fetchStreams();
    } catch (err) {
      console.error("Failed to start stream:", err);
      setError(
        err.response?.data?.message || `Failed to start stream: ${err.message}`
      );
    } finally {
      setActionLoading(null);
    }
  };

  // Stop stream
  const handleStopStream = async (streamKey) => {
    setActionLoading(streamKey);
    try {
      const response = await axiosInstance.post("/stream/stop", { streamKey });
      console.log("Stop stream response:", response.data);

      await fetchStreams();
      setError(null);
    } catch (err) {
      console.error("Stop stream error:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          `Failed to stop stream: ${err.message}`
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHrs > 0) return `${diffHrs}h ${diffMins}m`;
    return `${diffMins}m`;
  };

  const getStatusColor = (status) =>
    status === "live"
      ? "bg-green-100 text-green-800 border-green-300"
      : "bg-red-200 text-red-900 border-red-300";

  const getStatusIcon = (status) =>
    status === "live" ? (
      <Wifi className="w-4 h-4" />
    ) : (
      <WifiOff className="w-4 h-4" />
    );

  const hasLiveStream = streams.some((stream) => stream.status === "live");

  useEffect(() => {
    fetchStreams();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-lg text-gray-600">Loading streams...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Stream Management Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your live streams and view streaming history
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
              >
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleStartStream}
            disabled={actionLoading === "start"}
            className={`flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all ${
              hasLiveStream || actionLoading === "start"
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {actionLoading === "start" ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Play className="w-5 h-5 mr-2" />
            )}
            {actionLoading === "start" ? "Starting..." : "Start New Stream"}
          </button>

          <button
            onClick={fetchStreams}
            disabled={loading}
            className="flex items-center justify-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Streams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {streams.map((stream) => (
            <div
              key={stream.id}
              onClick={() => navigate(`/live/${stream.streamKey}`)} // ✅ open LiveStream.jsx
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      stream.status
                    )}`}
                  >
                    {getStatusIcon(stream.status)}
                    <span className="ml-1 capitalize">{stream.status}</span>
                  </div>
                  <span className="text-sm text-gray-500">ID: {stream.id}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Stream #{stream.id}
                </h3>

                <div className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded mb-3">
                  <strong>Stream Key:</strong> {stream.streamKey}
                </div>

                <div className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded mb-3">
                  <strong>RTMP URL:</strong> rtmp://localhost/live/{stream.streamKey}
                </div>

                <div className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded">
                  <strong>HLS URL:</strong> http://localhost:8080/hls/{stream.streamKey}.m3u8
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                  <span>Started: {formatDate(stream.createdAt)}</span>
                </div>

                {stream.endedAt && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-red-600" />
                    <span>Ended: {formatDate(stream.endedAt)}</span>
                  </div>
                )}

                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span>
                    Duration: {calculateDuration(stream.createdAt, stream.endedAt)}
                  </span>
                </div>

                {stream.status === "live" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ prevent card click navigation
                      handleStopStream(stream.streamKey);
                    }}
                    disabled={actionLoading === stream.streamKey}
                    className="w-full flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
                  >
                    {actionLoading === stream.streamKey ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    {actionLoading === stream.streamKey
                      ? "Stopping..."
                      : "Stop Stream"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {streams.length === 0 && !loading && (
          <div className="text-center py-16">
            <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No streams found
            </h3>
            <p className="text-gray-600 mb-6">
              Start your first stream to get started
            </p>
            <button
              onClick={handleStartStream}
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Start New Stream
            </button>
          </div>
        )}

        {/* Stats Footer */}
        {streams.length > 0 && (
          <div className="mt-12 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Stream Statistics
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {streams.length}
                </div>
                <div className="text-sm text-blue-800">Total Streams</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {streams.filter((s) => s.status === "live").length}
                </div>
                <div className="text-sm text-green-800">Live Streams</div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {streams.filter((s) => s.status === "ended").length}
                </div>
                <div className="text-sm text-gray-800">Ended Streams</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamManager;
