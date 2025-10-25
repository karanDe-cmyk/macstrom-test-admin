"use client"
import { useEffect, useState } from "react"
import {
  Box, Card, CardContent, Typography, Switch, Button, TextField, Checkbox, FormControlLabel,
  IconButton, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Divider, useTheme, useMediaQuery, Paper
} from "@mui/material"
import { Shield, Plus, Trash2, Save, Lock, Wifi, Key, CheckCircle } from "lucide-react"
import axiosInstance from "../../utils/axios"

const SecuritySettings = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

  const [settings, setSettings] = useState(null)
  const [showIpModal, setShowIpModal] = useState(false)
  const [newIpRange, setNewIpRange] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get("/security-settings")
        // Assuming you want to use the settings with id === 1
        const adminSettings = response.data.find((item) => item.id === 1)
        setSettings(adminSettings)
      } catch (error) {
        console.error("Failed to fetch security settings", error)
      }
    }

    fetchSettings()
  }, [])

  const handleAddIpRange = async () => {
    if (!newIpRange.trim() || !settings) return

    const updatedSettings = {
      ...settings,
      ipWhitelist: [...settings.ipWhitelist, newIpRange.trim()]
    }

    try {
      // Send only the flat object structure without id and updatedAt
      const settingsToSave = {
        require2FA: updatedSettings.require2FA,
        ipWhitelist: updatedSettings.ipWhitelist,
        minPasswordLength: updatedSettings.minPasswordLength,
        requireUppercase: updatedSettings.requireUppercase,
        requireNumbers: updatedSettings.requireNumbers,
        requireSpecialChars: updatedSettings.requireSpecialChars
      }

      const response = await axiosInstance.post("/security-settings", settingsToSave)

      setSettings(updatedSettings)
      setNewIpRange("")
      setShowIpModal(false)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to update security settings", error)
    }
  }

  const handleRemoveIpRange = (index) => {
    if (!settings) return
    const updatedWhitelist = settings.ipWhitelist.filter((_, i) => i !== index)
    setSettings({ ...settings, ipWhitelist: updatedWhitelist })
  }

  const handleSaveSettings = async () => {
    if (!settings) return
    try {
      // Send only the flat object structure without id and updatedAt
      const settingsToSave = {
        require2FA: settings.require2FA,
        ipWhitelist: settings.ipWhitelist,
        minPasswordLength: settings.minPasswordLength,
        requireUppercase: settings.requireUppercase,
        requireNumbers: settings.requireNumbers,
        requireSpecialChars: settings.requireSpecialChars
      }

      await axiosInstance.post("/security-settings", settingsToSave)

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to save settings", error.response?.data || error.message)
    }
  }

  if (!settings) return <Typography sx={{ p: 4 }}>Loading...</Typography>

  const IpRangeItem = ({ range, index }) => (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 2,
        border: "1px solid #f0f0f0",
        "&:hover": {
          borderColor: "#e3f2fd",
          backgroundColor: "#fafafa",
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1}>
        <Wifi size={16} color="#666" />
        <Typography
          variant="body2"
          sx={{
            fontFamily: "monospace",
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            color: "#333",
          }}
        >
          {range}
        </Typography>
      </Stack>
      <IconButton
        size="small"
        onClick={() => handleRemoveIpRange(index)}
        sx={{
          color: "#f44336",
          "&:hover": {
            backgroundColor: "#ffebee",
          },
        }}
      >
        <Trash2 size={16} />
      </IconButton>
    </Paper>
  )

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#fafafa", py: { xs: 2, sm: 3, md: 4 } }}>
      <Box sx={{ width: "95%", mx: "auto", px: { xs: 1, sm: 1.5, md: 2 } }}>
        {/* Header */}
        <Card elevation={2} sx={{ mb: 3, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #f0f0f0" }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ p: 1.5, borderRadius: 2, backgroundColor: "#e3f2fd", display: "flex" }}>
                <Shield size={24} color="#1976d2" />
              </Box>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: "#1a1a1a", mb: 0.5 }}>
                  Security Settings
                </Typography>
                <Typography variant="body2" color="text.secondary">Configure authentication and security policies</Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Settings Card */}
        <Card elevation={2} sx={{ borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #f0f0f0" }}>
          <CardContent sx={{ p: 3 }}>
            {/* 2FA */}
            <Box sx={{ mb: 4 }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.5 }}>
                    <Key size={18} color="#1976d2" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Two-Factor Authentication (TOTP)</Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">Require 2FA for all admin accounts</Typography>
                </Box>
                <Switch
                  checked={settings.require2FA}
                  onChange={(e) => setSettings({ ...settings, require2FA: e.target.checked })}
                  size="large"
                />
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* IP Whitelist */}
            <Box sx={{ mb: 4 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                <Wifi size={18} color="#1976d2" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>IP Whitelist (CIDR format)</Typography>
              </Stack>
              <Box sx={{ mb: 2 }}>
                {settings.ipWhitelist.map((range, index) => (
                  <IpRangeItem key={index} range={range} index={index} />
                ))}
              </Box>
              <Button variant="outlined" startIcon={<Plus size={16} />} onClick={() => setShowIpModal(true)}>
                Add IP Range
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            {/* Password Policy */}
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <Lock size={18} color="#1976d2" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Password Policy</Typography>
              </Stack>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Minimum Length</Typography>
                  <TextField
                    type="number"
                    value={settings.minPasswordLength}
                    onChange={(e) => setSettings({ ...settings, minPasswordLength: Number(e.target.value) || 0 })}
                    size="small"
                    inputProps={{ min: 1, max: 50 }}
                  />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2 }}>Requirements</Typography>
                  <Stack spacing={1}>
                    <FormControlLabel
                      control={<Checkbox checked={settings.requireUppercase} onChange={(e) => setSettings({ ...settings, requireUppercase: e.target.checked })} />}
                      label="Require Uppercase"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={settings.requireNumbers} onChange={(e) => setSettings({ ...settings, requireNumbers: e.target.checked })} />}
                      label="Require Numbers"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={settings.requireSpecialChars} onChange={(e) => setSettings({ ...settings, requireSpecialChars: e.target.checked })} />}
                      label="Require Special Characters"
                    />
                  </Stack>
                </Box>
              </Stack>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button variant="contained" startIcon={<Save size={18} />} onClick={handleSaveSettings}>
                Save Security Settings
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Success Alert */}
        {showSuccess && (
          <Alert severity="success" icon={<CheckCircle size={20} />} sx={{ mt: 2, borderRadius: 2 }}>
            Security settings saved successfully!
          </Alert>
        )}

        {/* IP Modal */}
        <Dialog open={showIpModal} onClose={() => setShowIpModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle>v0-battle-nation-admin-portal.vercel.app says</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>Enter IP address or CIDR range:</Typography>
            <TextField
              fullWidth
              value={newIpRange}
              onChange={(e) => setNewIpRange(e.target.value)}
              placeholder="e.g., 192.168.1.0/24"
              onKeyPress={(e) => e.key === "Enter" && handleAddIpRange()}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowIpModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleAddIpRange}>OK</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  )
}

export default SecuritySettings