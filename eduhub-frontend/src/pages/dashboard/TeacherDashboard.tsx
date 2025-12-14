import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Button, Avatar, 
    Grid, IconButton, Menu, MenuItem, 
    useTheme, useMediaQuery, Chip, Container, Paper, 
    Divider, ListItemIcon, List, ListItem, ListItemAvatar, ListItemText, 
    CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

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

// Import Loading Context (Ensure this path is correct for your project)
import { useLoading } from '../../context/LoadingContext';

// --- Types based on your Spring Boot DTOs ---
interface TeacherResourceDTO {
    id: number;
    title: string;
    subject: string;
    price: number;
    pricing: string;
    salesCount?: number; // Optional depending on DTO
}

interface TeacherProfile {
    bio: string;
    profilePicPath: string;
    paymentNumber: string;
}

interface DashboardData {
    resources: TeacherResourceDTO[];
    totalSales: number;
    currentBalance: number;
    profile: TeacherProfile | null;
}

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Loading Context
    const { startLoading, stopLoading } = useLoading();

    // State
    const [dashboardData, setDashboardData] = useState<DashboardData>({
        resources: [],
        totalSales: 0,
        currentBalance: 0.0,
        profile: null
    });
    
    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // Fetch Data from Backend
   // Inside TeacherDashboard.tsx

useEffect(() => {
    const fetchData = async () => {
        startLoading();
        try {
            // FIX: Ensure this is http://localhost:8081
            const response = await axios.get('http://localhost:8081/api/teacher/dashboard', {
                withCredentials: true
            });

            if (response.status === 200) {
                setDashboardData(response.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            stopLoading();
        }
    };

    fetchData();
}, []);

    // Handlers
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    
    const handleLogout = async () => {
        startLoading();
        try {
            // Optional: Call backend logout endpoint if you have one
            // await axios.post('http://localhost:8080/logout'); 
            
            // Clear local storage
            localStorage.clear();
            
            navigate('/'); // Redirect to Home/Login
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            stopLoading();
            handleMenuClose();
        }
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

    // Placeholder Chart - (Backend endpoint /analytics is separate, using mock data for UI visual)
    const RevenueChart = () => (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Revenue Analytics</Typography>
                    <Typography variant="body2" color="text.secondary">Income Overview</Typography>
                </Box>
                <Button variant="outlined" size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/teacher/analytics')}>
                    Full Report
                </Button>
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
                        
                        {/* PROFILE AVATAR FROM BACKEND DATA */}
                        <Avatar 
                            src={dashboardData.profile?.profilePicPath} 
                            onClick={handleAvatarClick} 
                            sx={{ cursor: 'pointer', bgcolor: theme.palette.primary.main, width: 36, height: 36 }}
                        >
                            {/* Fallback Initial */}
                            T
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
                    
                    {/* 1. STATS ROW - Data from Backend */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget 
                                title="Total Earnings" 
                                value={`KES ${dashboardData.currentBalance.toLocaleString()}`} 
                                icon={<AttachMoneyIcon />} 
                                color={theme.palette.success.main}
                                trend="Lifetime"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget 
                                title="Total Sales" 
                                value={dashboardData.totalSales} 
                                icon={<ShoppingBagIcon />} 
                                color={theme.palette.primary.main}
                                trend="Items sold"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget 
                                title="Total Resources" 
                                value={dashboardData.resources.length} 
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
                        
                        {/* Recent Activity (Placeholder as backend dashboard endpoint only gives summaries) */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%' }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>System Status</Typography>
                                <List disablePadding>
                                    <ListItem>
                                        <ListItemAvatar><Avatar sx={{ bgcolor: '#E0F2FE', color: '#0284C7' }}><CheckCircleIcon /></Avatar></ListItemAvatar>
                                        <ListItemText primary="Account Active" secondary="Your profile is visible" />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                    <ListItem>
                                        <ListItemAvatar><Avatar sx={{ bgcolor: '#FCE7F3', color: '#DB2777' }}><CloudUploadIcon /></Avatar></ListItemAvatar>
                                        <ListItemText primary="Uploads Enabled" secondary="You can publish resources" />
                                    </ListItem>
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* 3. QUICK ACTIONS & TOP RESOURCES TABLE */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" fontWeight={700}>Your Resources</Typography>
                                <Button onClick={() => navigate('/dashboard/teacher/resources')}>View All</Button>
                            </Box>
                            
                            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
                                {/* Table Header */}
                                <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', p: 2, bgcolor: '#F8F9FA', borderBottom: '1px solid #eee' }}>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">RESOURCE NAME</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">SUBJECT</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">PRICE</Typography>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">STATUS</Typography>
                                </Box>
                                
                                {/* Rows - Mapped from Backend Data */}
                                {dashboardData.resources.length > 0 ? (
                                    dashboardData.resources.slice(0, 5).map((resource, index) => (
                                        <Box key={resource.id} sx={{ 
                                            display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', p: 2, 
                                            borderBottom: '1px solid #f0f0f0',
                                            alignItems: 'center',
                                            '&:hover': { bgcolor: '#F8F9FA' }
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                {/* Fallback Icon for resource */}
                                                <Box sx={{ width: 40, height: 40, borderRadius: 1, bgcolor: '#eee', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                                    <PeopleIcon fontSize="small" color="disabled"/>
                                                </Box>
                                                <Typography variant="body2" fontWeight={600}>{resource.title}</Typography>
                                            </Box>
                                            <Typography variant="body2">{resource.subject}</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {resource.pricing === "Free" ? "Free" : `KES ${resource.price}`}
                                            </Typography>
                                            <Chip 
                                                label="Active" 
                                                size="small" 
                                                sx={{ bgcolor: '#E6FFFA', color: '#047857', fontWeight: 700, width: 'fit-content' }} 
                                            />
                                        </Box>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">You haven't uploaded any resources yet.</Typography>
                                        <Button 
                                            variant="outlined" sx={{ mt: 2 }}
                                            onClick={() => navigate('/dashboard/teacher/upload-first-resource')}
                                        >
                                            Upload First Resource
                                        </Button>
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

// Simple icon import helper for the status section
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

export default TeacherDashboard;