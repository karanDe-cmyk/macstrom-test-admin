"use client"

import { useState, useEffect } from "react"
import axiosInstance from "../../utils/axios"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Alert,
  Snackbar,
  Button,
  InputAdornment,
  CircularProgress,
} from "@mui/material"
import {
  YouTube as YouTubeIcon,
  Instagram as InstagramIcon,
  Save as SaveIcon,
  Check as CheckIcon,
  OpenInNew as OpenInNewIcon,
  CloudDone as CloudDoneIcon,
  ErrorOutline as ErrorOutlineIcon,
  Shield as ShieldIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
} from "@mui/icons-material"

const socialMediaPlatforms = [
  {
    id: "youtube",
    label: "YouTube Channel",
    icon: <YouTubeIcon sx={{ color: "#FF0000", fontSize: 24 }} />,
    placeholder: "https://youtube.com/@yourchannel",
    validator: (url) => /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/i.test(url),
    description: "Your YouTube channel URL",
  },
  {
    id: "instagram",
    label: "Instagram Profile",
    icon: <InstagramIcon sx={{ color: "#E1306C", fontSize: 24 }} />,
    placeholder: "https://instagram.com/yourprofile",
    validator: (url) => /^(https?:\/\/)?(www\.)?instagram\.com\/.+$/i.test(url),
    description: "Your Instagram profile URL",
  },
  {
    id: "facebook",
    label: "Facebook Page",
    icon: <FacebookIcon sx={{ color: "#1877F2", fontSize: 24 }} />,
    placeholder: "https://facebook.com/yourpage",
    validator: (url) => /^(https?:\/\/)?(www\.)?facebook\.com\/.+$/i.test(url),
    description: "Your Facebook page URL",
  },
  {
    id: "twitter",
    label: "Twitter Profile",
    icon: <TwitterIcon sx={{ color: "#1DA1F2", fontSize: 24 }} />,
    placeholder: "https://twitter.com/yourhandle",
    validator: (url) => /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/.+$/i.test(url),
    description: "Your Twitter profile URL",
  },
  {
    id: "discord",
    label: "Discord Server",
    icon: (
      <svg width="24" height="24" viewBox="0 0 245 240" fill="#7289DA" xmlns="http://www.w3.org/2000/svg">
        <path d="M104.4 104.5c-5.7 0-10.3 5-10.3 11.2s4.6 11.2 10.3 11.2c5.7 0 10.3-5 10.3-11.2.1-6.2-4.6-11.2-10.3-11.2zm36.1 0c-5.7 0-10.3 5-10.3 11.2s4.6 11.2 10.3 11.2c5.7 0 10.3-5 10.3-11.2s-4.6-11.2-10.3-11.2z" />
        <path d="M189.5 20H55.5C45.5 20 37 28.4 37 38.5v163c0 10.1 8.4 18.5 18.5 18.5h109l-5.1-17.5 12.3 11.4 11.7 10.8 20.8 18.2V38.5c0-10.1-8.4-18.5-18.5-18.5zM160.6 161s-5.3-6.3-9.7-11.9c19.3-5.5 26.6-17.6 26.6-17.6-6 4-11.7 6.8-16.8 8.7-7.3 3.1-14.3 5.2-21.1 6.4-14 2.6-26.8 1.9-37.7-.1-8.3-1.6-15.5-3.9-21.4-6.4-3.3-1.2-7-3-10.7-5.3-.5-.3-1-.5-1.5-.8-.3-.2-.5-.3-.8-.5-3.6-2-5.5-3.4-5.5-3.4s7.1 12 25.9 17.5c-4.4 5.6-9.8 12.2-9.8 12.2-32.4-1-44.7-22.3-44.7-22.3 0-47.2 21.1-85.6 21.1-85.6C80.1 45.5 94 44 94 44l1.8 2.1C67.8 58.5 61.4 72 61.4 72s3.5-2 9.5-4.9c17.3-7.6 30.9-9.6 36.5-10.1 1-.1 1.9-.2 2.9-.2 10.3-.8 21.9-1 33.5.2 15.8 1.8 32.8 6.5 50.2 16.1 0 0-6.4-12.2-24.1-25.9l2.5-2.8s13.9-1.5 27.9 10.6c0 0 21.1 38.4 21.1 85.6 0 .1-12.4 21.3-44.8 22.3z" />
      </svg>
    ),
    placeholder: "https://discord.gg/yourinvite",
    validator: (url) => /^(https?:\/\/)?(www\.)?discord\.gg\/.+$/i.test(url),
    description: "Your Discord server invite URL",
  },
]

const SocialMedia = () => {
  const [formData, setFormData] = useState({
    youtube: "",
    instagram: "",
    facebook: "",
    twitter: "",
    discord: "",
  })

  const [formErrors, setFormErrors] = useState({})
  const [linkTestStatus, setLinkTestStatus] = useState({})
  const [showSaveAlert, setShowSaveAlert] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [apiError, setApiError] = useState(null)

  // Fetch social media links on component mount
  useEffect(() => {
    const fetchSocialMediaLinks = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get("/socialmedialinks")
        
        // Transform the API response to match our formData structure
        const linksData = {}
        response.data.forEach(link => {
          linksData[link.platform] = link.url || ""
        })

        // Set form data with API response or keep default empty values
        setFormData(prevData => ({
          ...prevData,
          ...linksData
        }))

        setApiError(null)
      } catch (error) {
        console.error("Failed to fetch social media links:", error)
        setApiError("Failed to load social media links. Using default values.")
        // Keep the default empty values in formData
      } finally {
        setIsLoading(false)
      }
    }

    fetchSocialMediaLinks()
  }, [])

  const validateUrl = (platformId, url) => {
    if (!url.trim()) {
      return "" // Allow empty URLs
    }
    const platform = socialMediaPlatforms.find((p) => p.id === platformId)
    if (!platform.validator(url)) {
      return `Invalid ${platform.label} URL format.`
    }
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`)
      return ""
    } catch (error) {
      return "Invalid URL format."
    }
  }

  const handleInputChange = (platformId) => (event) => {
    const value = event.target.value
    setFormData((prev) => ({
      ...prev,
      [platformId]: value,
    }))
    const error = validateUrl(platformId, value)
    setFormErrors((prev) => ({
      ...prev,
      [platformId]: error,
    }))
    setHasChanges(true)
  }

  const handleTestLink = async (platformId) => {
    const url = formData[platformId]
    const error = validateUrl(platformId, url)
    if (error) {
      setFormErrors((prev) => ({ ...prev, [platformId]: error }))
      setLinkTestStatus((prev) => ({ ...prev, [platformId]: "error" }))
      return
    }

    setLinkTestStatus((prev) => ({ ...prev, [platformId]: "loading" }))
    await new Promise((resolve) => setTimeout(resolve, 1500))
    // Simulate 80% success rate
    const success = Math.random() > 0.2
    setLinkTestStatus((prev) => ({ ...prev, [platformId]: success ? "success" : "error" }))
    if (!success) {
      setFormErrors((prev) => ({
        ...prev,
        [platformId]: "Link test failed. Please check the URL.",
      }))
    } else {
      setFormErrors((prev) => ({ ...prev, [platformId]: "" }))
      window.open(url, "_blank")
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setApiError(null)
    
    // Validate all URLs first
    const allErrors = {}
    Object.keys(formData).forEach((key) => {
      const error = validateUrl(key, formData[key])
      if (error) {
        allErrors[key] = error
      }
    })

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors)
      setIsSaving(false)
      return
    }

    try {
      // Update each platform's link using PUT API
      const updatePromises = Object.entries(formData).map(([platform, url]) =>
        axiosInstance.put(`/socialmedialinks/${platform}`, {
          url: url.trim(),
          platform: platform
        })
      )

      await Promise.all(updatePromises)
      
      setHasChanges(false)
      setShowSaveAlert(true)
      setApiError(null)
    } catch (error) {
      console.error("Failed to save social media links:", error)
      setApiError("Failed to save social media links. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseAlert = () => {
    setShowSaveAlert(false)
  }

  const handleCloseApiError = () => {
    setApiError(null)
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
      }}
    >
      <Box sx={{ maxWidth: "95%", margin: "0 auto" }}>
        {/* Header Card */}
        <Card
          sx={{
            mb: 3,
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <ShieldIcon sx={{ color: "#3b82f6", fontSize: 28 }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: "#111827",
                    mb: 0.5,
                  }}
                >
                  Social Media Settings
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Configure your social media links and profiles
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* API Error Alert */}
        {apiError && (
          <Alert 
            severity="error" 
            onClose={handleCloseApiError}
            sx={{ mb: 3, borderRadius: "8px" }}
          >
            {apiError}
          </Alert>
        )}

        {/* Social Media Links Card */}
        <Card
          sx={{
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={4}>
              {socialMediaPlatforms.map((platform) => (
                <Grid item xs={12} md={6} key={platform.id}>
                  <Box sx={{ mb: 3 }}>
                    {/* Platform Label */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                      {platform.icon}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: "#374151",
                          fontSize: "16px",
                        }}
                      >
                        {platform.label}
                      </Typography>
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#6b7280",
                        mb: 2,
                        fontSize: "14px",
                      }}
                    >
                      {platform.description}
                    </Typography>

                    {/* Input and Test Button */}
                    <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
                      <TextField
                        fullWidth
                        value={formData[platform.id]}
                        onChange={handleInputChange(platform.id)}
                        error={!!formErrors[platform.id]}
                        helperText={formErrors[platform.id]}
                        variant="outlined"
                        placeholder={platform.placeholder}
                        size="medium"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {linkTestStatus[platform.id] === "loading" ? (
                                <Box
                                  sx={{
                                    width: 20,
                                    height: 20,
                                    backgroundColor: "#e5e7eb",
                                    borderRadius: "50%",
                                    animation: "pulse 2s infinite",
                                  }}
                                />
                              ) : linkTestStatus[platform.id] === "success" ? (
                                <CheckIcon sx={{ color: "#10b981", fontSize: 20 }} />
                              ) : linkTestStatus[platform.id] === "error" ? (
                                <ErrorOutlineIcon sx={{ color: "#ef4444", fontSize: 20 }} />
                              ) : null}
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "#ffffff",
                            borderRadius: "8px",
                            fontSize: "14px",
                            "& fieldset": {
                              borderColor: "#d1d5db",
                              borderWidth: "1px",
                            },
                            "&:hover fieldset": {
                              borderColor: "#9ca3af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#3b82f6",
                              borderWidth: "2px",
                            },
                            "&.Mui-error fieldset": {
                              borderColor: "#ef4444",
                            },
                          },
                          "& .MuiInputBase-input": {
                            padding: "12px 14px",
                            fontSize: "14px",
                            color: "#374151",
                            "&::placeholder": {
                              color: "#9ca3af",
                              opacity: 1,
                            },
                          },
                          "& .MuiFormHelperText-root": {
                            fontSize: "12px",
                            marginTop: "6px",
                            marginLeft: "4px",
                          },
                        }}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleTestLink(platform.id)}
                        startIcon={<OpenInNewIcon sx={{ fontSize: 16 }} />}
                        disabled={
                          !formData[platform.id] ||
                          !!formErrors[platform.id] ||
                          linkTestStatus[platform.id] === "loading"
                        }
                        sx={{
                          minWidth: "90px",
                          height: "48px",
                          borderColor: "#d1d5db",
                          color: "#374151",
                          fontSize: "13px",
                          fontWeight: 500,
                          textTransform: "none",
                          borderRadius: "8px",
                          "&:hover": {
                            borderColor: "#9ca3af",
                            backgroundColor: "#f9fafb",
                          },
                          "&:disabled": {
                            borderColor: "#e5e7eb",
                            color: "#9ca3af",
                          },
                        }}
                      >
                        Test
                      </Button>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Save Button - Styled like Publish button */}
            <Box sx={{ mt: 5, pt: 3, borderTop: "1px solid #e5e7eb" }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={isSaving || !hasChanges || Object.values(formErrors).some((error) => error)}
                startIcon={
                  isSaving ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <SaveIcon sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  backgroundColor: "#1A1A1A",
                  color: "#ffffff",
                  px: 4,
                  py: 1.5,
                  borderRadius: "6px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "14px",
                  letterSpacing: "0.025em",
                  boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  border: "none",
                  "&:hover": {
                    backgroundColor: "#1A1A1A",
                    boxShadow: "0 2px 4px 0 rgba(0, 0, 0, 0.1)",
                  },
                  "&:active": {
                    backgroundColor: "#1A1A1A",
                    transform: "translateY(1px)",
                  },
                  "&:disabled": {
                    backgroundColor: "#1A1A1A",
                    color: "#ffffff",
                    cursor: "not-allowed",
                  },
                  transition: "all 0.15s ease-in-out",
                }}
              >
                {isSaving ? "Saving..." : "Save Social Links"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Save Notification */}
      <Snackbar
        open={showSaveAlert}
        autoHideDuration={4000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="success"
          variant="filled"
          icon={<CloudDoneIcon />}
          sx={{
            borderRadius: "8px",
            backgroundColor: "#10b981",
            color: "#ffffff",
            minWidth: "300px",
          }}
        >
          Social media links saved successfully!
        </Alert>
      </Snackbar>

      {/* Custom CSS for animations */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </Box>
  )
}

export default SocialMedia