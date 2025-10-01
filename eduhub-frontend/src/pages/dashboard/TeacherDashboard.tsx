import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Button, Avatar, TextField, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Chip, Grid, Alert, Link, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings'; // Import settings icon
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Menu from '@mui/material/Menu';
import Badge from '@mui/material/Badge';
import TeacherSidebar from './TeacherSidebar';
import { useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [resources, setResources] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [totalSales, setTotalSales] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);

    // We can keep the dialog states for managing resources if you still need them
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedResource, setSelectedResource] = useState<any>(null);
    // ... other states for resource management ...

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    const handleEditProfile = () => {
      handleMenuClose();
      navigate('/teacher/settings');
    };
    const handleLogout = () => {
      localStorage.removeItem('email');
      localStorage.removeItem('role');
      handleMenuClose();
      navigate('/');
    };

    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showAll, setShowAll] = useState(false);
    const unreadCount = notifications.filter(n => !n.read).length;

    const fetchNotifications = () => {
      fetch('/api/teacher/notifications', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setNotifications(data);
          else setNotifications([]);
        })
        .catch(() => setNotifications([]));
    };

    useEffect(() => { fetchNotifications(); }, []);

    const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
      setNotifAnchorEl(event.currentTarget);
      fetchNotifications();
    };
    const handleNotifClose = () => setNotifAnchorEl(null);
    const handleClearAll = () => {
      fetch('/api/teacher/notifications/clear', { method: 'POST', credentials: 'include' })
        .then(() => { fetchNotifications(); });
    };
    const handleSeeAll = () => setShowAll(s => !s);

    useEffect(() => {
        fetch('http://localhost:8089/api/teacher/dashboard', {
            credentials: 'include'
        })
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch dashboard data');
            return res.json();
        })
        .then(data => {
            setResources(data.resources || []);
            setProfile(data.profile || null);
            setTotalSales(data.totalSales || 0);
            setCurrentBalance(data.currentBalance || 0);
        })
        .catch((err) => console.error("Failed to fetch dashboard data:", err));
    }, []);

    // Placeholder functions for resource management can stay
    const handleOpenEditDialog = (resource: any) => { /* Your logic here */ };
    const handleOpenDeleteDialog = (resource: any) => { /* Your logic here */ };

    const location = useLocation();
    const selectedRoute = location.pathname;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <Container maxWidth={false} disableGutters sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50', p: 0 }}>
          <TeacherSidebar selectedRoute={selectedRoute} mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1, md: 6 }, width: '100%' }}>
            {/* Top bar with icons, avatar, and name */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 4, gap: 2 }}>
                {isMobile && (
                    <IconButton onClick={() => setSidebarOpen(true)} sx={{ mr: 1 }}>
                        <MenuIcon />
                    </IconButton>
                )}
                <IconButton sx={{ border: '1.5px solid #e0e0e0', bgcolor: 'white', mr: 1, width: 48, height: 48 }}>
                    <DarkModeIcon sx={{ fontSize: 28, color: '#888' }} />
                </IconButton>
                <Badge color="error" badgeContent={unreadCount} invisible={unreadCount === 0} sx={{ mr: 1 }}>
                  <IconButton sx={{ border: '1.5px solid #e0e0e0', bgcolor: 'white', width: 48, height: 48 }} onClick={handleNotifClick}>
                    <NotificationsNoneIcon sx={{ fontSize: 28, color: '#888' }} />
                  </IconButton>
                </Badge>
                <IconButton onClick={handleAvatarClick} sx={{ p: 0, ml: 1, mr: 1 }}>
                    <Avatar src={profile?.profilePicPath || undefined} sx={{ width: 40, height: 40 }} />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} onClick={handleMenuClose}>
                    <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
                <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifClose} PaperProps={{ sx: { minWidth: 340, maxWidth: 400, maxHeight: 400 } }}>
                  <Box sx={{ px: 2, pt: 1, pb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography fontWeight={700}>Notifications</Typography>
                    <Button size="small" onClick={handleClearAll} sx={{ textTransform: 'none' }}>Clear All</Button>
                  </Box>
                  <List dense disablePadding>
                    {(showAll ? notifications : notifications.slice(0, 5)).map((notif, idx) => (
                      <ListItem key={notif.id || idx} sx={{ bgcolor: notif.read ? 'inherit' : 'rgba(33,150,243,0.07)' }}>
                        <ListItemText
                          primary={notif.message}
                          secondary={notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                        />
                      </ListItem>
                    ))}
                    {notifications.length === 0 && (
                      <ListItem><ListItemText primary="No notifications" /></ListItem>
                    )}
                  </List>
                  {notifications.length > 5 && (
                    <MenuItem onClick={handleSeeAll} sx={{ justifyContent: 'center', fontWeight: 600 }}>
                      {showAll ? 'Show Less' : 'See All Notifications'}
                    </MenuItem>
                  )}
                </Menu>
            </Box>
            
            {/* --- THIS IS THE NEW, CORRECTED HEADER --- */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700}>
                    Teacher Dashboard
                </Typography>
                <Button 
                    variant="outlined" 
                    startIcon={<SettingsIcon />} 
                    onClick={() => navigate('/teacher/settings')}
                >
                    Settings & Integrations
                </Button>
            </Box>
            
            {/* --- THIS IS THE NEW COACHING MANAGEMENT SECTION --- */}
            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h5" fontWeight={600}>
                        Coaching Management
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            onClick={() => navigate('/teacher/coaching-services')}
                        >
                            Manage My Services
                        </Button>
                        <Button 
                            variant="contained" 
                            color="secondary"
                            onClick={() => navigate('/teacher/availability')}
                        >
                            Set My Availability
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* The rest of your dashboard content (e.g., resources table) */}
            <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>My Uploaded Resources</Typography>
            <TableContainer component={Paper}>
                {/* Your existing table for resources goes here */}
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Price (KES)</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {resources.map((resource) => (
                            <TableRow key={resource.id}>
                                <TableCell>{resource.title}</TableCell>
                                <TableCell>{resource.price || 'Free'}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpenEditDialog(resource)}><EditIcon /></IconButton>
                                    <IconButton onClick={() => handleOpenDeleteDialog(resource)}><DeleteIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Your dialogs for editing/deleting resources would go here */}

          </Box>
        </Container>
    );
};

export default TeacherDashboard;