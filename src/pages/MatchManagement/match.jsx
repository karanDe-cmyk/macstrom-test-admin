"use client"

import { useState } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Avatar,
  Stack,
} from "@mui/material"
import {
  CalendarToday,
  Settings,
  Code,
  Add,
  Refresh,
  ContentCopy,
  GetApp,
  PlayArrow,
  Schedule,
  CheckCircle,
  People,
  ViewModule,
} from "@mui/icons-material"

import MatchSchedule from "./matchSchedule";
import MatchRoom from "./matchRoom"

const matches = [
  { id: "1", teamA: "Team A", teamB: "Team B", date: "2024-01-15", time: "14:00", status: "scheduled" },
  { id: "2", teamA: "Team C", teamB: "Team D", date: "2024-01-15", time: "15:30", status: "scheduled" },
  { id: "3", teamA: "Team E", teamB: "Team F", date: "2024-01-16", time: "14:00", status: "live" },
  {
    id: "4",
    teamA: "Phoenix Warriors",
    teamB: "Thunder Bolts",
    date: "2024-01-17",
    time: "16:00",
    status: "completed",
  },
]

const matchCodes = [
  { team: "Phoenix Warriors", code: "PHX123", expiry: "08-01-2024 16:00", status: "active" },
  { team: "Thunder Bolts", code: "TBT456", expiry: "08-01-2024 16:00", status: "active" },
  { team: "Shadow Hunters", code: "SHD789", expiry: "08-01-2024 17:30", status: "pending" },
  { team: "Storm Riders", code: "STR012", expiry: "08-01-2024 17:30", status: "pending" },
]

export default function Match() {
  const [activeTab, setActiveTab] = useState(0)
  const [autoSchedulerOpen, setAutoSchedulerOpen] = useState(false)
  const [matchCodesOpen, setMatchCodesOpen] = useState(false)
  const [selectedStage, setSelectedStage] = useState("")
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const [startTime, setStartTime] = useState(new Date())
  const [gapMinutes, setGapMinutes] = useState("90")
  const [selectedFilter, setSelectedFilter] = useState("all")

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ minWidth: 200, flex: 1 }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar sx={{ bgcolor: color, width: 40, height: 40 }}>{icon}</Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  const AutoSchedulerDialog = () => (
  <Dialog
    open={autoSchedulerOpen}
    onClose={() => setAutoSchedulerOpen(false)}
    maxWidth="md"
    fullWidth={false}
    sx={{
      "& .MuiDialog-paper": {
        width: "100%",
        maxWidth: "700px", // customize to fit content better
      },
    }}
  >
    <DialogTitle>
      <Stack spacing={0.5}>
        <Box display="flex" alignItems="center" gap={1}>
          <Settings fontSize="small" />
          <Typography variant="h6">Auto Scheduler Wizard</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Automatically schedule matches with custom parameters
        </Typography>
      </Stack>
    </DialogTitle>

    <DialogContent dividers>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Stage</InputLabel>
              <Select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                label="Stage"
              >
                <MenuItem value="state">State</MenuItem>
                <MenuItem value="regional">Regional</MenuItem>
                <MenuItem value="national">National</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Date Range
              </Typography>
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Start Date"
                  type="date"
                  value="2024-01-15"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="End Date"
                  type="date"
                  value="2024-01-20"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>
            </Box>

            <TextField
              label="Start Time"
              type="time"
              value="14:00"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Gap (minutes)"
              type="number"
              value={gapMinutes}
              onChange={(e) => setGapMinutes(e.target.value)}
              fullWidth
            />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Schedule Preview
          </Typography>
          <Stack spacing={2}>
            {matches.slice(0, 3).map((match) => (
              <Card key={match.id} variant="outlined">
                <CardContent sx={{ py: 1.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {match.teamA} vs {match.teamB}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {match.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {match.date}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button onClick={() => setAutoSchedulerOpen(false)} variant="outlined">
        Cancel
      </Button>
      <Button startIcon={<Refresh />} variant="outlined">
        Regenerate Preview
      </Button>
      <Button variant="contained" color="primary">
        Confirm & Schedule
      </Button>
    </DialogActions>
  </Dialog>
);

  const MatchCodesDialog = () => (
    <Dialog open={matchCodesOpen} onClose={() => setMatchCodesOpen(false)} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Code />
              Match Codes
            </Box>
            <Typography variant="body2" color="text.secondary">
              6-character codes for team access to matches
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Button startIcon={<GetApp />} variant="outlined" size="small">
              CSV Export
            </Button>
            <Button startIcon={<Refresh />} variant="outlined" size="small">
              Generate All
            </Button>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box mt={2}>
          {/* Phoenix Warriors vs Thunder Bolts */}
          <Typography variant="h6" gutterBottom>
            Phoenix Warriors vs Thunder Bolts
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchCodes.slice(0, 2).map((code, index) => (
                  <TableRow key={index}>
                    <TableCell>{code.team}</TableCell>
                    <TableCell>
                      <Chip label={code.code} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>{code.expiry}</TableCell>
                    <TableCell>
                      <Chip label={code.status} color={code.status === "active" ? "success" : "warning"} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <Refresh fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Shadow Hunters vs Storm Riders */}
          <Typography variant="h6" gutterBottom>
            Shadow Hunters vs Storm Riders
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Team</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchCodes.slice(2, 4).map((code, index) => (
                  <TableRow key={index}>
                    <TableCell>{code.team}</TableCell>
                    <TableCell>
                      <Chip label={code.code} variant="outlined" size="small" />
                    </TableCell>
                    <TableCell>{code.expiry}</TableCell>
                    <TableCell>
                      <Chip label={code.status} color={code.status === "active" ? "success" : "warning"} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
                        <Refresh fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={() => setMatchCodesOpen(false)} variant="outlined">
          Close
        </Button>
        <Button variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  )

  return (
    <Box sx={{ p: 3, width: "100%", minHeight: "100vh" }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Match Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Calendar, match rooms, and auto-scheduler
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button startIcon={<Settings />} variant="outlined" onClick={() => setAutoSchedulerOpen(true)}>
            Auto-Scheduler
          </Button>
          <Button startIcon={<Code />} variant="outlined" onClick={() => setMatchCodesOpen(true)}>
            Match Codes
          </Button>
          <Button startIcon={<Add />} variant="contained" color="primary">
            Schedule Match
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Tabs value={activeTab} onChange={handleTabChange}
           sx={{
    '.MuiTabs-indicator': {
      backgroundColor: 'black', // change underline color if needed
    },
    '.Mui-selected': {
      backgroundColor: 'transparent', // removes the blue block
      color: 'black', // selected tab text/icon color
    },
  }}
          >
            <Tab
              icon={<CalendarToday />}
              label="Calendar View"
              iconPosition="start"
              sx={{
                bgcolor: activeTab === 0 ? "primary.main" : "transparent",
                color: activeTab === 0 ? "white" : "inherit",
                borderRadius: 1,
                mr: 1,
              }}
            />
            <Tab icon={<ViewModule />} label="Match Rooms" iconPosition="start" sx={{ borderRadius: 1 }} />
          </Tabs>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              variant="outlined"
              displayEmpty
            >
              <MenuItem value="all">All Matches</MenuItem>
              <MenuItem value="live">Live</MenuItem>
              <MenuItem value="scheduled">Scheduled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Box display="flex" gap={3} mb={4} sx={{ flexWrap: "wrap" }}>
        <StatCard icon={<CalendarToday />} title="Total Matches" value="4" color="#2196f3" />
        <StatCard icon={<PlayArrow />} title="Live Now" value="1" color="#f44336" />
        <StatCard icon={<Schedule />} title="Scheduled" value="1" color="#ff9800" />
        <StatCard icon={<CheckCircle />} title="Completed" value="1" color="#4caf50" />
        <StatCard icon={<People />} title="Spectators" value="2,140" color="#9c27b0" />
      </Box>

      {/* Match List/Calendar Content */}
      <Card>
        <CardContent>
          {activeTab === 0 && <MatchSchedule />}
          {activeTab === 1 && <MatchRoom />}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AutoSchedulerDialog />
      <MatchCodesDialog />
    </Box>
  )
}
