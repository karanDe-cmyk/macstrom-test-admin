"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Box,
  TextField,
  Typography,
  Tooltip,
  Zoom,
  IconButton,
  InputAdornment,
  Alert,
  Snackbar,
  Pagination,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  CheckCircle,
  HourglassEmpty,
  Cancel,
  ErrorOutline,
  Info,
  Search,
  Clear,
  Refresh,
  Warning,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = "http://localhost:5000/api/subscriptions/purchased";

const statusConfig = {
  active: { color: "success", icon: <CheckCircle fontSize="small" />, label: "Active" },
  pending: { color: "warning", icon: <HourglassEmpty fontSize="small" />, label: "Pending" },
  cancelled: { color: "error", icon: <Cancel fontSize="small" />, label: "Cancelled" },
  failed: { color: "error", icon: <ErrorOutline fontSize="small" />, label: "Failed" },
  trial: { color: "info", icon: <Info fontSize="small" />, label: "Trial" },
};

function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount}`;
  }
}

function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function SubscriptionsTable() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      console.log('Fetching data from:', API_URL);
      
      const response = await fetch(API_URL, { 
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      
      const resData = await response.json();
      console.log('Response data:', resData);
      
      if (Array.isArray(resData)) {
        setData(resData);
      } else if (Array.isArray(resData?.data)) {
        setData(resData.data);
      } else {
        console.warn('Unexpected API response format:', resData);
        setData([]);
      }
      
      setError("");
      showSnackbar(`Loaded ${data.length} subscriptions`, "success");
      
    } catch (err) {
      console.error('Fetch error details:', err);
      
      let errorMsg = err.message;
      
      if (err.message.includes('Failed to fetch') || err.message.includes('Network')) {
        errorMsg = "Network error: Unable to connect to the server. Please check your internet connection and ensure the backend is running.";
      } else if (err.message.includes('CORS')) {
        errorMsg = "CORS Error: The server is not accepting requests from this origin. Please contact the administrator.";
      } else if (err.message.includes('404')) {
        errorMsg = "API endpoint not found. Please check if the backend route exists.";
      } else if (err.message.includes('500')) {
        errorMsg = "Server error. Please try again later.";
      }
      
      setError(errorMsg);
      showSnackbar(errorMsg, "error");
      setData([]); // Clear data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filteredData = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return data;

    return data.filter(
      (row) =>
        row.userName?.toLowerCase().includes(term) ||
        row.userEmail?.toLowerCase().includes(term) ||
        row.planName?.toLowerCase().includes(term) ||
        row.status?.toLowerCase().includes(term) ||
        row.userId?.toString().includes(term) ||
        row.orderId?.toLowerCase().includes(term)
    );
  }, [data, search]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  const pageCount = Math.ceil(filteredData.length / rowsPerPage);

  const clearSearch = () => setSearch("");

  if (loading && !refreshing)
    return (
      <Box className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <CircularProgress size={40} thickness={4} />
        <Typography variant="h6" className="mt-4 text-gray-600 font-medium">
          Loading Subscriptions
        </Typography>
        <Typography variant="body2" className="mt-2 text-gray-500">
          Connecting to server...
        </Typography>
      </Box>
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-1"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Typography variant="h4" className="font-bold text-gray-900">
            Subscriptions
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            Manage and view all subscription details
          </Typography>
          {error && (
            <Alert severity="warning" className="mt-2">
              {error}
            </Alert>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <IconButton 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="bg-blue-50 hover:bg-blue-100 transition-colors"
            size="small"
          >
            <Refresh className={refreshing ? "animate-spin" : ""} />
          </IconButton>
          
          <Typography variant="body2" className="text-gray-500">
            {filteredData.length} {filteredData.length === 1 ? 'subscription' : 'subscriptions'}
          </Typography>
        </div>
      </div>

      <TextField
        size="medium"
        placeholder="Search by user, email, plan, status, or ID..."
        variant="outlined"
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search className="text-gray-400" />
            </InputAdornment>
          ),
          endAdornment: search && (
            <InputAdornment position="end">
              <IconButton onClick={clearSearch} size="small">
                <Clear />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            backgroundColor: "white",
            "&:hover fieldset": {
              borderColor: "primary.main",
            },
            "&.Mui-focused fieldset": {
              borderColor: "primary.main",
              borderWidth: "2px",
            },
          },
        }}
      />

      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
        }}
      >
        <Table size="medium" aria-label="subscriptions table">
          <TableHead>
            <TableRow
              sx={{
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.06),
                "& th": {
                  py: 2,
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  color: "text.primary",
                  borderBottom: "2px solid",
                  borderBottomColor: "divider",
                },
              }}
            >
              <TableCell>Order ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>User Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <AnimatePresence>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align="center" sx={{ py: 8 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center"
                    >
                      <Search className="text-gray-400 text-4xl mb-3" />
                      <Typography variant="h6" className="text-gray-500 font-medium">
                        No subscriptions found
                      </Typography>
                      <Typography variant="body2" className="text-gray-400 mt-1">
                        {search ? "Try adjusting your search terms" : "No subscriptions available"}
                      </Typography>
                      {search && (
                        <button
                          onClick={clearSearch}
                          className="mt-3 px-4 py-2 text-primary hover:text-primary-dark transition-colors font-medium"
                        >
                          Clear search
                        </button>
                      )}
                    </motion.div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, index) => {
                  const statusKey = Object.keys(statusConfig).find((k) =>
                    row.status?.toLowerCase().includes(k)
                  );
                  const status = statusConfig[statusKey] || {
                    color: "default",
                    icon: <Info fontSize="small" />,
                    label: row.status || "Unknown"
                  };

                  return (
                    <TableRow
                      key={row.orderId || row.id || index}
                      component={motion.tr}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      sx={{
                        "&:hover": {
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        },
                        transition: "all 0.2s ease-in-out",
                        cursor: "pointer",
                        backgroundColor: index % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                        "& td": {
                          py: 2.5,
                          borderBottom: "1px solid",
                          borderBottomColor: "divider",
                        },
                      }}
                    >
                      <TableCell>
                        <Tooltip TransitionComponent={Zoom} title={row.orderId || "No Order ID"}>
                          <Typography variant="body2" className="font-mono text-sm">
                            {row.orderId ? `${row.orderId.slice(0, 8)}...` : "-"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" className="font-mono text-sm font-medium">
                          {row.userId || "-"}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" className="font-medium">
                          {row.userName || `User ${row.userId}`}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" className="text-gray-600">
                          {row.userEmail || "-"}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Tooltip TransitionComponent={Zoom} title={row.planName || ""}>
                          <Typography variant="body2" className="font-semibold text-primary">
                            {row.planName || "-"}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2" className="font-bold text-green-600">
                          {formatCurrency(row.price)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.duration || "-"}
                          variant="outlined"
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 600,
                            textTransform: "capitalize",
                            borderWidth: "2px",
                          }}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(row.startDate)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(row.endDate)}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          size="small"
                          label={status.label}
                          color={status.color}
                          icon={status.icon}
                          variant="filled"
                          sx={{
                            borderRadius: "8px",
                            fontWeight: 700,
                            textTransform: "capitalize",
                            minWidth: 80,
                            "& .MuiChip-icon": {
                              color: "inherit !important",
                            },
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(event, newPage) => setPage(newPage)}
          color="primary"
          showFirstButton
          showLastButton
          size="large"
        />
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {refreshing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50"
        >
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-3">
            <CircularProgress size={24} />
            <Typography className="font-medium">Refreshing...</Typography>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}