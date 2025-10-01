import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventIcon from '@mui/icons-material/Event';
import PersonIcon from '@mui/icons-material/Person';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupIcon from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', icon: <DashboardIcon />, route: '/dashboard/teacher' },
  { label: 'Coaching Management', icon: <GroupIcon />, route: '/teacher/coaching-services' },
  { label: 'Availability', icon: <CalendarTodayIcon />, route: '/teacher/availability' },
  { label: 'Profile', icon: <PersonIcon />, route: '/teacher/settings' },
  { label: 'Resources', icon: <AssignmentIcon />, route: '/dashboard/teacher/resources' },
  { label: 'Settings', icon: <SettingsIcon />, route: '/teacher/settings' },
];
const otherItems = [
  { label: 'Analytics', icon: <BarChartIcon />, route: '/dashboard/teacher/analytics' },
  { label: 'Support', icon: <SupportAgentIcon />, route: '/support' },
];

const TeacherSidebar = ({ selectedRoute, mobileOpen, onClose }: { selectedRoute: string, mobileOpen?: boolean, onClose?: () => void }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const drawerBg = '#2563eb'; // or use theme.palette.primary.main if you want theme-based
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
      <Typography variant="caption" color="text.secondary" sx={{ pl: 3, mb: 1, fontWeight: 700, letterSpacing: 1 }}>
        MENU
      </Typography>
      <List>
        {menuItems.map(item => (
          <ListItem
            button
            key={item.label}
            selected={selectedRoute === item.route}
            onClick={() => { navigate(item.route); if (isMobile && onClose) onClose(); }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              bgcolor: selectedRoute === item.route ? 'rgba(33,150,243,0.07)' : 'inherit',
              color: selectedRoute === item.route ? 'primary.main' : 'inherit',
              '&.Mui-selected': {
                bgcolor: 'rgba(33,150,243,0.07)',
                color: 'primary.main',
                fontWeight: 700,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ color: 'white' }} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <Typography variant="caption" color="text.secondary" sx={{ pl: 3, mb: 1, fontWeight: 700, letterSpacing: 1 }}>
        OTHERS
      </Typography>
      <List>
        {otherItems.map(item => (
          <ListItem
            button
            key={item.label}
            selected={selectedRoute === item.route}
            onClick={() => { navigate(item.route); if (isMobile && onClose) onClose(); }}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              bgcolor: selectedRoute === item.route ? 'rgba(33,150,243,0.07)' : 'inherit',
              color: selectedRoute === item.route ? 'primary.main' : 'inherit',
              '&.Mui-selected': {
                bgcolor: 'rgba(33,150,243,0.07)',
                color: 'primary.main',
                fontWeight: 700,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ color: 'white' }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
  return isMobile ? (
    <Drawer
      variant="temporary"
      open={!!mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          borderRight: '1px solid #f0f0f0',
          bgcolor: drawerBg,
          color: 'white',
          pt: 2,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  ) : (
    <Drawer
      variant="permanent"
      sx={{
        width: 250,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          borderRight: '1px solid #f0f0f0',
          bgcolor: drawerBg,
          color: 'white',
          pt: 2,
        },
      }}
      open
    >
      {drawerContent}
    </Drawer>
  );
};

export default TeacherSidebar; 