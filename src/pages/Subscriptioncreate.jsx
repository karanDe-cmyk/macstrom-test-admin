"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Tooltip,
  IconButton,
  Divider,
  Stack,
} from "@mui/material"
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Diamond as DiamondIcon,
  CurrencyRupee as RupeeIcon,
  Schedule as ScheduleIcon,
  Description as DescriptionIcon,
  Title as TitleIcon,
} from "@mui/icons-material"
import { toast } from "react-toastify"

const API_URL = "http://localhost:5000/api/subscription"

export default function SubscriptionAdminPanel() {
  const [plans, setPlans] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [formData, setFormData] = useState({
    plan_name: "",
    description: "",
    price: "",
    duration: "",
    duration_type: "days",
    diamond_rewards: "",
  })

  // 🔹 Fetch Plans
  const fetchPlans = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setPlans(data)
    } catch (err) {
      toast.error("Failed to fetch plans")
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  // 🔹 Handle Form Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // 🔹 Open Dialog for Add/Edit
  const handleOpen = (plan = null) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        plan_name: plan.plan_name,
        description: plan.description,
        price: plan.price.toString(),
        duration: plan.duration.toString(),
        duration_type: plan.duration_type,
        diamond_rewards: plan.diamond_rewards.toString(),
      })
    } else {
      setEditingPlan(null)
      setFormData({
        plan_name: "",
        description: "",
        price: "",
        duration: "",
        duration_type: "days",
        diamond_rewards: "",
      })
    }
    setIsDialogOpen(true)
  }

  // 🔹 Save Plan (Add/Edit)
  const handleSave = async () => {
    try {
      const method = editingPlan ? "PUT" : "POST"
      const url = editingPlan ? `${API_URL}/${editingPlan.id}` : API_URL

      const payload = {
        ...formData,
        price: parseInt(formData.price),
        duration: parseInt(formData.duration),
        diamond_rewards: parseInt(formData.diamond_rewards),
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to save plan")

      toast.success(editingPlan ? "Plan updated successfully" : "Plan added successfully")
      fetchPlans()
      setIsDialogOpen(false)
    } catch (err) {
      toast.error("Something went wrong!")
    }
  }

  // 🔹 Delete Plan
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return

    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")

      toast.success("Plan deleted successfully")
      fetchPlans()
    } catch (err) {
      toast.error("Something went wrong!")
    }
  }

  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active"
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error("Failed to update status")

      toast.success("Status updated successfully")
      fetchPlans()
    } catch (err) {
      toast.error("Something went wrong!")
    }
  }

  const formatDuration = (duration, type) => {
    if (type === "days") {
      return duration === 1 ? "1 day" : `${duration} days`
    }
    if (type === "months") {
      return duration === 1 ? "1 month" : `${duration} months`
    }
    if (type === "years") {
      return duration === 1 ? "1 year" : `${duration} years`
    }
    return `${duration} ${type}`
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Plans Table */}
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box>
              <Typography variant="h5" component="div" sx={{ fontWeight: 600, color: "#1976d2" }}>
                Subscription Plans
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Manage your subscription plans, pricing, and diamond rewards
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpen()}
              sx={{
                bgcolor: "#1976d2",
                borderRadius: 2,
                px: 3,
                py: 1.5,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
                "&:hover": {
                  bgcolor: "#1565c0",
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
                },
              }}
            >
              Add New Plan
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell>
                    <strong>Plan Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Description</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Price</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Duration</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Diamonds</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Status</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Created</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Actions</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{plan.plan_name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={plan.description}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {plan.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <RupeeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                        {plan.price.toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell>{formatDuration(plan.duration, plan.duration_type)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", color: "secondary.main" }}>
                        <span style={{ fontSize: 16, marginRight: 4 }}>💎</span>
                        {plan.diamond_rewards.toLocaleString()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={plan.status}
                        color={plan.status === "active" ? "success" : "default"}
                        size="small"
                        onClick={() => toggleStatus(plan.id, plan.status)}
                        sx={{ cursor: "pointer" }}
                      />
                    </TableCell>
                    <TableCell>{new Date(plan.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(plan)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(plan.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "#1976d2" }}>
            {editingPlan ? "Edit Subscription Plan" : "Create New Subscription Plan"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Set up pricing, duration, and diamond rewards for your subscription plan.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Plan Basic Info Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                📋 Plan Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Plan Name"
                    name="plan_name"
                    value={formData.plan_name}
                    onChange={handleChange}
                    placeholder="e.g., Premium Plan"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <TitleIcon sx={{ color: "#1976d2" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#1976d2",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of the plan benefits and features"
                    multiline
                    rows={3}
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}>
                          <DescriptionIcon sx={{ color: "#1976d2" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#1976d2",
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Pricing Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                💰 Pricing & Duration
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Price"
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="299"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <RupeeIcon sx={{ color: "#4caf50" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#4caf50",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <TextField
                    fullWidth
                    label="Duration"
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="1"
                    required
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <ScheduleIcon sx={{ color: "#ff9800" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#ff9800",
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6} md={4}>
                  <FormControl
                    fullWidth
                    required
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#ff9800",
                        },
                      },
                    }}
                  >
                    <InputLabel>Duration Type</InputLabel>
                    <Select
                      name="duration_type"
                      value={formData.duration_type}
                      label="Duration Type"
                      onChange={handleChange}
                    >
                      <MenuItem value="days">Days</MenuItem>
                      <MenuItem value="months">Months</MenuItem>
                      <MenuItem value="years">Years</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* Rewards Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: "#333", fontWeight: 600 }}>
                💎 Diamond Rewards
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Diamond Rewards"
                    type="number"
                    name="diamond_rewards"
                    value={formData.diamond_rewards}
                    onChange={handleChange}
                    placeholder="1000"
                    required
                    variant="outlined"
                    helperText="Number of diamonds users will receive for this plan"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DiamondIcon sx={{ color: "#e91e63" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&:hover fieldset": {
                          borderColor: "#e91e63",
                        },
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#666",
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setIsDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              bgcolor: "#1976d2",
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              "&:hover": {
                bgcolor: "#1565c0",
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.4)",
              },
            }}
          >
            {editingPlan ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}