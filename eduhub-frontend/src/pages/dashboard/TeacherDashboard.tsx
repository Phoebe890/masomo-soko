import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Button, Avatar, 
    Grid, Card, CardContent, CardMedia, CardActions,
    IconButton, Menu, MenuItem, Divider, Container,
    useTheme, useMediaQuery, Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Icons - Minimal use, only for actions
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Import your Sidebar
import TeacherSidebar from './TeacherSidebar';

const TeacherDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // --- YOUR ORIGINAL STATE & LOGIC ---
    const [resources, setResources] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [totalSales, setTotalSales] = useState(0);
    const [currentBalance, setCurrentBalance] = useState(0);

    // Sidebar State
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Menu State
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout = () => {
        localStorage.removeItem('email');
        localStorage.removeItem('role');
        handleMenuClose();
        navigate('/');
    };

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

    // Placeholder handlers
    const handleOpenEditDialog = (resource: any) => { console.log('Edit', resource); };
    const handleOpenDeleteDialog = (resource: any) => { console.log('Delete', resource); };

    // Helper to get a random image if the resource doesn't have one
    const getThumbnail = (index: number) => {
        // This generates a random academic image based on index to keep it consistent
        const images = [
            "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=400&q=80", // Coffee & Work
            "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80", // Planning
            "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=400&q=80", // Learning
            "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=400&q=80"  // Coding
        ];
        return images[index % images.length];
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#fff' }}>
            {/* Sidebar Logic */}
            <TeacherSidebar 
                selectedRoute={location.pathname} 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            {/* Main Content Area */}
            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 5 }, width: { sm: `calc(100% - 260px)` } }}>
                
                {/* --- HEADER --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {isMobile && (
                            <IconButton onClick={() => setSidebarOpen(true)} edge="start">
                                <MenuIcon />
                            </IconButton>
                        )}
                        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
                            Instructor Dashboard
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton><NotificationsNoneIcon /></IconButton>
                        <Avatar 
                            src={profile?.profilePicPath} 
                            onClick={handleAvatarClick} 
                            sx={{ cursor: 'pointer', bgcolor: '#1c1d1f' }} 
                        />
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                            <MenuItem onClick={() => navigate('/teacher/settings')}>Edit Profile</MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* --- STATS OVERVIEW (Udemy Style: Text based, dividers) --- */}
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Overview</Typography>
                <Paper elevation={0} sx={{ border: '1px solid #d1d7dc', borderRadius: 0, display: 'flex', flexWrap: 'wrap', mb: 6 }}>
                    <Box sx={{ flex: 1, p: 3, minWidth: 200, borderRight: { md: '1px solid #d1d7dc' } }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>TOTAL REVENUE</Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                            KES {totalSales.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 3, minWidth: 200, borderRight: { md: '1px solid #d1d7dc' } }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>CURRENT BALANCE</Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                            KES {currentBalance.toLocaleString()}
                        </Typography>
                    </Box>
                    <Box sx={{ flex: 1, p: 3, minWidth: 200 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>TOTAL RESOURCES</Typography>
                        <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
                            {resources.length}
                        </Typography>
                    </Box>
                </Paper>

                {/* --- RESOURCES GRID (Replaces the Table) --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight={700}>My Resources</Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/dashboard/teacher/resources')}
                        sx={{ 
                            bgcolor: '#a435f0', // Udemy Purple
                            fontWeight: 700, 
                            textTransform: 'none', 
                            borderRadius: 0,
                            '&:hover': { bgcolor: '#8710d8' }
                        }}
                    >
                        New Resource
                    </Button>
                </Box>

                {resources.length === 0 ? (
                    <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#f7f9fa', border: '1px dashed #d1d7dc' }} elevation={0}>
                        <Typography color="text.secondary">You haven't uploaded any resources yet.</Typography>
                        <Button sx={{ mt: 2 }} onClick={() => navigate('/dashboard/teacher/resources')}>Get Started</Button>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {resources.map((resource, index) => (
                            <Grid item xs={12} sm={6} lg={3} key={resource.id}>
                                <Card sx={{ 
                                    height: '100%', 
                                    display: 'flex', flexDirection: 'column', 
                                    borderRadius: 0, 
                                    border: '1px solid #d1d7dc',
                                    boxShadow: 'none',
                                    transition: '0.2s',
                                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }
                                }}>
                                    {/* Image Logic: Use resource image or a random placeholder */}
                                    <CardMedia
                                        component="img"
                                        height="150"
                                        image={resource.thumbnail || getThumbnail(index)}
                                        alt={resource.title}
                                    />
                                    
                                    <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                        <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.4, mb: 1 }}>
                                            {resource.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {profile?.firstName ? `By ${profile.firstName}` : 'Instructor'}
                                        </Typography>
                                        
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography fontWeight={700} variant="h6">
                                                {resource.price > 0 ? `KES ${resource.price}` : 'Free'}
                                            </Typography>
                                            <Chip 
                                                label="Active" 
                                                size="small" 
                                                sx={{ bgcolor: '#eceb98', color: '#3d3c0a', fontWeight: 700, borderRadius: 0 }} 
                                            />
                                        </Box>
                                    </CardContent>

                                    <Divider />

                                    <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
                                        <Button 
                                            size="small" 
                                            startIcon={<EditIcon />} 
                                            onClick={() => handleOpenEditDialog(resource)}
                                            sx={{ color: '#555', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Edit
                                        </Button>
                                        <IconButton 
                                            size="small" 
                                            color="error" 
                                            onClick={() => handleOpenDeleteDialog(resource)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default TeacherDashboard;