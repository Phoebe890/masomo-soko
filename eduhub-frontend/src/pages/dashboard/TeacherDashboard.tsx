import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Button, Avatar, 
    Grid, Card, CardContent, CardMedia, 
    IconButton, Menu, MenuItem, useTheme, 
    useMediaQuery, Chip, Container, Stack, Paper
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import LogoutIcon from '@mui/icons-material/Logout';

// Import the new Sidebar
import TeacherSidebar from './TeacherSidebar';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // --- YOUR ORIGINAL STATE ---
    const [resources, setResources] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [totalSales, setTotalSales] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);

    // Sidebar & UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    // --- YOUR ORIGINAL FETCH LOGIC ---
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

    // Handlers
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        handleMenuClose();
        navigate('/');
    };

    // Helper for thumbnails
    const getThumbnail = (index: number) => {
        const images = [
            "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=500&q=80", 
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=500&q=80", 
            "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=500&q=80", 
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&q=80"
        ];
        return images[index % images.length];
    };

    // --- WIDGET COMPONENT ---
    const DashboardWidget = ({ title, value, icon, color, gradient }: any) => (
        <Paper sx={{ 
            p: 3, 
            height: '100%', 
            borderRadius: 4, 
            background: gradient, // Gradient Background
            color: 'white',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Icon Decoration */}
            <Box sx={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.2, transform: 'scale(2.5)' }}>
                {icon}
            </Box>
            
            <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.9 }}>
                    {icon}
                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h3" fontWeight={800}>
                    {value}
                </Typography>
            </Stack>
        </Paper>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F6F8' }}>
            
            {/* 1. SIDEBAR */}
            <TeacherSidebar 
                selectedRoute={location.pathname} 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* 2. MAIN CONTENT */}
            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` } }}>
                
                {/* --- HEADER --- */}
                <Box sx={{ 
                    bgcolor: 'white', px: { xs: 2, md: 4 }, py: 2, 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid #E0E0E0'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isMobile && (
                            <IconButton onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>
                        )}
                        <Typography variant="h5" fontWeight={800} color="text.primary">
                            Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton><NotificationsNoneIcon /></IconButton>
                        <Stack direction="row" alignItems="center" spacing={1} onClick={handleAvatarClick} sx={{ cursor: 'pointer', bgcolor: '#f5f5f5', p: 0.5, pr: 2, borderRadius: 50 }}>
                            <Avatar src={profile?.profilePicPath} sx={{ width: 32, height: 32 }}>{profile?.firstName?.[0]}</Avatar>
                            <Typography variant="body2" fontWeight={600} sx={{ display: { xs: 'none', sm: 'block' } }}>
                                {profile?.firstName || 'Instructor'}
                            </Typography>
                        </Stack>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Logout
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* --- BODY --- */}
                <Container maxWidth="xl" sx={{ p: { xs: 2, md: 4 } }}>
                    
                    {/* Welcome Banner */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#0E243C' }}>
                            Hello, {profile?.firstName || 'Teacher'} 👋
                        </Typography>
                        <Typography color="text.secondary">
                            Here is an overview of your sales and resources.
                        </Typography>
                    </Box>

                    {/* Stats Widgets */}
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        <Grid item xs={12} md={4}>
                            <DashboardWidget 
                                title="Total Earnings" 
                                value={`KES ${totalSales.toLocaleString()}`} 
                                icon={<AttachMoneyIcon />} 
                                gradient="linear-gradient(135deg, #0E243C 0%, #203A58 100%)" // Navy Gradient
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DashboardWidget 
                                title="Available Balance" 
                                value={`KES ${currentBalance.toLocaleString()}`} 
                                icon={<ShoppingBagIcon />} 
                                gradient={`linear-gradient(135deg, ${theme.palette.primary.main} 0%, #1e54d6 100%)`} // Blue Gradient
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <DashboardWidget 
                                title="Active Resources" 
                                value={resources.length} 
                                icon={<LibraryBooksIcon />} 
                                gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)" // Orange Gradient
                            />
                        </Grid>
                    </Grid>

                    {/* Resources Section */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ color: '#0E243C' }}>Your Resources</Typography>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={() => navigate('/upload')}
                            sx={{ 
                                borderRadius: 2, px: 3, py: 1, fontWeight: 700, 
                                boxShadow: '0 4px 14px rgba(47, 107, 255, 0.4)' 
                            }}
                        >
                            Create New
                        </Button>
                    </Box>

                    {resources.length === 0 ? (
                        <Paper sx={{ 
                            p: 6, textAlign: 'center', borderRadius: 4, 
                            border: '2px dashed #e0e0e0', bgcolor: 'white' 
                        }}>
                            <LibraryBooksIcon sx={{ fontSize: 60, color: '#ddd', mb: 2 }} />
                            <Typography variant="h6" fontWeight={600} gutterBottom>No Resources Yet</Typography>
                            <Typography color="text.secondary" sx={{ mb: 3 }}>
                                Upload your first study material to start earning.
                            </Typography>
                            <Button variant="outlined" onClick={() => navigate('/upload')}>Upload Now</Button>
                        </Paper>
                    ) : (
                        <Grid container spacing={3}>
                            {resources.map((resource, index) => (
                                <Grid item xs={12} sm={6} lg={3} key={resource.id}>
                                    <Card sx={{ 
                                        height: '100%', display: 'flex', flexDirection: 'column', 
                                        borderRadius: 3, border: 'none', 
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                        transition: 'transform 0.2s',
                                        '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }
                                    }}>
                                        <CardMedia
                                            component="img"
                                            height="180"
                                            image={resource.thumbnail || getThumbnail(index)}
                                            alt={resource.title}
                                        />
                                        <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Chip 
                                                    label={resource.price > 0 ? `KES ${resource.price}` : 'FREE'} 
                                                    size="small" 
                                                    sx={{ 
                                                        fontWeight: 700, 
                                                        bgcolor: resource.price > 0 ? '#E3F2FD' : '#E8F5E9', 
                                                        color: resource.price > 0 ? '#1565C0' : '#2E7D32' 
                                                    }} 
                                                />
                                                <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>
                                            </Box>
                                            
                                            <Typography variant="h6" sx={{ 
                                                fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, mb: 1,
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                            }}>
                                                {resource.title}
                                            </Typography>
                                            
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                Uploaded on {new Date().toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default TeacherDashboard;