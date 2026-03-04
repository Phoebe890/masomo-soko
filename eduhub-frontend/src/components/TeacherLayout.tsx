import React, { useState, useEffect } from 'react';
import { 
    Box, IconButton, Typography, Avatar, Menu, MenuItem, 
    useTheme, AppBar, Toolbar, Badge, Divider, ListItemIcon,
    Popover, List, ListItem, ListItemAvatar, ListItemText, Tooltip, Button, ListItemSecondaryAction,alpha,InputBase, createTheme, ThemeProvider, CssBaseline
} from '@mui/material';
// High-End Icons
import { Bell, User, LogOut, Settings, Home, CheckCircle, DollarSign, Star, X, Info, Sun, Moon  } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import TeacherSidebar from './TeacherSidebar';
import logoIcon from '@/assets/logo-icon.svg';
import MenuIcon from '@mui/icons-material/Menu';
import { Search,  } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";
const BORDER_COLOR = '#E2E8F0';
const BRAND_BLUE = '#2563EB';

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

    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);     
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userProfile, setUserProfile] = useState({ name: '', email: '', profilePic: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const notifRes = await api.get('/api/teacher/notifications');
                setNotifications(notifRes.data);
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
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAllRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            await api.post('/api/teacher/notifications/read-all');
        } catch (e) { console.error(e); }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        try {
            setNotifications(prev => prev.filter(n => n.id !== id));
            await api.delete(`/api/teacher/notifications/${id}`);
        } catch (e) { console.error(e); }
    };

    const handleNotificationClick = async (id: number) => {
        try {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            await api.post(`/api/teacher/notifications/${id}/read`);
        } catch (e) { console.error(e); }
    };

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.clear();
        navigate('/login');
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const getAvatarSrc = (path: string) => {
        if (!path) return undefined;
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${BACKEND_URL}/${cleanPath}`; 
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            <TeacherSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} selectedRoute={selectedRoute} />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` }, display: 'flex', flexDirection: 'column' }}>
                
                {/* --- UPDATED APPBAR --- */}
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: `1px solid ${BORDER_COLOR}`, color: '#1F2937' }}>
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { md: 'none' }, color: '#374151' }}>
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                                {title || 'Dashboard'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            
                            {/* Sharp Blue Notification Bell */}
                            <IconButton 
                                onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                                sx={{ 
                                    border: `1px solid ${BORDER_COLOR}`, 
                                    borderRadius: '2px', // Sharp box
                                    p: 1,
                                    color: BRAND_BLUE 
                                }}
                            >
                                <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem', height: 16, minWidth: 16 } }}>
                                    <Bell size={18} strokeWidth={2.5} />
                                </Badge>
                            </IconButton>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

                            {/* Round Profile Avatar */}
                            <Box 
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                            >
                                <Avatar 
                                    src={getAvatarSrc(userProfile.profilePic)}
                                    sx={{ 
                                        width: 36, height: 36, 
                                        border: `2px solid ${alpha(BRAND_BLUE, 0.1)}`,
                                        
                                    }}
                                >
                                    {userProfile.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1 }}>
                                        {userProfile.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Teacher</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* --- PREMIUM NOTIFICATIONS POPOVER --- */}
<Popover
    open={Boolean(notifAnchorEl)}
    anchorEl={notifAnchorEl}
    onClose={() => setNotifAnchorEl(null)}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    PaperProps={{ 
        sx: { 
            width: 380, 
            mt: 1.5, 
            borderRadius: '2px', // Sharp
            border: `1px solid ${BORDER_COLOR}`, 
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden'
        } 
    }}
>
    {/* Header: Clean & Actionable */}
    <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        bgcolor: '#FFF',
        borderBottom: `1px solid #F1F5F9`
    }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem' }}>
            Notifications
        </Typography>
        {unreadCount > 0 && (
            <Button 
                onClick={handleMarkAllRead}
                sx={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 800, 
                    textTransform: 'none',
                    color: BRAND_BLUE,
                    '&:hover': { bgcolor: alpha(BRAND_BLUE, 0.05) }
                }}
            >
                Mark all as read
            </Button>
        )}
    </Box>

    {/* Scrollable Feed */}
    <Box sx={{ maxHeight: 420, overflow: 'auto', bgcolor: '#FFF' }}>
        {notifications.length === 0 ? (
            <Box sx={{ py: 8, textAlign: 'center', px: 4 }}>
                <Box sx={{ 
                    width: 48, height: 48, bgcolor: '#F8FAFC', borderRadius: '2px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2,
                    border: `1px solid ${BORDER_COLOR}`
                }}>
                    <Bell size={20} color="#94A3B8" strokeWidth={1.5} />
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>No new updates</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>We'll notify you when sales or reviews arrive.</Typography>
            </Box>
        ) : (
            notifications.map((notif) => {
                const isSale = notif.message.toLowerCase().includes('purchased');
                const isReview = notif.message.toLowerCase().includes('review');
                
                return (
                    <Box 
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id)}
                        sx={{ 
                            p: 2,
                            display: 'flex',
                            gap: 2,
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s',
                            bgcolor: notif.read ? 'transparent' : alpha(BRAND_BLUE, 0.02),
                            borderBottom: '1px solid #F8FAFC',
                            '&:hover': { 
                                bgcolor: '#F8FAFC',
                                '& .dismiss-btn': { opacity: 1 }
                            }
                        }}
                    >
                        {/* Unread Indicator Dot */}
                        {!notif.read && (
                            <Box sx={{ 
                                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                                width: 6, height: 6, borderRadius: '50%', bgcolor: BRAND_BLUE 
                            }} />
                        )}

                        {/* Icon Accent */}
                        <Box sx={{ 
                            minWidth: 36, height: 36, 
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '2px',
                            bgcolor: isSale ? alpha('#10B981', 0.1) : isReview ? alpha('#F59E0B', 0.1) : alpha(BRAND_BLUE, 0.1),
                            color: isSale ? '#059669' : isReview ? '#D97706' : BRAND_BLUE,
                        }}>
                            {isSale ? <DollarSign size={16} /> : isReview ? <Star size={16} /> : <Info size={16} />}
                        </Box>

                        {/* Text Content */}
                        <Box sx={{ flexGrow: 1, pr: 2 }}>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    fontWeight: notif.read ? 500 : 700, 
                                    color: '#1E293B', 
                                    fontSize: '0.825rem',
                                    lineHeight: 1.4,
                                    mb: 0.5
                                }}
                            >
                                {notif.message}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 600 }}>
                                {getTimeAgo(notif.createdAt)}
                            </Typography>
                        </Box>

                        {/* Action: Dismiss Button (Hover only) */}
                        <IconButton 
                            className="dismiss-btn"
                            size="small" 
                            onClick={(e) => handleDeleteNotification(e, notif.id)}
                            sx={{ 
                                opacity: 0, // Hidden until row hover
                                position: 'absolute', right: 8, top: 12,
                                transition: 'opacity 0.2s',
                                '&:hover': { color: 'error.main' }
                            }}
                        >
                            <X size={14} />
                        </IconButton>
                    </Box>
                )
            })
        )}
    </Box>

   
    
</Popover>

                {/* --- PROFILE MENU (LUCIDE ICONS) --- */}
                <Menu 
                    anchorEl={anchorEl} 
                    open={Boolean(anchorEl)} 
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{ sx: { minWidth: 200, mt: 1.5, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, boxShadow: '0 10px 25px rgba(0,0,0,0.05)' } }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight={800}>{userProfile.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{userProfile.email}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => navigate('/')} sx={{ py: 1.2 }}>
                        <ListItemIcon><Home size={18} color="#0f6aea" /></ListItemIcon> 
                        <Typography variant="body2" fontWeight={600}>Home</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/teacher/settings')} sx={{ py: 1.2 }}>
                        <ListItemIcon><User size={18} color="#0f6aea" /></ListItemIcon> 
                        <Typography variant="body2" fontWeight={600}>Profile</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => navigate('/teacher/settings')} sx={{ py: 1.2 }}>
                        <ListItemIcon><Settings size={18} color="#0f6aea" /></ListItemIcon> 
                        <Typography variant="body2" fontWeight={600}>Settings</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
                        <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon> 
                        <Typography variant="body2" fontWeight={800}>Logout</Typography>
                    </MenuItem>
                </Menu>

                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default TeacherLayout;