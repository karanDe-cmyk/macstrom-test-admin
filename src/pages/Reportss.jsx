"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Alert,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuList,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Container,
  CircularProgress,
  Tooltip,
  Badge,
  AvatarGroup,
  Skeleton,
  Snackbar,
} from "@mui/material";
import {
  ReportProblem,
  FilterList,
  Refresh,
  Visibility,
  PersonOff,
  CheckCircle,
  BugReport,
  Security,
  SportsEsports,
  Support,
  Flag,
  Close,
  Search,
  Warning,
  MoreHoriz,
  Description,
  People,
  Schedule,
  NotificationsActive,
  PlayArrow,
  Pause,
  ExpandMore,
  ExpandLess,
  Download,
  BookmarkBorder,
  Bookmark,
  AttachFile,
  AccessTime,
} from "@mui/icons-material";

// Add after the imports and before the component definition
const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    const handleError = (error) => {
      console.error("Component error:", error);
      setHasError(true);
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);
  if (hasError) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        Something went wrong. Please refresh the page.
      </Alert>
    );
  }
  return children;
};

const reportCategories = [
  { value: "all", label: "All Reports", count: 0 },
  {
    value: "harassment",
    label: "Harassment",
    count: 0,
    icon: Warning,
    color: "warning",
  },
  {
    value: "cheating",
    label: "Cheating/Hacking",
    count: 0,
    icon: Security,
    color: "error",
  },
  {
    value: "bug report",
    label: "Bug Report",
    count: 0,
    icon: BugReport,
    color: "info",
  },
  {
    value: "technical issue",
    label: "Technical Issue",
    count: 0,
    icon: Support,
    color: "primary",
  },
  {
    value: "inappropriate content",
    label: "Inappropriate Content",
    count: 0,
    icon: Flag,
    color: "error",
  },
  {
    value: "gameplay issue",
    label: "Gameplay Issue",
    count: 0,
    icon: SportsEsports,
    color: "secondary",
  },
];

const reportStatuses = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending", color: "warning" },
  { value: "assigned", label: "Assigned", color: "info" },
  { value: "resolved", label: "Resolved", color: "success" },
  { value: "rejected", label: "Rejected", color: "error" },
];

const priorities = [
  { value: "all", label: "All Priority" },
  { value: "high", label: "High Priority", color: "error" },
  { value: "medium", label: "Medium Priority", color: "warning" },
  { value: "low", label: "Low Priority", color: "success" },
];

export default function UserReportsCenter() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [reportToAssign, setReportToAssign] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuReportId, setMenuReportId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [viewMode, setViewMode] = useState("list"); // This state is not used in the provided code, but kept for consistency
  const [sortBy, setSortBy] = useState("newest");
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [bookmarkedReports, setBookmarkedReports] = useState(new Set());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [selectedReports, setSelectedReports] = useState(new Set());
  const [bulkActionAnchor, setBulkActionAnchor] = useState(null);
  const [userReports, setUserReports] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [apiError, setApiError] = useState(null);
  const [fetchedAdminUsers, setFetchedAdminUsers] = useState([]); // New state for fetched admins

  // API Base URLs
  const API_BASE_URL =
    "https://mactromtest-backend.onrender.com/api/reports";
  const ADMIN_API_URL =
    "https://mactromtest-backend.onrender.com/api/auth/admin/getadmins"; // Admin API URL
  const ADMIN_AUTH_TOKEN = localStorage.getItem("authToken"); // Get auth token from local storage
  // Calculate category counts from reports
  const calculateCategoryCounts = (reports) => {
    const counts = { all: reports.length };
    reports.forEach((report) => {
      const category = report.category.toLowerCase();
      counts[category] = (counts[category] || 0) + 1;
    });
    return counts;
  };

  // Get updated categories with counts
  const getUpdatedCategories = () => {
    return reportCategories.map((category) => ({
      ...category,
      count: categoryCounts[category.value] || 0,
    }));
  };

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/reports`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Add null check for data
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid data format received from API");
      }
      // Transform API data with proper null checks
      const transformedReports = data
        .map((report) => {
          if (!report) return null;
          return {
            id: `RPT-${(report.id || 0).toString().padStart(3, "0")}`,
            originalId: report.id || 0,
            title: report.title || "Untitled Report",
            category: (report.category || "other").toLowerCase(),
            status: report.status || "pending",
            priority: "medium", // Default priority, as it's not in the provided report API response
            reportedBy: {
              username: report.user_name || "Unknown User",
              id: report.user_id || 0,
              avatar: `/placeholder.svg?height=40&width=40&text=${(
                report.user_name || "UN"
              )
                .slice(0, 2)
                .toUpperCase()}`,
              reputation: 4.0,
            },
            reportedUser: report.reported_user_id
              ? {
                  username: report.reported_user_name || "Unknown User",
                  id: report.reported_user_id,
                  avatar: `/placeholder.svg?height=40&width=40&text=${(
                    report.reported_user_name || "UN"
                  )
                    .slice(0, 2)
                    .toUpperCase()}`,
                  reputation: 2.5,
                }
              : null,
            description: report.description || "No description provided",
            gameMode: "Unknown Mode", // Default value
            matchName: null, // Default value
            createdAt: report.createdAt
              ? new Date(report.createdAt).toLocaleString()
              : "Unknown Date",
            evidence: Array.isArray(report.evidence_files)
              ? report.evidence_files.filter((file) => file !== null)
              : [],
            assignedTo: report.assigned_admin || null,
            assignedBy: report.assigned_by || null,
            assignedAt: report.assigned_at
              ? new Date(report.assigned_at).toLocaleString()
              : null,
            urgency: report.status === "pending" ? "normal" : "low", // Default urgency
            location: "Global", // Default location
            upvotes: Math.floor(Math.random() * 50), // Random for now
            comments: Math.floor(Math.random() * 20), // Random for now
            views: Math.floor(Math.random() * 200), // Random for now
          };
        })
        .filter(Boolean); // Remove any null entries
      setUserReports(transformedReports);
      // Calculate and set category counts with null check
      const counts = calculateCategoryCounts(transformedReports);
      setCategoryCounts(counts);
      showSnackbar("Reports loaded successfully", "success");
    } catch (error) {
      console.error("Error fetching reports:", error);
      setApiError(error.message);
      showSnackbar("Failed to load reports", "error");
      // Set empty state on error
      setUserReports([]);
      setCategoryCounts({ all: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin users from API
  const fetchAdmins = async () => {
    try {
      const response = await fetch(ADMIN_API_URL, {
        headers: {
          Authorization: `Bearer ${ADMIN_AUTH_TOKEN}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data)) {
        throw new Error("Invalid admin data format received from API");
      }
      const transformedAdmins = data.map((admin) => ({
        id: admin.id.toString(),
        name: admin.name,
        role: admin.role,
        avatar: `/placeholder.svg?height=32&width=32&text=${admin.name
          .slice(0, 2)
          .toUpperCase()}`,
        status: admin.sessions && admin.sessions.length > 0 ? "online" : "away", // Derive status from sessions
        workload: Math.floor(Math.random() * 20), // Placeholder, as API doesn't provide
        rating: (Math.random() * (5 - 4) + 4).toFixed(1), // Placeholder, random rating between 4.0 and 5.0
      }));
      setFetchedAdminUsers(transformedAdmins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setApiError(`Failed to load admins: ${error.message}`);
      showSnackbar("Failed to load admin users", "error");
    }
  };

  // Load reports and admins on component mount
  useEffect(() => {
    fetchReports();
    fetchAdmins();
  }, []);

  // Update category counts when reports change
  useEffect(() => {
    if (userReports.length > 0) {
      const counts = calculateCategoryCounts(userReports);
      setCategoryCounts(counts);
    }
  }, [userReports]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      setAnchorEl(null);
      setBulkActionAnchor(null);
    };
  }, []);

  const getStatusColor = (status) => {
    const statusObj = reportStatuses.find((s) => s.value === status);
    return statusObj?.color || "default";
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find((p) => p.value === priority);
    return priorityObj?.color || "default";
  };

  const getCategoryIcon = (category) => {
    const categoryObj = reportCategories.find((c) => c.value === category);
    return categoryObj?.icon || ReportProblem;
  };

  const getAssignedAdmin = (adminName) => {
    return fetchedAdminUsers.find((admin) => admin.name === adminName);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
    // Update view count locally
    setUserReports((prev) =>
      prev.map((r) => (r.id === report.id ? { ...r, views: r.views + 1 } : r))
    );
  };

  const handleAssignReport = async (reportId, adminName) => {
    const report = userReports.find((r) => r.id === reportId);
    if (!report) {
      showSnackbar("Report not found", "error");
      return;
    }
    setActionLoading((prev) => ({ ...prev, [reportId]: true }));
    try {
      const response = await fetch(
        `${API_BASE_URL}/reports/${report.originalId}/assign`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ admin_name: adminName }), // Match backend expected field name
        }
      );

      if (!response.ok) {
        const errorText = await response.text(); // Get error message from backend
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const updatedReportData = await response.json(); // This is the updated report object

      // Transform the updated report data to match frontend structure
      const transformedUpdatedReport = {
        id: `RPT-${(updatedReportData.id || 0).toString().padStart(3, "0")}`,
        originalId: updatedReportData.id || 0,
        title: updatedReportData.title || "Untitled Report",
        category: (updatedReportData.category || "other").toLowerCase(),
        status: updatedReportData.status || "assigned",
        priority: "medium", // Default priority, as it's not in the provided report API response
        reportedBy: {
          username: updatedReportData.user_name || "Unknown User",
          id: updatedReportData.user_id || 0,
          avatar: `/placeholder.svg?height=40&width=40&text=${(
            updatedReportData.user_name || "UN"
          )
            .slice(0, 2)
            .toUpperCase()}`,
          reputation: 4.0,
        },
        reportedUser: updatedReportData.reported_user_id
          ? {
              username: updatedReportData.reported_user_name || "Unknown User",
              id: updatedReportData.reported_user_id,
              avatar: `/placeholder.svg?height=40&width=40&text=${(
                updatedReportData.reported_user_name || "UN"
              )
                .slice(0, 2)
                .toUpperCase()}`,
              reputation: 2.5,
            }
          : null,
        description: updatedReportData.description || "No description provided",
        gameMode: "Unknown Mode", // Default value
        matchName: null, // Default value
        createdAt: updatedReportData.createdAt
          ? new Date(updatedReportData.createdAt).toLocaleString()
          : "Unknown Date",
        evidence: Array.isArray(updatedReportData.evidence_files)
          ? updatedReportData.evidence_files.filter((file) => file !== null)
          : [],
        assignedTo: updatedReportData.assigned_admin || adminName,
        assignedBy: updatedReportData.assigned_by || null, // Assuming backend returns this, otherwise it will be null
        assignedAt: new Date().toLocaleString(), // Current timestamp for assignment
        urgency: updatedReportData.status === "pending" ? "normal" : "low", // Default urgency
        location: "Global", // Default location
        upvotes: Math.floor(Math.random() * 50), // Random for now
        comments: Math.floor(Math.random() * 20), // Random for now
        views: Math.floor(Math.random() * 200), // Random for now
      };

      // Update local state with the transformed data
      setUserReports((prev) =>
        prev.map((r) => (r.id === reportId ? transformedUpdatedReport : r))
      );
      // showSnackbar(`Assigned to ${transformedUpdatedReport.assignedTo}`, "success")
      if (adminName) {
        showSnackbar(`Assigned to ${adminName}`, "success");
      } else {
        showSnackbar("Report unassigned successfully", "success");
      }
    } catch (error) {
      console.error("Assignment error:", error);
      showSnackbar(`Failed to assign: ${error.message}`, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
      setAssignDialogOpen(false);
    }
  };

  const handleAction = async (action, reportId) => {
    const report = userReports.find((r) => r.id === reportId);
    if (!report) return;
    setActionLoading((prev) => ({ ...prev, [reportId]: true }));
    try {
      const endpoint = action === "resolve" ? "resolve" : "reject";
      const response = await fetch(
        `${API_BASE_URL}/reports/${report.originalId}/${endpoint}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Update local state
      setUserReports((prev) =>
        prev.map((r) =>
          r.id === reportId
            ? { ...r, status: action === "resolve" ? "resolved" : "rejected" }
            : r
        )
      );
      const actionText = action === "resolve" ? "resolved" : "rejected";
      showSnackbar(`Report ${reportId} has been ${actionText}`, "success");
    } catch (error) {
      console.error(`Error ${action}ing report:`, error);
      showSnackbar(`Failed to ${action} report`, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
      handleMenuClose(); // Close action menu if opened from there
      setDialogOpen(false); // Close report detail dialog
    }
  };

  const handleResetFilters = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSearchQuery("");
    showSnackbar("Filters have been reset", "info");
    setLoading(false);
  };

  const handleRefreshReports = () => {
    fetchReports();
    fetchAdmins(); // Also refresh admin data
  };

  const handleMenuClick = (event, reportId) => {
    try {
      event.preventDefault();
      event.stopPropagation();
      setAnchorEl(event.currentTarget);
      setMenuReportId(reportId);
    } catch (error) {
      console.error("Menu click error:", error);
    }
  };

  const handleMenuClose = () => {
    try {
      setAnchorEl(null);
      setMenuReportId(null);
    } catch (error) {
      console.error("Menu close error:", error);
    }
  };

  const handleBookmark = (reportId) => {
    setBookmarkedReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
        showSnackbar("Report removed from bookmarks", "info");
      } else {
        newSet.add(reportId);
        showSnackbar("Report bookmarked", "success");
      }
      return newSet;
    });
  };

  const handleSelectReport = (reportId) => {
    setSelectedReports((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleBulkAction = (action) => {
    const count = selectedReports.size;
    showSnackbar(`${action} applied to ${count} reports`, "success");
    setSelectedReports(new Set());
    setBulkActionAnchor(null);
  };

  const handleBulkActionClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setBulkActionAnchor(event.currentTarget);
  };

  const handleBulkActionClose = () => {
    setBulkActionAnchor(null);
  };

  const filteredReports = userReports.filter((report) => {
    const categoryMatch =
      selectedCategory === "all" ||
      report.category === selectedCategory.toLowerCase();
    const statusMatch =
      selectedStatus === "all" || report.status === selectedStatus;
    const priorityMatch =
      selectedPriority === "all" || report.priority === selectedPriority;
    const searchMatch =
      searchQuery === "" ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedBy.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (report.reportedUser &&
        report.reportedUser.username
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && statusMatch && priorityMatch && searchMatch;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case "upvotes":
        return b.upvotes - a.upvotes;
      default:
        return 0;
    }
  });

  // Get updated categories with current counts
  const updatedCategories = getUpdatedCategories();

  return (
    <ErrorBoundary>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f5f5",
          py: 3,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: { xs: 2, sm: 4 } }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: { xs: "center", sm: "flex-start" },
                gap: { xs: 2, sm: 3 },
                mb: 3,
                flexWrap: "wrap",
              }}
            >
              {/* Icon Box - Mobile Responsive */}
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  bgcolor: "primary.main",
                  borderRadius: 2,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  mx: { xs: 0, sm: "auto", md: 0 },
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                }}
              >
                <ReportProblem sx={{ fontSize: { xs: 24, sm: 32 } }} />
              </Box>

              {/* Content - Mobile Optimized */}
              <Box
                sx={{
                  flex: 1,
                  minWidth: "250px",
                  textAlign: { xs: "center", sm: "left" },
                  width: { xs: "100%", sm: "auto" },
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight={600}
                  color="text.primary"
                  sx={{
                    mb: 1,
                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
                    lineHeight: { xs: 1.2, sm: 1.167 },
                  }}
                >
                  User Reports Center
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.9rem", sm: "1rem" },
                    mb: { xs: 2, sm: 0 },
                  }}
                >
                  Manage and review user reports efficiently
                </Typography>

                {/* Actions - Mobile Stack Layout */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: { xs: "stretch", sm: "center" },
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 2 },
                    mt: { xs: 2, sm: 1 },
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={
                      loading ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Refresh sx={{ fontSize: { xs: 16, sm: 18 } }} />
                      )
                    }
                    onClick={handleRefreshReports}
                    disabled={loading}
                    sx={{
                      fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      px: { xs: 2, sm: 2 },
                      py: { xs: 1, sm: 0.5 },
                      alignSelf: { xs: "center", sm: "flex-start" },
                      minWidth: { xs: 120, sm: "auto" },
                    }}
                  >
                    Refresh
                  </Button>

                  {apiError && (
                    <Alert
                      severity="error"
                      sx={{
                        py: 0,
                        flex: 1,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        "& .MuiAlert-message": {
                          fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        },
                      }}
                    >
                      API Error: {apiError}
                    </Alert>
                  )}
                </Box>

                {/* Stats - Mobile Responsive Grid */}
                <Grid
                  container
                  spacing={{ xs: 1, sm: 2 }}
                  sx={{ mt: { xs: 2, sm: 2 } }}
                >
                  <Grid item xs={6} sm={6} md={3}>
                    <Card
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        textAlign: "center",
                        height: { xs: 80, sm: "auto" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="primary.main"
                        fontWeight={600}
                        sx={{
                          fontSize: { xs: "1.2rem", sm: "1.5rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {categoryCounts?.all || 0}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          mt: { xs: 0.25, sm: 0.5 },
                        }}
                      >
                        Total Reports
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={6} sm={6} md={3}>
                    <Card
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        textAlign: "center",
                        height: { xs: 80, sm: "auto" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="warning.main"
                        fontWeight={600}
                        sx={{
                          fontSize: { xs: "1.2rem", sm: "1.5rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {
                          userReports.filter((r) => r.status === "pending")
                            .length
                        }
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          mt: { xs: 0.25, sm: 0.5 },
                        }}
                      >
                        Pending
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={6} sm={6} md={3}>
                    <Card
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        textAlign: "center",
                        height: { xs: 80, sm: "auto" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="success.main"
                        fontWeight={600}
                        sx={{
                          fontSize: { xs: "1.2rem", sm: "1.5rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {
                          fetchedAdminUsers.filter((a) => a.status === "online")
                            .length
                        }
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          mt: { xs: 0.25, sm: 0.5 },
                        }}
                      >
                        Admins Online
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid item xs={6} sm={6} md={3}>
                    <Card
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        textAlign: "center",
                        height: { xs: 80, sm: "auto" },
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        variant="h5"
                        color="info.main"
                        fontWeight={600}
                        sx={{
                          fontSize: { xs: "1.2rem", sm: "1.5rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {
                          userReports.filter((r) => r.status === "assigned")
                            .length
                        }
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          fontSize: { xs: "0.7rem", sm: "0.875rem" },
                          mt: { xs: 0.25, sm: 0.5 },
                        }}
                      >
                        Assigned
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {/*  Filters */}
            <Card sx={{ boxShadow: 1 }}>
              <CardContent sx={{ pb: { xs: 1, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    mb: filtersExpanded ? 2 : 0,
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: 1, sm: 0 },
                  }}
                  onClick={() => setFiltersExpanded(!filtersExpanded)}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontSize: { xs: "1.1rem", sm: "1.25rem" },
                    }}
                  >
                    <FilterList
                      color="primary"
                      sx={{ fontSize: { xs: 20, sm: 24 } }}
                    />
                    Filters & Search
                    {loading && (
                      <CircularProgress
                        size={{ xs: 16, sm: 20 }}
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: { xs: 1, sm: 2 },
                    }}
                  >
                    <Chip
                      label={`${filteredReports.length} results`}
                      color="primary"
                      size="small"
                      sx={{
                        fontSize: { xs: "0.7rem", sm: "0.75rem" },
                        height: { xs: 20, sm: 24 },
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                      }}
                    >
                      {filtersExpanded ? (
                        <ExpandLess sx={{ fontSize: { xs: 18, sm: 24 } }} />
                      ) : (
                        <ExpandMore sx={{ fontSize: { xs: 18, sm: 24 } }} />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                {filtersExpanded && (
                  <Box>
                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                      {/* Search Field - Full width on mobile */}
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Search Reports"
                          placeholder="Search by title, ID, or username..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search
                                  color="primary"
                                  sx={{ fontSize: { xs: 16, sm: 20 } }}
                                />
                              </InputAdornment>
                            ),
                          }}
                          size="small"
                          sx={{
                            "& .MuiInputBase-input": {
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                            },
                          }}
                        />
                      </Grid>

                      {/* Filter Dropdowns - Stack on mobile */}
                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel
                            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          >
                            Category
                          </InputLabel>
                          <Select
                            value={selectedCategory}
                            label="Category"
                            onChange={(e) =>
                              setSelectedCategory(e.target.value)
                            }
                            sx={{
                              "& .MuiSelect-select": {
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                              },
                            }}
                          >
                            {updatedCategories.map((category) => (
                              <MenuItem
                                key={category.value}
                                value={category.value}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  {category.icon && (
                                    <category.icon
                                      sx={{ fontSize: { xs: 14, sm: 16 } }}
                                    />
                                  )}
                                  <Typography
                                    sx={{
                                      fontSize: {
                                        xs: "0.8rem",
                                        sm: "0.875rem",
                                      },
                                    }}
                                  >
                                    {category.label} ({category.count})
                                  </Typography>
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel
                            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          >
                            Status
                          </InputLabel>
                          <Select
                            value={selectedStatus}
                            label="Status"
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            sx={{
                              "& .MuiSelect-select": {
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                              },
                            }}
                          >
                            {reportStatuses.map((status) => (
                              <MenuItem
                                key={status.value}
                                value={status.value}
                                sx={{
                                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                }}
                              >
                                {status.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel
                            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          >
                            Priority
                          </InputLabel>
                          <Select
                            value={selectedPriority}
                            label="Priority"
                            onChange={(e) =>
                              setSelectedPriority(e.target.value)
                            }
                            sx={{
                              "& .MuiSelect-select": {
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                              },
                            }}
                          >
                            {priorities.map((priority) => (
                              <MenuItem
                                key={priority.value}
                                value={priority.value}
                                sx={{
                                  fontSize: { xs: "0.8rem", sm: "0.875rem" },
                                }}
                              >
                                {priority.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={6} sm={4} md={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={
                            loading ? (
                              <CircularProgress size={16} />
                            ) : (
                              <Refresh sx={{ fontSize: { xs: 16, sm: 18 } }} />
                            )
                          }
                          onClick={handleResetFilters}
                          disabled={loading}
                          sx={{
                            height: "40px",
                            fontSize: { xs: "0.8rem", sm: "0.875rem" },
                            "& .MuiButton-startIcon": {
                              marginRight: { xs: 0.5, sm: 1 },
                            },
                          }}
                        >
                          <Box
                            component="span"
                            sx={{ display: { xs: "none", sm: "inline" } }}
                          >
                            Reset
                          </Box>
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Bottom Controls - Mobile Responsive */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: { xs: "flex-start", sm: "center" },
                        mt: 2,
                        flexDirection: { xs: "column", sm: "row" },
                        gap: { xs: 1, sm: 0 },
                      }}
                    >
                      <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
                        <FormControl
                          size="small"
                          sx={{ minWidth: { xs: 100, sm: 120 } }}
                        >
                          <InputLabel
                            sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}
                          >
                            Sort By
                          </InputLabel>
                          <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value)}
                            sx={{
                              "& .MuiSelect-select": {
                                fontSize: { xs: "0.875rem", sm: "1rem" },
                              },
                            }}
                          >
                            <MenuItem
                              value="newest"
                              sx={{
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              }}
                            >
                              Newest First
                            </MenuItem>
                            <MenuItem
                              value="oldest"
                              sx={{
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              }}
                            >
                              Oldest First
                            </MenuItem>
                            <MenuItem
                              value="priority"
                              sx={{
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              }}
                            >
                              High Priority
                            </MenuItem>
                            <MenuItem
                              value="upvotes"
                              sx={{
                                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                              }}
                            >
                              Most Upvoted
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      {selectedReports.size > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 1, sm: 2 },
                            alignSelf: { xs: "stretch", sm: "auto" },
                          }}
                        >
                          <Typography
                            variant="body2"
                            color="primary.main"
                            sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                          >
                            {selectedReports.size} selected
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={handleBulkActionClick}
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              px: { xs: 1, sm: 2 },
                              flex: { xs: 1, sm: "none" },
                            }}
                          >
                            Bulk Actions
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Mobile Responsive Categories Overview */}
            <Grid container spacing={{ xs: 1, sm: 2 }}>
              {updatedCategories.map((category) => {
                const IconComponent = category.icon || ReportProblem;
                const isSelected = selectedCategory === category.value;
                return (
                  <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                    lg={12 / 7}
                    key={category.value}
                  >
                    <Card
                      sx={{
                        cursor: "pointer",
                        height: "100%",
                        bgcolor: isSelected ? "primary.main" : "white",
                        color: isSelected ? "white" : "text.primary",
                        border: isSelected ? "2px solid" : "1px solid",
                        borderColor: isSelected ? "primary.main" : "divider",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: { xs: "none", sm: "translateY(-2px)" },
                          boxShadow: { xs: 1, sm: 2 },
                        },
                        "&:active": {
                          transform: {
                            xs: "scale(0.95)",
                            sm: "translateY(-2px)",
                          },
                        },
                      }}
                      onClick={() => setSelectedCategory(category.value)}
                    >
                      <CardContent
                        sx={{
                          textAlign: "center",
                          py: { xs: 1, sm: 2 },
                          px: { xs: 1, sm: 2 },
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: { xs: 0.5, sm: 1 },
                          }}
                        >
                          <Box
                            sx={{
                              p: { xs: 1, sm: 1.5 },
                              borderRadius: "50%",
                              bgcolor: isSelected
                                ? "rgba(255, 255, 255, 0.2)"
                                : "grey.100",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: { xs: 36, sm: 48 },
                              height: { xs: 36, sm: 48 },
                            }}
                          >
                            <IconComponent
                              sx={{
                                fontSize: { xs: 18, sm: 24 },
                                color: isSelected ? "white" : "primary.main",
                              }}
                            />
                          </Box>
                          <Typography
                            variant="h5"
                            fontWeight="600"
                            sx={{
                              fontSize: { xs: "1.2rem", sm: "1.5rem" },
                              lineHeight: 1.2,
                            }}
                          >
                            {category.count}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              opacity: isSelected ? 0.9 : 0.7,
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              lineHeight: 1.2,
                              textAlign: "center",
                            }}
                          >
                            {category.label}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
            {/* Reports List */}
            <Card sx={{ boxShadow: 1 }}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Description color="primary" />
                    Reports ({sortedReports.length})
                    {sortedReports.some((r) => r.urgency === "critical") && (
                      <Badge badgeContent="!" color="error">
                        <NotificationsActive color="error" />
                      </Badge>
                    )}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <AvatarGroup
                      max={4}
                      sx={{ "& .MuiAvatar-root": { width: 28, height: 28 } }}
                    >
                      {fetchedAdminUsers
                        .filter((admin) => admin.status === "online")
                        .map((admin) => (
                          <Tooltip
                            key={admin.id}
                            title={admin.name + " - " + admin.role}
                          >
                            <Avatar
                              src={admin.avatar}
                              sx={{ border: "2px solid #4caf50" }}
                            >
                              {admin.name.slice(0, 2)}
                            </Avatar>
                          </Tooltip>
                        ))}
                    </AvatarGroup>
                  </Box>
                </Box>
                {loading ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    {[...Array(3)].map((_, index) => (
                      <Card key={index} sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <Skeleton variant="circular" width={40} height={40} />
                          <Box sx={{ flex: 1 }}>
                            <Skeleton variant="text" width="60%" height={24} />
                            <Skeleton variant="text" width="40%" height={20} />
                            <Skeleton variant="text" width="80%" height={16} />
                          </Box>
                        </Box>
                      </Card>
                    ))}
                  </Box>
                ) : sortedReports.length === 0 ? (
                  <Paper sx={{ p: 4, textAlign: "center", bgcolor: "grey.50" }}>
                    <Warning
                      sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      No reports found
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      No reports match your current filters.
                    </Typography>
                    <Button variant="contained" onClick={handleResetFilters}>
                      Clear filters
                    </Button>
                  </Paper>
                ) : (
                  <Box sx={{ maxHeight: 600, overflow: "auto" }}>
                    <Stack spacing={2}>
                      {sortedReports.map((report) => {
                        const IconComponent = getCategoryIcon(report.category);
                        const assignedAdmin = getAssignedAdmin(
                          report.assignedTo
                        );
                        const isLoading = actionLoading[report.id];
                        const isBookmarked = bookmarkedReports.has(report.id);
                        const isSelected = selectedReports.has(report.id);
                        return (
                          <Card
                            key={report.id}
                            sx={{
                              border: isSelected ? "2px solid" : "1px solid",
                              borderColor: isSelected
                                ? "primary.main"
                                : "divider",
                              bgcolor: isSelected ? "primary.50" : "white",
                              position: "relative",
                              "&:hover": {
                                boxShadow: 2,
                              },
                            }}
                          >
                            <CardContent sx={{ position: "relative" }}>
                              {isLoading && (
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: "rgba(255, 255, 255, 0.8)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    zIndex: 10,
                                  }}
                                >
                                  <CircularProgress />
                                </Box>
                              )}
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 2,
                                }}
                              >
                                {/* Selection Checkbox */}
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    border: "2px solid",
                                    borderColor: isSelected
                                      ? "primary.main"
                                      : "divider",
                                    borderRadius: 1,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    bgcolor: isSelected
                                      ? "primary.main"
                                      : "transparent",
                                    mt: 0.5,
                                  }}
                                  onClick={() => handleSelectReport(report.id)}
                                >
                                  {isSelected && (
                                    <CheckCircle
                                      sx={{ fontSize: 16, color: "white" }}
                                    />
                                  )}
                                </Box>
                                {/* Report Icon */}
                                <Box
                                  sx={{
                                    p: 1,
                                    borderRadius: "50%",
                                    bgcolor: "primary.main",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  <IconComponent
                                    sx={{ fontSize: 18, color: "white" }}
                                  />
                                </Box>
                                {/* Mobile Responsive Report Content */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: {
                                        xs: "flex-start",
                                        sm: "center",
                                      },
                                      flexDirection: {
                                        xs: "column",
                                        sm: "row",
                                      },
                                      gap: 1,
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 600,
                                        flexGrow: 1,
                                        fontSize: { xs: "1rem", sm: "1.25rem" },
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {report.title}
                                    </Typography>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        alignSelf: {
                                          xs: "flex-start",
                                          sm: "auto",
                                        },
                                      }}
                                    >
                                      {report.urgency === "critical" && (
                                        <Chip
                                          label="CRITICAL"
                                          size="small"
                                          color="error"
                                          sx={{
                                            fontSize: {
                                              xs: "0.65rem",
                                              sm: "0.75rem",
                                            },
                                            height: { xs: 20, sm: 24 },
                                          }}
                                        />
                                      )}
                                      <Chip
                                        label={report.id}
                                        size="small"
                                        variant="outlined"
                                        color="primary"
                                        sx={{
                                          fontSize: {
                                            xs: "0.65rem",
                                            sm: "0.75rem",
                                          },
                                          height: { xs: 20, sm: 24 },
                                        }}
                                      />
                                    </Box>
                                  </Box>

                                  {/* Status Chips - Mobile Optimized */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      flexWrap: "wrap",
                                      gap: { xs: 0.5, sm: 1 },
                                      mb: 1,
                                    }}
                                  >
                                    <Chip
                                      label={
                                        report.status === "assigned" &&
                                        report.assignedTo
                                          ? {
                                              xs: report.assignedTo,
                                              sm: `Assigned to ${report.assignedTo}`,
                                            }[{ xs: true, sm: false }] ||
                                            `Assigned to ${report.assignedTo}`
                                          : report.status.replace("-", " ")
                                      }
                                      size="small"
                                      color={getStatusColor(report.status)}
                                      icon={
                                        report.status === "assigned" ? (
                                          <PlayArrow
                                            sx={{
                                              fontSize: { xs: 12, sm: 16 },
                                            }}
                                          />
                                        ) : report.status === "resolved" ? (
                                          <CheckCircle
                                            sx={{
                                              fontSize: { xs: 12, sm: 16 },
                                            }}
                                          />
                                        ) : report.status === "pending" ? (
                                          <Schedule
                                            sx={{
                                              fontSize: { xs: 12, sm: 16 },
                                            }}
                                          />
                                        ) : (
                                          <Pause
                                            sx={{
                                              fontSize: { xs: 12, sm: 16 },
                                            }}
                                          />
                                        )
                                      }
                                      sx={{
                                        fontSize: {
                                          xs: "0.65rem",
                                          sm: "0.75rem",
                                        },
                                        height: { xs: 20, sm: 24 },
                                        "& .MuiChip-label": {
                                          px: { xs: 0.5, sm: 1 },
                                        },
                                      }}
                                    />
                                    <Chip
                                      label={`${report.priority} priority`}
                                      size="small"
                                      color={getPriorityColor(report.priority)}
                                      variant="outlined"
                                      sx={{
                                        fontSize: {
                                          xs: "0.65rem",
                                          sm: "0.75rem",
                                        },
                                        height: { xs: 20, sm: 24 },
                                        "& .MuiChip-label": {
                                          px: { xs: 0.5, sm: 1 },
                                        },
                                      }}
                                    />
                                    <Chip
                                      label={report.category}
                                      size="small"
                                      color="secondary"
                                      sx={{
                                        fontSize: {
                                          xs: "0.65rem",
                                          sm: "0.75rem",
                                        },
                                        height: { xs: 20, sm: 24 },
                                        "& .MuiChip-label": {
                                          px: { xs: 0.5, sm: 1 },
                                        },
                                      }}
                                    />
                                    {report.location && (
                                      <Chip
                                        label={report.location}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          fontSize: {
                                            xs: "0.65rem",
                                            sm: "0.75rem",
                                          },
                                          height: { xs: 20, sm: 24 },
                                          "& .MuiChip-label": {
                                            px: { xs: 0.5, sm: 1 },
                                          },
                                        }}
                                      />
                                    )}
                                  </Box>

                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      mb: 2,
                                      display: "-webkit-box",
                                      WebkitLineClamp: { xs: 3, sm: 2 },
                                      WebkitBoxOrient: "vertical",
                                      overflow: "hidden",
                                      fontSize: {
                                        xs: "0.8rem",
                                        sm: "0.875rem",
                                      },
                                      lineHeight: { xs: 1.3, sm: 1.43 },
                                    }}
                                  >
                                    {report.description}
                                  </Typography>

                                  {/* User Information - Mobile Stack Layout */}
                                  <Box sx={{ mb: 1 }}>
                                    <Grid container spacing={{ xs: 1, sm: 2 }}>
                                      {/* Reporter */}
                                      <Grid item xs={12} sm={6}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <Avatar
                                            src={report.reportedBy.avatar}
                                            sx={{
                                              width: { xs: 16, sm: 20 },
                                              height: { xs: 16, sm: 20 },
                                              fontSize: {
                                                xs: "0.6rem",
                                                sm: "0.75rem",
                                              },
                                            }}
                                          >
                                            {report.reportedBy.username.slice(
                                              0,
                                              2
                                            )}
                                          </Avatar>
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontSize: {
                                                xs: "0.7rem",
                                                sm: "0.75rem",
                                              },
                                            }}
                                          >
                                            <strong>
                                              {report.reportedBy.username}
                                            </strong>
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      {/* Reported User */}
                                      {report.reportedUser && (
                                        <Grid item xs={12} sm={6}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <Avatar
                                              src={report.reportedUser.avatar}
                                              sx={{
                                                width: { xs: 16, sm: 20 },
                                                height: { xs: 16, sm: 20 },
                                                fontSize: {
                                                  xs: "0.6rem",
                                                  sm: "0.75rem",
                                                },
                                              }}
                                            >
                                              {report.reportedUser.username.slice(
                                                0,
                                                2
                                              )}
                                            </Avatar>
                                            <Typography
                                              variant="caption"
                                              color="error.main"
                                              sx={{
                                                fontSize: {
                                                  xs: "0.7rem",
                                                  sm: "0.75rem",
                                                },
                                              }}
                                            >
                                              <strong>
                                                {report.reportedUser.username}
                                              </strong>
                                            </Typography>
                                          </Box>
                                        </Grid>
                                      )}

                                      {/* Created At */}
                                      <Grid item xs={12} sm={6}>
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                          }}
                                        >
                                          <AccessTime
                                            sx={{
                                              fontSize: { xs: 12, sm: 14 },
                                              color: "text.secondary",
                                            }}
                                          />
                                          <Typography
                                            variant="caption"
                                            sx={{
                                              fontSize: {
                                                xs: "0.7rem",
                                                sm: "0.75rem",
                                              },
                                            }}
                                          >
                                            {report.createdAt}
                                          </Typography>
                                        </Box>
                                      </Grid>

                                      {/* Assignment Info */}
                                      {report.assignedTo && (
                                        <Grid item xs={12} sm={6}>
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              gap: 1,
                                            }}
                                          >
                                            <People
                                              sx={{
                                                fontSize: { xs: 12, sm: 14 },
                                                color: "text.secondary",
                                              }}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  fontSize: {
                                                    xs: "0.7rem",
                                                    sm: "0.75rem",
                                                  },
                                                  display: "block",
                                                }}
                                              >
                                                <strong>
                                                  {/* Show shorter text on mobile */}
                                                  <Box
                                                    component="span"
                                                    sx={{
                                                      display: {
                                                        xs: "inline",
                                                        sm: "none",
                                                      },
                                                    }}
                                                  >
                                                    {report.assignedTo}
                                                  </Box>
                                                  <Box
                                                    component="span"
                                                    sx={{
                                                      display: {
                                                        xs: "none",
                                                        sm: "inline",
                                                      },
                                                    }}
                                                  >
                                                    Assigned to:{" "}
                                                    {report.assignedTo}
                                                  </Box>
                                                </strong>
                                              </Typography>
                                              {report.assignedBy && (
                                                <Typography
                                                  variant="caption"
                                                  color="text.secondary"
                                                  sx={{
                                                    display: "block",
                                                    fontSize: {
                                                      xs: "0.6rem",
                                                      sm: "0.7rem",
                                                    },
                                                    lineHeight: 1.2,
                                                  }}
                                                >
                                                  by {report.assignedBy}
                                                  {report.assignedAt &&
                                                    ` • ${report.assignedAt}`}
                                                </Typography>
                                              )}
                                            </Box>
                                          </Box>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </Box>

                                  {/* Evidence Files Count */}
                                  {report.evidence &&
                                    report.evidence.length > 0 && (
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 0.5,
                                          mb: 1,
                                        }}
                                      >
                                        <AttachFile
                                          sx={{
                                            fontSize: { xs: 12, sm: 14 },
                                            color: "text.secondary",
                                          }}
                                        />
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{
                                            fontSize: {
                                              xs: "0.7rem",
                                              sm: "0.75rem",
                                            },
                                          }}
                                        >
                                          {report.evidence.length} evidence
                                          files
                                        </Typography>
                                      </Box>
                                    )}
                                </Box>

                                {/* Action Buttons - Mobile Optimized */}
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexDirection: { xs: "row", sm: "column" },
                                    gap: { xs: 0.5, sm: 1 },
                                    flexShrink: 0,
                                    alignItems: { xs: "center", sm: "stretch" },
                                  }}
                                >
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={
                                      <Visibility
                                        sx={{ fontSize: { xs: 14, sm: 18 } }}
                                      />
                                    }
                                    onClick={() => handleViewReport(report)}
                                    sx={{
                                      fontSize: {
                                        xs: "0.7rem",
                                        sm: "0.875rem",
                                      },
                                      minWidth: { xs: 60, sm: "auto" },
                                      px: { xs: 1, sm: 2 },
                                      "& .MuiButton-startIcon": {
                                        marginRight: { xs: 0.5, sm: 1 },
                                      },
                                    }}
                                  >
                                    <Box
                                      component="span"
                                      sx={{
                                        display: { xs: "none", sm: "inline" },
                                      }}
                                    >
                                      View
                                    </Box>
                                  </Button>

                                  <IconButton
                                    size="small"
                                    onClick={() => handleBookmark(report.id)}
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      color: isBookmarked
                                        ? "warning.main"
                                        : "text.secondary",
                                      width: { xs: 32, sm: 40 },
                                      height: { xs: 32, sm: 40 },
                                    }}
                                  >
                                    {isBookmarked ? (
                                      <Bookmark
                                        sx={{ fontSize: { xs: 14, sm: 18 } }}
                                      />
                                    ) : (
                                      <BookmarkBorder
                                        sx={{ fontSize: { xs: 14, sm: 18 } }}
                                      />
                                    )}
                                  </IconButton>

                                  <IconButton
                                    size="small"
                                    onClick={(e) =>
                                      handleMenuClick(e, report.id)
                                    }
                                    sx={{
                                      border: "1px solid",
                                      borderColor: "divider",
                                      width: { xs: 32, sm: 40 },
                                      height: { xs: 32, sm: 40 },
                                    }}
                                  >
                                    <MoreHoriz
                                      sx={{ fontSize: { xs: 14, sm: 18 } }}
                                    />
                                  </IconButton>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuList>
              <MenuItem
                onClick={() => {
                  const report = userReports.find((r) => r.id === menuReportId);
                  setReportToAssign(report);
                  setAssignDialogOpen(true);
                  handleMenuClose();
                }}
              >
                <ListItemIcon>
                  <People />
                </ListItemIcon>
                <ListItemText>Assign to Admin</ListItemText>
              </MenuItem>
              {userReports.find((r) => r.id === menuReportId)?.status ===
                "pending" && (
                <>
                  <Divider />
                  <MenuItem
                    onClick={() => handleAction("resolve", menuReportId)}
                  >
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText>Mark Resolved</ListItemText>
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleAction("reject", menuReportId)}
                  >
                    <ListItemIcon>
                      <Close color="error" />
                    </ListItemIcon>
                    <ListItemText>Reject Report</ListItemText>
                  </MenuItem>
                </>
              )}
            </MenuList>
          </Menu>
          {/* Bulk Actions Menu */}
          <Menu
            anchorEl={bulkActionAnchor}
            open={Boolean(bulkActionAnchor)}
            onClose={handleBulkActionClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuList>
              <MenuItem onClick={() => handleBulkAction("Assign")}>
                <ListItemIcon>
                  <People />
                </ListItemIcon>
                <ListItemText>Bulk Assign</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleBulkAction("Resolve")}>
                <ListItemIcon>
                  <CheckCircle />
                </ListItemIcon>
                <ListItemText>Bulk Resolve</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => handleBulkAction("Export")}>
                <ListItemIcon>
                  <Download />
                </ListItemIcon>
                <ListItemText>Export Selected</ListItemText>
              </MenuItem>
            </MenuList>
          </Menu>
          {/* Report Detail Dialog */}
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="md"
            fullWidth
            // Removed disableScrollLock, disableEnforceFocus, disableAutoFocus, disableRestoreFocus
          >
            {selectedReport && (
              <>
                <DialogTitle>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",
                      }}
                    >
                      <ReportProblem />
                      <Typography
                        variant="h6"
                        sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
                      >
                        {selectedReport.title}
                      </Typography>
                    </Box>
                    <IconButton
                      onClick={() => setDialogOpen(false)}
                      sx={{ alignSelf: { xs: "flex-end", sm: "center" } }}
                    >
                      <Close />
                    </IconButton>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    Report ID: {selectedReport.id} • Created:{" "}
                    {selectedReport.createdAt}
                  </Typography>
                </DialogTitle>

                <DialogContent>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {/* Description */}
                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight="bold"
                        gutterBottom
                      >
                        Description
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedReport.description}
                      </Typography>
                    </Box>

                    {/* Two-column layout on desktop, single column on mobile */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        {/* Report Details */}
                        ...
                      </Grid>

                      <Grid item xs={12} md={6}>
                        {/* Users Involved */}
                        ...
                      </Grid>
                    </Grid>

                    {/* Assignment History */}
                    {selectedReport.assignedTo && (
                      <Grid item xs={12}>
                        ...
                      </Grid>
                    )}

                    {/* Evidence Files */}
                    {selectedReport.evidence?.length > 0 && (
                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight="bold"
                          gutterBottom
                        >
                          Evidence Files
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {selectedReport.evidence.map((file, index) => (
                            <Chip
                              key={index}
                              label={`Evidence ${index + 1}`}
                              size="small"
                              variant="outlined"
                              icon={<AttachFile />}
                              onClick={() => window.open(file, "_blank")}
                              sx={{ cursor: "pointer" }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </DialogContent>

                <DialogActions
                  sx={{ flexWrap: "wrap", gap: 1, p: { xs: 1, sm: 2 } }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => setDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<People />}
                    onClick={() => {
                      setReportToAssign(selectedReport);
                      setAssignDialogOpen(true);
                    }}
                  >
                    Assign to Admin
                  </Button>
                  {selectedReport.status === "pending" && (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        onClick={() =>
                          handleAction("resolve", selectedReport.id)
                        }
                      >
                        Resolve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Close />}
                        onClick={() =>
                          handleAction("reject", selectedReport.id)
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </DialogActions>
              </>
            )}
          </Dialog>
          {/* Assignment Dialog */}
          <Dialog
            open={assignDialogOpen}
            onClose={() => setAssignDialogOpen(false)}
            maxWidth="sm"
            fullWidth
            // Removed disableScrollLock, disableEnforceFocus, disableAutoFocus, disableRestoreFocus
          >
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <People />
                Assign Report to Admin
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Select an admin to assign this report to for review and action.
              </Typography>
              {reportToAssign && (
                <Box sx={{ mt: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: "grey.50", mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {reportToAssign.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Report ID: {reportToAssign.id} • Priority:{" "}
                      {reportToAssign.priority}
                    </Typography>
                  </Paper>
                  <Typography variant="subtitle2" gutterBottom>
                    Available Admins
                  </Typography>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                  >
                    {fetchedAdminUsers.map((admin) => (
                      <Paper
                        key={admin.id}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "primary.50" },
                        }}
                        onClick={() =>
                          handleAssignReport(reportToAssign.id, admin.name)
                        }
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar src={admin.avatar}>
                            {admin.name.slice(0, 2)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              {admin.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {admin.role} • {admin.workload} active reports
                            </Typography>
                          </Box>
                          <Chip
                            label={admin.status}
                            size="small"
                            color={
                              admin.status === "online"
                                ? "success"
                                : admin.status === "busy"
                                ? "warning"
                                : "default"
                            }
                          />
                        </Box>
                      </Paper>
                    ))}
                    <Paper
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        "&:hover": { bgcolor: "error.50" },
                      }}
                      onClick={() =>
                        handleAssignReport(reportToAssign.id, null)
                      }
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Avatar sx={{ bgcolor: "grey.300" }}>
                          <PersonOff />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            Unassign Report
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Remove current assignment
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                variant="outlined"
                onClick={() => setAssignDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
          {/* Footer */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Report Management System:</strong> Efficiently manage and
              review user reports with advanced filtering and assignment
              capabilities. Connected to live API endpoints.
            </Typography>
          </Alert>
        </Container>
      </Box>
    </ErrorBoundary>
  );
}

                