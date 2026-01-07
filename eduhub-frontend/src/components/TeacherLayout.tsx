import React, { useState, useEffect } from 'react';
import { 
    Box, IconButton, Typography, Avatar, Menu, MenuItem, 
    useTheme, AppBar, Toolbar, Badge, Divider, ListItemIcon,
    Popover, List, ListItem, ListItemAvatar, ListItemText, Tooltip, Button 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import TeacherSidebar from './TeacherSidebar';

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

const BACKEND_URL = "http://localhost:8081";

// Helper for time
const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hrs ago`;
    return `${Math.floor(hours / 24)} days ago`;
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
    // NEW: Store User Profile Data here
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
                const notifRes = await api.get(`${BACKEND_URL}/api/teacher/notifications`, { withCredentials: true });
                setNotifications(notifRes.data);

                // NEW: Fetch User Settings to get Name/Pic
                const settingsRes = await api.get(`${BACKEND_URL}/api/teacher/settings`, { withCredentials: true });
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
    }, []);

    // ... (Keep existing notification handlers: handleMarkAllRead, handleDeleteNotification, handleNotificationClick) ...
    const handleMarkAllRead = async () => {
        try {
            await api.post(`${BACKEND_URL}/api/teacher/notifications/clear`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await api.delete(`${BACKEND_URL}/api/teacher/notifications/${id}`, { withCredentials: true });
        } catch (e) { console.error(e); }
    };

    const handleNotificationClick = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    // Helper to format Image URL (in case backend sends relative path)
    const getAvatarSrc = (path: string) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        return `${BACKEND_URL}${path}`; // Prepend backend URL if it's a relative path
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
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton 
                                onClick={() => setSidebarOpen(true)} 
                                sx={{ display: { md: 'none' }, color: '#374151' }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" fontWeight={800} noWrap sx={{ color: '#111827' }}>
                                {title || 'Instructor Dashboard'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            
                            <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsNoneIcon />
                                </Badge>
                            </IconButton>

                            {/* UPDATED PROFILE SECTION */}
                            <Box 
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{ 
                                    display: 'flex', alignItems: 'center', gap: 1.5, 
                                    cursor: 'pointer', p: 0.5, pr: 1.5, borderRadius: 4,
                                    '&:hover': { bgcolor: '#F3F4F6' }
                                }}
                            >
                                <Avatar 
                                    src={getAvatarSrc(userProfile.profilePic)}
                                    sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, fontSize: '0.9rem' }}
                                >
                                    {userProfile.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                                        {userProfile.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Instructor
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* ... Keep Notifications Popover code exactly as is ... */}
                <Popover
                    open={Boolean(notifAnchorEl)}
                    anchorEl={notifAnchorEl}
                    onClose={() => setNotifAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ sx: { width: 380, maxHeight: 500, borderRadius: 3, mt: 1.5 } }}
                >
                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                        <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                        {notifications.some(n => !n.read) && (
                            <Button size="small" onClick={handleMarkAllRead} startIcon={<CheckCircleIcon fontSize="inherit" />}>Mark all read</Button>
                        )}
                    </Box>
                    <List sx={{ p: 0 }}>
                        {notifications.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">No new notifications</Typography>
                            </Box>
                        ) : (
                            notifications.map((notif) => {
                                const isSale = notif.message.toLowerCase().includes('purchased');
                                const isReview = notif.message.toLowerCase().includes('review');
                                return (
                                    <ListItem 
                                        key={notif.id} 
                                        button 
                                        onClick={() => handleNotificationClick(notif.id)}
                                        sx={{ 
                                            bgcolor: notif.read ? 'white' : '#F0F7FF',
                                            '&:hover .delete-btn': { opacity: 1 }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ 
                                                width: 40, height: 40, 
                                                bgcolor: isSale ? '#DCFCE7' : isReview ? '#FEF3C7' : '#E0F2FE',
                                                color: isSale ? '#166534' : isReview ? '#B45309' : '#0284C7'
                                            }}>
                                                {isSale ? <AttachMoneyIcon fontSize="small"/> : isReview ? <StarIcon fontSize="small"/> : <NotificationsActiveIcon fontSize="small"/>}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText 
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="body2" fontWeight={notif.read ? 400 : 600}>{notif.message}</Typography>
                                                    {!notif.read && <FiberManualRecordIcon sx={{ fontSize: 10, color: theme.palette.primary.main }} />}
                                                </Box>
                                            }
                                            secondary={<Typography variant="caption" color="text.secondary">{getTimeAgo(notif.createdAt)}</Typography>}
                                        />
                                        <Tooltip title="Remove">
                                            <IconButton 
                                                className="delete-btn" size="small" 
                                                onClick={(e) => handleDeleteNotification(e, notif.id)}
                                                sx={{ opacity: 0, transition: 'opacity 0.2s', '&:hover': { color: 'error.main' } }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </ListItem>
                                )
                            })
                        )}
                    </List>
                </Popover>

                {/* PROFILE MENU */}
                <Menu 
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { minWidth: 200, mt: 1.5, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={700}>{userProfile.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{userProfile.email}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => navigate('/dashboard/teacher/settings')}>
                        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> Profile
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/dashboard/teacher/settings')}>
                        <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Logout
                    </MenuItem>
                </Menu>

                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, overflowX: 'hidden' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default TeacherLayout;