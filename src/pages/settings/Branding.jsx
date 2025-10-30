"use client"

import { useState, useRef } from "react"
import axios from "axios"
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  TextField,
  Grid,
  Avatar,
  Divider,
  LinearProgress,
  Chip,
  Alert,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material"
import {
  CloudUpload,
  Publish,
  Delete,
  CheckCircle,
  Info,
  Image as ImageIcon,
  VideoLibrary,
  Refresh,
  Settings,
} from "@mui/icons-material"

export default function Branding({ sidebarOpen = true }) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [logo, setLogo] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [icon, setIcon] = useState(null)
  const [iconFile, setIconFile] = useState(null)
  const [splashUrl, setSplashUrl] = useState("https://cdn.battlenation.com/splash.mp4")
  const [isPublishing, setIsPublishing] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [dragOver, setDragOver] = useState({ logo: false, icon: false })

  const logoInputRef = useRef(null)
  const iconInputRef = useRef(null)

  const handleImageChange = (e, setter, type) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setter(URL.createObjectURL(file))
            // Store the actual file for API upload
            if (type === 'logo') {
              setLogoFile(file)
            } else if (type === 'icon') {
              setIconFile(file)
            }
            return 100
          }
          return prev + 10
        })
      }, 100)
    }
  }

  const handleDragOver = (e, type) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [type]: true }))
  }

  const handleDragLeave = (e, type) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [type]: false }))
  }

  const handleDrop = (e, setter, type) => {
    e.preventDefault()
    setDragOver((prev) => ({ ...prev, [type]: false }))
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      setter(URL.createObjectURL(file))
      // Store the actual file for API upload
      if (type === 'logo') {
        setLogoFile(file)
      } else if (type === 'icon') {
        setIconFile(file)
      }
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    setApiError(null)
    
    try {
      // Create FormData for multipart/form-data request
      const formData = new FormData()
      
      // Add files to FormData if they exist
      if (logoFile) {
        formData.append('logo', logoFile)
      }
      
      if (iconFile) {
        formData.append('icon', iconFile)
      }
      
      // Add splash URL to FormData
      if (splashUrl.trim()) {
        formData.append('splashUrl', splashUrl.trim())
      }

      // Make POST request to upload API
      const response = await axios.post(
        'https://mactromtest-backend.onrender.com/api/brandassets/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          // Optional: Add upload progress tracking
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            )
            setUploadProgress(percentCompleted)
          }
        }
      )

      console.log('Upload successful:', response.data)
      
      // Show success message
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 4000)
      
      // Optional: Reset file states after successful upload
      // setLogoFile(null)
      // setIconFile(null)
      
    } catch (error) {
      console.error('Upload failed:', error)
      setApiError(
        error.response?.data?.message || 
        'Failed to upload brand assets. Please try again.'
      )
    } finally {
      setIsPublishing(false)
      setUploadProgress(0)
    }
  }

  const handleRemoveAsset = (setter, type) => {
    setter(null)
    // Also clear the corresponding file
    if (type === 'logo') {
      setLogoFile(null)
    } else if (type === 'icon') {
      setIconFile(null)
    }
  }

  const handleCloseApiError = () => {
    setApiError(null)
  }

  const UploadArea = ({
    title,
    subtitle,
    asset,
    setter,
    type,
    inputRef,
    accept = "image/*",
    icon: Icon = ImageIcon,
  }) => (
    <Paper
      elevation={dragOver[type] ? 4 : 1}
      onDragOver={(e) => handleDragOver(e, type)}
      onDragLeave={(e) => handleDragLeave(e, type)}
      onDrop={(e) => handleDrop(e, setter, type)}
      onClick={() => inputRef?.current?.click()}
      sx={{
        border: dragOver[type] ? "2px solid #2196f3" : "1px solid #e0e0e0",
        borderRadius: 2,
        p: 3,
        minHeight: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.3s ease",
        backgroundColor: dragOver[type] ? "rgba(33, 150, 243, 0.04)" : "#fff",
        "&:hover": {
          borderColor: "#2196f3",
          backgroundColor: "rgba(33, 150, 243, 0.02)",
          elevation: 2,
        },
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Icon
          sx={{
            fontSize: 48,
            color: asset ? "#2196f3" : "#9e9e9e",
            mb: 1,
          }}
        />
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, color: "#212121" }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      {asset ? (
        <Box sx={{ position: "relative", mb: 2 }}>
          <Avatar
            src={asset}
            variant="rounded"
            sx={{
              width: 96,
              height: 96,
              mb: 2,
              border: "2px solid #2196f3",
            }}
          />
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              handleRemoveAsset(setter, type)
            }}
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "#f44336",
              color: "white",
              width: 24,
              height: 24,
              "&:hover": { backgroundColor: "#d32f2f" },
            }}
          >
            <Delete sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <CloudUpload sx={{ fontSize: 64, color: "#bdbdbd", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Drag & drop or click to upload
          </Typography>
        </Box>
      )}

      <Button
        variant={asset ? "outlined" : "contained"}
        startIcon={<CloudUpload />}
        component="label"
        size="small"
        sx={{
          borderRadius: 2,
          px: 3,
          py: 1,
          backgroundColor: asset ? "transparent" : "#212121",
          color: asset ? "#212121" : "white",
          "&:hover": {
            backgroundColor: asset ? "rgba(33, 33, 33, 0.04)" : "#424242",
          },
        }}
      >
        {asset ? "Replace" : "Upload"}
        <input hidden accept={accept} type="file" ref={inputRef} onChange={(e) => handleImageChange(e, setter, type)} />
      </Button>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <Box sx={{ width: "100%", mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      )}
    </Paper>
  )

  return (
    <Box
      sx={{
        minHeight: "100vh",
        transition: "all 0.3s ease",
      }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: "95%",
          mx: "auto",
          transition: "all 0.3s ease",
        }}
      >
        {/* Header */}
        <Card
          elevation={1}
          sx={{
            mb: 3,
            border: "1px solid #e0e0e0",
            backgroundColor: "#fff",
          }}
        >
          <CardHeader
            sx={{ p: 3 }}
            avatar={
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  backgroundColor: "#2196f3",
                  borderRadius: 1.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Settings sx={{ fontSize: 24, color: "white" }} />
              </Box>
            }
            title={
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#212121", mb: 1 }}>
                Branding Assets
              </Typography>
            }
            subheader={
              <Typography variant="body1" sx={{ color: "#666", lineHeight: 1.5 }}>
                Basic application configuration with manual and auto-save functionality
              </Typography>
            }
          />
        </Card>

        {/* Alert */}
        <Alert
          severity="info"
          icon={<Info />}
          sx={{
            mb: 3,
            borderRadius: 2,
            backgroundColor: "rgba(33, 150, 243, 0.04)",
            border: "1px solid rgba(33, 150, 243, 0.2)",
          }}
        >
          Upload logos, icons, and media with S3 integration. All assets are automatically optimized and cached with CDN
          versioning.
        </Alert>

        {/* API Error Alert */}
        {apiError && (
          <Alert 
            severity="error" 
            onClose={handleCloseApiError}
            sx={{ mb: 3, borderRadius: 2 }}
          >
            {apiError}
          </Alert>
        )}

        {/* Upload Areas - Now taking full 95% width with proper margins */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <UploadArea
                title="Logo"
                subtitle="PNG/SVG • Max 2MB"
                asset={logo}
                setter={setLogo}
                type="logo"
                inputRef={logoInputRef}
                icon={ImageIcon}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <UploadArea
                title="App Icon"
                subtitle="512×512 • PNG/JPG"
                asset={icon}
                setter={setIcon}
                type="icon"
                inputRef={iconInputRef}
                icon={ImageIcon}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={1}
                sx={{
                  borderRadius: 2,
                  p: 3,
                  minHeight: 250,
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#fff",
                  border: "1px solid #e0e0e0",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <VideoLibrary sx={{ color: "#2196f3" }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Splash Video
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  MP4 format • Max 10MB
                </Typography>
                <Box sx={{ mb: 2, flexGrow: 1 }}>
                  <video
                    width="100%"
                    height="160"
                    controls
                    src={splashUrl}
                    style={{
                      borderRadius: 8,
                      backgroundColor: "#000",
                      objectFit: "cover",
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="https://cdn.example.com/splash.mp4"
                    value={splashUrl}
                    onChange={(e) => setSplashUrl(e.target.value)}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        backgroundColor: "#fff",
                      },
                    }}
                  />
                  <IconButton size="small" sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                    <Refresh fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Upload Progress Bar (shown during API upload) */}
        {isPublishing && uploadProgress > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Uploading assets... {uploadProgress}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#2196f3'
                }
              }} 
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Footer */}
        <Card elevation={1} sx={{ backgroundColor: "#fff" }}>
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "stretch", sm: "center" },
                gap: 2,
              }}
            >
              <Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  <Chip
                    label="Version 1.2.3"
                    variant="outlined"
                    size="small"
                    sx={{ color: "#2196f3", borderColor: "#2196f3" }}
                  />
                  <Chip
                    label="CDN Cached"
                    variant="outlined"
                    size="small"
                    icon={<CheckCircle />}
                    sx={{ color: "#4caf50", borderColor: "#4caf50" }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Assets are automatically optimized and distributed globally
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={
                  isPublishing ? (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: "2px solid white",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        "@keyframes spin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                  ) : (
                    <Publish />
                  )
                }
                onClick={handlePublish}
                disabled={isPublishing || (!logoFile && !iconFile && !splashUrl.trim())}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 600,
                  minWidth: 160,
                  backgroundColor: "#212121",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#424242",
                  },
                  "&:disabled": {
                    backgroundColor: "#9e9e9e",
                  },
                }}
              >
                {isPublishing ? "Publishing..." : "Publish Changes"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <Box
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 1300,
            }}
          >
            <Alert
              severity="success"
              icon={<CheckCircle />}
              onClose={() => setShowSuccess(false)}
              sx={{
                borderRadius: 2,
                backgroundColor: "rgba(76, 175, 80, 0.1)",
                border: "1px solid rgba(76, 175, 80, 0.2)",
                color: "#2e7d32",
              }}
            >
              Changes published successfully! Your branding assets are now live.
            </Alert>
          </Box>
        )}
      </Box>
    </Box>
  )
}