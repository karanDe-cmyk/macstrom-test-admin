import React, { useState, useEffect } from "react";
import axios from "../utils/axios";
import { toast } from "react-toastify";

function Ads() {
  const [tab, setTab] = useState("upload");
  const [ads, setAds] = useState([]);
  const [form, setForm] = useState({
    adName: "",
    adType: "Banner",
    startDate: "",
    endDate: "",
    targetUrl: "",
    media: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjcsInJvbGUiOiJTdXBlckFkbWluIiwiaWF0IjoxNzU0MzY5NzkwLCJleHAiOjE3NTU2NjU3OTB9.B6xvX5qEONmozHu-3pmDu7e0nzBzmMj89AtQ60MM9-I";


  const fetchAds = async () => {
    try {
      const res = await axios.get("/ads");
      setAds(res.data);
    } catch (err) {
      console.error("Error fetching ads", err);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "media") {
      setForm((prev) => ({ ...prev, media: files[0] }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };
    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        if (isEditing) {
        // PUT request — update without media
        await axios.put(`/ads/${editingId}`, {
          adName: form.adName,
          adType: form.adType,
          startDate: form.startDate,
          endDate: form.endDate,
          targetUrl: form.targetUrl,
        }, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        toast.success("Ad updated!");
        } else {
        // POST request — with media
        if (!form.media) return toast.info("Please select media");

        const data = new FormData();
        Object.entries(form).forEach(([key, val]) => data.append(key, val));

        await axios.post("/ads", data, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        toast.success("Ad uploaded!");
        }

        // Reset form state
        setForm({
        adName: "",
        adType: "Banner",
        startDate: "",
        endDate: "",
        targetUrl: "",
        media: null,
        });
        setIsEditing(false);
        setEditingId(null);
        fetchAds();
    } catch (err) {
        console.error("Submit error:", err.response?.data || err.message);
        toast.error("Error submitting ad.");
    }
    };


  const handleDelete = async (id) => {
    if (!window.confirm("Delete this ad?")) return;
    try {
      await axios.delete(`/ads/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      fetchAds();
    } catch (err) {
      toast.error("Failed to delete.");
    }
  };

const filteredAds = ads;

  const tabOptions = [
    { label: "Upload Ads", value: "upload" },
    { label: "Schedule", value: "scheduled" },
    { label: "Performance", value: "active" },
    ];


  return (
    <div className="p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h1 className="text-3xl font-semibold dark:text-white">Sponsor Ads</h1>

        <div className="flex gap-2">
            <button
            onClick={fetchAds}
            className="flex items-center gap-1 text-sm px-4 py-2 border border-zinc-300 rounded hover:bg-zinc-100"
            >
            ⟳ Refresh
            </button>
            <button
            onClick={() => toast.info("Coming soon!")} // TEMP action
            className="bg-black text-white text-sm px-4 py-2 rounded hover:bg-zinc-800"
            >
            ⎙ View Full Stats
            </button>
        </div>
        </div>


      <div className="flex space-x-4 border-b mb-6">
        {tabOptions.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`py-2 px-4 ${
              tab === t.value
                ? "border-b-2 border-black bg-black/10 font-medium"
                : "text-zinc-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>


        {tab === "upload" && (
        <form
            onSubmit={handleSubmit}
            className="bg-white p-6 shadow rounded-md space-y-6"
        >
            <h2 className="text-2xl font-semibold">
             {isEditing ? "Edit Ad" : "Upload New Ad"}
            </h2>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT SECTION */}
            <div className="space-y-4">
                <div>
                <label className="block text-sm mb-1">Ad Name</label>
                <input
                    type="text"
                    name="adName"
                    placeholder="Enter ad campaign name"
                    value={form.adName}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                />
                </div>
                <div>
                <label className="block text-sm mb-1">Ad Type</label>
                <select
                    name="adType"
                    value={form.adType}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                >
                    <option value="Banner">Banner</option>
                    <option value="Interstitial">Interstitial</option>
                </select>
                </div>
                <div>
                <label className="block text-sm mb-1">Campaign Dates</label>
                <div className="grid grid-cols-2 gap-2">
                    <input
                    type="date"
                    name="startDate"
                    value={form.startDate}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                    />
                    <input
                    type="date"
                    name="endDate"
                    value={form.endDate}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                    />
                </div>
                </div>
            </div>

            {/* RIGHT SECTION */}
            <div className="space-y-4">
                <div>
                <label className="block text-sm mb-1">Upload Media</label>
                <input
                    type="file"
                    name="media"
                    accept="image/*,video/*"
                    onChange={handleChange}
                    className="w-full p-2 border rounded bg-white"
                />
                <p className="text-xs text-zinc-500 mt-1">
                    JPG, PNG or GIF. Recommended size: 1200×628px
                </p>
                </div>
                <div>
                <label className="block text-sm mb-1">Target URL</label>
                <input
                    type="text"
                    name="targetUrl"
                    placeholder="https://example.com/promo"
                    value={form.targetUrl}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                />
                </div>
            </div>
            </div>

            <div className="text-right flex items-center justify-end gap-4">
            <button
                type="submit"
                className="bg-black text-white px-6 py-2 rounded hover:bg-zinc-800"
            >
                {isEditing ? "Update Ad" : "Save Ad Campaign"}
            </button>

            {isEditing && (
                <button
                type="button"
                onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setForm({
                    adName: "",
                    adType: "Banner",
                    startDate: "",
                    endDate: "",
                    targetUrl: "",
                    media: null,
                    });
                }}
                className="text-sm text-zinc-600 underline hover:text-black"
                >
                Cancel Edit
                </button>
            )}
            </div>

        </form>
        )}

        {/* Scheduled Ads */}
        {tab === "scheduled" && (
          <div className="bg-white rounded shadow mt-6 p-6">
            <h2 className="text-2xl font-semibold mb-4">Ad Schedule</h2>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full table-auto text-sm text-left">
                <thead className="bg-zinc-100 text-zinc-600">
                  <tr>
                    <th className="p-3 font-medium">Ad Name</th>
                    <th className="p-3 font-medium">Type</th>
                    <th className="p-3 font-medium">Start Date</th>
                    <th className="p-3 font-medium">End Date</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAds.map((ad) => (
                    <tr key={ad.id} className="border-t hover:bg-indigo-50">
                      <td className="p-3">{ad.adName}</td>
                      <td className="p-3">{ad.adType}</td>
                      <td className="p-3">{ad.startDate}</td>
                      <td className="p-3">{ad.endDate}</td>
                      <td className="p-3">
                        <span
                          onClick={async () => {
                            try {
                              await axios.patch(`/ads/${ad.id}/toggle`);
                              setAds(prev =>
                                prev.map(a =>
                                  a.id === ad.id
                                    ? { ...a, status: a.status === "active" ? "inactive" : "active" }
                                    : a
                                )
                              );
                            } catch {
                              toast.error("Failed to toggle status");
                            }
                          }}
                          className={`cursor-pointer text-xs font-medium px-2 py-1 rounded ${
                            ad.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          {ad.status}
                        </span>
                      </td>
                      <td className="p-3 flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setForm({
                              adName: ad.adName,
                              adType: ad.adType,
                              startDate: ad.startDate,
                              endDate: ad.endDate,
                              targetUrl: ad.targetUrl,
                              media: null,
                            });
                            setIsEditing(true);
                            setEditingId(ad.id);
                            setTab("upload");
                          }}
                          className="text-zinc-600 hover:text-black"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(ad.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredAds.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-zinc-500 py-6">
                        No scheduled ads found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden flex flex-col gap-3">
              {filteredAds.map((ad) => (
                <div key={ad.id} className="rounded-xl border border-gray-200 p-3 bg-gray-50">
                  <p className="text-xs text-gray-500">Ad Name</p>
                  <p className="font-medium mb-1">{ad.adName}</p>

                  <p className="text-xs text-gray-500">Type</p>
                  <p className="mb-1">{ad.adType}</p>

                  <p className="text-xs text-gray-500">Start Date</p>
                  <p className="mb-1">{ad.startDate}</p>

                  <p className="text-xs text-gray-500">End Date</p>
                  <p className="mb-1">{ad.endDate}</p>

                  <p className="text-xs text-gray-500">Status</p>
                  <span
                    onClick={async () => {
                      try {
                        await axios.patch(`/ads/${ad.id}/toggle`);
                        setAds(prev =>
                          prev.map(a =>
                            a.id === ad.id
                              ? { ...a, status: a.status === "active" ? "inactive" : "active" }
                              : a
                          )
                        );
                      } catch {
                        toast.error("Failed to toggle status");
                      }
                    }}
                    className={`inline-block mt-1 text-xs font-medium px-2 py-1 rounded ${
                      ad.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    {ad.status}
                  </span>

                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      onClick={() => {
                        setForm({
                          adName: ad.adName,
                          adType: ad.adType,
                          startDate: ad.startDate,
                          endDate: ad.endDate,
                          targetUrl: ad.targetUrl,
                          media: null,
                        });
                        setIsEditing(true);
                        setEditingId(ad.id);
                        setTab("upload");
                      }}
                      className="text-sm text-blue-600"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(ad.id)}
                      className="text-sm text-red-600"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}

              {filteredAds.length === 0 && (
                <p className="text-center text-zinc-500 py-6">
                  No scheduled ads found.
                </p>
              )}
            </div>
          </div>
        )}


        {/* Ad Performance Table */}
        {tab === "active" && (
        <div className="bg-white rounded shadow mt-6 p-6">
            <h2 className="text-2xl font-semibold mb-4">Ad Performance</h2>
            <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm text-left">
                <thead className="bg-zinc-100 text-zinc-600">
                <tr>
                    <th className="p-3 font-medium">Ad Name</th>
                    <th className="p-3 font-medium">Impressions</th>
                    <th className="p-3 font-medium">Clicks</th>
                    <th className="p-3 font-medium">CTR</th>
                    <th className="p-3 font-medium text-center">Actions</th>
                </tr>
                </thead>
                <tbody>
                {filteredAds.map((ad) => {
                    const ctr = ad.impressions
                    ? ((ad.clicks / ad.impressions) * 100).toFixed(2)
                    : "0.00";
                    return (
                    <tr key={ad.id} className="border-t transition-colors duration-200 hover:bg-indigo-50 hover:shadow-sm">
                        <td className="p-3">{ad.adName}</td>
                        <td className="p-3">{ad.impressions.toLocaleString()}</td>
                        <td className="p-3">{ad.clicks}</td>
                        <td className="p-3">{ctr}%</td>
                        <td className="p-3 text-center">
                        <button className="hover:text-black text-zinc-500">
                            📊
                        </button>
                        </td>
                    </tr>
                    );
                })}
                {filteredAds.length === 0 && (
                    <tr>
                    <td colSpan="5" className="text-center text-zinc-500 py-6">
                        No performance data found.
                    </td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
        )}

    </div>
  );
}

export default Ads;
