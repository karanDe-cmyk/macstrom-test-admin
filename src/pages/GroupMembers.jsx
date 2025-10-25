"use client"

import { useState, useEffect } from "react"

import { useParams, useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import axiosInstance from "../utils/axios"

const GroupMembers = () => {
  const { gameType, groupId } = useParams()
  const navigate = useNavigate()

  const [members, setMembers] = useState([])
  const [filteredMembers, setFilteredMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [groupInfo, setGroupInfo] = useState(null)
  const [winnerId, setWinnerId] = useState(null)

  const [searchName, setSearchName] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [searchDate, setSearchDate] = useState("")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState(null)

  const [showStartDateModal, setShowStartDateModal] = useState(false)
  const [startDateForm, setStartDateForm] = useState({
    startDate: "",
    startDateDescription: "",
    room_id: "",
    room_password: "",
    roomDescription: "",
  })

  const [isSavingSchedule, setIsSavingSchedule] = useState(false)
  const [isSavingRoom, setIsSavingRoom] = useState(false)
  const [isDeletingSchedule, setIsDeletingSchedule] = useState(false)
  const [isDeletingRoom, setIsDeletingRoom] = useState(false)

  useEffect(() => {
    fetchGroupMembers()
  }, [groupId, gameType])

  useEffect(() => {
    filterMembers()
  }, [members, searchName, searchEmail, searchPhone, searchDate])

  const fetchGroupMembers = async () => {
    try {
      setLoading(true)
      const response = await axiosInstance.get(
        `/macstrom-tournament/${gameType}/groups/${groupId}`,
      )

      const membersData = response.data.users || []
      setMembers(membersData)
      setFilteredMembers(membersData)
      setWinnerId(response.data.winnerUserId)

      setGroupInfo({
        groupNumber: response.data.groupNumber,
        game: gameType,
        startDate: response.data.startDate,
        room_id: response.data.room_id,
        room_password: response.data.room_password,
        currentCount: response.data.currentCount,
        isFull: response.data.isFull,
      })

      setError(null)
    } catch (err) {
      setError("Failed to fetch group members. Please try again.")
      console.error("Error fetching members:", err)
      toast.error("Failed to fetch group members")
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = [...members]

    if (searchName) {
      filtered = filtered.filter((member) => member.name.toLowerCase().includes(searchName.toLowerCase()))
    }

    if (searchEmail) {
      filtered = filtered.filter((member) => member.email.toLowerCase().includes(searchEmail.toLowerCase()))
    }

    if (searchPhone) {
      filtered = filtered.filter((member) => member.phone.includes(searchPhone))
    }

    if (searchDate) {
      filtered = filtered.filter((member) => {
        const memberDate = new Date(member.registrationDate).toISOString().split("T")[0]
        return memberDate === searchDate
      })
    }

    setFilteredMembers(filtered)
    setCurrentPage(1)
  }

  const handleSetWinner = async (userId) => {
    try {
      const response = await axiosInstance.post(
        `/macstrom-tournament/${gameType}/groups/${groupId}/winner`,
        { userId },
      )

      if (response.data.message === "Winner already set for this group") {
        toast.info("Winner is already set for this group")
      } else {
        toast.success("Winner set successfully")
        fetchGroupMembers()
      }
    } catch (err) {
      console.error("Error setting winner:", err)
      if (err.response?.data?.message === "Winner already set for this group") {
        toast.info("Winner is already set for this group")
      } else {
        toast.error("Failed to set winner")
      }
    }
  }

  const handleRemoveWinner = async () => {
    try {
      await axiosInstance.delete(
        `/macstrom-tournament/${gameType}/groups/${groupId}/winner`,
      )

      toast.success("Winner removed successfully")
      fetchGroupMembers()
    } catch (err) {
      console.error("Error removing winner:", err)
      toast.error("Failed to remove winner")
    }
  }

  const handleDeleteClick = (member) => {
    setMemberToDelete(member)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      const deleteEndpoint =
        gameType === "freefire"
          ? `/macstrom-tournament/freefire/registrations/${memberToDelete.id}`
          : `/macstrom-tournament/pubg/registrations/${memberToDelete.id}`

      await axiosInstance.delete(deleteEndpoint)

      toast.success("Member deleted successfully")
      setShowDeleteModal(false)
      setMemberToDelete(null)
      fetchGroupMembers()
    } catch (err) {
      console.error("Error deleting member:", err)
      toast.error("Failed to delete member")
    }
  }

  const handleDeleteStartDate = async () => {
    try {
      setIsDeletingSchedule(true)

      await axiosInstance.delete(
        `/macstrom-tournament/${gameType}/groups/${groupId}/start-date`
      )

      toast.success("Match schedule deleted successfully")
      
      // Re-fetch to get the latest data from server
      await fetchGroupMembers()

    } catch (err) {
      console.error("Error deleting start date:", err)
      toast.error(err.response?.data?.message || "Failed to delete match schedule")
    } finally {
      setIsDeletingSchedule(false)
    }
  }

  const handleDeleteRoom = async () => {
    try {
      setIsDeletingRoom(true)

      await axiosInstance.delete(
        `/macstrom-tournament/${gameType}/groups/${groupId}/room`
      )

      toast.success("Room details deleted successfully")

      // Re-fetch to get the latest data from server
      await fetchGroupMembers()

    } catch (err) {
      console.error("Error deleting room details:", err)
      toast.error(err.response?.data?.message || "Failed to delete room details")
    } finally {
      setIsDeletingRoom(false)
    }
  }

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();

    if (!startDateForm.startDate) {
      toast.error("Please select a start date and time");
      return;
    }

    try {
      setIsSavingSchedule(true);

      const startDateISO = new Date(startDateForm.startDate).toISOString();
      
      const startDatePayload = {
        startDate: startDateISO,
      };

      // Add description only if provided
      if (startDateForm.startDateDescription.trim()) {
        startDatePayload.description = startDateForm.startDateDescription;
      }

      await axiosInstance.post(
        `/macstrom-tournament/${gameType}/groups/${groupId}/start-date`,
        startDatePayload
      );

      toast.success("Match schedule updated successfully");
      
      // Re-fetch to get the latest data from server
      await fetchGroupMembers();

    } catch (err) {
      console.error("Error updating start date:", err);
      toast.error(err.response?.data?.message || "Failed to update match schedule");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();

    if (!startDateForm.room_id || !startDateForm.room_password) {
      toast.error("Please provide both Room ID and Password");
      return;
    }

    try {
      setIsSavingRoom(true);

      const roomPayload = {
        room_id: startDateForm.room_id,
        room_password: startDateForm.room_password,
      };

      // Add description only if provided
      if (startDateForm.roomDescription.trim()) {
        roomPayload.description = startDateForm.roomDescription;
      }

      await axiosInstance.post(
        `/macstrom-tournament/${gameType}/groups/${groupId}/room`,
        roomPayload
      );

      toast.success("Room details updated successfully");

      // Re-fetch to get the latest data from server
      await fetchGroupMembers();

    } catch (err) {
      console.error("Error updating room details:", err);
      toast.error(err.response?.data?.message || "Failed to update room details");
    } finally {
      setIsSavingRoom(false);
    }
  };

  const clearFilters = () => {
    setSearchName("")
    setSearchEmail("")
    setSearchPhone("")
    setSearchDate("")
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMembers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)

  const paginate = (pageNumber) => setCurrentPage(pageNumber)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchGroupMembers}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mr-2"
          >
            Retry
          </button>
          <button
            onClick={() => navigate("/games-registation")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
          >
            Back to Groups
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/games-registation")}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Groups
          </button>

          {groupInfo && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Group {groupInfo.groupNumber} - {groupInfo.game.toUpperCase()}
                  </h1>
                  <p className="text-gray-600 mb-2">Total Members: {groupInfo.currentCount}</p>
                  {groupInfo.startDate && (
                    <p className="text-gray-600">Start Date: {new Date(groupInfo.startDate).toLocaleString()}</p>
                  )}
                  {groupInfo.room_id && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Room ID:</span> {groupInfo.room_id}
                      </p>
                      {groupInfo.room_password && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Password:</span> {groupInfo.room_password}
                        </p>
                      )}
                    </div>
                  )}
                  {winnerId && (
                    <div className="mt-2">
                      <p className="text-sm text-green-600 font-semibold">🏆 Winner has been set for this group</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {winnerId && (
                    <button
                      onClick={handleRemoveWinner}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                      Remove Winner
                    </button>
                  )}
                  <button
                    onClick={() => setShowStartDateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Set Match Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Search Filters</h2>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800">
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Search by name..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="text"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Search by email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder="Search by phone..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    In-Game Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((member) => (
                    <tr key={member.id} className={`hover:bg-gray-50 ${winnerId === member.id ? "bg-yellow-50" : ""}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {member.name}
                        {winnerId === member.id && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                            🏆 WINNER
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.inGameUsername}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.inGameLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.teamName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.age}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.paymentStatus === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {member.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.paymentDetails && (
                          <div className="text-xs">
                            <div>Currency: {member.paymentDetails.currency}</div>
                            <div>Amount: ₹{member.paymentDetails.amount}</div>
                            <div>Txn: {member.paymentDetails.txnId || member.paymentDetails.transactionId}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(member.registrationDate).toLocaleDateString()}
                        <div className="text-xs text-gray-500">
                          {new Date(member.registrationDate).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {winnerId === member.id ? (
                            <button
                              onClick={handleRemoveWinner}
                              className="flex items-center text-yellow-600 hover:text-yellow-900 px-3 py-1 border border-yellow-600 rounded text-sm"
                              title="Remove Winner"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Remove Winner
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSetWinner(member.id)}
                              disabled={winnerId !== null}
                              className={`flex items-center px-3 py-1 border rounded text-sm ${
                                winnerId !== null
                                  ? "bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed"
                                  : "text-green-600 hover:text-green-900 border-green-600"
                              }`}
                              title={winnerId !== null ? "Winner already set for this group" : "Set as Winner"}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Set Winner
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteClick(member)}
                            className="flex items-center text-red-600 hover:text-red-900 px-3 py-1 border border-red-600 rounded text-sm"
                            title="Delete Member"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                      No members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredMembers.length)}</span> of{" "}
                    <span className="font-medium">{filteredMembers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => paginate(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === pageNumber
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNumber}
                          </button>
                        )
                      } else if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                        return (
                          <span
                            key={pageNumber}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                          >
                            ...
                          </span>
                        )
                      }
                      return null
                    })}

                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Member</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete <strong>{memberToDelete?.name}</strong>? This action cannot be
                        undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showStartDateModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowStartDateModal(false)}
            ></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Set Match Details</h3>
                    
                    <div className="mt-4 space-y-6">
                      {/* Start Date Section */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-semibold text-gray-800">Match Schedule</h4>
                          {groupInfo?.startDate && (
                            <button
                              onClick={handleDeleteStartDate}
                              disabled={isDeletingSchedule}
                              className={`flex items-center px-3 py-1 text-sm rounded-md ${
                                isDeletingSchedule
                                  ? "bg-red-300 cursor-not-allowed text-white"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              {isDeletingSchedule ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                        <form onSubmit={handleScheduleSubmit}>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date & Time <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="datetime-local"
                                value={startDateForm.startDate}
                                onChange={(e) => setStartDateForm({ ...startDateForm, startDate: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                              </label>
                              <textarea
                                value={startDateForm.startDateDescription}
                                onChange={(e) => setStartDateForm({ ...startDateForm, startDateDescription: e.target.value })}
                                placeholder="e.g., Quarter-final match."
                                rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={isSavingSchedule}
                                className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                                  isSavingSchedule ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                                } text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                              >
                                {isSavingSchedule ? "Saving..." : "Save Schedule"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>

                      {/* Room Details Section */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-md font-semibold text-gray-800">Room Details</h4>
                          {groupInfo?.room_id && (
                            <button
                              onClick={handleDeleteRoom}
                              disabled={isDeletingRoom}
                              className={`flex items-center px-3 py-1 text-sm rounded-md ${
                                isDeletingRoom
                                  ? "bg-red-300 cursor-not-allowed text-white"
                                  : "bg-red-100 text-red-700 hover:bg-red-200"
                              }`}
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              {isDeletingRoom ? "Deleting..." : "Delete"}
                            </button>
                          )}
                        </div>
                        <form onSubmit={handleRoomSubmit}>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room ID <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={startDateForm.room_id}
                                onChange={(e) => setStartDateForm({ ...startDateForm, room_id: e.target.value })}
                                placeholder="Enter room ID"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Room Password <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={startDateForm.room_password}
                                onChange={(e) => setStartDateForm({ ...startDateForm, room_password: e.target.value })}
                                placeholder="Enter room password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                              </label>
                              <textarea
                                value={startDateForm.roomDescription}
                                onChange={(e) => setStartDateForm({ ...startDateForm, roomDescription: e.target.value })}
                                placeholder="e.g., Join 10 mins early."
                                rows="2"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="submit"
                                disabled={isSavingRoom}
                                className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                                  isSavingRoom ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                                } text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
                              >
                                {isSavingRoom ? "Saving..." : "Save Room Details"}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => {
                    setShowStartDateModal(false);
                    setStartDateForm({ 
                      startDate: "", 
                      startDateDescription: "",
                      room_id: "", 
                      room_password: "",
                      roomDescription: ""
                    });
                  }}
                  disabled={isSavingSchedule || isSavingRoom || isDeletingSchedule || isDeletingRoom}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GroupMembers