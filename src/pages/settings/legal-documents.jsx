"use client"
import { useEffect, useState } from "react"
import axiosInstance from "../../utils/axios"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Chip,
  Tab,
  Tabs,
  TextField,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material"
import { FileText, Edit, Eye, X, Save, Upload, CheckCircle, Plus, Trash2 } from "lucide-react"

const LegalDocuments = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState({})

  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [activeTab, setActiveTab] = useState(0)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [markdownContent, setMarkdownContent] = useState("")
  const [documentToDelete, setDocumentToDelete] = useState(null)

  const [newDocData, setNewDocData] = useState({
    title: "",
    version: "",
    content: "",
    updatedBy: "",
  })

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axiosInstance.get("/legal-docs")
        const mappedDocs = res.data.map(doc => ({
          ...doc,
          lastUpdated: new Date(doc.updatedAt).toLocaleString(),
        }))
        setDocuments(mappedDocs)
      } catch (err) {
        console.error("Failed to fetch legal documents:", err)
        setError("Failed to load legal documents.")
      } finally {
        setLoading(false)
      }
    }
    fetchDocuments()
  }, [])

  const handleEditDocument = (document) => {
    setSelectedDocument(document)
    setMarkdownContent(document.content)
    setShowEditModal(true)
    setActiveTab(0)
  }

  const handleTabChange = (event, newValue) => setActiveTab(newValue)

  const handleSaveDraft = () => {
    console.log("Save draft:", markdownContent)
  }

  const handlePublishLive = async () => {
    if (!selectedDocument) return

    setUpdateLoading(true)
    try {
      // Call PUT API to update the document
      const updateData = {
        content: markdownContent,
        updatedBy: selectedDocument.updatedBy || "Admin", // You can modify this to get current user
      }

      const res = await axiosInstance.put(
        `/legal-docs/${selectedDocument.id}`,
        updateData
      )

      // Update the local state with the response data
      const updatedDoc = {
        ...res.data,
        lastUpdated: new Date(res.data.updatedAt).toLocaleString(),
      }

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === selectedDocument.id ? updatedDoc : doc
        )
      )

      setShowEditModal(false)
      setSelectedDocument(null)
      setMarkdownContent("")
      setActiveTab(0)

      // Optional: Show success message
      console.log("Document updated successfully")
    } catch (err) {
      console.error("Failed to update document:", err)
      setError("Failed to update document. Please try again.")
      // Optional: You can show an alert or toast notification here
      alert("Failed to update document. Please try again.")
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedDocument(null)
    setMarkdownContent("")
    setActiveTab(0)
  }

  const handleOpenAddModal = () => {
    setShowAddModal(true)
    setNewDocData({
      title: "",
      version: "",
      content: "",
      updatedBy: "",
    })
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setNewDocData({
      title: "",
      version: "",
      content: "",
      updatedBy: "",
    })
  }

  const handleAddDocumentSubmit = async () => {
    try {
      const res = await axiosInstance.post("/legal-docs", newDocData)
      const newDoc = {
        ...res.data,
        lastUpdated: new Date().toLocaleString(),
      }
      setDocuments(prev => [newDoc, ...prev])
      setShowAddModal(false)
    } catch (err) {
      console.error("Error adding document:", err)
      alert("Failed to add document")
    }
  }

  const handleOpenDeleteModal = (document) => {
    setDocumentToDelete(document)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setDocumentToDelete(null)
  }

  const handleDeleteDocument = async () => {
    if (!documentToDelete) return

    setDeleteLoading(prev => ({ ...prev, [documentToDelete.id]: true }))

    try {
      await axiosInstance.delete(`/legal-docs/${documentToDelete.id}`)
      
      // Remove the document from local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentToDelete.id))
      
      setShowDeleteModal(false)
      setDocumentToDelete(null)
      
      console.log("Document deleted successfully")
    } catch (err) {
      console.error("Failed to delete document:", err)
      setError("Failed to delete document. Please try again.")
      alert("Failed to delete document. Please try again.")
    } finally {
      setDeleteLoading(prev => ({ ...prev, [documentToDelete.id]: false }))
    }
  }

  const renderMarkdown = (content) => {
    return content
      .replace(/^### (.*$)/gm, "<h3>$1</h3>")
      .replace(/^## (.*$)/gm, "<h2>$1</h2>")
      .replace(/^# (.*$)/gm, "<h1>$1</h1>")
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\n/g, "<br/>")
  }

  const DocumentCard = ({ document }) => (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 2, sm: 3 },
        mb: 2,
        borderRadius: 2,
        border: "1px solid #f0f0f0",
        "&:hover": {
          borderColor: "#e3f2fd",
          backgroundColor: "#fafafa",
        },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Box sx={{ flex: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={{ xs: 1, sm: 2 }}
            sx={{ mb: 1 }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {document.title}
            </Typography>
            <Stack direction="row" spacing={1}>
              <Chip label={document.version} size="small" variant="outlined" />
              <Chip
                label={document.status || "Live"}
                size="small"
                color="success"
                icon={<CheckCircle size={14} />}
              />
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Last updated: {document.lastUpdated} by {document.updatedBy}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Edit size={16} />}
            onClick={() => handleEditDocument(document)}
            size={isMobile ? "small" : "medium"}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            startIcon={deleteLoading[document.id] ? <CircularProgress size={16} color="inherit" /> : <Trash2 size={16} />}
            onClick={() => handleOpenDeleteModal(document)}
            disabled={deleteLoading[document.id]}
            size={isMobile ? "small" : "medium"}
            sx={{
              backgroundColor: "#d32f2f",
              "&:hover": {
                backgroundColor: "#b71c1c",
              },
              "&:disabled": {
                backgroundColor: "#ffcdd2",
              },
            }}
          >
            {deleteLoading[document.id] ? "Deleting..." : "Delete"}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )

  return (
    <Box sx={{ minHeight: "100vh"}}>
      <Box>
        <Card elevation={2} >
          <CardContent >
            {/* <Stack direction="column" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#e3f2fd" }}>
                  <FileText size={isMobile ? 20 : 24} color="#1976d2" />
                </Box>
                <Box>
                  <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700} >
                    Legal Documents
                  </Typography>
                  <Typography mb={2} variant="body2" color="text.secondary">
                    Manage legal documents with version control and markdown editing
                  </Typography>
                </Box>
              </Stack>
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleOpenAddModal}
                sx={{
                  backgroundColor: "#1a1a1a",
                  "&:hover": {
                    backgroundColor: "#333",
                  },
                }}
              >
                Add Document
              </Button>
            </Stack> */}

              <Stack 
              direction={{ xs: "column", sm: "row" }} 
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              sx={{ mb: 4 }}
            >
              {/* Left Side: Heading + Subtitle */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#e3f2fd" }}>
                  <FileText size={isMobile ? 20 : 24} color="#1976d2" />
                </Box>
                <Box>
                  <Typography variant={isMobile ? "h5" : "h4"} fontWeight={700}>
                    Legal Documents
                  </Typography>
                  <Typography mb={2} variant="body2" color="text.secondary">
                    Manage legal documents with version control and markdown editing
                  </Typography>
                </Box>
              </Stack>

              {/* Right Side: Add Button */}
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={handleOpenAddModal}
                sx={{
                  backgroundColor: "#1a1a1a",
                  "&:hover": { backgroundColor: "#333" },
                  mt: { xs: 2, sm: 0 } // spacing for mobile
                }}
              >
                Add Document
              </Button>
            </Stack>



            {loading ? (
              <Stack alignItems="center" py={6}>
                <CircularProgress />
              </Stack>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              documents.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog
          open={showEditModal}
          onClose={handleCloseEditModal}
          maxWidth="lg"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{
            sx: {
              borderRadius: isMobile ? 0 : 3,
              m: isMobile ? 0 : 2,
              height: isMobile ? "100vh" : "80vh",
            },
          }}
        >
          <DialogTitle
            sx={{
              pb: 1,
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Edit {selectedDocument?.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                Version {selectedDocument?.version} • Markdown Editor with Split Pane
              </Typography>
            </Box>
            <IconButton onClick={handleCloseEditModal} size="small" sx={{ color: "#666" }}>
              <X size={20} />
            </IconButton>
          </DialogTitle>

          <Box sx={{ borderBottom: "1px solid #f0f0f0" }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  minHeight: 48,
                  backgroundColor: "#f9f9f9",
                  "&.Mui-selected": {
                    backgroundColor: "#1a1a1a",
                    color: "white",
                  },
                },
                "& .MuiTabs-indicator": { display: "none" },
              }}
            >
              <Tab icon={<Edit size={16} />} iconPosition="start" label="Edit" />
              <Tab icon={<Eye size={16} />} iconPosition="start" label="Preview" />
            </Tabs>
          </Box>

          <DialogContent sx={{ p: 0, height: "100%", overflow: "hidden" }}>
            <Stack direction={{ xs: "column", md: "row" }} sx={{ height: "100%" }}>
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRight: { xs: "none", md: "1px solid #f0f0f0" },
                  display: activeTab === 0 || !isMobile ? "block" : "none",
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Markdown Content
                </Typography>
                <TextField
                  multiline
                  fullWidth
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  placeholder="Enter markdown content..."
                  sx={{
                    height: "calc(100% - 40px)",
                    "& .MuiOutlinedInput-root": {
                      height: "100%",
                      alignItems: "flex-start",
                      fontFamily: "monospace",
                      fontSize: "0.9rem",
                    },
                    "& .MuiOutlinedInput-input": {
                      height: "100% !important",
                      overflow: "auto !important",
                    },
                  }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  backgroundColor: "#fafafa",
                  display: activeTab === 1 || !isMobile ? "block" : "none",
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Preview
                </Typography>
                <Box
                  sx={{
                    height: "calc(100% - 40px)",
                    overflow: "auto",
                    p: 2,
                    backgroundColor: "white",
                    borderRadius: 1,
                    border: "1px solid #e0e0e0",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(markdownContent),
                  }}
                />
              </Box>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: "1px solid #f0f0f0" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
              <Button
                variant="outlined"
                startIcon={<Save size={18} />}
                onClick={handleSaveDraft}
                sx={{ flex: 1, py: 1.5, fontWeight: 600 }}
                disabled={updateLoading}
              >
                Save Draft
              </Button>
              <Button
                variant="contained"
                startIcon={updateLoading ? <CircularProgress size={18} color="inherit" /> : <Upload size={18} />}
                onClick={handlePublishLive}
                disabled={updateLoading}
                sx={{
                  flex: 1,
                  py: 1.5,
                  fontWeight: 600,
                  backgroundColor: "#1a1a1a",
                  "&:hover": {
                    backgroundColor: "#333",
                  },
                }}
              >
                {updateLoading ? "Publishing..." : "Publish Live"}
              </Button>
            </Stack>
          </DialogActions>
        </Dialog>

        {/* Add Document Modal */}
        <Dialog open={showAddModal} onClose={handleCloseAddModal} maxWidth="sm" fullWidth>
          <DialogTitle fontWeight={600}>Add New Legal Document</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Title"
                fullWidth
                value={newDocData.title}
                onChange={(e) => setNewDocData({ ...newDocData, title: e.target.value })}
              />
              <TextField
                label="Version"
                fullWidth
                value={newDocData.version}
                onChange={(e) => setNewDocData({ ...newDocData, version: e.target.value })}
              />
              <TextField
                label="Updated By"
                fullWidth
                value={newDocData.updatedBy}
                onChange={(e) => setNewDocData({ ...newDocData, updatedBy: e.target.value })}
              />
              <TextField
                label="Content (Markdown)"
                fullWidth
                multiline
                rows={6}
                value={newDocData.content}
                onChange={(e) => setNewDocData({ ...newDocData, content: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            <Button variant="contained" onClick={handleAddDocumentSubmit}>
              Submit
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog
          open={showDeleteModal}
          onClose={handleCloseDeleteModal}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 1 }}>
            <Trash2 size={24} color="#d32f2f" />
            Delete Document
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Are you sure you want to delete this document? This action cannot be undone.
            </Typography>
            {documentToDelete && (
              <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {documentToDelete.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Version: {documentToDelete.version}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Last updated: {documentToDelete.lastUpdated}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDeleteModal}
              variant="outlined"
              disabled={deleteLoading[documentToDelete?.id]}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteDocument}
              variant="contained"
              color="error"
              startIcon={deleteLoading[documentToDelete?.id] ? <CircularProgress size={18} color="inherit" /> : <Trash2 size={18} />}
              disabled={deleteLoading[documentToDelete?.id]}
              sx={{ fontWeight: 600 }}
            >
              {deleteLoading[documentToDelete?.id] ? "Deleting..." : "Delete Document"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}
export default LegalDocuments