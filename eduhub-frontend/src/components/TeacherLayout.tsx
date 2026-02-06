import React, { useState, useEffect } from 'react';
import { 
    Box, IconButton, Typography, Avatar, Menu, MenuItem, 
    useTheme, AppBar, Toolbar, Badge, Divider, ListItemIcon,
    Popover, List, ListItem, ListItemAvatar, ListItemText, Tooltip, Button ,ListItemSecondaryAction
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import TeacherSidebar from './TeacherSidebar';
import logoIcon from '@/assets/logo-icon.svg';
// Icons
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StarIcon from '@mui/icons-material/Star';
import HomeIcon from '@mui/icons-material/HomeOutlined';
// Environment variable for image paths
const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

// Helper for time

const getTimeAgo = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(); 
};

interface TeacherLayoutProps {
    children: React.ReactNode;
    title?: string;
    selectedRoute: string;
}

const TeacherLayout: React.FC<TeacherLayoutProps> = ({ children, title, selectedRoute }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);     
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

    // Data State
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        profilePic: ''
    });

    // 1. Fetch User Profile & Notifications on Mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Notifications
                const notifRes = await api.get('/api/teacher/notifications');
                setNotifications(notifRes.data);

                // Fetch Settings for Profile Pic
                const settingsRes = await api.get('/api/teacher/settings');
                const profile = settingsRes.data.profile;
                
                setUserProfile({
                    name: profile?.user?.name || 'Instructor',
                    email: profile?.user?.email || '',
                    profilePic: profile?.profilePicPath || ''
                });

            } catch (error) {
                console.error("Failed to load layout data", error);
            }
        };
        fetchData();
        
        // Optional: Poll every 60s
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

   
const handleMarkAllRead = async () => {
    try {
        // 1. Update UI immediately (Optimistic)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        
        // 2. Tell Backend to save this change permanently
        await api.post('/api/teacher/notifications/read-all');
    } catch (e) { 
        console.error("Failed to mark all as read", e); 
    }
};

    const handleDeleteNotification = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevents the 'read' click from firing
    try {
        // 1. Update UI immediately
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // 2. Tell Backend to delete it permanently
        await api.delete(`/api/teacher/notifications/${id}`);
    } catch (e) { 
        console.error("Failed to delete notification", e); 
    }
};

    const handleNotificationClick = async (id: number) => {
    try {
        // Update UI
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        
        // Update Backend
        await api.post(`/api/teacher/notifications/${id}/read`);
    } catch (e) { 
        console.error("Failed to mark notification as read", e); 
    }
};

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.clear();
        navigate('/login');
    };

    const handleProfileClick = () => {
        setAnchorEl(null);
        // Correct path based on typical structure
        navigate('/dashboard/teacher/settings'); 
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Helper to resolve image URL
    const getAvatarSrc = (path: string) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        // Clean double slashes
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${BACKEND_URL}/${cleanPath}`; 
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            
            <TeacherSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                selectedRoute={selectedRoute} 
            />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` }, display: 'flex', flexDirection: 'column' }}>
                
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', color: '#1F2937' }}>
                   <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
    
    {/* --- LEFT SIDE: MENU + MOBILE LOGO + TITLE --- */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
        {/* Hamburger Menu (Mobile Only) */}
        <IconButton 
            onClick={() => setSidebarOpen(true)} 
            sx={{ display: { md: 'none' }, color: '#374151', ml: -1 }}
        >
            <MenuIcon />
        </IconButton>

        {/* MOBILE LOGO (Visible only on small screens) */}
        <Box 
            onClick={() => navigate('/')}
            sx={{ 
                display: { xs: 'flex', md: 'none' }, 
                alignItems: 'center',
                cursor: 'pointer'
            }}
        >
            <Box 
                component="img"
                src={logoIcon}
                alt="Logo"
                sx={{ height: 32, width: 'auto' }}
            />
        </Box>

        {/* DASHBOARD TITLE */}
        <Typography 
            variant="h6" 
            fontWeight={800} 
            noWrap 
            sx={{ 
                color: '#111827', 
                fontSize: { xs: '0.95rem', md: '1.25rem' },
                letterSpacing: '-0.5px'
            }}
        >
            {title || 'Instructor Dashboard'}
        </Typography>
    </Box>

    {/* --- RIGHT SIDE: NOTIFICATIONS + PROFILE --- */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 2 } }}>
        
        {/* Notification Bell */}
        <IconButton 
            onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            sx={{ color: '#6B7280', '&:hover': { color: '#2563EB' } }}
        >
            <Badge badgeContent={unreadCount} color="error">
                <NotificationsNoneIcon />
            </Badge>
        </IconButton>

        {/* Vertical Divider (Desktop Only) */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 24, alignSelf: 'center', display: { xs: 'none', md: 'block' } }} />

        {/* User Profile Section */}
        <Box 
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                cursor: 'pointer', 
                p: 0.5, 
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#F3F4F6' }
            }}
        >
            <Avatar 
                src={getAvatarSrc(userProfile.profilePic)}
                sx={{ 
                    bgcolor: theme.palette.primary.main, 
                    width: { xs: 32, md: 36 }, 
                    height: { xs: 32, md: 36 }, 
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
            >
                {userProfile.name.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" fontWeight={700} color="#111827" lineHeight={1.2}>
                    {userProfile.name}
                </Typography>
                <Typography variant="caption" color="#6B7280" fontWeight={500}>
                    Instructor
                </Typography>
            </Box>
        </Box>
    </Box>
</Toolbar>
                </AppBar>

                {/* --- NOTIFICATIONS POPOVER --- */}
<Popover
    open={Boolean(notifAnchorEl)}
    anchorEl={notifAnchorEl}
    onClose={() => setNotifAnchorEl(null)}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{ 
        sx: { 
            width: 380, 
            maxHeight: 500, 
            borderRadius: 3, 
            mt: 1.5,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        } 
    }}
>
    {/* Header */}
    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
        <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
        {notifications.some(n => !n.read) && (
            <Button 
                size="small" 
                onClick={handleMarkAllRead} 
                startIcon={<CheckCircleIcon fontSize="inherit" />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
            >
                Mark all read
            </Button>
        )}
    </Box>

    {/* Notification List */}
    <List sx={{ p: 0 }}>
        {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <NotificationsActiveIcon sx={{ fontSize: 40, color: '#e0e0e0', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No new notifications</Typography>
            </Box>
        ) : (
            notifications.map((notif) => {
                const isSale = notif.message.toLowerCase().includes('purchased');
                const isReview = notif.message.toLowerCase().includes('review');
                
                return (
                    <ListItem 
                        key={notif.id} 
                        onClick={() => handleNotificationClick(notif.id)}
                        sx={{ 
                            cursor: 'pointer',
                            bgcolor: notif.read ? 'white' : 'rgba(37, 99, 235, 0.04)',
                            borderBottom: '1px solid #f9f9f9',
                            pr: 8, // Space for the 'X' button
                            transition: 'background-color 0.2s',
                            '&:hover': { bgcolor: '#f8fafc' },
                            '&:hover .delete-btn': { opacity: 1 } 
                        }}
                    >
                        {/* Icon/Avatar */}
                        <ListItemAvatar>
                            <Avatar sx={{ 
                                width: 40, height: 40, 
                                bgcolor: isSale ? '#DCFCE7' : isReview ? '#FEF3C7' : '#E0F2FE',
                                color: isSale ? '#166534' : isReview ? '#B45309' : '#0284C7'
                            }}>
                                {isSale ? <AttachMoneyIcon fontSize="small"/> : isReview ? <StarIcon fontSize="small"/> : <NotificationsActiveIcon fontSize="small"/>}
                            </Avatar>
                        </ListItemAvatar>

                        {/* Text Content */}
                        <ListItemText 
                            primary={
                                <Box display="flex" alignItems="center" gap={1}>
                                    <Typography 
                                        variant="body2" 
                                        fontWeight={notif.read ? 400 : 600}
                                        sx={{ color: '#1f2937', lineHeight: 1.4 }}
                                    >
                                        {notif.message}
                                    </Typography>
                                    {!notif.read && (
                                        <FiberManualRecordIcon sx={{ fontSize: 10, color: '#2563EB' }} />
                                    )}
                                </Box>
                            }
                            secondary={
                                <Typography variant="caption" sx={{ color: '#9ca3af', mt: 0.5, display: 'block' }}>
                                    {getTimeAgo(notif.createdAt)}
                                </Typography>
                            }
                        />

                        {/* Dismiss Button (The 'X') */}
                        <ListItemSecondaryAction>
                            <Tooltip title="Dismiss">
                                 <IconButton 
            className="delete-btn" 
            size="small" 
            onClick={(e) => handleDeleteNotification(e, notif.id)}
            sx={{ 
                // Visible on mobile, hover-only on desktop
                opacity: { xs: 0.7, md: 0 }, 
                transition: 'all 0.2s', 
                color: '#9ca3af', // Subtle grey color
                '&:hover': { 
                    opacity: 1,
                    color: 'error.main', 
                    bgcolor: 'rgba(239, 68, 68, 0.08)' // Light red background on hover
                } 
            }}
        >
            <CloseIcon fontSize="small" />
        </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    </ListItem>
                )
            })
        )}
    </List>

    {/* Footer */}
    {notifications.length > 0 && (
        <Box sx={{ p: 1.5, textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                End of notifications
            </Typography>
        </Box>
    )}
</Popover>

                {/* --- USER PROFILE MENU --- */}
<Menu 
    anchorEl={anchorEl} 
    open={Boolean(anchorEl)} 
    onClose={() => setAnchorEl(null)}
    PaperProps={{ sx: { minWidth: 200, mt: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
>
    <Box sx={{ px: 2, py: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700}>
            {userProfile.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {userProfile.email}
        </Typography>
    </Box>
    <Divider />
<MenuItem onClick={() => {
        setAnchorEl(null);
        navigate('/'); // Navigates to the main landing page
    }}>
        <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon> 
        Home
    </MenuItem>
    {/* Profile Link */}
    <MenuItem onClick={() => {
        setAnchorEl(null);
        navigate('/teacher/settings'); // Navigates to the route in your sidebar
    }}>
        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> 
        Profile
    </MenuItem>

    {/* Settings Link */}
    <MenuItem onClick={() => {
        setAnchorEl(null);
        navigate('/teacher/settings'); // Navigates to the same settings route
    }}>
        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> 
        Settings
    </MenuItem>

    <Divider />

    {/* Logout Link */}
    <MenuItem 
        onClick={() => {
            setAnchorEl(null);
            handleLogout(); // Ensure this function clears storage and navigates to login
        }} 
        sx={{ color: 'error.main' }}
    >
        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> 
        Logout
    </MenuItem>
</Menu>

                {/* --- CONTENT AREA --- */}
                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, overflowX: 'hidden' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default TeacherLayout;