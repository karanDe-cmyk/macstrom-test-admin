"use client"

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  TablePagination,
  Autocomplete
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axiosInstance from '../utils/axios'

// const API_BASE_URL = 'http://localhost:5000/api/bonus'

export default function AdminBonusPanel() {
  const [bonuses, setBonuses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ userId: '', amount: '' })
  const [editingBonus, setEditingBonus] = useState(null)
  const [openEditDialog, setOpenEditDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // Fetch all bonuses
  const fetchBonuses = async () => {
    try {
      setLoading(true);
      setError("");

      // ✅ Use axiosInstance (baseURL already included)
      const response = await axiosInstance.get("/all");

      // Axios automatically throws for non-2xx responses, so no manual .ok check needed
      const data = response.data || [];

      // ✅ Sort bonuses by member_id
      const sortedData = data.sort((a, b) => a.member_id - b.member_id);

      setBonuses(sortedData);
    } catch (err) {
      console.error("❌ Fetch bonuses error:", err);
      setError("Failed to fetch bonuses: " + (err.response?.data?.message || err.message));
      toast.error("Failed to load bonuses!");
    } finally {
      setLoading(false);
    }
  };


  // Load bonuses on component mount
  useEffect(() => {
    fetchBonuses()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle autocomplete change for user ID
  const handleUserIdChange = (event, value) => {
    if (value) {
      // If it's an object from dropdown selection
      if (typeof value === 'object' && value.member_id) {
        setFormData(prev => ({ ...prev, userId: value.member_id.toString() }))
      } else {
        // If it's a string (typed value)
        setFormData(prev => ({ ...prev, userId: value }))
      }
    } else {
      setFormData(prev => ({ ...prev, userId: '' }))
    }
  }

  const handleAddBonus = async () => {
    if (!formData.userId || !formData.amount) {
      toast.error("Please fill in all fields!");
      return;
    }

    try {
      setActionLoading(true);

      // ✅ Use axiosInstance
      const { data: responseData } = await axiosInstance.post("/add", {
        userId: parseInt(formData.userId),
        amount: parseFloat(formData.amount),
      });

      // Find if user already exists in the list
      const existingUserIndex = bonuses.findIndex(
        (bonus) => bonus.member_id === parseInt(formData.userId)
      );

      if (existingUserIndex !== -1) {
        // ✅ Update existing user in state
        setBonuses((prevBonuses) => {
          const updatedBonuses = [...prevBonuses];
          updatedBonuses[existingUserIndex] = {
            ...updatedBonuses[existingUserIndex],
            bonus_balance: parseFloat(formData.amount).toString(),
          };
          return updatedBonuses;
        });
      } else {
        // ✅ Fetch fresh data if new user
        await fetchBonuses();
      }

      setFormData({ userId: "", amount: "" });
      toast.success("Bonus added successfully! 🎉");
    } catch (err) {
      console.error("Add bonus error:", err);
      toast.error("Failed to add bonus: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };


  const handleEditClick = (bonus) => {
    setEditingBonus({
      userId: bonus.member_id,
      amount: parseFloat(bonus.bonus_balance),
      user_name: bonus.user_name
    })
    setOpenEditDialog(true)
  }

  const handleEditSave = async () => {
    if (!editingBonus) return;

    try {
      setActionLoading(true);

      // ✅ Use axiosInstance
      await axiosInstance.put("/update", {
        userId: editingBonus.userId,
        amount: editingBonus.amount,
      });

      // ✅ Update state
      setBonuses((prevBonuses) =>
        prevBonuses.map((bonus) =>
          bonus.member_id === editingBonus.userId
            ? { ...bonus, bonus_balance: editingBonus.amount.toString() }
            : bonus
        )
      );

      setOpenEditDialog(false);
      setEditingBonus(null);
      toast.success("Bonus updated successfully! ✅");
    } catch (err) {
      console.error("Update bonus error:", err);
      toast.error("Failed to update bonus: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };


  const handleDelete = async (memberId) => {
    if (!window.confirm("Are you sure you want to delete this bonus?")) return;

    try {
      setActionLoading(true);

      // ✅ Use axiosInstance
      await axiosInstance.delete(`/delete/${memberId}`);

      // ✅ Update state
      setBonuses((prevBonuses) => {
        const filteredBonuses = prevBonuses.filter((bonus) => bonus.member_id !== memberId);

        // Adjust page if current page is now empty
        const newTotalPages = Math.ceil(filteredBonuses.length / rowsPerPage);
        if (page >= newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages - 1);
        }

        return filteredBonuses;
      });

      toast.success("Bonus deleted successfully! 🗑");
    } catch (err) {
      console.error("Delete bonus error:", err);
      toast.error("Failed to delete bonus: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(false);
    }
  };


  const handleRefresh = () => {
    fetchBonuses()
    toast.info('Refreshing bonus data...')
  }

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10)
    setRowsPerPage(newRowsPerPage)
    setPage(0)
  }

  // Calculate statistics
  const totalBonuses = bonuses.length
  const activeBonuses = bonuses.filter(bonus => parseFloat(bonus.bonus_balance) > 0).length
  const totalAmount = bonuses.reduce((sum, bonus) => sum + parseFloat(bonus.bonus_balance || 0), 0)

  // Get paginated data
  const paginatedBonuses = bonuses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  // Prepare options for autocomplete (sorted by member_id for better UX)
  const userOptions = bonuses
    .sort((a, b) => a.member_id - b.member_id)
    .map(bonus => ({
      member_id: bonus.member_id,
      user_name: bonus.user_name,
      label: `${bonus.member_id} - ${bonus.user_name || 'No username'}`,
      displayText: `ID: ${bonus.member_id} | ${bonus.user_name || 'No username'}`
    }))

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, width: '100%', mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 'bold', textAlign: { xs: 'center', md: 'left' } }}
        >
          Admin Bonus Management Panel
        </Typography>
        <Button
          variant="outlined"
          onClick={handleRefresh}
          startIcon={<RefreshIcon />}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{totalBonuses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Users with Bonuses</Typography>
              <Typography variant="h4">{activeBonuses}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">Total Bonus Amount</Typography>
              <Typography variant="h4">₹{totalAmount.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Bonus Form */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <AddIcon /> Add New Bonus
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                freeSolo
                options={userOptions}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option
                  return option.displayText || option.label || ''
                }}
                value={formData.userId}
                onInputChange={(event, newValue) => {
                  setFormData(prev => ({ ...prev, userId: newValue || '' }))
                }}
                onChange={handleUserIdChange}
                disabled={actionLoading}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="User ID (Member ID)"
                    placeholder="Type or select member ID"
                    variant="outlined"
                    helperText="Enter custom ID or select from existing users"
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        ID: {option.member_id}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.user_name || 'No username'}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                label="Bonus Amount"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="Enter amount"
                variant="outlined"
                disabled={actionLoading}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleAddBonus}
                startIcon={actionLoading ? <CircularProgress size={20} /> : <AddIcon />}
                disabled={actionLoading}
                size="large"
                sx={{ height: '56px' }}
              >
                {actionLoading ? 'Adding...' : 'Add Bonus'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Bonuses Table */}
      <Card sx={{ overflowX: 'auto' }}>
        <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
          {/* Heading with Rows per page on the right */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2
            }}
          >
            <Typography variant="h6">
              All Users and Their Bonuses ({bonuses.length} total)
            </Typography>

            {/* Rows Per Page Selector */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">Rows per page:</Typography>
              <TextField
                select
                size="small"
                value={rowsPerPage}
                onChange={handleChangeRowsPerPage}
                SelectProps={{ native: true }}
                sx={{ width: 80 }}
              >
                {[5, 10, 25, 50, 100].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </TextField>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Member ID</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Bonus Balance</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedBonuses.map((bonus) => (
                  <TableRow key={bonus.member_id} hover>
                    <TableCell>{bonus.member_id}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: bonus.user_name ? 'grey.100' : 'warning.light',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          display: 'inline-block'
                        }}
                      >
                        {bonus.user_name || 'No username'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 'bold',
                          color: parseFloat(bonus.bonus_balance) > 0 ? 'success.main' : 'text.secondary'
                        }}
                      >
                        ₹{parseFloat(bonus.bonus_balance).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={parseFloat(bonus.bonus_balance) > 0 ? 'Has Bonus' : 'No Bonus'}
                        color={parseFloat(bonus.bonus_balance) > 0 ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditClick(bonus)}
                          size="small"
                          disabled={actionLoading}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(bonus.member_id)}
                          size="small"
                          disabled={actionLoading}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Component - Only page navigation, no rows per page selector */}
          <TablePagination
            rowsPerPageOptions={[]} // Empty array removes the rows per page dropdown
            component="div"
            count={bonuses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
            }
            sx={{
              mt: 2,
              '& .MuiTablePagination-toolbar': {
                paddingLeft: { xs: 1, sm: 2 },
                paddingRight: { xs: 1, sm: 2 },
                minHeight: { xs: 52, sm: 64 },
              },
              '& .MuiTablePagination-displayedRows': {
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                margin: 0,
              },
              '& .MuiTablePagination-actions': {
                marginLeft: { xs: 1, sm: 2 },
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Bonus for {editingBonus?.user_name || 'User'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Member ID"
                  value={editingBonus?.userId || ''}
                  disabled
                  variant="outlined"
                  helperText="Member ID cannot be changed"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bonus Amount"
                  type="number"
                  value={editingBonus?.amount || ''}
                  onChange={(e) =>
                    setEditingBonus(prev =>
                      prev ? { ...prev, amount: parseFloat(e.target.value) || 0 } : null
                    )
                  }
                  variant="outlined"
                  disabled={actionLoading}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenEditDialog(false)}
            startIcon={<CancelIcon />}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            startIcon={actionLoading ? <CircularProgress size={20} /> : <SaveIcon />}
            disabled={actionLoading}
          >
            {actionLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </Box>
  )
}