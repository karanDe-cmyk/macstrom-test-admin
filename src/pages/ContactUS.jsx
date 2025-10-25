"use client"

import { useState, useEffect } from "react"
import axiosInstance from "../utils/axios";

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [nameFilter, setNameFilter] = useState("")
  const [emailFilter, setEmailFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching contacts from API...")

      const response = await axiosInstance.get("/websitecontact")
      
      console.log("Contacts fetched successfully:", response.data)
      setContacts(response.data)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      setError(error.message || "Failed to fetch contacts")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteContact = async (contactId) => {
    try {
      setDeleting(true)
      console.log("Deleting contact ID:", contactId)

      await axiosInstance.delete(`/websitecontact/${contactId}`)

      console.log("Contact deleted successfully")
      setContacts(contacts.filter((contact) => contact.id !== contactId))
      setDeleteConfirm(null)
      setCurrentPage(1)
    } catch (error) {
      console.error("Error deleting contact:", error)
      setError(error.message || "Failed to delete contact")
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteAllContacts = async () => {
    try {
      setDeleting(true)
      console.log("Deleting all contacts...")

      let deletedCount = 0
      for (const contact of contacts) {
        try {
          await axiosInstance.delete(`/websitecontact/${contact.id}`)
          deletedCount++
        } catch (error) {
          console.error(`  Error deleting contact ${contact.id}:`, error)
        }
      }

      console.log(`Deleted ${deletedCount} contacts`)
      setContacts([])
      setDeleteConfirm(null)
      setCurrentPage(1)
    } catch (error) {
      console.error("Error deleting all contacts:", error)
      setError(error.message || "Failed to delete all contacts")
    } finally {
      setDeleting(false)
    }
  }

  const handleReplyClick = (contact) => {
    setSelectedContact(contact)
    setReplyText(contact.reply || "")
    setDialogOpen(true)
  }

  const handleSubmitReply = async () => {
    if (!selectedContact || !replyText.trim()) return

    try {
      setSubmitting(true)
      console.log("Submitting reply for contact ID:", selectedContact.id)

      await axiosInstance.put(`/websitecontact/${selectedContact.id}`, { reply: replyText })

      console.log("Reply submitted successfully")
      setContacts(
        contacts.map((contact) => (contact.id === selectedContact.id ? { ...contact, reply: replyText } : contact)),
      )
      setDialogOpen(false)
      setReplyText("")
      setSelectedContact(null)
    } catch (error) {
      console.error("Error submitting reply:", error)
      setError(error.message || "Failed to submit reply")
    } finally {
      setSubmitting(false)
    }
  }

  const getFilteredContacts = () => {
    return contacts.filter((contact) => {
      const nameMatch = contact.name.toLowerCase().includes(nameFilter.toLowerCase())
      const emailMatch = contact.email.toLowerCase().includes(emailFilter.toLowerCase())

      let dateMatch = true
      if (startDate || endDate) {
        dateMatch = true
      }

      return nameMatch && emailMatch && dateMatch
    })
  }

  const handleClearFilters = () => {
    setNameFilter("")
    setEmailFilter("")
    setStartDate("")
    setEndDate("")
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: "18px", color: "#666" }}>Loading...</div>
      </div>
    )
  }

  const filteredContacts = getFilteredContacts()
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex)

  const repliedCount = filteredContacts.filter((c) => c.reply).length
  const pendingCount = filteredContacts.filter((c) => !c.reply).length

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#f9fafb", padding: "24px" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
        <div
          style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <div>
            <h1 style={{ fontSize: "30px", fontWeight: "bold", marginBottom: "8px" }}>Website Contacts</h1>
            <p style={{ color: "#666", fontSize: "14px" }}>Manage and reply to website contact submissions</p>
          </div>
          {contacts.length > 0 && (
            <button
              onClick={() => setDeleteConfirm("all")}
              style={{
                padding: "8px 16px",
                fontSize: "13px",
                fontWeight: "500",
                borderRadius: "4px",
                border: "none",
                backgroundColor: "#ef4444",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#dc2626"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#ef4444"
              }}
            >
              Delete All
            </button>
          )}
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "13px",
              color: "#991b1b",
            }}
          >
            <strong>Error:</strong> {error}. Please check your API connection at https://macstrombattle-api.kglame.com/api
          </div>
        )}

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            padding: "16px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "12px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#374151" }}>
              Filter Contacts
            </h3>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginBottom: "12px",
            }}
          >
            <div>
              <label
                style={{ fontSize: "12px", fontWeight: "500", color: "#666", display: "block", marginBottom: "4px" }}
              >
                Filter by Name
              </label>
              <input
                type="text"
                placeholder="Enter name..."
                value={nameFilter}
                onChange={(e) => {
                  setNameFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{ fontSize: "12px", fontWeight: "500", color: "#666", display: "block", marginBottom: "4px" }}
              >
                Filter by Email
              </label>
              <input
                type="text"
                placeholder="Enter email..."
                value={emailFilter}
                onChange={(e) => {
                  setEmailFilter(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{ fontSize: "12px", fontWeight: "500", color: "#666", display: "block", marginBottom: "4px" }}
              >
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{ fontSize: "12px", fontWeight: "500", color: "#666", display: "block", marginBottom: "4px" }}
              >
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setCurrentPage(1)
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
          {(nameFilter || emailFilter || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: "500",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                backgroundColor: "white",
                color: "#374151",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white"
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#f3f4f6", borderBottom: "1px solid #e5e7eb" }}>
                  {["ID", "Name", "Email", "Subject", "Message", "Phone", "Country", "Status", "Action"].map(
                    (header) => (
                      <th
                        key={header}
                        style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontWeight: "600",
                          fontSize: "14px",
                          color: "#374151",
                        }}
                      >
                        {header}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.length > 0 ? (
                  paginatedContacts.map((contact) => (
                    <tr key={contact.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                      <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500" }}>{contact.id}</td>
                      <td style={{ padding: "12px 16px", fontSize: "14px" }}>{contact.name}</td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#666" }}>{contact.email}</td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "14px",
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {contact.subject}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: "13px",
                          color: "#666",
                          maxWidth: "200px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {contact.message}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#666" }}>{contact.phone || "-"}</td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#666" }}>
                        {contact.country || "-"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "4px 12px",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "500",
                            backgroundColor: contact.reply ? "#dcfce7" : "#f3f4f6",
                            color: contact.reply ? "#166534" : "#374151",
                            border: contact.reply ? "1px solid #86efac" : "1px solid #d1d5db",
                          }}
                        >
                          {contact.reply ? "✓ Replied" : "✗ Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            onClick={() => handleReplyClick(contact)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              fontWeight: "500",
                              borderRadius: "4px",
                              border: contact.reply ? "1px solid #d1d5db" : "none",
                              backgroundColor: contact.reply ? "white" : "#3b82f6",
                              color: contact.reply ? "#374151" : "white",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = "0.8"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = "1"
                            }}
                          >
                            {contact.reply ? "Edit" : "Reply"}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(contact.id)}
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              fontWeight: "500",
                              borderRadius: "4px",
                              border: "1px solid #fecaca",
                              backgroundColor: "white",
                              color: "#dc2626",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#fef2f2"
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "white"
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ padding: "32px 16px", textAlign: "center", color: "#999" }}>
                      {filteredContacts.length === 0 && (nameFilter || emailFilter || startDate || endDate)
                        ? "No contacts match your filters"
                        : "No contacts found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: "16px", fontSize: "13px", color: "#666" }}>
          {nameFilter || emailFilter || startDate || endDate ? (
            <>
              Filtered results: <strong>{filteredContacts.length}</strong> | Replied:{" "}
              <strong style={{ color: "#16a34a" }}>{repliedCount}</strong> | Pending:{" "}
              <strong style={{ color: "#dc2626" }}>{pendingCount}</strong>
            </>
          ) : (
            <>
              Total contacts: <strong>{contacts.length}</strong> | Replied:{" "}
              <strong style={{ color: "#16a34a" }}>{repliedCount}</strong> | Pending:{" "}
              <strong style={{ color: "#dc2626" }}>{pendingCount}</strong>
            </>
          )}
        </div>

        {totalPages > 1 && (
          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: "500",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                backgroundColor: currentPage === 1 ? "#f3f4f6" : "white",
                color: currentPage === 1 ? "#999" : "#374151",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6"
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage > 1) {
                  e.currentTarget.style.backgroundColor = "white"
                }
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                style={{
                  padding: "8px 12px",
                  fontSize: "13px",
                  fontWeight: "500",
                  borderRadius: "4px",
                  border: page === currentPage ? "1px solid #3b82f6" : "1px solid #d1d5db",
                  backgroundColor: page === currentPage ? "#3b82f6" : "white",
                  color: page === currentPage ? "white" : "#374151",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (page !== currentPage) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6"
                  }
                }}
                onMouseLeave={(e) => {
                  if (page !== currentPage) {
                    e.currentTarget.style.backgroundColor = "white"
                  }
                }}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: "500",
                borderRadius: "4px",
                border: "1px solid #d1d5db",
                backgroundColor: currentPage === totalPages ? "#f3f4f6" : "white",
                color: currentPage === totalPages ? "#999" : "#374151",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.backgroundColor = "#f3f4f6"
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage < totalPages) {
                  e.currentTarget.style.backgroundColor = "white"
                }
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {dialogOpen && selectedContact && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setDialogOpen(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px" }}>
                Reply to {selectedContact.name}
              </h2>
              <p style={{ fontSize: "13px", color: "#666" }}>Email: {selectedContact.email}</p>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Original Message
              </label>
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#374151",
                  lineHeight: "1.5",
                }}
              >
                {selectedContact.message}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  display: "block",
                  marginBottom: "8px",
                }}
              >
                Your Reply
              </label>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply here..."
                style={{
                  width: "100%",
                  minHeight: "120px",
                  padding: "12px",
                  fontSize: "13px",
                  border: "1px solid #d1d5db",
                  borderRadius: "4px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setDialogOpen(false)}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white"
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReply}
                disabled={submitting || !replyText.trim()}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: submitting || !replyText.trim() ? "#d1d5db" : "#3b82f6",
                  color: "white",
                  cursor: submitting || !replyText.trim() ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  opacity: submitting || !replyText.trim() ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!submitting && replyText.trim()) {
                    e.currentTarget.style.backgroundColor = "#2563eb"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting && replyText.trim()) {
                    e.currentTarget.style.backgroundColor = "#3b82f6"
                  }
                }}
              >
                {submitting ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
          }}
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
              maxWidth: "400px",
              width: "90%",
              padding: "24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "12px", color: "#dc2626" }}>
              Confirm Delete
            </h2>
            <p style={{ fontSize: "14px", color: "#666", marginBottom: "24px" }}>
              {deleteConfirm === "all"
                ? "Are you sure you want to delete all contacts? This action cannot be undone."
                : "Are you sure you want to delete this contact? This action cannot be undone."}
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  borderRadius: "4px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = "white"
                  }
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirm === "all") {
                    handleDeleteAllContacts()
                  } else {
                    handleDeleteContact(deleteConfirm)
                  }
                }}
                disabled={deleting}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  borderRadius: "4px",
                  border: "none",
                  backgroundColor: deleting ? "#d1d5db" : "#dc2626",
                  color: "white",
                  cursor: deleting ? "not-allowed" : "pointer",
                  opacity: deleting ? 0.6 : 1,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = "#b91c1c"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!deleting) {
                    e.currentTarget.style.backgroundColor = "#dc2626"
                  }
                }}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}