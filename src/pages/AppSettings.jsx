// src/components/revenue/RevenueManagement.jsx
import React, { useState } from "react";
import {
  Tabs,
  Tab,
  Box,
  Paper,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
  Typography,
  Divider,
} from "@mui/material";
import { PlayCircle } from "lucide-react";
import AppUpdates from "../pages/AppUpdates";
import AppLogoUpdate from "../pages/AppLogoUpdate";

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ p: { xs: 2, sm: 4 } }}>{children}</Box>}
  </div>
);

const RevenueManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [value, setValue] = useState(0);

  const tabs = [
    { label: "App Updates", icon: <PlayCircle size={18} />, component: <AppUpdates /> },
    { label: "App Logo & Theme", icon: <PlayCircle size={18} />, component: <AppLogoUpdate /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex justify-center items-start py-6">
      <Paper
        elevation={3}
        className="w-full max-w-5xl mx-auto rounded-2xl shadow-lg"
        sx={{
          background: "white",
          borderRadius: "1.5rem",
          overflow: "hidden",
           width: "95%", 
            maxWidth: "1400px",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: "1px solid",
            borderColor: "divider",
            background: "linear-gradient(to right, #f9fafb, #f3f4f6)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              mb: 3,
              color: "black",
            }}
          >
            App Settings
          </Typography>

          {isMobile ? (
            <Select
              fullWidth
              value={value}
              onChange={(e) => setValue(e.target.value)}
              displayEmpty
              sx={{
                bgcolor: "white",
                borderRadius: "12px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              {tabs.map((tab, index) => (
                <MenuItem key={index} value={index}>
                  <Box display="flex" alignItems="center" gap={1}>
                    {tab.icon}
                    {tab.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Tabs
              value={value}
              onChange={(e, newValue) => setValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              textColor="primary"
              indicatorColor="primary"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "1rem",
                  minHeight: "48px",
                  borderRadius: "8px",
                  mx: 0.5,
                  "&.Mui-selected": {
                    bgcolor: theme.palette.action.hover,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  },
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          )}
        </Box>

        {/* Divider */}
        <Divider />

        {/* Tab Panels */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
    </div>
  );
};

export default RevenueManagement;
