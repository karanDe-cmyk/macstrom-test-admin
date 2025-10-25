"use client"

import { useEffect, useState } from "react"
import axiosInstance from "../../utils/axios"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
  InputAdornment,
  Stack,
  useTheme,
  useMediaQuery,
  Snackbar,
} from "@mui/material"
import { Plug, ExternalLink, Eye, EyeOff, Save, AlertTriangle } from "lucide-react"

const Integration = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"))

  const [formData, setFormData] = useState({
    fcmServerKey: "",
    razorpayKeyId: "",
    razorpaySecret: "",
    slackWebhookUrl: "",
    maxmindLicenseKey: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    fcmServerKey: false,
    razorpayKeyId: false,
    razorpaySecret: false,
    slackWebhookUrl: false,
    maxmindLicenseKey: false,
  })

  const [snackbarOpen, setSnackbarOpen] = useState(false)

  useEffect(() => {
    const fetchIntegrationSettings = async () => {
      try {
        const res = await axiosInstance.get("/integrations")
        const settings = res.data.settings

        const newFormData = {
          fcmServerKey: "",
          razorpayKeyId: "",
          razorpaySecret: "",
          slackWebhookUrl: "",
          maxmindLicenseKey: "",
        }

        settings.forEach(({ provider, config }) => {
          if (!config) return
          switch (provider) {
            case "FCM":
              newFormData.fcmServerKey = config.serverKey || ""
              break
            case "Razorpay":
              newFormData.razorpayKeyId = config.keyId || ""
              newFormData.razorpaySecret = config.keySecret || ""
              break
            case "Slack":
              newFormData.slackWebhookUrl = config.webhookUrl || ""
              break
            case "MaxMind":
              newFormData.maxmindLicenseKey = config.licenseKey || ""
              break
            default:
              break
          }
        })

        setFormData(newFormData)
      } catch (error) {
        console.error("Failed to fetch integration settings:", error)
      }
    }

    fetchIntegrationSettings()
  }, [])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSaveSettings = async () => {
    const settings = []

    // Only add providers with non-empty values to reduce payload size
    if (formData.fcmServerKey.trim()) {
      settings.push({
        provider: "FCM",
        config: {
          serverKey: formData.fcmServerKey.trim(),
        },
      })
    }

    if (formData.razorpayKeyId.trim() || formData.razorpaySecret.trim()) {
      settings.push({
        provider: "Razorpay",
        config: {
          keyId: formData.razorpayKeyId.trim(),
          keySecret: formData.razorpaySecret.trim(),
        },
      })
    }

    if (formData.slackWebhookUrl.trim()) {
      settings.push({
        provider: "Slack",
        config: {
          webhookUrl: formData.slackWebhookUrl.trim(),
        },
      })
    }

    if (formData.maxmindLicenseKey.trim()) {
      settings.push({
        provider: "MaxMind",
        config: {
          licenseKey: formData.maxmindLicenseKey.trim(),
        },
      })
    }

    const payload = { settings }

    try {
      const res = await axiosInstance.post("/integrations", payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log("Saved:", res.data)
      setSnackbarOpen(true)
    } catch (err) {
      console.error("Failed to save integration settings:", err)
      alert("Error saving settings.")
    }
  }

  const IntegrationField = ({ label, field, placeholder }) => (
    <TextField
      fullWidth
      label={label}
      type={showPasswords[field] ? "text" : "password"}
      value={formData[field]}
      onChange={(e) => handleInputChange(field, e.target.value)}
      placeholder={placeholder}
      size="medium"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 1.5,
          backgroundColor: "#ffffff",
          fontFamily: "monospace",
          fontSize: "0.875rem",
          border: "1px solid #e5e7eb",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3b82f6",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#3b82f6",
            borderWidth: "1px",
          },
        },
        "& .MuiInputLabel-root": {
          fontSize: "0.875rem",
          fontWeight: 500,
          color: "#374151",
          "&.Mui-focused": {
            color: "#3b82f6",
          },
        },
        "& .MuiOutlinedInput-input": {
          padding: "12px 14px",
        },
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <Stack direction="row" spacing={0.5}>
              <IconButton
                size="small"
                onClick={() => togglePasswordVisibility(field)}
                sx={{
                  color: "#6b7280",
                  "&:hover": {
                    color: "#3b82f6",
                    backgroundColor: "#eff6ff",
                  },
                }}
              >
                {showPasswords[field] ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
              <IconButton
                size="small"
                sx={{
                  color: "#6b7280",
                  "&:hover": {
                    color: "#3b82f6",
                    backgroundColor: "#eff6ff",
                  },
                }}
              >
                <ExternalLink size={16} />
              </IconButton>
            </Stack>
          </InputAdornment>
        ),
      }}
    />
  )

  return (
    <Box sx={{ minHeight: "100vh", py: 3 }}>
      <Box sx={{ width: "95%", maxWidth: "95%", mx: "auto" }}>
        <Card
          elevation={0}
          sx={{
            mb: 3,
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#dbeafe",
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plug size={24} color="#3b82f6" />
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#111827", fontSize: "1.875rem", mb: 0.5 }}
                >
                  Third-Party Integrations
                </Typography>
                <Typography variant="body1" sx={{ color: "#6b7280", fontSize: "1rem" }}>
                  Configure API keys and webhooks (AES256 encrypted)
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card
          elevation={0}
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: 2,
            backgroundColor: "#ffffff",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} lg={6}>
                <Stack spacing={3}>
                  <IntegrationField label="FCM Server Key" field="fcmServerKey" placeholder="Enter FCM Server Key" />
                  <IntegrationField
                    label="Razorpay Secret"
                    field="razorpaySecret"
                    placeholder="Enter Razorpay Secret"
                  />
                  <IntegrationField
                    label="MaxMind License Key"
                    field="maxmindLicenseKey"
                    placeholder="Enter MaxMind License Key"
                  />
                </Stack>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Stack spacing={3}>
                  <IntegrationField
                    label="Razorpay Key ID"
                    field="razorpayKeyId"
                    placeholder="Enter Razorpay Key ID"
                  />
                  <IntegrationField
                    label="Slack Webhook URL"
                    field="slackWebhookUrl"
                    placeholder="Enter Slack Webhook URL"
                  />
                  <Box sx={{ minHeight: 56 }} />
                </Stack>
              </Grid>
            </Grid>

            <Alert
              severity="warning"
              icon={<AlertTriangle size={18} />}
              sx={{
                mb: 4,
                borderRadius: 1.5,
                backgroundColor: "#fffbeb",
                border: "1px solid #fbbf24",
                "& .MuiAlert-message": {
                  fontSize: "0.875rem",
                  color: "#92400e",
                },
                "& .MuiAlert-icon": {
                  color: "#f59e0b",
                },
              }}
            >
              All secrets are AES256 encrypted in the database and never returned in GET requests.
            </Alert>

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                variant="contained"
                startIcon={<Save size={18} />}
                onClick={handleSaveSettings}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  px: 4,
                  py: 1.5,
                  backgroundColor: "#1A1A1A",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#1A1A1A",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  },
                }}
              >
                Save Integration Settings
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message="Integration settings saved successfully!"
      />
    </Box>
  )
}

export default Integration