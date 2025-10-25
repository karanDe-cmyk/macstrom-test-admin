import React, { useState } from "react";
5
export default function LiveStreamAdForm({ initial = null, onSaved = () => {} }) {
  const [form, setForm] = useState({
    adName: initial?.adName ?? "",
    streamId: initial?.streamId ?? "",
    adType: initial?.adType ?? "mid-roll", // pre-roll, mid-roll, post-roll, overlay, banner
    placement: initial?.placement ?? "overlay", // overlay, banner, full-screen
    startAt: initial?.startAt ?? "", // ISO datetime string
    endAt: initial?.endAt ?? "",
    durationSec: initial?.durationSec ?? 30,
    immediateStart: false,
    cpm: initial?.cpm ?? "",
    creativeUrl: initial?.creativeUrl ?? "",
    clickUrl: initial?.clickUrl ?? "",
    isActive: initial?.isActive ?? true,
    platforms: initial?.platforms ?? "web", // web, mobile, all
    muteStreamDuringAd: initial?.muteStreamDuringAd ?? false,
    adminNotes: initial?.adminNotes ?? "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState("idle"); // idle | running | paused | stopped

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.adName.trim()) e.adName = "Ad name is required";
    if (!form.streamId.trim()) e.streamId = "Stream ID or Channel is required";
    if (!form.creativeUrl.trim()) e.creativeUrl = "Creative URL is required (video/image)";
    // basic url checks
    const urlPattern = /^https?:\/\/.+/i;
    if (form.creativeUrl && !urlPattern.test(form.creativeUrl)) e.creativeUrl = "Enter valid URL (http/https)";
    if (form.clickUrl && !urlPattern.test(form.clickUrl)) e.clickUrl = "Enter valid Click URL (http/https)";
    if (form.durationSec && (isNaN(Number(form.durationSec)) || Number(form.durationSec) <= 0))
      e.durationSec = "Duration must be a positive number (seconds)";
    return e;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setSubmitting(true);
    try {
      // TODO: replace with real API call
      const payload = { ...form, createdAt: new Date().toISOString() };
      console.log("Submitting ad payload:", payload);

      // Simulate API delay
      await new Promise((r) => setTimeout(r, 800));

      // Simulated response
      const saved = { id: Math.floor(Math.random() * 1000000), ...payload };

      // callback to parent
      onSaved(saved);

      // friendly UI feedback
      alert("Ad saved successfully");
    } catch (err) {
      console.error("Save error", err);
      alert("Error saving ad. Check console for details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time control handlers
  const startAdNow = async () => {
    setRealtimeStatus("running");
    console.log("Starting ad now for stream:", form.streamId);
  };

  const pauseAdNow = async () => {
    setRealtimeStatus("paused");
    console.log("Pausing ad on stream:", form.streamId);
  };

  const resumeAdNow = async () => {
    setRealtimeStatus("running");
    console.log("Resuming ad on stream:", form.streamId);
  };

  const stopAdNow = async () => {
    setRealtimeStatus("stopped");
    console.log("Stopping ad on stream:", form.streamId);
  };

  const getStatusColor = () => {
    switch (realtimeStatus) {
      case "running": return "bg-green-100 text-green-800 border-green-200";
      case "paused": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "stopped": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="w-[90vw] max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-100">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Live Stream Ad Manager
            </h1>
            <p className="text-gray-600 mt-2 text-sm lg:text-base">
              Create, schedule, and control ads for live streams in real-time
            </p>
          </div>
          
          <div className={`px-4 py-2 rounded-full border text-sm font-medium ${getStatusColor()}`}>
            Status: {realtimeStatus.charAt(0).toUpperCase() + realtimeStatus.slice(1)}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-blue-700"><strong>Schedule:</strong> Set timing or start immediately</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span className="text-purple-700"><strong>Placement:</strong> Choose display options</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-700"><strong>Control:</strong> Real-time ad management</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-200 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 space-y-8">
          
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ad Name <span className="text-red-500">*</span>
                </label>
                <input 
                  name="adName" 
                  value={form.adName} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.adName ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="Enter ad campaign name"
                />
                {errors.adName && <p className="text-xs text-red-500 mt-2">{errors.adName}</p>}
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Stream / Channel ID <span className="text-red-500">*</span>
                </label>
                <input 
                  name="streamId" 
                  value={form.streamId} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.streamId ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="stream_12345 or channel_abc"
                />
                {errors.streamId && <p className="text-xs text-red-500 mt-2">{errors.streamId}</p>}
              </div>

              <div className="lg:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Type</label>
                <select 
                  name="adType" 
                  value={form.adType} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="pre-roll">Pre-roll (Before stream)</option>
                  <option value="mid-roll">Mid-roll (During stream)</option>
                  <option value="post-roll">Post-roll (After stream)</option>
                  <option value="overlay">Overlay</option>
                  <option value="banner">Banner</option>
                </select>
              </div>
            </div>
          </div>

          {/* Placement & Timing */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Placement & Timing</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Placement Style</label>
                <select 
                  name="placement" 
                  value={form.placement} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="overlay">Overlay (on top of stream)</option>
                  <option value="banner">Bottom Banner</option>
                  <option value="full-screen">Full-screen (interrupt)</option>
                  <option value="inline">Inline (in chat/player UI)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time</label>
                <input 
                  type="datetime-local" 
                  name="startAt" 
                  value={form.startAt} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for manual start</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">End Time</label>
                <input 
                  type="datetime-local" 
                  name="endAt" 
                  value={form.endAt} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-xs text-gray-500 mt-1">Optional end time</p>
              </div>
            </div>
          </div>

          {/* Content & Settings */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Content & Settings</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Creative URL (video/image) <span className="text-red-500">*</span>
                </label>
                <input 
                  name="creativeUrl" 
                  value={form.creativeUrl} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.creativeUrl ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="https://cdn.example.com/ads/video.mp4"
                />
                {errors.creativeUrl && <p className="text-xs text-red-500 mt-2">{errors.creativeUrl}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Click URL</label>
                <input 
                  name="clickUrl" 
                  value={form.clickUrl} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.clickUrl ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                  placeholder="https://advertiser.example.com/landing"
                />
                {errors.clickUrl && <p className="text-xs text-red-500 mt-2">{errors.clickUrl}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (seconds)</label>
                <input 
                  name="durationSec" 
                  type="number" 
                  min="1" 
                  value={form.durationSec} 
                  onChange={handleChange} 
                  className={`w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.durationSec ? "border-red-400 bg-red-50" : "border-gray-300 hover:border-gray-400"}`}
                />
                {errors.durationSec && <p className="text-xs text-red-500 mt-2">{errors.durationSec}</p>}
              </div>

              {/* <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CPM Rate</label>
                <input 
                  name="cpm" 
                  type="number" 
                  step="0.01"
                  min="0" 
                  value={form.cpm} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 mt-1">Cost per thousand impressions</p>
              </div> */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Platform</label>
                <select 
                  name="platforms" 
                  value={form.platforms} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="web">Web Only</option>
                  <option value="mobile">Mobile Only</option>
                  <option value="all">All Platforms</option>
                </select>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">Options</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="immediateStart" 
                  checked={form.immediateStart} 
                  onChange={handleChange} 
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                />
                <span className="text-sm font-medium text-gray-700">Immediate Start</span>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="muteStreamDuringAd" 
                  checked={form.muteStreamDuringAd} 
                  onChange={handleChange} 
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                />
                <span className="text-sm font-medium text-gray-700">Mute Stream During Ad</span>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  checked={form.isActive} 
                  onChange={handleChange} 
                  className="h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500" 
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Admin Notes</label>
            <textarea 
              name="adminNotes" 
              value={form.adminNotes} 
              onChange={handleChange} 
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm hover:border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              rows={4}
              placeholder="Internal notes about this ad campaign..."
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-50 -m-6 sm:-m-8 mt-8 p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
              {/* Main Actions */}
              <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-8 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-200 transform hover:scale-105 ${submitting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"}`}
                >
                  {submitting ? "Saving..." : "Save & Schedule Ad"}
                </button>

                <button
                  type="button"
                  onClick={() => setPreviewOpen((s) => !s)}
                  className="px-8 py-3 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition-all duration-200 transform hover:scale-105"
                >
                  {previewOpen ? "Hide Preview" : "Preview Ad"}
                </button>
              </div>

              {/* Real-time Controls */}
              <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
                <button 
                  type="button" 
                  onClick={startAdNow} 
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Start Now
                </button>
                <button 
                  type="button" 
                  onClick={pauseAdNow} 
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Pause
                </button>
                <button 
                  type="button" 
                  onClick={resumeAdNow} 
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Resume
                </button>
                <button 
                  type="button" 
                  onClick={stopAdNow} 
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm font-medium transition-all duration-200 transform hover:scale-105"
                >
                  Stop
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {previewOpen && (
          <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-6 sm:p-8">
            <h4 className="text-xl font-semibold text-gray-800 mb-6">Ad Preview</h4>
            <div className="bg-white rounded-2xl shadow-lg p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Creative Preview */}
              <div className="lg:col-span-1">
                <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-300">
                  {form.creativeUrl ? (
                    form.creativeUrl.match(/\.(mp4|webm|mov)$/i) ? (
                      <video 
                        src={form.creativeUrl} 
                        controls 
                        className="max-h-full max-w-full rounded-lg" 
                      />
                    ) : (
                      <img 
                        src={form.creativeUrl} 
                        alt="Creative preview" 
                        className="max-h-full max-w-full object-contain rounded-lg" 
                      />
                    )
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-2xl mb-2">📺</div>
                      <div className="text-sm">No creative set</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ad Details */}
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <h5 className="text-lg font-semibold text-gray-800">
                    {form.adName || "Untitled Ad"}
                  </h5>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      {form.adType}
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      {form.placement}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {form.platforms}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Duration:</span>
                    <span className="ml-2 text-gray-800">{form.durationSec}s</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">CPM:</span>
                    <span className="ml-2 text-gray-800">${form.cpm || "0.00"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Start Time:</span>
                    <span className="ml-2 text-gray-800">{form.startAt || "Manual"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor()}`}>
                      {realtimeStatus}
                    </span>
                  </div>
                </div>

                {form.clickUrl && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-600 text-sm">Click URL:</span>
                    <a href={form.clickUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800 text-sm break-all">
                      {form.clickUrl}
                    </a>
                  </div>
                )}

                {form.adminNotes && (
                  <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <span className="font-medium text-yellow-800 text-sm">Notes:</span>
                    <p className="text-yellow-700 text-sm mt-1">{form.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}