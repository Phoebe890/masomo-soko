import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, useTheme, useMediaQuery, Box, Avatar, Typography, Divider } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Changed Home to Dashboard for professional look
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  selectedRoute?: string; // Added to highlight active tab
}

const drawerWidth = 260; // Slightly wider for a "Pro" feel

const TeacherSidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onClose, selectedRoute }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Updated paths to match a Teacher context usually found in these apps
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/teacher' },
    { text: 'My Resources', icon: <SchoolIcon />, path: '/dashboard/teacher/resources' },
    { text: 'Earnings', icon: <MonetizationOnIcon />, path: '/teacher/earnings' },
    { text: 'Reviews', icon: <StarOutlineIcon />, path: '/teacher/reviews' },
    { text: 'Profile', icon: <PersonIcon />, path: '/teacher/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/teacher/settings' },
  ];

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand / Logo Area */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h6" fontWeight={700} color="primary">
          EduPlatform
        </Typography>
      </Box>
      <Divider />
      
      <List sx={{ px: 2, pt: 2 }}>
        {menuItems.map((item) => {
          const isActive = selectedRoute === item.path;
          return (
            <ListItem
              button
              key={item.text}
              component={RouterLink}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              sx={{
                mb: 1,
                borderRadius: 2,
                backgroundColor: isActive ? 'rgba(33, 150, 243, 0.08)' : 'transparent', // Highlight active
                color: isActive ? theme.palette.primary.main : 'text.primary',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.04)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: isActive ? theme.palette.primary.main : 'text.secondary' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: isActive ? 600 : 400 }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid #e0e0e0',
            bgcolor: '#fff' 
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default TeacherSidebar;