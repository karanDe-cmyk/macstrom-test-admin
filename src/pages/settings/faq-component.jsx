"use client"
import { useState, useEffect } from "react"
import axiosInstance from "../../utils/axios"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Paper,
  CircularProgress,
  Alert
} from "@mui/material"
import { HelpCircle, Plus, X, Save, Edit2, Trash2 } from "lucide-react"
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

const FAQComponent = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newFAQ, setNewFAQ] = useState({ question: "", answer: "" })

  const [showEditModal, setShowEditModal] = useState(false)
  const [editFAQ, setEditFAQ] = useState({ id: null, question: "", answer: "" })

  // Fetch FAQs
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await axiosInstance.get("/faqs")
        setFaqs(res.data)
      } catch (err) {
        console.error("Error fetching FAQs:", err)
        setError("Failed to load FAQs.")
      } finally {
        setLoading(false)
      }
    }
    fetchFAQs()
  }, [])

  // Add FAQ
  const handleAddFAQ = async () => {
    const { question, answer } = newFAQ
    if (question.trim() && answer.trim()) {
      try {
        const res = await axiosInstance.post("/faqs", {
          question: question.trim(),
          answer: answer.trim(),
        })
        setFaqs([...faqs, res.data])
        setNewFAQ({ question: "", answer: "" })
        setShowAddModal(false)
      } catch (err) {
        console.error("Error adding FAQ:", err)
        setError("Failed to add FAQ.")
      }
    }
  }

  // Delete FAQ
  const handleDeleteFAQ = async (id) => {
    try {
      await axiosInstance.delete(`/faqs/${id}`)
      setFaqs(faqs.filter((faq) => faq.id !== id))
    } catch (err) {
      console.error("Error deleting FAQ:", err)
      setError("Failed to delete FAQ.")
    }
  }

  // Update FAQ
  const handleUpdateFAQ = async () => {
    const { id, question, answer } = editFAQ
    if (question.trim() && answer.trim()) {
      try {
      await axiosInstance.put(`/faqs/${id}`, {
        question: question.trim(),
        answer: answer.trim()
      })


        setFaqs(
          faqs.map((faq) =>
            faq.id === id ? { ...faq, question: question.trim(), answer: answer.trim() } : faq
          )
        )
        setShowEditModal(false)
        setEditFAQ({ id: null, question: "", answer: "" })
      } catch (err) {
        console.error("Error updating FAQ:", err)
        setError("Failed to update FAQ.")
      }
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setNewFAQ({ question: "", answer: "" })
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditFAQ({ id: null, question: "", answer: "" })
  }

  const FAQItem = ({ faq }) => (
    <Paper
      elevation={1}
      sx={{
        mb: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        border: "1px solid #f0f0f0",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "#e3f2fd",
          backgroundColor: "#fafafa",
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{ fontWeight: 600, mb: 1, color: "#1a1a1a" }}
            >
              {faq.question}
            </Typography>
            <Typography variant="body2" sx={{ color: "#666", fontSize: "0.95rem" }}>
              {faq.answer}
            </Typography>
          </Box>
<Stack direction="row" spacing={1} alignSelf="flex-start">
  <IconButton
    size="small"
    sx={{ color: '#1976d2' }} // Blue edit
    onClick={() => {
      setEditFAQ(faq)
      setShowEditModal(true)
    }}
  >
    <EditIcon sx={{ fontSize: 20 }} />
  </IconButton>
  <IconButton
    size="small"
    sx={{ color: '#d32f2f' }} // Red delete
    onClick={() => handleDeleteFAQ(faq.id)}
  >
    <DeleteIcon sx={{ fontSize: 20 }} />
  </IconButton>
</Stack>

        </Stack>
      </CardContent>
    </Paper>
  )

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ width: "95%", maxWidth: "95%", mx: "auto", px: { xs: 1, sm: 2 } }}>
        <Card elevation={2} sx={{ borderRadius: 3, border: "1px solid #f0f0f0" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#e3f2fd" }}>
                <HelpCircle size={isMobile ? 20 : 24} color="#1976d2" />
              </Box>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ fontWeight: 700 }}>
                Frequently Asked Questions
              </Typography>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                {faqs.map((faq) => (
                  <FAQItem key={faq.id} faq={faq} />
                ))}
              </Box>
            )}

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="outlined"
                startIcon={<Plus size={18} />}
                onClick={() => setShowAddModal(true)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontSize: { xs: "0.9rem", sm: "1rem" },
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1.5, sm: 2 },
                }}
              >
                Add New FAQ
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Add FAQ Modal */}
        <Dialog
          open={showAddModal}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Add New FAQ</Typography>
            <IconButton onClick={handleCloseModal}><X size={20} /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Question"
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                fullWidth
              />
              <TextField
                label="Answer"
                multiline
                rows={4}
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              onClick={handleAddFAQ}
              variant="contained"
              startIcon={<Save size={18} />}
              disabled={!newFAQ.question.trim() || !newFAQ.answer.trim()}
            >
              Add FAQ
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit FAQ Modal */}
        <Dialog
          open={showEditModal}
          onClose={handleCloseEditModal}
          maxWidth="md"
          fullWidth
          fullScreen={isMobile}
          PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
        >
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h6">Edit FAQ</Typography>
            <IconButton onClick={handleCloseEditModal}><X size={20} /></IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Stack spacing={3}>
              <TextField
                label="Question"
                value={editFAQ.question}
                onChange={(e) => setEditFAQ({ ...editFAQ, question: e.target.value })}
                fullWidth
              />
              <TextField
                label="Answer"
                multiline
                rows={4}
                value={editFAQ.answer}
                onChange={(e) => setEditFAQ({ ...editFAQ, answer: e.target.value })}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button
              onClick={handleUpdateFAQ}
              variant="contained"
              startIcon={<Save size={18} />}
              disabled={!editFAQ.question.trim() || !editFAQ.answer.trim()}
            >
              Update FAQ
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default FAQComponent
