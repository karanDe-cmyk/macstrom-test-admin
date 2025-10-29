"use client"
import { useState, useEffect } from "react"
import { Download, Trash2, RefreshCw, Edit, Send, Clock, Calendar, Eye, EyeOff } from "lucide-react"
import Modal from "../components/EditNotificationModal"
import dayjs from "dayjs"
import axios from "axios"

export default function NotificationCenter() {
  const pageSize = 5
  const [tab, setTab] = useState("compose")
  const [notifications, setNotifications] = useState([])
  const [selected, setSelected] = useState([])
  const [selectAll, setSelectAll] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showEdit, setShowEdit] = useState(false)
  const [editingNotification, setEditingNotification] = useState(null)
  const [showMobileView, setShowMobileView] = useState(false)
  const [composeData, setComposeData] = useState({
    title: "",
    body: "",
    audience: "All Users",
    filters: "",
    deeplink: "",
    schedule: false,
    scheduledDate: "",
    scheduledTime: "",
  })

  // Helper function to convert audience display name to API format
  const convertAudienceToApiFormat = (audience) => {
    const audienceMap = {
      "All Users": "all",
      "Registered Users": "registered_users",
      "Premium Users": "premium_users",
      "State Players": "state_players",
      "National Players": "national_players",
      "Custom Segment": "custom_segment",
    }
    return audienceMap[audience] || "all"
  }

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications")
      const transformed = res.data.map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        audience: n.audience === "all" ? "All Users" : n.audience.replace("_", " "),
        status: n.status === "delivered" ? "Delivered" : n.status.charAt(0).toUpperCase() + n.status.slice(1),
        sends: n.sends,
        opens: n.opens,
        ctr: n.clickRate != null ? n.clickRate.toFixed(2) + "%" : "0%",
        sentAt: n.sendAt || n.createdAt,
      }))
      setNotifications(transformed)
    } catch (err) {
      console.error("Failed to fetch notifications", err)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const handleComposeChange = (field, val) => setComposeData((prev) => ({ ...prev, [field]: val }))

  const handleSend = async () => {
    try {
      // Validate required fields
      if (!composeData.title.trim()) {
        alert("Please enter a notification title")
        return
      }
      if (!composeData.body.trim()) {
        alert("Please enter notification content")
        return
      }
      // Validate scheduled notification fields
      if (composeData.schedule) {
        if (!composeData.scheduledDate) {
          alert("Please select a scheduled date")
          return
        }
        if (!composeData.scheduledTime) {
          alert("Please select a scheduled time")
          return
        }
      }

      // Prepare payload according to API format
      const payload = {
        title: composeData.title.trim(),
        body: composeData.body.trim(),
        audience: convertAudienceToApiFormat(composeData.audience),
        scheduled: composeData.schedule,
      }

      // Add deeplink if provided
      if (composeData.deeplink.trim()) {
        payload.deeplink = composeData.deeplink.trim()
      }

      // Add sendAt if scheduled
      if (composeData.schedule && composeData.scheduledDate && composeData.scheduledTime) {
        // Create ISO string from date and time
        const scheduledDateTime = `${composeData.scheduledDate}T${composeData.scheduledTime}:00Z`
        payload.sendAt = scheduledDateTime
      }

      console.log("Sending payload:", payload)
      const response = await axios.post("http://localhost:5000/api/notifications", payload, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      console.log("Response:", response.data)

      const successMessage = composeData.schedule
        ? "Notification scheduled successfully!"
        : "Notification sent successfully!"

      alert(successMessage)

      // Refresh notifications list
      await fetchNotifications()

      // Reset form
      setComposeData({
        title: "",
        body: "",
        audience: "All Users",
        filters: "",
        deeplink: "",
        schedule: false,
        scheduledDate: "",
        scheduledTime: "",
      })
    } catch (err) {
      console.error("Error sending notification", err)

      // More detailed error handling
      if (err.response) {
        // Server responded with error status
        const errorMessage =
          err.response.data?.message || err.response.data?.error || `Server error: ${err.response.status}`
        alert(`Failed to send notification: ${errorMessage}`)
      } else if (err.request) {
        // Request was made but no response received
        alert("Failed to send notification: No response from server. Please check if the server is running.")
      } else {
        // Something else happened
        alert(`Failed to send notification: ${err.message}`)
      }
    }
  }

  const refresh = () => {
    fetchNotifications()
  }

  const filteredData = notifications
    .filter((n) => n.title?.toLowerCase().includes(search.toLowerCase()))
    .filter((n) => (filterStatus ? n.status === filterStatus : true))

  const totalPages = Math.ceil(filteredData.length / pageSize)
  const pageData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const toggleSelectAll = () => {
    const ids = selectAll ? [] : pageData.map((n) => n.id)
    setSelected(ids)
    setSelectAll(!selectAll)
  }

  const toggleSelection = (id) =>
    selected.includes(id) ? setSelected(selected.filter((sid) => sid !== id)) : setSelected([...selected, id])

  const deleteSelected = async () => {
    if (!selected.length) return
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selected.length} notification(s)? This action cannot be undone.`,
    )
    if (!confirmDelete) return

    try {
      // Delete notifications one by one using the API
      const deletePromises = selected.map(async (id) => {
        try {
          await axios.delete(`http://localhost:5000/api/notifications/${id}`)
          return { id, success: true }
        } catch (error) {
          console.error(`Failed to delete notification ${id}:`, error)
          return { id, success: false, error }
        }
      })

      const results = await Promise.allSettled(deletePromises)

      // Process results
      const successfulDeletes = []
      const failedDeletes = []

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.success) {
          successfulDeletes.push(result.value.id)
        } else {
          failedDeletes.push(result.value?.id || "unknown")
        }
      })

      // Update local state by removing successfully deleted notifications
      if (successfulDeletes.length > 0) {
        setNotifications((prev) => prev.filter((n) => !successfulDeletes.includes(n.id)))
      }

      // Clear selections
      setSelected([])
      setSelectAll(false)

      // Show result message
      if (failedDeletes.length === 0) {
        alert(`Successfully deleted ${successfulDeletes.length} notification(s).`)
      } else if (successfulDeletes.length === 0) {
        alert(`Failed to delete all ${selected.length} notification(s). Please try again.`)
      } else {
        alert(
          `Partially successful: ${successfulDeletes.length} deleted, ${failedDeletes.length} failed. Please refresh to see current state.`,
        )
      }

      // Refresh the list to ensure consistency
      await fetchNotifications()
    } catch (error) {
      console.error("Error during bulk delete:", error)
      alert("An error occurred while deleting notifications. Please try again.")
    }
  }

  const exportCSV = () => {
    const csv = [
      ["Title", "Status", "Audience", "Sends", "Opens", "CTR", "Sent At"],
      ...filteredData.map((n) => [n.title, n.status, n.audience, n.sends, n.opens, n.ctr, n.sentAt]),
    ]
      .map((r) => r.join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "notifications.csv"
    a.click()
  }

  const openEdit = (notif) => {
    setEditingNotification(notif)
    setShowEdit(true)
  }

  const closeEdit = () => {
    setShowEdit(false)
    setEditingNotification(null)
  }

  const saveEdit = (updated) => {
    setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)))
    closeEdit()
  }

  // Mobile card component for notifications
  const NotificationCard = ({ notification }) => (
    <div className="bg-white border rounded-lg p-4 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selected.includes(notification.id)}
            onChange={() => toggleSelection(notification.id)}
            className="rounded"
          />
          <h3 className="font-medium text-sm">{notification.title}</h3>
        </div>
        <button className="text-blue-600 hover:text-blue-800 p-1" onClick={() => openEdit(notification)}>
          <Edit size={16} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
        <div>
          <span className="font-medium">Status:</span>
          <span
            className={`ml-1 px-2 py-1 rounded-full text-xs ${
              notification.status === "Delivered"
                ? "bg-green-100 text-green-800"
                : notification.status === "Failed"
                  ? "bg-red-100 text-red-800"
                  : notification.status === "Scheduled"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {notification.status}
          </span>
        </div>
        <div>
          <span className="font-medium">Audience:</span>
          <span className="ml-1">{notification.audience}</span>
        </div>
        <div>
          <span className="font-medium">Sends:</span>
          <span className="ml-1">{notification.sends ?? "-"}</span>
        </div>
        <div>
          <span className="font-medium">Opens:</span>
          <span className="ml-1">{notification.opens ?? "-"}</span>
        </div>
        <div>
          <span className="font-medium">CTR:</span>
          <span className="ml-1">{notification.ctr}</span>
        </div>
        <div>
          <span className="font-medium">Sent:</span>
          <span className="ml-1">{dayjs(notification.sentAt).format("MM/DD HH:mm")}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Notification Center</h1>
          <p className="text-gray-600">Manage and send notifications to your users</p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 rounded-lg bg-gray-100 p-1 max-w-md">
          {["compose", "history"].map((t) => (
            <button
              key={t}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                tab === t ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Compose */}
        {tab === "compose" && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900">Create New Notification</h2>

              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Notification Title *</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Enter notification title"
                      value={composeData.title}
                      onChange={(e) => handleComposeChange("title", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Notification Body *</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      rows={5}
                      placeholder="Write your notification content here..."
                      value={composeData.body}
                      onChange={(e) => handleComposeChange("body", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Deeplink (optional)</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="app://match/123"
                      value={composeData.deeplink}
                      onChange={(e) => handleComposeChange("deeplink", e.target.value)}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Target Audience</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={composeData.audience}
                      onChange={(e) => handleComposeChange("audience", e.target.value)}
                    >
                      {[
                        "All Users",
                        "Registered Users",
                        "Premium Users",
                        "State Players",
                        "National Players",
                        "Custom Segment",
                      ].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Custom Filters</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Add filters like state, game type, etc."
                      value={composeData.filters}
                      onChange={(e) => handleComposeChange("filters", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Options</label>
                    <div className="space-y-4">
                      <button
                        onClick={() => handleComposeChange("schedule", !composeData.schedule)}
                        className={`w-full sm:w-auto px-6 py-2 rounded-lg font-medium transition-all ${
                          composeData.schedule
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {composeData.schedule ? "✓ Scheduled Delivery" : "Schedule for Later"}
                      </button>

                      {composeData.schedule && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <div className="relative flex-1">
                            <Calendar className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                              type="date"
                              className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={composeData.scheduledDate}
                              onChange={(e) => handleComposeChange("scheduledDate", e.target.value)}
                            />
                          </div>
                          <div className="relative flex-1">
                            <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                              type="time"
                              className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={composeData.scheduledTime}
                              onChange={(e) => handleComposeChange("scheduledTime", e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                <span className="text-sm text-gray-500">Rate limit: 100,000 notifications/min</span>
                <button
                  onClick={handleSend}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 flex items-center justify-center gap-2 rounded-lg font-medium transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!composeData.title.trim() || !composeData.body.trim()}
                >
                  <Send size={18} />
                  {composeData.schedule ? "Schedule Notification" : "Send Now"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {tab === "history" && (
          <div className="bg-white shadow-sm rounded-xl border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Notification History</h2>

                {/* Mobile view toggle - only visible on small screens */}
                <button
                  onClick={() => setShowMobileView(!showMobileView)}
                  className="sm:hidden flex items-center gap-2 px-3 py-2 text-sm border rounded-lg"
                >
                  {showMobileView ? <Eye size={16} /> : <EyeOff size={16} />}
                  {showMobileView ? "Table View" : "Card View"}
                </button>
              </div>

              {/* Filters and Actions */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 flex-1">
                  <input
                    type="text"
                    placeholder="Search by title..."
                    className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <select
                    className="border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                    <option value="Sent">Sent</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={refresh}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw size={16} /> Refresh
                  </button>
                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Download size={16} /> Export
                  </button>
                  <button
                    onClick={deleteSelected}
                    disabled={!selected.length}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      selected.length
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Trash2 size={16} /> Delete ({selected.length})
                  </button>
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} className="rounded" />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Title</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Audience</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Sends</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Opens</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">CTR</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Sent At</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageData.map((n) => (
                      <tr key={n.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={selected.includes(n.id)}
                            onChange={() => toggleSelection(n.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900 max-w-xs truncate">{n.title}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              n.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : n.status === "Failed"
                                  ? "bg-red-100 text-red-800"
                                  : n.status === "Scheduled"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{n.audience}</td>
                        <td className="py-3 px-4 text-gray-600">{n.sends ?? "-"}</td>
                        <td className="py-3 px-4 text-gray-600">{n.opens ?? "-"}</td>
                        <td className="py-3 px-4 text-gray-600">{n.ctr}</td>
                        <td className="py-3 px-4 text-gray-600">{dayjs(n.sentAt).format("MMM DD, HH:mm")}</td>
                        <td className="py-3 px-4">
                          <button
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
                            onClick={() => openEdit(n)}
                          >
                            <Edit size={14} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="sm:hidden space-y-3">
                {pageData.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} notifications
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.max(p - 1, 1))
                        setSelectAll(false)
                        setSelected([])
                      }}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-600 px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                        setSelectAll(false)
                        setSelected([])
                      }}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEdit && editingNotification && (
          <Modal notification={editingNotification} onSave={saveEdit} onClose={closeEdit} />
        )}
      </div>
    </div>
  )
}
