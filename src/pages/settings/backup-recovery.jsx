"use client"
import { useState } from "react"
import { Box, Card, CardContent, Typography, Button, Grid, Alert, Stack, useTheme, useMediaQuery } from "@mui/material"
import { Database, Upload, Clock, Download, Settings, Shield, Archive } from "lucide-react"

const BackupRecovery = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"))

  const [isDownloading, setIsDownloading] = useState({
    database: false,
    s3: false,
  })

  // Handlers
  const handleDownloadDB = async () => {
    setIsDownloading((prev) => ({ ...prev, database: true }))
    // Simulate download process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDownloading((prev) => ({ ...prev, database: false }))
  }

  const handleDownloadS3 = async () => {
    setIsDownloading((prev) => ({ ...prev, s3: true }))
    // Simulate download process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsDownloading((prev) => ({ ...prev, s3: false }))
  }

  const handleConfigureSchedule = () => {
    // Handle schedule configuration
    console.log("Configure schedule clicked")
  }

  const BackupCard = ({
    icon: Icon,
    iconColor,
    title,
    description,
    buttonText,
    buttonIcon: ButtonIcon,
    onClick,
    isLoading = false,
  }) => (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: { xs: 1.5, sm: 2 },
        border: "1px solid #f0f0f0",
        transition: "all 0.3s ease",
        "&:hover": {
          elevation: 4,
          transform: "translateY(-2px)",
          borderColor: "#e3f2fd",
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.5 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          "&:last-child": { pb: { xs: 1.5, sm: 2, md: 2.5 } },
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            p: { xs: 1, sm: 1.5, md: 2 },
            borderRadius: "50%",
            backgroundColor: `${iconColor}15`,
            mb: { xs: 1, sm: 1.5, md: 2 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={isMobile ? 24 : isTablet ? 28 : 32} color={iconColor} />
        </Box>

        {/* Title */}
        <Typography
          variant={isMobile ? "subtitle1" : "h6"}
          sx={{
            fontWeight: 600,
            mb: { xs: 0.5, sm: 1 },
            fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.2rem" },
            color: "#1a1a1a",
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: { xs: 1.5, sm: 2 },
            fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
            lineHeight: 1.4,
            flex: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {description}
        </Typography>

        {/* Button */}
        <Button
          variant="contained"
          startIcon={<ButtonIcon size={16} />}
          onClick={onClick}
          disabled={isLoading}
          sx={{
            width: "100%",
            py: { xs: 1, sm: 1.25 },
            borderRadius: 2,
            backgroundColor: "#1a1a1a",
            color: "white",
            fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#333",
            },
            "&:disabled": {
              backgroundColor: "#666",
              color: "white",
            },
          }}
        >
          {isLoading ? "Processing..." : buttonText}
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#fafafa",
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box
        sx={{
          width: "95%",
          maxWidth: "95%",
          mx: "auto",
          px: { xs: 1, sm: 1.5, md: 2 },
        }}
      >
        {/* Header */}
        <Card
          elevation={2}
          sx={{
            mb: { xs: 2, sm: 3 },
            borderRadius: { xs: 1.5, sm: 2 },
            backgroundColor: "#ffffff",
            border: "1px solid #f0f0f0",
          }}
        >
          <CardContent
            sx={{
              p: { xs: 1.5, sm: 2, md: 2.5 },
              "&:last-child": { pb: { xs: 1.5, sm: 2, md: 2.5 } },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: "#e3f2fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Archive size={isMobile ? 18 : 20} color="#1976d2" />
              </Box>
              <Box>
                <Typography
                  variant={isMobile ? "h6" : "h5"}
                  sx={{
                    fontWeight: 700,
                    color: "#1a1a1a",
                    mb: 0.25,
                    fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.4rem" },
                  }}
                >
                  Backup & Recovery
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    fontSize: { xs: "0.75rem", sm: "0.8rem" },
                  }}
                >
                  Generate backups and schedule automated backups
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Backup Cards */}
        <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid item xs={12} sm={6} md={4}>
            <BackupCard
              icon={Database}
              iconColor="#1976d2"
              title="Database Dump"
              description="Complete database backup with all tables"
              buttonText="Download DB Dump"
              buttonIcon={Download}
              onClick={handleDownloadDB}
              isLoading={isDownloading.database}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <BackupCard
              icon={Upload}
              iconColor="#4caf50"
              title="S3 Manifest"
              description="List of all uploaded files and assets"
              buttonText="Download S3 Manifest"
              buttonIcon={Download}
              onClick={handleDownloadS3}
              isLoading={isDownloading.s3}
            />
          </Grid>

          <Grid item xs={12} sm={12} md={4}>
            <BackupCard
              icon={Clock}
              iconColor="#9c27b0"
              title="Scheduled Backup"
              description="Automated nightly backups via cron"
              buttonText="Configure Schedule"
              buttonIcon={Settings}
              onClick={handleConfigureSchedule}
            />
          </Grid>
        </Grid>

        {/* Security Notice */}
        <Alert
          severity="info"
          icon={<Shield size={18} />}
          sx={{
            borderRadius: { xs: 1.5, sm: 2 },
            backgroundColor: "#e3f2fd",
            border: "1px solid #bbdefb",
            py: { xs: 1, sm: 1.5 },
            "& .MuiAlert-message": {
              fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
              color: "#1565c0",
            },
            "& .MuiAlert-icon": {
              color: "#1976d2",
            },
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              mb: 0.25,
              fontSize: { xs: "0.8rem", sm: "0.85rem" },
            }}
          >
            Security Notice
          </Typography>
          Backup download links are presigned S3 URLs valid for 15 minutes only. Links expire automatically for
          security.
        </Alert>
      </Box>
    </Box>
  )
}

export default BackupRecovery
