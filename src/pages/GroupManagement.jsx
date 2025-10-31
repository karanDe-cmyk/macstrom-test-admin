"use client"

import { useState, useEffect, useMemo } from "react"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import {
  MoreVertical,
  Calendar,
  Search,
  Users,
  Download,
  TrendingUp,
  X,
  User,
  CalendarDays,
  Award,
} from "lucide-react"
import axiosInstance from "../utils/axios"

// const API_URL = "https://macstrombattle-api.kglame.com/api/tournament"

export default function GroupManagement() {
  const [userData, setUserData] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const rowsPerPage = 10
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" })

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function fetchData() {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get('/tournament', {
          signal: controller.signal,
        })

        if (isMounted) {
          // Transform and sort the data
          const transformedData = response.data.map((user, index) => ({
            id: user.id,
            username: user.formData.inGameUsername,
            email: user.formData.email || "",
            mobile: user.formData.mobile || "",
            groupNo: Math.floor(index / 10) + 1,
            status: user.status,
            dateAllotted: user.createdAt,
            teamName: user.formData.teamName,
            game: user.formData.game,
            level: user.formData.inGameLevel,
            age: user.formData.age,
            amount: user.formData.amount,
            paymentId: user.formData.txnid || ""
          }))
          setUserData(transformedData)
        }
      } catch (err) {
        if (isMounted && err.name !== "AbortError") {
          console.error("Error fetching data:", err)
          showNotification("Failed to fetch data. Please try again.", "error")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type })
    setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000)
  }

  const filteredData = useMemo(() => {
    return userData.filter(
      (item) =>
        (item.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.teamName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.game || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.mobile || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(item.groupNo || "").includes(searchTerm) ||
        String(item.level || "").includes(searchTerm),
    )
  }, [userData, searchTerm])

  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, page, rowsPerPage])

  const groupStats = useMemo(() => {
    const totalUsers = userData.length
    const totalGroups = Math.ceil(totalUsers / 10)
    const lastGroupSize = totalUsers % 10 || 10
    const groupsWithDate = userData.filter((user) => user.dateAllotted).length > 0

    return { totalUsers, totalGroups, lastGroupSize, groupsWithDate }
  }, [userData])

  const [groupDates, setGroupDates] = useState({})
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isDateModalOpen, setIsDateModalOpen] = useState(false)
  // winners: map of groupNo -> winner row
  const [winners, setWinners] = useState({})

  const handleDateModalOpen = (groupNo) => {
    setSelectedGroup(groupNo)
    setStartDate(groupDates[groupNo] || "")
    setIsDateModalOpen(true)
  }

  const handleAddWinner = (row) => {
    // Only one winner per group - set this row as winner for its group
    setWinners((prev) => ({ ...prev, [row.groupNo]: row }))

    // mark userData rows in the same group with isWinner flag
    setUserData((prev) =>
      prev.map((u) =>
        u.groupNo === row.groupNo ? { ...u, isWinner: u.id === row.id } : u,
      ),
    )

    showNotification(`Player ${row.username} declared winner for Group ${row.groupNo}`)
  }

  const handleDateAllocation = async () => {
    if (!startDate || selectedGroup === null) {
      showNotification("Please select a date", "error")
      return
    }

    try {
      setIsLoading(true)
      // Update dates only for the selected group
      const updatedData = userData.map((user) => ({
        ...user,
        dateAllotted: user.groupNo === selectedGroup ? startDate : user.dateAllotted,
      }))
      setUserData(updatedData)
      setGroupDates((prev) => ({
        ...prev,
        [selectedGroup]: startDate,
      }))
      setIsDateModalOpen(false)
      showNotification(`Date allocated successfully to Group ${selectedGroup}!`)
    } catch (error) {
      console.error("Error allocating dates:", error)
      showNotification("Failed to allocate dates. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "User ID",
      "Name",
      "Email",
      "Mobile",
      "Group No",
      "Payment Status",
      "Date Allotted",
    ]
    const csvContent = [
      headers.join(","),
      ...filteredData.map(
        (row) =>
          `"${row.id}","${row.username}","${row.email || ""}","${row.mobile || ""}",${row.groupNo},"${row.status || "pending"}","${row.dateAllotted || ""}"`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "group_management.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showNotification("Data exported successfully!")
  }

  const totalPages = Math.ceil(filteredData.length / rowsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-2">
            Group Management
          </h1>
          <p className="text-gray-600 mb-6">Manage and monitor user groups with automatic allocation</p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{groupStats.totalUsers}</p>
                  <p className="text-blue-100 text-sm">Total Users</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </div>
            <div className="bg-gray-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{groupStats.totalGroups}</p>
                  <p className="text-green-100 text-sm">Total Groups</p>
                </div>
                <User className="h-8 w-8 text-green-200" />
              </div>
            </div>
            <div className="bg-gray-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{groupStats.lastGroupSize}</p>
                  <p className="text-purple-100 text-sm">Last Group Size</p>
                </div>
                <Users className="h-8 w-8 text-purple-200" />
              </div>
            </div>
            {/* <div className="bg-gray-600 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{groupStats.groupsWithDate ? "Yes" : "No"}</p>
                  <p className="text-orange-100 text-sm">Dates Allocated</p>
                </div>
                <CalendarDays className="h-8 w-8 text-orange-200" />
              </div>
            </div> */}
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, email, mobile, or group number..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(0)
                }}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>

            <button
              onClick={exportToCSV}
              disabled={isLoading}
              className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5" />
              Export CSV
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            Showing {Math.min((page + 1) * rowsPerPage, filteredData.length)} of {filteredData.length} entries
            {searchTerm && ` (filtered from ${userData.length} total)`}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
                  <th className="px-6 py-4 text-left font-semibold">Winner</th>
                  <th className="px-6 py-4 text-left font-semibold">User ID</th>
                  <th className="px-6 py-4 text-left font-semibold">Name</th>
                  <th className="px-6 py-4 text-left font-semibold">Email</th>
                  <th className="px-6 py-4 text-left font-semibold">Mobile</th>
                  <th className="px-6 py-4 text-center font-semibold">Group No</th>
                  <th className="px-6 py-4 text-center font-semibold">Payment Status</th>
                  <th className="px-6 py-4 text-center font-semibold">Date Allotted</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((row) => (
                  <tr key={row.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4 text-left">
                      {row.isWinner ? (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-800">Winner</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddWinner(row)}
                          disabled={isLoading}
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 disabled:opacity-50"
                        >
                          Add Winner
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-left">
                      <span className="font-medium text-gray-900">#{row.id}</span>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div>
                        <span className="text-gray-700 font-medium">{row.username}</span>
                        {/* <div className="text-xs text-gray-500">Team: {row.teamName}</div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div>
                        <span className="text-gray-700">{row.email || "N/A"}</span>
                        {/* <div className="text-xs text-gray-500">Game: {row.game}</div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div>
                        <span className="text-gray-700">{row.mobile || "N/A"}</span>
                        {/* <div className="text-xs text-gray-500">Age: {row.age}</div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
                          Group {row.groupNo}
                        </span>
                        {/* <div className="text-xs text-gray-500 mt-1">Level: {row.level}</div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <div className="space-y-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              row.status === "approved"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : row.status === "rejected"
                                  ? "bg-red-100 text-red-800 border-red-200"
                                  : "bg-yellow-100 text-yellow-800 border-yellow-200"
                            }`}
                          >
                            {row.status || "pending"}
                          </span>
                          <div className="flex flex-col gap-1">
                            <div className="text-sm text-gray-700">₹{row.amount}</div>
                            <div className="text-xs font-medium">
                              TXN ID: <span className="font-mono text-blue-600">{row.txnid || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {row.dateAllotted ? (
                          <>
                            <span className="text-gray-700">
                              {new Date(row.dateAllotted).toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => handleDateModalOpen(row.groupNo)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Change Date"
                            >
                              <Calendar className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleDateModalOpen(row.groupNo)}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1"
                          >
                            <Calendar className="h-4 w-4" />
                            Allocate Date
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page + 1} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0 || isLoading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1 || isLoading}
                  className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Winners Table */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold mb-2">Declared Winners</h2>
            {Object.keys(winners).length === 0 ? (
              <p className="text-gray-600">No winners declared yet. Use "Add Winner" to mark a player.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 text-gray-700">
                      <th className="px-4 py-3 text-left font-medium">Group</th>
                      <th className="px-4 py-3 text-left font-medium">Player ID</th>
                      <th className="px-4 py-3 text-left font-medium">Name</th>
                      <th className="px-4 py-3 text-left font-medium">Team</th>
                      <th className="px-4 py-3 text-left font-medium">Game</th>
                      <th className="px-4 py-3 text-left font-medium">Date Allotted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(winners)
                      .sort((a, b) => a.groupNo - b.groupNo)
                      .map((w) => (
                        <tr key={`${w.groupNo}-${w.id}`} className="border-t">
                          <td className="px-4 py-3">{w.groupNo}</td>
                          <td className="px-4 py-3">#{w.id}</td>
                          <td className="px-4 py-3">{w.username}</td>
                          <td className="px-4 py-3">{w.teamName || "-"}</td>
                          <td className="px-4 py-3">{w.game || "-"}</td>
                          <td className="px-4 py-3">{w.dateAllotted ? new Date(w.dateAllotted).toLocaleDateString() : "-"}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* No Results */}
        {filteredData.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl mt-8">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search terms</p>
          </div>
        )}
      </div>

      {/* Date Allocation Modal */}
      {isDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                Allocate Date for Group {selectedGroup}
              </h3>
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <DatePicker
              selected={startDate ? new Date(startDate) : null}
              onChange={date => setStartDate(date.toISOString())}
              dateFormat="MM/dd/yyyy"
              className="w-full p-2 border rounded-lg mb-4"
              placeholderText="Select date..."
              minDate={new Date()}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsDateModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDateAllocation}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50">
          <div
            className={`px-6 py-4 rounded-xl shadow-lg text-white ${
              notification.type === "success"
                ? "bg-green-500"
                : notification.type === "error"
                  ? "bg-red-500"
                  : "bg-orange-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {notification.type === "success" && <TrendingUp className="h-5 w-5" />}
                {notification.type === "error" && <X className="h-5 w-5" />}
              </div>
              <p className="font-medium">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}