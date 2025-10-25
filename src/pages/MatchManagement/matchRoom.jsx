"use client"

import { useState } from "react"
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Grid,
  Avatar,
} from "@mui/material"
import { LiveTv, ContentCopy, ChevronLeft, ChevronRight, ChatBubbleOutline, FeedOutlined } from "@mui/icons-material"

const killFeedData = [
  {
    time: "23:45",
    killer: "PHX_Sniper",
    killerTeam: "phoenix",
    action: "eliminated",
    victim: "TBT_Warrior",
    victimTeam: "thunder",
  },
  {
    time: "23:12",
    killer: "TBT_Assassin",
    killerTeam: "thunder",
    action: "eliminated",
    victim: "PHX_Hunter",
    victimTeam: "phoenix",
  },
  {
    time: "22:58",
    killer: "PHX_Tank",
    killerTeam: "phoenix",
    action: "eliminated",
    victim: "TBT_Support",
    victimTeam: "thunder",
  },
  {
    time: "22:45",
    killer: "PHX_Sniper",
    killerTeam: "phoenix",
    action: "eliminated",
    victim: "TBT_Warrior",
    victimTeam: "thunder",
  },
  {
    time: "22:30",
    killer: "TBT_Assassin",
    killerTeam: "thunder",
    action: "eliminated",
    victim: "PHX_Hunter",
    victimTeam: "phoenix",
  },
  {
    time: "22:15",
    killer: "PHX_Tank",
    killerTeam: "phoenix",
    action: "eliminated",
    victim: "TBT_Support",
    victimTeam: "thunder",
  },
  {
    time: "22:00",
    killer: "TBT_Sniper",
    killerTeam: "thunder",
    action: "eliminated",
    victim: "PHX_Warrior",
    victimTeam: "phoenix",
  },
  {
    time: "21:45",
    killer: "PHX_Assassin",
    killerTeam: "phoenix",
    action: "eliminated",
    victim: "TBT_Hunter",
    victimTeam: "thunder",
  },
]

const chatData = [
  {
    time: "23:50",
    user: "Spectator123",
    message: "Great play by PHX!",
  },
  {
    time: "23:48",
    user: "GameFan",
    message: "TBT comeback incoming",
  },
  {
    time: "23:45",
    user: "ProGamer",
    message: "Amazing shot!",
  },
  {
    time: "23:42",
    user: "MatchWatcher",
    message: "This is getting intense!",
  },
  {
    time: "23:40",
    user: "ESportsFan",
    message: "Phoenix Warriors looking strong",
  },
  {
    time: "23:38",
    user: "Spectator456",
    message: "Thunder Bolts need to step up",
  },
  {
    time: "23:35",
    user: "GameAnalyst",
    message: "Great strategy from both teams",
  },
  {
    time: "23:32",
    user: "ViewerX",
    message: "This match is epic!",
  },
  {
    time: "23:30",
    user: "ChatMod",
    message: "Keep the chat respectful everyone",
  },
  {
    time: "23:28",
    user: "FanBoy",
    message: "Go Phoenix Warriors!",
  },
]

export default function MatchRoom() {
  const [phoenixScore, setPhoenixScore] = useState(1)
  const [thunderScore, setThunderScore] = useState(2)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"))
  const isTablet = useMediaQuery(theme.breakpoints.down("md"))

  const getTeamColor = (team) => {
    return team === "phoenix" ? "#f44336" : "#2196f3"
  }

  const handleScoreUpdate = (team) => {
    if (team === "phoenix") {
      console.log("Phoenix score updated:", phoenixScore)
    } else {
      console.log("Thunder score updated:", thunderScore)
    }
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        p: isMobile ? 2 : isTablet ? 3 : 4,
      }}
    >
      {/* Header */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              gap: isMobile ? 2 : 0,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant={isMobile ? "h5" : isTablet ? "h4" : "h3"}
                sx={{
                  fontWeight: 700,
                  color: "#333",
                  mb: 1,
                }}
              >
                Phoenix Warriors vs Thunder Bolts
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#666",
                  fontSize: isMobile ? "14px" : "16px",
                }}
              >
                Live match room with kill feed and chat
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexDirection: isMobile ? "column" : "row",
                width: isMobile ? "100%" : "auto",
              }}
            >
              <Chip
                icon={<LiveTv />}
                label="Live"
                color="error"
                variant="filled"
                sx={{
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "#f0f0f0",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                }}
              >
                <ContentCopy sx={{ fontSize: 16, color: "#666" }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    fontFamily: "monospace",
                  }}
                >
                  MATCH789
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Content - 50-50 Split */}
      <Box
        sx={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: 3,
          height: isMobile ? "auto" : "600px",
        }}
      >
        {/* Kill Feed - 50% width */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Card sx={{ height: "100%", boxShadow: 2, display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 2,
                backgroundColor: "#fafafa",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <FeedOutlined sx={{ color: "#666" }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                Live Kill Feed
              </Typography>
            </Box>

            {/* Scrollable Kill Feed Content */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c1c1c1",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                },
              }}
            >
              {killFeedData.map((kill, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    py: 1,
                    borderBottom: index < killFeedData.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#666",
                      minWidth: "40px",
                      fontSize: "12px",
                    }}
                  >
                    {kill.time}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getTeamColor(kill.killerTeam),
                      fontWeight: 600,
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  >
                    {kill.killer}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#666",
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  >
                    {kill.action}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getTeamColor(kill.victimTeam),
                      fontWeight: 600,
                      fontSize: isMobile ? "13px" : "14px",
                    }}
                  >
                    {kill.victim}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* Navigation Controls */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
                p: 2,
                borderTop: "1px solid #e0e0e0",
                backgroundColor: "#fafafa",
              }}
            >
              <IconButton size="small">
                <ChevronLeft />
              </IconButton>
              <LinearProgress
                variant="determinate"
                value={60}
                sx={{
                  flex: 1,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#2196f3",
                  },
                }}
              />
              <IconButton size="small">
                <ChevronRight />
              </IconButton>
            </Box>
          </Card>
        </Box>

        {/* Chat Moderator - 50% width */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Card sx={{ height: "100%", boxShadow: 2, display: "flex", flexDirection: "column" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 2,
                backgroundColor: "#fafafa",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <ChatBubbleOutline sx={{ color: "#666" }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#333" }}>
                Chat Moderator
              </Typography>
            </Box>

            {/* Scrollable Chat Content */}
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: "#f1f1f1",
                  borderRadius: "4px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#c1c1c1",
                  borderRadius: "4px",
                  "&:hover": {
                    backgroundColor: "#a8a8a8",
                  },
                },
              }}
            >
              {chatData.map((chat, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    py: 1.5,
                    borderBottom: index < chatData.length - 1 ? "1px solid #f0f0f0" : "none",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: "#2196f3",
                      fontSize: "12px",
                    }}
                  >
                    {chat.user.charAt(0)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          fontSize: isMobile ? "13px" : "14px",
                        }}
                      >
                        {chat.user}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#666",
                          fontSize: "11px",
                        }}
                      >
                        {chat.time}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#555",
                        fontSize: isMobile ? "13px" : "14px",
                      }}
                    >
                      {chat.message}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Manual Score Override */}
      <Card sx={{ mt: 3, boxShadow: 2 }}>
        <CardContent sx={{ p: isMobile ? 2 : 3 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "#333",
              mb: 3,
              backgroundColor: "#fff3cd",
              p: 2,
              borderRadius: 1,
              border: "1px solid #ffeaa7",
            }}
          >
            Manual Score Override
          </Typography>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    minWidth: "140px",
                  }}
                >
                  Phoenix Warriors:
                </Typography>
                <TextField
                  type="number"
                  value={phoenixScore}
                  onChange={(e) => setPhoenixScore(Number.parseInt(e.target.value) || 0)}
                  size="small"
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleScoreUpdate("phoenix")}
                  sx={{
                    backgroundColor: "#f44336",
                    "&:hover": {
                      backgroundColor: "#d32f2f",
                    },
                  }}
                >
                  Update
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "#333",
                    minWidth: "140px",
                  }}
                >
                  Thunder Bolts:
                </Typography>
                <TextField
                  type="number"
                  value={thunderScore}
                  onChange={(e) => setThunderScore(Number.parseInt(e.target.value) || 0)}
                  size="small"
                  sx={{
                    width: "80px",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleScoreUpdate("thunder")}
                  sx={{
                    backgroundColor: "#2196f3",
                    "&:hover": {
                      backgroundColor: "#1976d2",
                    },
                  }}
                >
                  Update
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
