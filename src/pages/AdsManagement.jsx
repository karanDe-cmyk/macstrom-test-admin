// src/components/revenue/RevenueManagement.jsx
import React, { useState } from "react";
import { Tabs, Tab, Box, Paper, MenuItem, Select, useMediaQuery, useTheme } from "@mui/material";
import { PlayCircle, Tv } from "lucide-react";

import WatchAndEarn from "../pages/Watch&Earn";
import LiveStreamAds from "../pages/LiveStreamAds";


const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} role="tabpanel">
    {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
  </div>
);

const RevenueManagement = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [value, setValue] = useState(0);

  const tabs = [
    { label: "Watch & Earn", icon: <PlayCircle />, component: <WatchAndEarn /> },
    { label: "Live Stream Ads", icon: <Tv />, component: <LiveStreamAds /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Paper elevation={3} className="max-w-full mx-auto">
        {/* Header Nav */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", p: 2 }}>
          {isMobile ? (
            <Select
              fullWidth
              value={value}
              onChange={(e) => setValue(e.target.value)}
              displayEmpty
              sx={{ bgcolor: "white" }}
            >
              {tabs.map((tab, index) => (
                <MenuItem key={index} value={index}>
                  {tab.icon} &nbsp; {tab.label}
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
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  label={tab.label}
                  icon={tab.icon}
                  iconPosition="start"
                  sx={{ textTransform: "none" }}
                />
              ))}
            </Tabs>
          )}
        </Box>

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
