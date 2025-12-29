import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, Typography, Button, Avatar, 
    Grid, IconButton, Menu, MenuItem, 
    useTheme, useMediaQuery, Chip, Container, Paper, 
    Divider, List, ListItem, ListItemAvatar, ListItemText, 
    CircularProgress, Badge, Popover, Tooltip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

import TeacherSidebar from './TeacherSidebar';

const BACKEND_URL = "http://localhost:8081";

const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hrs ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "Just now";
};

interface Review {
    rating: number;
    comment: string;
}

interface TeacherResourceDTO {
    id: number;
    title: string;
    subject: string;
    price: number;
    pricing: string;
    reviews?: Review[];
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
    const [analyticsData, setAnalyticsData] = useState<{date: string, sales: number}[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashRes = await axios.get(`${BACKEND_URL}/api/teacher/dashboard`, { withCredentials: true });
                setData(dashRes.data);

                const notifRes = await axios.get(`${BACKEND_URL}/api/teacher/notifications`, { withCredentials: true });
                setNotifications(notifRes.data);

                const analyticsRes = await axios.get(`${BACKEND_URL}/api/teacher/analytics`, { withCredentials: true });
                const rawSales = analyticsRes.data.salesLast30Days || {};
                const chartData = Object.keys(rawSales).sort().map(dateKey => {
                    const date = new Date(dateKey);
                    return {
                        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        sales: rawSales[dateKey]
                    };
                });
                setAnalyticsData(chartData);

            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const averageRating = useMemo(() => {
        let totalRating = 0;
        let count = 0;
        data.resources.forEach(res => {
            if (res.reviews && res.reviews.length > 0) {
                res.reviews.forEach(r => {
                    totalRating += r.rating;
                    count++;
                });
            }
        });
        return count === 0 ? 0 : (totalRating / count).toFixed(1);
    }, [data.resources]);

    const getUserInitial = () => {
        const name = data.profile?.user?.name;
        if (name && typeof name === 'string' && name.length > 0) {
            return name.charAt(0).toUpperCase();
        }
        return 'T';
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/teacher/notifications/clear`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    const handleDeleteNotification = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        const previousNotifications = [...notifications];
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await axios.delete(`${BACKEND_URL}/api/teacher/notifications/${id}`, { 
                withCredentials: true 
            });
        } catch (e) { 
            console.error("Failed to delete notification", e);
            setNotifications(previousNotifications);
        }
    };

    const handleNotificationClick = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const StatWidget = ({ title, value, icon, color }: any) => (
        <Paper elevation={0} sx={{ 
            p: 3, borderRadius: 3, border: '1px solid #eee', 
            height: '100%', display: 'flex', flexDirection: 'column', 
            justifyContent: 'space-between', transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color }}>{icon}</Box>
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0E243C' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            </Box>
        </Paper>
    );

    const NotificationsPopover = () => (
        <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={() => setNotifAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 380, maxHeight: 500, borderRadius: 3, mt: 1.5, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' } }}
        >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
                <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                {notifications.some(n => !n.read) && (
                    <Button 
                        size="small" 
                        onClick={handleMarkAllRead} 
                        startIcon={<CheckCircleIcon fontSize="inherit" />}
                        sx={{ fontSize: '0.75rem', textTransform: 'none' }}
                    >
                        Mark all read
                    </Button>
                )}
            </Box>
            <List sx={{ p: 0 }}>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: '50%', mb: 2 }}>
                            <NotificationsNoneIcon sx={{ fontSize: 32, color: '#bdbdbd' }} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">You're all caught up!</Typography>
                    </Box>
                ) : (
                    notifications.map((notif) => {
                        const isSale = notif.message.toLowerCase().includes('purchased') || notif.message.toLowerCase().includes('sold');
                        const isReview = notif.message.toLowerCase().includes('review') || notif.message.toLowerCase().includes('rated');
                        
                        return (
                            <ListItem 
                                key={notif.id} 
                                button
                                onClick={() => handleNotificationClick(notif.id)}
                                sx={{ 
                                    borderBottom: '1px solid #f9f9f9',
                                    bgcolor: notif.read ? 'white' : '#F0F7FF',
                                    transition: 'all 0.2s',
                                    pr: 5, 
                                    '&:hover': { 
                                        bgcolor: '#fafafa',
                                        '& .delete-btn': { opacity: 1 } 
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ 
                                        width: 40, height: 40,
                                        bgcolor: isSale ? '#DCFCE7' : isReview ? '#FEF3C7' : '#E0F2FE',
                                        color: isSale ? '#166534' : isReview ? '#B45309' : '#0284C7'
                                    }}>
                                        {isSale ? <AttachMoneyIcon fontSize="small" /> : 
                                         isReview ? <StarIcon fontSize="small" /> : 
                                         <NotificationsActiveIcon fontSize="small" />}
                                    </Avatar>
                                </ListItemAvatar>
                                
                                <ListItemText 
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" fontWeight={notif.read ? 400 : 600} color="#333" sx={{ lineHeight: 1.3 }}>
                                                {notif.message}
                                            </Typography>
                                            {!notif.read && <FiberManualRecordIcon sx={{ fontSize: 10, color: theme.palette.primary.main }} />}
                                        </Box>
                                    }
                                    secondary={
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                            {getTimeAgo(notif.createdAt)}
                                        </Typography>
                                    }
                                />

                                <Tooltip title="Remove">
                                    <IconButton 
                                        className="delete-btn"
                                        size="small" 
                                        onClick={(e) => handleDeleteNotification(e, notif.id)}
                                        sx={{ 
                                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                                            opacity: 0, transition: 'opacity 0.2s', color: '#999',
                                            '&:hover': { color: 'error.main', bgcolor: '#fee2e2' }
                                        }}
                                    >
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </ListItem>
                        );
                    })
                )}
            </List>
        </Popover>
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
            
            <TeacherSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} selectedRoute={location.pathname} />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` } }}>
                
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
                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', display: { xs: 'none', sm: 'flex' }, boxShadow: 'none' }}
                        >
                            Upload
                        </Button>
                        
                        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsNoneIcon color="action" />
                            </Badge>
                        </IconButton>
                        <NotificationsPopover />

                        <Avatar 
                            src={data.profile?.profilePicPath} 
                            onClick={(e) => setAnchorEl(e.currentTarget)} 
                            sx={{ cursor: 'pointer', bgcolor: theme.palette.primary.main, width: 40, height: 40, fontSize: '1.1rem', fontWeight: 600 }}
                        >
                            {getUserInitial()}
                        </Avatar>
                        
                        <Menu 
                            anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                            PaperProps={{ sx: { minWidth: 200, mt: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle2" fontWeight={700}>{data.profile?.user?.name || 'Teacher'}</Typography>
                                <Typography variant="caption" color="text.secondary">{data.profile?.user?.email}</Typography>
                            </Box>
                            <Divider />
                            <MenuItem onClick={() => navigate('/dashboard/teacher/settings')}>Settings</MenuItem>
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Box>

                <Container maxWidth="xl" sx={{ p: { xs: 2, md: 4 } }}>
                    
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
                            <StatWidget title="Avg. Rating" value={averageRating} icon={<StarIcon />} color="#F59E0B" />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={8}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: 400 }}>
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" fontWeight={700}>Revenue Analytics</Typography>
                                    <Typography variant="caption" color="text.secondary">Sales performance over last 30 days</Typography>
                                </Box>
                                <ResponsiveContainer width="100%" height="85%">
                                    <AreaChart data={analyticsData}>
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="date" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                        <YAxis tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                                        <RechartsTooltip 
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ color: theme.palette.primary.main, fontWeight: 600 }}
                                        />
                                        <Area 
                                            type="monotone" 
                                            dataKey="sales" 
                                            stroke={theme.palette.primary.main} 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorSales)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%', minHeight: 400, overflow: 'hidden' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Activity</Typography>
                                {notifications.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', py: 8 }}>
                                        <NotificationsNoneIcon sx={{ fontSize: 40, color: '#eee', mb: 1 }} />
                                        <Typography color="text.secondary">No recent activity.</Typography>
                                    </Box>
                                ) : (
                                    <List disablePadding>
                                        {notifications.slice(0, 5).map((notif, i) => {
                                             const isSale = notif.message.toLowerCase().includes('purchased');
                                             return (
                                                <React.Fragment key={notif.id}>
                                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                                        <ListItemAvatar>
                                                            <Avatar sx={{ 
                                                                bgcolor: isSale ? '#DCFCE7' : '#E0F2FE',
                                                                color: isSale ? '#166534' : '#0284C7',
                                                                width: 36, height: 36
                                                            }}>
                                                                {isSale ? <AttachMoneyIcon fontSize="small" /> : <NotificationsActiveIcon fontSize="small" />}
                                                            </Avatar>
                                                        </ListItemAvatar>
                                                        <ListItemText
                                                            primary={<Typography variant="body2" fontWeight={600}>{notif.message}</Typography>}
                                                            secondary={
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {getTimeAgo(notif.createdAt)}
                                                                </Typography>
                                                            }
                                                        />
                                                    </ListItem>
                                                    {i < 4 && <Divider variant="inset" component="li" sx={{ ml: 7, borderColor: '#f5f5f5' }} />}
                                                </React.Fragment>
                                             );
                                        })}
                                    </List>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>Your Top Resources</Typography>
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
                                            borderBottom: '1px solid #f0f0f0', alignItems: 'center',
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: '#fafafa' }
                                        }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{resource.title}</Typography>
                                                <Typography variant="caption" color="text.secondary">{resource.reviews?.length || 0} reviews</Typography>
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">{resource.subject}</Typography>
                                            <Typography variant="body2" fontWeight={600}>{resource.pricing === "Free" ? "Free" : `KES ${resource.price}`}</Typography>
                                            <Chip label="Active" size="small" sx={{ bgcolor: '#E6FFFA', color: '#047857', fontWeight: 700, width: 'fit-content', borderRadius: 1 }} />
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">No resources uploaded yet.</Typography>
                                        <Button sx={{ mt: 1 }} onClick={() => navigate('/dashboard/teacher/upload-first-resource')}>Upload Now</Button>
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