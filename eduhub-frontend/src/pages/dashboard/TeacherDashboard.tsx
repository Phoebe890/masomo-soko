import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Button, Avatar, 
    Grid, IconButton, Menu, MenuItem, 
    useTheme, useMediaQuery, Chip, Container, Paper, 
    Divider, List, ListItem, ListItemAvatar, ListItemText, 
    CircularProgress, Badge
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star'; // Added Star Icon

// Import Sidebar
import TeacherSidebar from './TeacherSidebar';

const BACKEND_URL = "http://localhost:8081";

interface TeacherResourceDTO {
    id: number;
    title: string;
    subject: string;
    price: number;
    pricing: string;
}

interface Notification {
    id: number;
    message: string;
    createdAt: string;
    read: boolean;
}

interface DashboardData {
    resources: TeacherResourceDTO[];
    totalSales: number;
    currentBalance: number;
    profile: any;
}

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

    const [data, setData] = useState<DashboardData>({
        resources: [],
        totalSales: 0,
        currentBalance: 0.0,
        profile: null
    });
    
    const [notifications, setNotifications] = useState<Notification[]>([]);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Stats
                const dashRes = await axios.get(`${BACKEND_URL}/api/teacher/dashboard`, { withCredentials: true });
                setData(dashRes.data);

                // 2. Get Notifications
                const notifRes = await axios.get(`${BACKEND_URL}/api/teacher/notifications`, { withCredentials: true });
                setNotifications(notifRes.data);

            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- HANDLERS ---
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleClearNotifications = async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/teacher/notifications/clear`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    // --- SUB-COMPONENTS ---

    const StatWidget = ({ title, value, icon, color }: any) => (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color }}>{icon}</Box>
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0E243C' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            </Box>
        </Paper>
    );

    const NotificationsMenu = () => (
        <Menu
            anchorEl={notifAnchorEl}
            open={Boolean(notifAnchorEl)}
            onClose={() => setNotifAnchorEl(null)}
            PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1 } }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
                <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                <Button size="small" onClick={handleClearNotifications}>Mark all read</Button>
            </Box>
            <List sx={{ p: 0 }}>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">No notifications yet.</Typography>
                    </Box>
                ) : (
                    notifications.slice(0, 5).map((notif) => (
                        <ListItem key={notif.id} sx={{ bgcolor: notif.read ? 'white' : '#F0F9FF', borderBottom: '1px solid #f5f5f5' }}>
                            <ListItemText 
                                primary={notif.message} 
                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: notif.read ? 400 : 600 }}
                                secondary={new Date(notif.createdAt).toLocaleDateString()}
                            />
                        </ListItem>
                    ))
                )}
            </List>
        </Menu>
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
            
            <TeacherSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} selectedRoute={location.pathname} />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` } }}>
                
                {/* HEADER */}
                <Box sx={{ bgcolor: 'white', px: { xs: 2, md: 4 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E0E0', position: 'sticky', top: 0, zIndex: 100 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isMobile && <IconButton onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>}
                        <Typography variant="h6" fontWeight={800} color="text.primary">Dashboard</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={() => navigate('/dashboard/teacher/upload-first-resource')}
                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', display: { xs: 'none', sm: 'flex' } }}
                        >
                            Upload
                        </Button>
                        
                        {/* NOTIFICATIONS BELL */}
                        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsNoneIcon />
                            </Badge>
                        </IconButton>
                        <NotificationsMenu />

                        <Avatar 
                            src={data.profile?.profilePicPath} 
                            onClick={(e) => setAnchorEl(e.currentTarget)} 
                            sx={{ cursor: 'pointer', bgcolor: theme.palette.primary.main, width: 36, height: 36, fontSize: '0.9rem' }}
                        >
                            {data.profile?.user?.name?.[0] || 'T'}
                        </Avatar>
                        
                        <Menu 
                            anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                            PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={() => navigate('/teacher/settings')}>Settings</MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* CONTENT */}
                <Container maxWidth="xl" sx={{ p: { xs: 2, md: 4 } }}>
                    
                    {/* STATS */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Total Earnings" value={`KES ${data.currentBalance.toLocaleString()}`} icon={<AttachMoneyIcon />} color={theme.palette.success.main} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Total Sales" value={data.totalSales} icon={<ShoppingBagIcon />} color={theme.palette.primary.main} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Total Resources" value={data.resources.length} icon={<PeopleIcon />} color="#8B5CF6" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Avg. Rating" value="4.8" icon={<TrendingUpIcon />} color="#F59E0B" />
                        </Grid>
                    </Grid>

                    {/* ACTIVITY FEED */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={8}>
                            {/* Simple Chart Placeholder */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC' }}>
                                <Typography color="text.secondary">Revenue Analytics Chart</Typography>
                            </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%', minHeight: 300 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Activity</Typography>
                                {notifications.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography color="text.secondary">No recent activity.</Typography>
                                    </Box>
                                ) : (
                                    <List disablePadding>
                                        {notifications.slice(0, 4).map((notif, i) => (
                                            <React.Fragment key={notif.id}>
                                                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                    <ListItemAvatar>
                                                        <Avatar sx={{ 
                                                            bgcolor: notif.message.toLowerCase().includes('purchased') ? '#DCFCE7' : 
                                                                     notif.message.toLowerCase().includes('review') ? '#FEF3C7' : '#E0F2FE',
                                                            color: notif.message.toLowerCase().includes('purchased') ? '#166534' : 
                                                                   notif.message.toLowerCase().includes('review') ? '#B45309' : '#0284C7'
                                                        }}>
                                                            {notif.message.toLowerCase().includes('purchased') ? <AttachMoneyIcon fontSize="small" /> : 
                                                             notif.message.toLowerCase().includes('review') ? <StarIcon fontSize="small" /> : 
                                                             <NotificationsActiveIcon fontSize="small" />}
                                                        </Avatar>
                                                    </ListItemAvatar>
                                                    <ListItemText
                                                        primary={<Typography variant="body2" fontWeight={600}>{notif.message}</Typography>}
                                                        secondary={
                                                            <Typography variant="caption" color="text.secondary">
                                                                {new Date(notif.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        }
                                                    />
                                                </ListItem>
                                                {i < 3 && <Divider variant="inset" component="li" sx={{ ml: 7 }} />}
                                            </React.Fragment>
                                        ))}
                                    </List>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* TOP RESOURCES TABLE */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>Your Resources</Typography>
                                <Button onClick={() => navigate('/dashboard/teacher/resources')}>View All</Button>
                            </Box>
                            
                            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', p: 2, bgcolor: '#F8F9FA', borderBottom: '1px solid #eee' }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">RESOURCE NAME</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">SUBJECT</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">PRICE</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">STATUS</Typography>
                                </Box>
                                
                                {data.resources.length > 0 ? (
                                    data.resources.slice(0, 5).map((resource) => (
                                        <Box key={resource.id} sx={{ 
                                            display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', p: 2, 
                                            borderBottom: '1px solid #f0f0f0', alignItems: 'center'
                                        }}>
                                            <Typography variant="body2" fontWeight={600}>{resource.title}</Typography>
                                            <Typography variant="body2">{resource.subject}</Typography>
                                            <Typography variant="body2" fontWeight={600}>{resource.pricing === "Free" ? "Free" : `KES ${resource.price}`}</Typography>
                                            <Chip label="Active" size="small" sx={{ bgcolor: '#E6FFFA', color: '#047857', fontWeight: 700, width: 'fit-content' }} />
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">No resources uploaded yet.</Typography>
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                </Container>
            </Box>
        </Box>
    );
};

export default TeacherDashboard;