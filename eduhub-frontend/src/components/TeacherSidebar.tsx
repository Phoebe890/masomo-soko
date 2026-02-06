import React from 'react';
import { 
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, useMediaQuery, 
    IconButton, Avatar 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.svg';
// --- ICONS ---
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SchoolIcon from '@mui/icons-material/School'; 
import StarOutlineIcon from '@mui/icons-material/StarOutline'; 
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';

// NEW ICONS REQUESTED
import SourceIcon from '@mui/icons-material/Source'; // New for "My Resources"
import PaymentsIcon from '@mui/icons-material/Payments'; // New for "Earnings" (Represents Cash/KES)

const drawerWidth = 280;

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
    selectedRoute?: string;
}

const TeacherSidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, selectedRoute }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();

    // --- MENU ITEMS ---
    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/teacher' },
        { text: 'My Resources', icon: <SourceIcon />, path: '/dashboard/teacher/resources' }, // Changed Icon
        { text: 'Upload New', icon: <CloudUploadIcon />, path: '/dashboard/teacher/upload-first-resource' },
        { text: 'Earnings', icon: <PaymentsIcon />, path: '/teacher/earnings' }, // Changed Icon to Cash/Payments
        { text: 'Resource Reviews', icon: <StarOutlineIcon />, path: '/teacher/reviews' },
        { text: 'Profile Settings', icon: <AccountCircleIcon />, path: '/teacher/settings' },
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        if (isMobile) onClose();
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleHomeClick = () => {
        navigate('/');
    };

    const drawerContent = (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            height: '100vh', 
            p: 2,
            // Darker Blue Gradient
            background: 'linear-gradient(180deg, #2563EB 0%, #1e40af 100%)', 
            color: '#fff',
            // PREVENT SCROLLING
            overflow: 'hidden' 
        }}>
            {/* Import Font */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Chewy&display=swap');`}
            </style>

           {/* --- HEADER: LOGO (COMPACT VERSION) --- */}
<Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    px: 1, 
    py: 1.5, // Reduced from 4 to 1.5
    mb: 0     // Removed margin-bottom
}}>
    <Box 
        onClick={handleHomeClick}
        sx={{ 
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            '&:hover': { transform: 'scale(1.05)' }
        }}
    >
        <Box 
            component="img"
            src={logoIcon}
            alt="Masomo Soko"
            sx={{ 
                height: 50, // Reduced from 60 to 50
                width: 50,
                objectFit: 'contain'
            }}
        />
    </Box>

    {isMobile && (
        <IconButton 
            onClick={onClose} 
            sx={{ position: 'absolute', right: 8, top: 12, color: 'rgba(255,255,255,0.8)' }}
        >
            <CloseIcon />
        </IconButton>
    )}
</Box>

            {/* --- NAVIGATION LIST --- */}
           <List sx={{ 
    flexGrow: 1, 
    overflowY: 'auto', // Allows scrolling if menu is too long
    pr: 1,             // Space for the scrollbar
    // Hide scrollbar for Chrome/Safari/Firefox but keep functionality
    '&::-webkit-scrollbar': { display: 'none' },
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
}}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || selectedRoute === item.path;
                    
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                            <ListItemButton
                                onClick={() => handleNavigation(item.path)}
                                sx={{
                                    borderRadius: 3,
                                    py: 1.5,
                                    px: 2,
                                    transition: 'all 0.3s ease',
                                    // Glass Effect for Active Item
                                    bgcolor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                                    backdropFilter: isActive ? 'blur(10px)' : 'none',
                                    border: isActive ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                                    '&:hover': {
                                        bgcolor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ 
                                    minWidth: 40, 
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)' 
                                }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.text} 
                                    primaryTypographyProps={{ 
                                        fontSize: '0.95rem',
                                        fontWeight: isActive ? 700 : 500, 
                                        color: isActive ? '#fff' : 'rgba(255,255,255,0.9)'
                                    }} 
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* --- LOGOUT SECTION --- */}
            <Box>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                <ListItem disablePadding>
                    <ListItemButton 
                        onClick={handleLogout}
                        sx={{
                            borderRadius: 3,
                            py: 1.5,
                            px: 2,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 40, color: '#fff' }}>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText 
                            primary="Log out" 
                            primaryTypographyProps={{ fontSize: '0.95rem', fontWeight: 500, color: '#fff' }} 
                        />
                    </ListItemButton>
                </ListItem>
            </Box>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth,
                        border: 'none',
                        bgcolor: 'transparent'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth,
                        border: 'none',
                        bgcolor: 'transparent',
                        // Force hide scrollbar on Desktop
                        overflowX: 'hidden',
                        overflowY: 'hidden',
                        '&::-webkit-scrollbar': { display: 'none' } // Chrome/Safari hide
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default TeacherSidebar;