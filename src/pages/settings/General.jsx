"use client";

import { useState, useEffect } from "react";


import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Chip,
  InputAdornment,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Settings as SettingsIcon,
  Business as BusinessIcon,
  Apps as AppsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useTheme, useMediaQuery } from "@mui/material";
import axiosInstance from "../../utils/axios";

export default function General() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState({
    leagueName: "",
    appName: "",
    supportEmail: "",
    supportPhone: "",
    timezone: "",
  });

  const [lastSaved, setLastSaved] = useState(new Date());
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get("/general-settings");
        const data = response.data;

        setFormData({
          leagueName: data.league_name || "",
          appName: data.app_name || "",
          supportEmail: data.support_email || "",
          supportPhone: data.support_phone || "",
          timezone: data.timezone || "",
        });

        setLastSaved(new Date(data.updatedAt || Date.now()));
        setFetchError("");
      } catch (error) {
        console.error("Error fetching settings:", error);
        setFetchError("Failed to load general settings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError("");

    try {
      // Prepare data in the format expected by the API
      const postData = {
        league_name: formData.leagueName,
        app_name: formData.appName,
        support_email: formData.supportEmail,
        support_phone: formData.supportPhone,
        timezone: formData.timezone,
      };

      // Make POST request to save settings
      const response = await axiosInstance.post("/general-settings",
        postData,
 
      );

      console.log("Settings saved successfully:", response.data);

      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setShowSuccessMessage(true);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save settings. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
  };

  const handleCloseErrorMessage = () => {
    setSaveError("");
  };

  const timezones = [
    "Eastern Time (ET)",
    "Central Time (CT)",
    "Mountain Time (MT)",
    "Pacific Time (PT)",
    "Alaska Time (AKT)",
    "Hawaii Time (HT)",
    "Greenwich Mean Time (GMT)",
    "Central European Time (CET)",
    "Japan Standard Time (JST)",
    "Australian Eastern Time (AET)",
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: "95%",
          mx: "auto",
        }}
      >
        <Card
          elevation={2}
          sx={{
            borderRadius: { xs: 2, sm: 3 },
            backgroundColor: "#ffffff",
            border: "1px solid #f0f0f0",
            mb: 3,
          }}
        >
          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SettingsIcon sx={{ fontSize: 24 }} color="primary" />
            </Box>
            <Box>
              <Typography
                variant={isMobile ? "h5" : "h4"}
                sx={{
                  fontWeight: 700,
                  color: "#1a1a1a",
                  mb: 0.5,
                }}
              >
                General Settings
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
              >
                Basic application configuration with manual and auto-save
                functionality
              </Typography>
            </Box>
          </CardContent>

          <CardContent sx={{ pt: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Chip
                icon={<SaveIcon />}
                label={`Last saved: ${lastSaved.toLocaleTimeString()}`}
                size="small"
                sx={{
                  backgroundColor: "#e3f2fd",
                  color: "#1a1a1a",
                  "& .MuiChip-icon": { color: "#1976d2" },
                }}
              />
              {hasUnsavedChanges && (
                <Chip
                  label="Unsaved changes"
                  size="small"
                  color="warning"
                  sx={{ color: "white" }}
                />
              )}
            </Box>
          </CardContent>
        </Card>

        <Card
          elevation={2}
          sx={{
            borderRadius: 3,
            backgroundColor: "#ffffff",
            border: "1px solid #f0f0f0",
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
            {isLoading ? (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={{ xs: 3, sm: 4, md: 5 }}>
                <Grid item xs={12}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <BusinessIcon color="primary" />
                      Application Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="League Name"
                    value={formData.leagueName}
                    onChange={(e) =>
                      handleInputChange("leagueName", e.target.value)
                    }
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="App Name"
                    value={formData.appName}
                    onChange={(e) =>
                      handleInputChange("appName", e.target.value)
                    }
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AppsIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <EmailIcon color="primary" />
                      Support Information
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Support Email"
                    type="email"
                    value={formData.supportEmail}
                    onChange={(e) =>
                      handleInputChange("supportEmail", e.target.value)
                    }
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Support Phone"
                    type="tel"
                    value={formData.supportPhone}
                    onChange={(e) =>
                      handleInputChange("supportPhone", e.target.value)
                    }
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 2, mb: 3 }}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 600,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <ScheduleIcon color="primary" />
                      System Configuration
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={formData.timezone}
                      onChange={(e) =>
                        handleInputChange("timezone", e.target.value)
                      }
                      label="Timezone"
                    >
                      {timezones.map((tz) => (
                        <MenuItem key={tz} value={tz}>
                          {tz}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      mt: 4,
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 2,
                    }}
                  >
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !hasUnsavedChanges}
                      startIcon={
                        isSaving ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      disableElevation
                      sx={{
                        background: "linear-gradient(90deg, #1e3a8a, #2563eb)",
                        color: "#ffffff",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 4,
                        py: 1.5,
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          background:
                            "linear-gradient(90deg, #1d4ed8, #3b82f6)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        },
                        "&:disabled": {
                          background: "#1A1A1A",
                          color: "#ffffff",
                          boxShadow: "none",
                        },
                      }}
                    >
                      {isSaving ? "Saving..." : "Save Settings"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {hasUnsavedChanges
              ? "You have unsaved changes. Click 'Save Settings' to save your changes."
              : "All changes have been saved successfully."}
          </Typography>
        </Box>

        {/* Success Message Snackbar */}
        <Snackbar
          open={showSuccessMessage}
          autoHideDuration={4000}
          onClose={handleCloseSuccessMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="success"
            variant="filled"
            icon={<CheckCircleIcon />}
            sx={{ width: "100%" }}
            onClose={handleCloseSuccessMessage}
          >
            Settings saved successfully!
          </Alert>
        </Snackbar>

        {/* Error Messages Snackbar */}
        <Snackbar
          open={!!fetchError || !!saveError}
          autoHideDuration={6000}
          onClose={() => {
            setFetchError("");
            setSaveError("");
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity="error"
            variant="filled"
            sx={{ width: "100%" }}
            onClose={() => {
              setFetchError("");
              setSaveError("");
            }}
          >
            {fetchError || saveError}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
