"use client"

import { useState, useRef, useEffect } from "react"
import {
  ArrowLeft,
  CreditCard,
  FileText,
  Gamepad,
  ScrollText,
  User,
  Wallet,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export default function UserDetail({ user, onBack, onKycStatusChange, authToken }) {
  const safeUser = user || {}
  const userId = safeUser.id || 84 // Updated default ID to 84 as requested

  const [activeTab, setActiveTab] = useState("Overview")
  const [kycData, setKycData] = useState(null)
  const [loadingKyc, setLoadingKyc] = useState(false)
  const [depositData, setDepositData] = useState([])
  const [withdrawalData, setWithdrawalData] = useState([])
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [transactionsData, setTransactionsData] = useState([])
  const [loadingTransactions, setLoadingTransactions] = useState(false)
  const overviewRef = useRef(null)

  // Pagination states
  const [currentDepositPage, setCurrentDepositPage] = useState(1)
  const [currentWithdrawalPage, setCurrentWithdrawalPage] = useState(1)
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    const fetchKycData = async () => {
      setLoadingKyc(true)
      try {
        const response = await fetch(`https://mactromtest-backend.onrender.com/api/userkyc/user/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setKycData(data.data)
          console.log("KYC Data:", data.data)
        } else {
          console.error("Failed to fetch KYC data:", response.status)
          setKycData(null)
        }
      } catch (error) {
        console.error("Error fetching KYC data:", error)
        setKycData(null)
      } finally {
        setLoadingKyc(false)
      }
    }

    if (userId) {
      fetchKycData()
    }
  }, [userId, authToken])

  const fetchPaymentData = async () => {
    setLoadingPayments(true)
    try {
      const depositResponse = await fetch(`https://mactromtest-backend.onrender.com/api/user/deposit/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })

      const withdrawalResponse = await fetch(
        `https://mactromtest-backend.onrender.com/api/user/withdraw/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      )

      if (depositResponse.ok) {
        const depositResult = await depositResponse.json()
        // Sort deposits by date in descending order (latest first)
        const sortedDeposits = (depositResult.data || []).sort((a, b) => new Date(b.date) - new Date(a.date))
        setDepositData(sortedDeposits)
        setCurrentDepositPage(1) // Reset to first page when data loads
        console.log("Deposit Data:", sortedDeposits)
      } else {
        console.error("Failed to fetch deposit data:", depositResponse.status)
        setDepositData([])
      }

      if (withdrawalResponse.ok) {
        const withdrawalResult = await withdrawalResponse.json()
        // Sort withdrawals by date in descending order (latest first)
        const sortedWithdrawals = (withdrawalResult.data || []).sort((a, b) => new Date(b.date) - new Date(a.date))
        setWithdrawalData(sortedWithdrawals)
        setCurrentWithdrawalPage(1) // Reset to first page when data loads
        console.log("Withdrawal Data:", sortedWithdrawals)
      } else {
        console.error("Failed to fetch withdrawal data:", withdrawalResponse.status)
        setWithdrawalData([])
      }
    } catch (error) {
      console.error("Error fetching payment data:", error)
      setDepositData([])
      setWithdrawalData([])
    } finally {
      setLoadingPayments(false)
    }
  }

  useEffect(() => {
    if (activeTab === "Payments" && userId) {
      fetchPaymentData()
    }
  }, [activeTab, userId, authToken])

  const fetchTransactionsData = async () => {
    setLoadingTransactions(true)
    try {
      const response = await fetch(
        `https://mactromtest-backend.onrender.com/api/match/match-transaction-logs/user/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        },
      )

      if (response.ok) {
        const result = await response.json()
        // Sort transactions by date in descending order (latest first)
        const sortedTransactions = (result.matchTransactionsLog || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        setTransactionsData(sortedTransactions)
        setCurrentTransactionPage(1) // Reset to first page when data loads
        console.log("Transactions Data:", sortedTransactions)
      } else {
        console.error("Failed to fetch transactions data:", response.status)
        setTransactionsData([])
      }
    } catch (error) {
      console.error("Error fetching transactions data:", error)
      setTransactionsData([])
    } finally {
      setLoadingTransactions(false)
    }
  }

  useEffect(() => {
    if (activeTab === "Transactions" && userId) {
      fetchTransactionsData()
    }
  }, [activeTab, userId, authToken])

  const handleExportPDF = () => {
    const input = overviewRef.current
    if (!input) return
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
      pdf.save(`User_Overview_${safeUser.name || "User"}.pdf`)
    })
  }

  // Pagination helper functions
  const paginateData = (data, currentPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return data.slice(startIndex, startIndex + itemsPerPage)
  }

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage)
  }

  const PaginationControls = ({ currentPage, totalPages, onPageChange, dataType }) => {
    return (
      <div className="flex items-center justify-between mt-4 p-3 border-t dark:border-zinc-600">
        <div className="text-sm text-gray-500">
          Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalPages * itemsPerPage)} of {totalPages * itemsPerPage} {dataType}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 dark:border-zinc-600"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-zinc-700 dark:border-zinc-600"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { name: "Overview", icon: User },
    { name: "KYC Docs", icon: FileText },
    { name: "Payments", icon: Wallet },
    { name: "Gameplay", icon: Gamepad },
    { name: "Transactions", icon: CreditCard },
    { name: "Audit Trail", icon: ScrollText },
  ]

  const renderDocumentStatus = (status) => {
    if (!status) return null

    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          status === "verified"
            ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
            : status === "rejected"
              ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white"
        }`}
      >
        {statusText}
        {status === "verified" && <CheckCircle className="w-3 h-3" />}
        {status === "rejected" && <XCircle className="w-3 h-3" />}
        {status === "pending" && <Clock className="w-3 h-3" />}
      </span>
    )
  }

  const renderPaymentStatus = (status) => {
    if (!status) return null

    const statusText = status.charAt(0).toUpperCase() + status.slice(1)
    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
          status === "approved"
            ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
            : status === "rejected"
              ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white"
        }`}
      >
        {statusText}
        {status === "approved" && <CheckCircle className="w-3 h-3" />}
        {status === "rejected" && <XCircle className="w-3 h-3" />}
        {status === "pending" && <Clock className="w-3 h-3" />}
      </span>
    )
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "Overview":
        return (
          <div
            ref={overviewRef}
            className="border rounded-lg p-4 mb-4 dark:border-zinc-700 bg-white dark:bg-zinc-800 overflow-auto"
          >
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">User Information</h3>
            <table className="min-w-full text-sm border dark:border-zinc-700 rounded-lg overflow-hidden">
              <tbody className="divide-y dark:divide-zinc-700">
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">User ID</td>
                  <td className="p-2">{userId}</td>
                </tr>
                <tr>
                  <td className="font-medium p-2">Username</td>
                  <td className="p-2">{safeUser.name}</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Full Name</td>
                  <td className="p-2">{safeUser.fullName}</td>
                </tr>
                <tr>
                  <td className="font-medium p-2">Email</td>
                  <td className="p-2">{safeUser.email}</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Phone</td>
                  <td className="p-2">{kycData?.phone || "N/A"}</td>
                </tr>
                <tr>
                  <td className="font-medium p-2">Location</td>
                  <td className="p-2">{safeUser.location}</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Joined</td>
                  <td className="p-2">{safeUser.joined}</td>
                </tr>
                <tr>
                  <td className="font-medium p-2">Last Active</td>
                  <td className="p-2">{safeUser.lastActive}</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Status</td>
                  <td className="p-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        safeUser.status === "Active"
                          ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                          : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                      }`}
                    >
                      {safeUser.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="font-medium p-2">KYC Status</td>
                  <td className="p-2">{renderDocumentStatus(kycData?.status)}</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Deposits</td>
                  <td className="p-2 text-green-600">₹{safeUser.deposits?.toFixed(2) || "0.00"}</td>
                </tr>
                <tr>
                  <td className="font-medium p-2">Withdrawals</td>
                  <td className="p-2 text-red-600">₹{safeUser.withdrawals?.toFixed(2) || "0.00"}</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Balance</td>
                  <td className={`p-2 ${safeUser.balance >= 0 ? "text-blue-600" : "text-red-500"}`}>
                    ₹{safeUser.balance?.toFixed(2) || "0.00"}
                  </td>
                </tr>

                {/* KYC Documents Section */}
                <tr>
                  <td colSpan={2} className="p-2 pt-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    KYC Documents
                  </td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Aadhaar Card</td>
                  <td className="p-2">
                    {kycData?.aadhaar_card_number ? (
                      <span className="font-mono">{kycData.aadhaar_card_number}</span>
                    ) : (
                      "Not provided"
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium p-2">PAN Card</td>
                  <td className="p-2">
                    {kycData?.pan_card_number ? (
                      <span className="font-mono">{kycData.pan_card_number}</span>
                    ) : (
                      "Not provided"
                    )}
                  </td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Driving License</td>
                  <td className="p-2">
                    {kycData?.driving_license_number ? (
                      <span className="font-mono">{kycData.driving_license_number}</span>
                    ) : (
                      "Not provided"
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="font-medium p-2">Voter ID</td>
                  <td className="p-2">
                    {kycData?.voter_id_number ? (
                      <span className="font-mono">{kycData.voter_id_number}</span>
                    ) : (
                      "Not provided"
                    )}
                  </td>
                </tr>

                {/* Banking Info Section */}
                <tr>
                  <td colSpan={2} className="p-2 pt-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Banking Information
                  </td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">Bank Name</td>
                  <td className="p-2">{safeUser.bank?.bankName || "N/A"}</td>
                </tr>
                <tr>
                  <td className="font-medium p-2">Account Number</td>
                  <td className="p-2">{safeUser.bank?.accountNumber || "N/A"}</td>
                </tr>
                <tr className="bg-gray-50 dark:bg-zinc-700">
                  <td className="font-medium p-2">IFSC Code</td>
                  <td className="p-2">{safeUser.bank?.ifsc || "N/A"}</td>
                </tr>
                <tr>
                  <td className="font-medium p-2">UPI ID</td>
                  <td className="p-2">{safeUser.bank?.upiId || "N/A"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )

      case "KYC Docs":
        return (
          <div className="border rounded-lg p-4 mb-4 dark:border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">KYC Documents</h3>

            {loadingKyc ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-sm text-gray-500">Loading KYC documents...</p>
              </div>
            ) : kycData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Aadhaar Card */}
                <div className="border rounded-lg p-4 dark:border-zinc-600">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800 dark:text-white">Aadhaar Card</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded dark:bg-zinc-700">
                    {kycData.aadhaar_card_number ? (
                      <div>
                        <p className="font-mono text-sm break-all">{kycData.aadhaar_card_number}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(kycData.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="border rounded-lg p-4 dark:border-zinc-600">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800 dark:text-white">PAN Card</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded dark:bg-zinc-700">
                    {kycData.pan_card_number ? (
                      <div>
                        <p className="font-mono text-sm break-all">{kycData.pan_card_number}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(kycData.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>

                {/* Driving License */}
                <div className="border rounded-lg p-4 dark:border-zinc-600">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800 dark:text-white">Driving License</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded dark:bg-zinc-700">
                    {kycData.driving_license_number ? (
                      <div>
                        <p className="font-mono text-sm break-all">{kycData.driving_license_number}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(kycData.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>

                {/* Voter ID */}
                <div className="border rounded-lg p-4 dark:border-zinc-600">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-800 dark:text-white">Voter ID</h4>
                  </div>
                  <div className="bg-gray-50 p-3 rounded dark:bg-zinc-700">
                    {kycData.voter_id_number ? (
                      <div>
                        <p className="font-mono text-sm break-all">{kycData.voter_id_number}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(kycData.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">Not provided</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-32">
                <p className="text-sm text-gray-500">No KYC documents found for this user.</p>
              </div>
            )}

            <div className="mt-6">
              <h4 className="font-semibold mb-3">KYC Status</h4>
              <div className="flex items-center">
                {kycData?.status ? (
                  renderDocumentStatus(kycData.status)
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-white">
                    <Clock className="w-3 h-3" />
                    Not Available
                  </span>
                )}
              </div>
            </div>
          </div>
        )

      case "Payments":
        return (
          <div className="space-y-6">
            {loadingPayments ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-sm text-gray-500">Loading payment data...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="border rounded-lg p-4 dark:border-zinc-700 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Total Deposits</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          ₹{depositData.reduce((sum, deposit) => sum + Number.parseFloat(deposit.amount), 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">{depositData.length} transactions</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 dark:border-zinc-700 bg-red-50 dark:bg-red-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 dark:text-red-400">Total Withdrawals</p>
                        <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                          ₹
                          {withdrawalData
                            .reduce((sum, withdrawal) => sum + Number.parseFloat(withdrawal.amount), 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400">{withdrawalData.length} transactions</p>
                      </div>
                      <TrendingDown className="w-8 h-8 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                </div>

                {/* Deposits Section */}
                <div className="border rounded-lg dark:border-zinc-700">
                  <div className="p-4 border-b dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Deposits ({depositData.length})
                    </h3>
                  </div>

                  {depositData.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800">
                              <th className="text-left p-3 font-medium">#</th>
                              <th className="text-left p-3 font-medium">Amount</th>
                              <th className="text-left p-3 font-medium">Description</th>
                              <th className="text-left p-3 font-medium">Date</th>
                              <th className="text-left p-3 font-medium">User</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-zinc-700">
                            {paginateData(depositData, currentDepositPage).map((deposit, index) => (
                              <tr key={deposit.id} className={index % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                                <td className="p-3 font-medium text-gray-600 dark:text-gray-400">
                                  {(currentDepositPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="p-3 font-semibold text-green-600 dark:text-green-400">
                                  ₹{Number.parseFloat(deposit.amount).toFixed(2)}
                                </td>
                                <td className="p-3">{deposit.description}</td>
                                <td className="p-3 text-xs text-gray-500">{deposit.date}</td>
                                <td className="p-3">
                                  <div className="text-xs">
                                    <p className="font-medium">
                                      {deposit.user.first_name} {deposit.user.last_name}
                                    </p>
                                    <p className="text-gray-500">{deposit.user.user_name}</p>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls 
                        currentPage={currentDepositPage}
                        totalPages={getTotalPages(depositData.length)}
                        onPageChange={setCurrentDepositPage}
                        dataType="deposits"
                      />
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No deposit transactions found</p>
                  )}
                </div>

                {/* Withdrawals Section */}
                <div className="border rounded-lg dark:border-zinc-700">
                  <div className="p-4 border-b dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 flex items-center gap-2">
                      <TrendingDown className="w-5 h-5" />
                      Withdrawals ({withdrawalData.length})
                    </h3>
                  </div>

                  {withdrawalData.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800">
                              <th className="text-left p-3 font-medium">#</th>
                              <th className="text-left p-3 font-medium">Amount</th>
                              <th className="text-left p-3 font-medium">Method</th>
                              <th className="text-left p-3 font-medium">Description</th>
                              <th className="text-left p-3 font-medium">Status</th>
                              <th className="text-left p-3 font-medium">Date</th>
                              <th className="text-left p-3 font-medium">User</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-zinc-700">
                            {paginateData(withdrawalData, currentWithdrawalPage).map((withdrawal, index) => (
                              <tr key={withdrawal.id} className={index % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                                <td className="p-3 font-medium text-gray-600 dark:text-gray-400">
                                  {(currentWithdrawalPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="p-3 font-semibold text-red-600 dark:text-red-400">
                                  ₹{Number.parseFloat(withdrawal.amount).toFixed(2)}
                                </td>
                                <td className="p-3">
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-white rounded text-xs">
                                    {withdrawal.payment_method || "N/A"}
                                  </span>
                                </td>
                                <td className="p-3">{withdrawal.description}</td>
                                <td className="p-3">{renderPaymentStatus(withdrawal.status)}</td>
                                <td className="p-3 text-xs text-gray-500">{withdrawal.date}</td>
                                <td className="p-3">
                                  <div className="text-xs">
                                    <p className="font-medium">
                                      {withdrawal.user.first_name} {withdrawal.user.last_name}
                                    </p>
                                    <p className="text-gray-500">{withdrawal.user.user_name}</p>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls 
                        currentPage={currentWithdrawalPage}
                        totalPages={getTotalPages(withdrawalData.length)}
                        onPageChange={setCurrentWithdrawalPage}
                        dataType="withdrawals"
                      />
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No withdrawal transactions found</p>
                  )}
                </div>
              </>
            )}
          </div>
        )

      case "Transactions":
        return (
          <div className="space-y-6">
            {loadingTransactions ? (
              <div className="flex justify-center items-center h-32">
                <p className="text-sm text-gray-500">Loading transactions data...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border rounded-lg p-4 dark:border-zinc-700 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 dark:text-blue-400">Total Transactions</p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{transactionsData.length}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">Match activities</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 dark:border-zinc-700 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 dark:text-green-400">Total Refunds</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                          ₹
                          {transactionsData
                            .filter((t) => t.transaction_type === "refund")
                            .reduce((sum, t) => sum + Number.parseFloat(t.refund_amount), 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {transactionsData.filter((t) => t.transaction_type === "refund").length} refunds
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 dark:border-zinc-700 bg-orange-50 dark:bg-orange-900/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-orange-600 dark:text-orange-400">Contest Joins</p>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                          ₹
                          {transactionsData
                            .filter((t) => t.transaction_type === "join")
                            .reduce((sum, t) => sum + Number.parseFloat(t.entry_fee), 0)
                            .toFixed(2)}
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          {transactionsData.filter((t) => t.transaction_type === "join").length} joins
                        </p>
                      </div>
                      <Gamepad className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="border rounded-lg dark:border-zinc-700">
                  <div className="p-4 border-b dark:border-zinc-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Match Transactions ({transactionsData.length})
                    </h3>
                  </div>

                  {transactionsData.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800">
                              <th className="text-left p-3 font-medium">#</th>
                              <th className="text-left p-3 font-medium">Contest</th>
                              <th className="text-left p-3 font-medium">Type</th>
                              <th className="text-left p-3 font-medium">Entry Fee</th>
                              <th className="text-left p-3 font-medium">Refund</th>
                              <th className="text-left p-3 font-medium">Balance After</th>
                              <th className="text-left p-3 font-medium">Description</th>
                              <th className="text-left p-3 font-medium">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y dark:divide-zinc-700">
                            {paginateData(transactionsData, currentTransactionPage).map((transaction, index) => (
                              <tr key={transaction.id} className={index % 2 === 0 ? "bg-white dark:bg-zinc-900" : "bg-gray-50 dark:bg-zinc-800"}>
                                <td className="p-3 font-medium text-gray-600 dark:text-gray-400">
                                  {(currentTransactionPage - 1) * itemsPerPage + index + 1}
                                </td>
                                <td className="p-3">
                                  <div className="text-xs">
                                    <p className="font-medium">{transaction.contest_name}</p>
                                    <p className="text-gray-500">ID: {transaction.contest_id}</p>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      transaction.transaction_type === "join"
                                        ? "bg-orange-100 text-orange-700 dark:bg-orange-700 dark:text-white"
                                        : "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                                    }`}
                                  >
                                    {transaction.transaction_type.charAt(0).toUpperCase() +
                                      transaction.transaction_type.slice(1)}
                                  </span>
                                </td>
                                <td className="p-3 font-semibold text-orange-600 dark:text-orange-400">
                                  ₹{Number.parseFloat(transaction.entry_fee).toFixed(2)}
                                </td>
                                <td className="p-3 font-semibold text-green-600 dark:text-green-400">
                                  ₹{Number.parseFloat(transaction.refund_amount).toFixed(2)}
                                </td>
                                <td className="p-3 font-semibold text-blue-600 dark:text-blue-400">
                                  ₹{Number.parseFloat(transaction.wallet_balance_after).toFixed(2)}
                                </td>
                                <td className="p-3 text-xs">{transaction.description}</td>
                                <td className="p-3 text-xs text-gray-500">
                                  {new Date(transaction.createdAt).toLocaleDateString()}{" "}
                                  {new Date(transaction.createdAt).toLocaleTimeString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <PaginationControls 
                        currentPage={currentTransactionPage}
                        totalPages={getTotalPages(transactionsData.length)}
                        onPageChange={setCurrentTransactionPage}
                        dataType="transactions"
                      />
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No match transactions found</p>
                  )}
                </div>
              </>
            )}
          </div>
        )

      default:
        return (
          <div className="border rounded-lg p-4 mb-4 dark:border-zinc-700">
            <p className="text-gray-500">Select a tab to view content</p>
          </div>
        )
    }
  }

  return (
    <div className="p-6 min-h-screen bg-white dark:bg-zinc-900 text-gray-900 dark:text-white">
      <button
        onClick={onBack}
        className="mb-6 flex items-center text-sm text-blue-600 hover:underline dark:text-blue-400"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Users
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{safeUser.name || "Unknown User"}</h2>
          <p className="text-sm text-gray-500">{safeUser.email || "No email provided"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              safeUser.status === "Active"
                ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                : "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
            }`}
          >
            {safeUser.status || "Unknown"}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              kycData?.status === "verified"
                ? "bg-green-100 text-green-700 dark:bg-green-700 dark:text-white"
                : kycData?.status === "rejected"
                  ? "bg-red-100 text-red-700 dark:bg-red-700 dark:text-white"
                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-700 dark:text-white"
            }`}
          >
            {kycData?.status ? kycData.status.charAt(0).toUpperCase() + kycData.status.slice(1) : "KYC Pending"}
          </span>
        </div>
      </div>

      <div className="flex gap-2 border-b mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap ${
              activeTab === tab.name
                ? "border-b-2 border-blue-500 text-blue-600 dark:text-blue-400"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="mb-4 text-right">
          <button
            onClick={handleExportPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Export as PDF
          </button>
        </div>
      )}

      <div>{renderTabContent()}</div>
    </div>
  )
}