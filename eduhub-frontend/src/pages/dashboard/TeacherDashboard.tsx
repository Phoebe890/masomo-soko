import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Button, Avatar, 
    Grid, Card, CardContent, IconButton, Menu, MenuItem, 
    useTheme, useMediaQuery, Chip, Container, Stack, Paper, 
    Divider, ListItemIcon, List, ListItem, ListItemAvatar, ListItemText, LinearProgress 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
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

// Import Sidebar
import TeacherSidebar from './TeacherSidebar';

// 1. IMPORT THE LOADING HOOK
import { useLoading } from '../../context/LoadingContext';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // 2. GET THE LOADING FUNCTIONS
    const { startLoading, stopLoading } = useLoading();

    // State
    const [profile, setProfile] = useState<any>(null);
    const [totalSales, setTotalSales] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);
    
    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Fetch Data
    useEffect(() => {
        // 3. START LOADING
        startLoading();

        // Simulating a Fetch Request (Added timeout so you can see the spinner)
        const fetchData = async () => {
            try {
                // In a real app, this is where: await fetch('...') happens
                
                // Simulate 1 second network delay
                await new Promise(resolve => setTimeout(resolve, 1000));

                setProfile({ firstName: 'Instructor', profilePicPath: '' });
                setTotalSales(15400);
                setCurrentBalance(4200);
            } catch (error) {
                console.error(error);
            } finally {
                // 4. STOP LOADING (Always run this at the end)
                stopLoading();
            }
        };

        fetchData();
    }, []);

    // Handlers
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        // Show loader during logout too for a smooth effect
        startLoading();
        setTimeout(() => {
            localStorage.removeItem('email');
            localStorage.removeItem('role');
            stopLoading();
            handleMenuClose();
            navigate('/');
        }, 500);
    };

    // --- SUB-COMPONENTS ---

    const StatWidget = ({ title, value, icon, trend, color }: any) => (
        <Paper elevation={0} sx={{ 
            p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color }}>
                    {icon}
                </Box>
                {trend && (
                    <Chip 
                        label={trend} 
                        size="small" 
                        sx={{ bgcolor: '#E6FFFA', color: '#047857', fontWeight: 700, borderRadius: 1 }} 
                    />
                )}
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0E243C' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            </Box>
        </Paper>
    );

    const RevenueChart = () => (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Revenue Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">Income over the last 7 days</Typography>
                </Box>
                <Button variant="outlined" size="small" endIcon={<ArrowForwardIcon />}>Full Report</Button>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 200, gap: 1 }}>
                {[40, 65, 30, 80, 55, 90, 70].map((height, i) => (
                    <Box key={i} sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                            width: '60%', 
                            height: `${height}%`, 
                            bgcolor: i === 6 ? theme.palette.primary.main : '#E2E8F0', 
                            borderRadius: 2,
                            transition: 'height 1s',
                            '&:hover': { bgcolor: theme.palette.primary.main }
                        }} />
                        <Typography variant="caption" color="text.secondary">
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );

    const RecentActivity = () => (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%' }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Sales</Typography>
            <List disablePadding>
                {[
                    { name: 'John Doe', item: 'Form 4 Math Notes', time: '2 mins ago', amount: 'KES 200' },
                    { name: 'Sarah Smith', item: 'Biology Revision', time: '1 hour ago', amount: 'KES 500' },
                    { name: 'Mike Johnson', item: 'History Paper 1', time: '3 hours ago', amount: 'KES 150' },
                    { name: 'Emily Davis', item: 'Physics Guide', time: '5 hours ago', amount: 'KES 300' },
                ].map((sale, i) => (
                    <React.Fragment key={i}>
                        <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                            <ListItemAvatar>
                                <Avatar sx={{ bgcolor: i % 2 === 0 ? '#E0F2FE' : '#FCE7F3', color: i % 2 === 0 ? '#0284C7' : '#DB2777', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {sale.name[0]}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                primary={<Typography variant="subtitle2" fontWeight={700}>{sale.item}</Typography>}
                                secondary={
                                    <Typography variant="caption" component="span" color="text.secondary">
                                        Sold to <b>{sale.name}</b> • {sale.time}
                                    </Typography>
                                }
                            />
                            <Typography variant="subtitle2" fontWeight={700} color="success.main">+{sale.amount}</Typography>
                        </ListItem>
                        {i < 3 && <Divider variant="inset" component="li" sx={{ ml: 7 }} />}
                    </React.Fragment>
                ))}
            </List>
            <Button fullWidth sx={{ mt: 1, textTransform: 'none' }}>View All Transactions</Button>
        </Paper>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
            
            <TeacherSidebar 
                selectedRoute={location.pathname} 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` } }}>
                
                {/* --- HEADER --- */}
                <Box sx={{ 
                    bgcolor: 'white', px: { xs: 2, md: 4 }, py: 2, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid #E0E0E0', position: 'sticky', top: 0, zIndex: 100
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isMobile && <IconButton onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>}
                        <Typography variant="h6" fontWeight={800} color="text.primary">Dashboard Overview</Typography>
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
                        <IconButton><NotificationsNoneIcon /></IconButton>
                        <Avatar 
                            src={profile?.profilePicPath} 
                            onClick={handleAvatarClick} 
                            sx={{ cursor: 'pointer', bgcolor: theme.palette.primary.main, width: 36, height: 36 }}
                        >
                            {profile?.firstName?.[0] || 'T'}
                        </Avatar>
                        
                        <Menu 
                            anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}
                            PaperProps={{ sx: { minWidth: 200, mt: 1.5, borderRadius: 3, boxShadow: 3 } }}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/'); }}><ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon>Home Page</MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); navigate('/teacher/settings'); }}><ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>Settings</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* --- MAIN CONTENT BODY --- */}
                <Container maxWidth="xl" sx={{ p: { xs: 2, md: 4 } }}>
                    
                    {/* 1. STATS ROW */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget 
                                title="Total Earnings" 
                                value={`KES ${totalSales.toLocaleString()}`} 
                                icon={<AttachMoneyIcon />} 
                                color={theme.palette.success.main}
                                trend="+12% this week"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget 
                                title="Current Balance" 
                                value={`KES ${currentBalance.toLocaleString()}`} 
                                icon={<ShoppingBagIcon />} 
                                color={theme.palette.primary.main}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget 
                                title="Total Students" 
                                value="1,204" 
                                icon={<PeopleIcon />} 
                                color="#8B5CF6" // Purple
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget 
                                title="Avg. Rating" 
                                value="4.8" 
                                icon={<TrendingUpIcon />} 
                                color="#F59E0B" // Orange
                            />
                        </Grid>
                    </Grid>

                    {/* 2. ANALYTICS & ACTIVITY ROW */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Revenue Chart */}
                        <Grid item xs={12} md={8}>
                            <RevenueChart />
                        </Grid>
                        
                        {/* Recent Activity Feed */}
                        <Grid item xs={12} md={4}>
                            <RecentActivity />
                        </Grid>
                    </Grid>

                    {/* 3. QUICK ACTIONS & TOP RESOURCES */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>Top Performing Resources</Typography>
                                <Button onClick={() => navigate('/dashboard/teacher/resources')}>View All</Button>
                            </Box>
                            
                            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
                                {/* Mock Table Header */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', p: 2, bgcolor: '#F8F9FA', borderBottom: '1px solid #eee' }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">RESOURCE NAME</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">SALES</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">REVENUE</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">STATUS</Typography>
                                </Box>
                                
                                {/* Mock Rows */}
                                {[
                                    { title: 'Complete KCSE Math Revision', sales: 124, revenue: 'KES 24,800', status: 'Active' },
                                    { title: 'Biology Form 2 Notes', sales: 98, revenue: 'KES 9,800', status: 'Active' },
                                    { title: 'History & Government Guide', sales: 45, revenue: 'KES 6,750', status: 'Review' },
                                ].map((row, index) => (
                                    <Box key={index} sx={{ 
                                        display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', p: 2, 
                                        borderBottom: index !== 2 ? '1px solid #f0f0f0' : 'none',
                                        alignItems: 'center',
                                        '&:hover': { bgcolor: '#F8F9FA' }
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#eee' }} />
                                            <Typography variant="body2" fontWeight={600}>{row.title}</Typography>
                                        </Box>
                                        <Typography variant="body2">{row.sales}</Typography>
                                        <Typography variant="body2" fontWeight={600}>{row.revenue}</Typography>
                                        <Chip 
                                            label={row.status} 
                                            size="small" 
                                            sx={{ 
                                                bgcolor: row.status === 'Active' ? '#E6FFFA' : '#FFFAF0', 
                                                color: row.status === 'Active' ? '#047857' : '#9A3412',
                                                fontWeight: 700,
                                                width: 'fit-content'
                                            }} 
                                        />
                                    </Box>
                                ))}
                            </Paper>
                        </Grid>
                    </Grid>

                </Container>
            </Box>
        </Box>
    );
};

export default TeacherDashboard;