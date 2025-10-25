"use client"

import { useEffect, useState, useContext } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  useMediaQuery,
  Card,
  CardContent,
  CardActions,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  createTheme,
  ThemeProvider,
} from "@mui/material"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import EmailIcon from "@mui/icons-material/Email"
import PhoneIcon from "@mui/icons-material/Phone"
import HomeIcon from "@mui/icons-material/Home"
import axiosInstance from "../utils/axios"
import ThemeContext from '../contexts/ThemeContext' // Import your theme context

export default function KycTable() {
  const [kycData, setKycData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedKycId, setSelectedKycId] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState("")
  const [snackbarSeverity, setSnackbarSeverity] = useState("success")
  const [updatingId, setUpdatingId] = useState(null)

  // Get dark mode from your context
  const { darkMode } = useContext(ThemeContext)
  
  // Create MUI theme based on your dark mode context
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      ...(darkMode
        ? {
            // Dark theme colors
            background: {
              default: '#121212',
              paper: '#1e1e1e',
            },
            text: {
              primary: '#ffffff',
              secondary: '#b0b0b0',
            },
          }
        : {
            // Light theme colors  
            background: {
              default: '#fafafa',
              paper: '#ffffff',
            },
            text: {
              primary: '#000000',
              secondary: '#666666',
            },
          }),
    },
  })

  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const fetchKycData = async () => {
    setLoading(true)
    try {
      const response = await axiosInstance.get("/userkyc/all")
      const result = await response.data;
      const sortedData = result.data.sort((a, b) => a.id - b.id)
      setKycData(sortedData)
    } catch (err) {
      setError(err.message)
      setSnackbarMessage(`Failed to fetch data: ${err.message}`)
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKycData()
  }, [])

  const handleMenuClick = (event, id) => {
    setAnchorEl(event.currentTarget)
    setSelectedKycId(id)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedKycId(null)
  }

  const handleStatusUpdate = async (status) => {
    handleMenuClose()
    if (!selectedKycId) return

    setUpdatingId(selectedKycId)

    try {
       const response = await axiosInstance.put(`/userkyc/status/${selectedKycId}`, { status });
      setSnackbarMessage(`KYC status updated to '${status}' successfully!`)
      setSnackbarSeverity("success")
      setSnackbarOpen(true)
      fetchKycData()
    } catch (err) {
      setSnackbarMessage(`Failed to update status: ${err.message}`)
      setSnackbarSeverity("error")
      setSnackbarOpen(true)
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    setSnackbarOpen(false)
  }

  const MobileKycCard = ({ kyc }) => (
    <Card sx={{ mb: 2, borderRadius: 0 }}>
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            #{kyc.id} - {kyc.user_name}
          </Typography>
          <Chip
            label={kyc.status}
            color={kyc.status === "approved" ? "success" : kyc.status === "rejected" ? "error" : "warning"}
            size="small"
            sx={{ borderRadius: 0 }}
          />
        </Box>
        
        <Grid container spacing={1}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmailIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all', fontSize: '0.75rem' }}>
                {kyc.email}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <PhoneIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 16 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {kyc.phone}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <HomeIcon sx={{ mr: 1, color: theme.palette.text.secondary, fontSize: 16, mt: 0.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2, fontSize: '0.75rem' }}>
                {kyc.address}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Accordion sx={{ mt: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ px: 0, minHeight: 32, '& .MuiAccordionSummary-content': { margin: '6px 0' } }}
          >
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
              Document Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 0 }}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>Aadhaar</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>
                  {kyc.aadhaar_card_number || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>PAN</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>
                  {kyc.pan_card_number || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>Driving License</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>
                  {kyc.driving_license_number || "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>Voter ID</Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>
                  {kyc.voter_id_number || "N/A"}
                </Typography>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </CardContent>
      
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0, pb: 1 }}>
        <IconButton
          aria-label="more"
          onClick={(event) => handleMenuClick(event, kyc.id)}
          disabled={updatingId === kyc.id}
          color="primary"
          size="small"
        >
          {updatingId === kyc.id ? <CircularProgress size={16} /> : <MoreVertIcon fontSize="small" />}
        </IconButton>
      </CardActions>
    </Card>
  )

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "64vh",
            bgcolor: theme.palette.background.default,
          }}
        >
          <CircularProgress color="primary" />
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading KYC data...
          </Typography>
        </Box>
      </ThemeProvider>
    )
  }

  if (error && kycData.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "64vh",
            color: "error.main",
            bgcolor: theme.palette.background.default,
          }}
        >
          <Typography variant="h6">Error: {error}</Typography>
        </Box>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 0,
              overflow: "hidden",
              p: { xs: 1, sm: 2, md: 3 },
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{ mb: 3, fontWeight: 600, color: theme.palette.text.primary }}
            >
              User KYC Applications
            </Typography>

            {isMobile ? (
              <Box>
                {kycData.map((kyc) => (
                  <MobileKycCard key={kyc.id} kyc={kyc} />
                ))}
              </Box>
            ) : (
              <TableContainer
                sx={{
                  maxHeight: "calc(100vh - 200px)",
                  overflowX: "auto",
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 0,
                }}
              >
                <Table stickyHeader aria-label="KYC data table">
                  <TableHead>
                    <TableRow>
                      {[
                        { label: 'ID', minWidth: 50 },
                        { label: 'User Name', minWidth: 120 },
                        { label: 'Email', minWidth: 150 },
                        { label: 'Phone', minWidth: 100 },
                        { label: 'Address', minWidth: 200 },
                        { label: 'Aadhaar', minWidth: 120 },
                        { label: 'PAN', minWidth: 100 },
                        { label: 'Driving License', minWidth: 150 },
                        { label: 'Voter ID', minWidth: 100 },
                        { label: 'Status', minWidth: 100 },
                        { label: 'Actions', minWidth: 100, align: 'right' },
                      ].map((column) => (
                        <TableCell
                          key={column.label}
                          align={column.align || 'left'}
                          sx={{
                            minWidth: column.minWidth,
                            fontWeight: 700,
                            bgcolor: darkMode ? '#2d2d2d' : theme.palette.grey[100],
                            color: theme.palette.text.secondary,
                          }}
                        >
                          {column.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {kycData.map((kyc) => (
                      <TableRow
                        key={kyc.id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                          "&:hover": {
                            bgcolor: darkMode ? '#2a2a2a' : theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell component="th" scope="row">{kyc.id}</TableCell>
                        <TableCell>{kyc.user_name}</TableCell>
                        <TableCell>{kyc.email}</TableCell>
                        <TableCell>{kyc.phone}</TableCell>
                        <TableCell>{kyc.address}</TableCell>
                        <TableCell>{kyc.aadhaar_card_number || "N/A"}</TableCell>
                        <TableCell>{kyc.pan_card_number || "N/A"}</TableCell>
                        <TableCell>{kyc.driving_license_number || "N/A"}</TableCell>
                        <TableCell>{kyc.voter_id_number || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={kyc.status}
                            color={kyc.status === "approved" ? "success" : kyc.status === "rejected" ? "error" : "warning"}
                            size="small"
                            sx={{ borderRadius: 0 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            aria-label="more"
                            onClick={(event) => handleMenuClick(event, kyc.id)}
                            disabled={updatingId === kyc.id}
                            color="primary"
                          >
                            {updatingId === kyc.id ? <CircularProgress size={24} /> : <MoreVertIcon />}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
              PaperProps={{
                sx: {
                  borderRadius: 0,
                  boxShadow: theme.shadows[3],
                  bgcolor: theme.palette.background.paper,
                },
              }}
            >
              <MenuItem onClick={() => handleStatusUpdate("approved")}>
                <CheckCircleOutlineIcon fontSize="small" sx={{ mr: 1, color: theme.palette.success.main }} />
                Approve
              </MenuItem>
              <MenuItem onClick={() => handleStatusUpdate("rejected")}>
                <CancelOutlinedIcon fontSize="small" sx={{ mr: 1, color: theme.palette.error.main }} />
                Reject
              </MenuItem>
            </Menu>
          </Paper>

          <Snackbar
            open={snackbarOpen}
            autoHideDuration={6000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  )
}