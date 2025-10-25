import React, { useState } from 'react';
import {
  Tabs, Tab, Box, Paper, MenuItem, Select, useMediaQuery, useTheme
} from '@mui/material';
import {
  Settings, Share, Palette, Policy, SportsEsports,
  Security, Group, IntegrationInstructions, Backup
} from '@mui/icons-material';
import {Gift } from 'lucide-react';

import General from './settings/General';
import SocialMedia from './settings/SocialMedia';
import Branding from './settings/Branding';
import PoliciesAndDocs from './settings/legal-documents';
import HowToPlay from './settings/HowToPlay';
import SecuritySettings from './settings/security-settings';
import AdminRoles from './settings/admin-roles';
import BackupRecovery from './settings/backup-recovery';
import FAQComponent from './settings/faq-component';
import Integration from './settings/Integration';
import Bonus from './settings/Bonus';

const TabPanel = ({ children, value, index }) => {
  return (
    <div hidden={value !== index} role="tabpanel" id={`tabpanel-${index}`}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
};

const Setting = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // screen < 600px
  const [value, setValue] = useState(0);

  const tabs = [
    { label: 'General', icon: <Settings />, component: <General /> },
    { label: 'Social Media', icon: <Share />, component: <SocialMedia /> },
    { label: 'Branding', icon: <Palette />, component: <Branding /> },
    { label: 'Policies and Docs', icon: <Policy />, component: <PoliciesAndDocs /> },
    { label: 'How to Play', icon: <SportsEsports />, component: <><HowToPlay /><FAQComponent /></> },
    { label: 'Security', icon: <Security />, component: <SecuritySettings /> },
    { label: 'Roles', icon: <Group />, component: <AdminRoles /> },
    { label: 'Integration', icon: <IntegrationInstructions />, component: <Integration /> },
    // { label: 'Bonus', icon: <Gift />, component: <Bonus /> },
    // { label: 'Backup', icon: <Backup />, component: <BackupRecovery /> },
  ];

  return (
    <div className="min-h-screen bg-gray-100 ">
      <Paper elevation={3} className="max-w-full mx-auto">
        {/* Header Nav: Tabs (desktop) or Select (mobile) */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 2 }}>
          {isMobile ? (
            <Select
              fullWidth
              value={value}
              onChange={(e) => setValue(e.target.value)}
              displayEmpty
              sx={{ bgcolor: 'white' }}
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
                  sx={{ textTransform: 'none' }}
                />
              ))}
            </Tabs>
          )}
        </Box>

        {/* Tab Content */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={value} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
    </div>
  );
};

export default Setting;
