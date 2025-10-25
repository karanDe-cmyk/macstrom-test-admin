"use client"
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Paper,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputLabel,
} from "@mui/material"
import axiosInstance from "../../utils/axios"
import { Info } from "lucide-react"
import { Edit, Delete } from "@mui/icons-material"
import { useState, useEffect } from "react"

const HowToPlay = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [steps, setSteps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [openAddModal, setOpenAddModal] = useState(false)
  const [openEditModal, setOpenEditModal] = useState(false)

  const [addStep, setAddStep] = useState({
    title: "",
    description: "",
    gifUrl: "",
    image: null,
  })

  const [editStep, setEditStep] = useState({
    id: null,
    title: "",
    description: "",
    gifUrl: "",
    image: null,
  })

  const fetchSteps = async () => {
    try {
      const res = await axiosInstance.get("/how-to-play")
      setSteps(res.data)
    } catch (err) {
      console.error("Error fetching steps:", err)
      setError("Failed to load steps.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSteps()
  }, [])

  // Add Step Handlers
  const handleOpenAddModal = () => {
    setAddStep({ title: "", description: "", gifUrl: "", image: null })
    setOpenAddModal(true)
  }

  const handleCloseAddModal = () => {
    setOpenAddModal(false)
  }

  const handleAddChange = (e) => {
    const { name, value, files } = e.target
    setAddStep({ ...addStep, [name]: name === "image" ? files[0] : value })
  }

  const handleAddStepSubmit = async () => {
    try {
      const payload = {
        stepNumber: steps.length + 1,
        title: addStep.title,
        description: addStep.description,
        gifUrl: addStep.gifUrl,
      }

      await axiosInstance.post("/how-to-play", payload)
      await fetchSteps()
      handleCloseAddModal()
    } catch (error) {
      console.error("Error adding step:", error.response?.data || error.message)
      alert("Failed to add step.")
    }
  }

  // Edit Step Handlers
  const handleOpenEditModal = (step) => {
    setEditStep({
      id: step.id,
      title: step.title,
      description: step.description,
      gifUrl: step.gifUrl,
      image: null,
    })
    setOpenEditModal(true)
  }

  const handleCloseEditModal = () => {
    setOpenEditModal(false)
  }

  const handleEditChange = (e) => {
    const { name, value, files } = e.target
    setEditStep({ ...editStep, [name]: name === "image" ? files[0] : value })
  }

  const handleEditStepSubmit = async () => {
    if (!editStep.id) return

    try {
      const payload = {
        title: editStep.title,
        description: editStep.description,
        gifUrl: editStep.gifUrl,
      }

      await axiosInstance.put(`/how-to-play/${editStep.id}`, payload)
      await fetchSteps()
      handleCloseEditModal()
    } catch (error) {
      console.error("Error editing step:", error.response?.data || error.message)
      alert("Failed to edit step.")
    }
  }

  // Delete
  const handleDeleteStep = async (id) => {
    if (!id) return
    try {
      await axiosInstance.delete(`/how-to-play/${id}`)
      setSteps(prev => prev.filter(step => step.id !== id))
    } catch (error) {
      console.error("Failed to delete step:", error.response?.data || error.message)
    }
  }

  const StepCard = ({ step, index }) => (
    <Card
      elevation={1}
      sx={{
        mb: { xs: 1, sm: 1.5 },
        borderRadius: { xs: 1.5, sm: 2 },
        border: "1px solid #f0f0f0",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-1px)",
          borderColor: "#e3f2fd",
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1, sm: 1.5, md: 2 },
          "&:last-child": { pb: { xs: 1, sm: 1.5, md: 2 } },
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={{ xs: 1, sm: 1.5 }}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Avatar
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              width: { xs: 28, sm: 32, md: 36 },
              height: { xs: 28, sm: 32, md: 36 },
              fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {step.stepNumber}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 1.5 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.25, color: "#1a1a1a" }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: "0.75rem", sm: "0.8rem" }, lineHeight: 1.4 }}>
                  {step.description}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Paper
                  elevation={0}
                  sx={{
                    width: { xs: 100, sm: 120, md: 140 },
                    height: { xs: 60, sm: 50, md: 60 },
                    borderRadius: 1,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e0e0e0",
                    backgroundColor: "#fafafa",
                    flexShrink: 0,
                  }}
                >
                  {step.gifUrl ? (
                    <img src={step.gifUrl} alt={step.title} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }} />
                  ) : (
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
                      No preview
                    </Typography>
                  )}
                </Paper>

                <Stack spacing={0.5} alignItems="center">
                  <IconButton color="primary" size="small" onClick={() => handleOpenEditModal(step)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDeleteStep(step.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ width: "95%", maxWidth: "95%", mx: "auto", px: { xs: 1, sm: 1.5, md: 2 } }}>
        <Card elevation={2} sx={{ mb: 2, borderRadius: 2, backgroundColor: "#ffffff", border: "1px solid #f0f0f0" }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Avatar sx={{ bgcolor: "#e3f2fd", color: "#1976d2", width: 36, height: 36 }}>
                  <Info size={isMobile ? 16 : 18} />
                </Avatar>
                <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 700, color: "#1a1a1a" }}>
                  How to Play Guide
                </Typography>
              </Stack>

              <Button
  variant="contained"
  onClick={handleOpenAddModal}
  sx={{
    backgroundColor: '#1F1F1F',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#1F1F1F',
    },
  }}
>
  Add Step
</Button>


            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Step-by-step guide with markdown and GIF support
            </Typography>
          </CardContent>
        </Card>

        <Box>
          {loading && <Typography>Loading steps...</Typography>}
          {error && <Typography color="error">{error}</Typography>}
          {!loading && !error && steps.map((step, index) => <StepCard key={step.id} step={step} index={index} />)}
        </Box>

        {/* Add Step Modal */}
        <Dialog open={openAddModal} onClose={handleCloseAddModal} fullWidth maxWidth="sm">
          <DialogTitle>Add New Step</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField label="Title" name="title" value={addStep.title} onChange={handleAddChange} fullWidth />
              <TextField label="Description" name="description" value={addStep.description} onChange={handleAddChange} multiline rows={3} fullWidth />
              <TextField label="GIF URL" name="gifUrl" value={addStep.gifUrl} onChange={handleAddChange} fullWidth />
              <InputLabel htmlFor="add-image-upload">Upload Image</InputLabel>
              <input type="file" name="image" accept="image/*" onChange={handleAddChange} id="add-image-upload" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddModal}>Cancel</Button>
            <Button variant="contained" onClick={handleAddStepSubmit}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* Edit Step Modal */}
        <Dialog open={openEditModal} onClose={handleCloseEditModal} fullWidth maxWidth="sm">
          <DialogTitle>Edit Step</DialogTitle>
          <DialogContent>
            <Stack spacing={2} mt={1}>
              <TextField label="Title" name="title" value={editStep.title} onChange={handleEditChange} fullWidth />
              <TextField label="Description" name="description" value={editStep.description} onChange={handleEditChange} multiline rows={3} fullWidth />
              <TextField label="GIF URL" name="gifUrl" value={editStep.gifUrl} onChange={handleEditChange} fullWidth />
              <InputLabel htmlFor="edit-image-upload">Upload Image</InputLabel>
              <input type="file" name="image" accept="image/*" onChange={handleEditChange} id="edit-image-upload" />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditModal}>Cancel</Button>
            <Button variant="contained" onClick={handleEditStepSubmit}>Save Changes</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default HowToPlay
