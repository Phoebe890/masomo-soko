import React from 'react';
import { 
    Drawer, Box, List, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, 
    useMediaQuery, IconButton, Avatar 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloseIcon from '@mui/icons-material/Close';
import SchoolIcon from '@mui/icons-material/School'; // Brand Icon

const drawerWidth = 260;

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
    selected: string;
}

const AdminSidebar = ({ mobileOpen = false, onClose, selected }: SidebarProps) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menu = [
        { text: 'Overview', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Payouts', icon: <PaymentsIcon />, path: '/admin/payouts' },
        { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
        { text: 'Content', icon: <LibraryBooksIcon />, path: '/admin/resources' },
    ];

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const drawerContent = (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            p: 2,
            // Dark Blue Gradient (Matches Teacher Sidebar)
            background: 'linear-gradient(180deg, #2563EB 0%, #1e40af 100%)', 
            color: 'white',
            overflow: 'hidden'
        }}>
            {/* Import Font to match Teacher Sidebar */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Chewy&display=swap');`}
            </style>

            {/* HEADER SECTION */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 3, mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {/* Consistent Brand Icon */}
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 42, height: 42 }}>
                        <SchoolIcon fontSize="medium" />
                    </Avatar>
                    
                    <Box>
                        {/* Chewy Font Branding */}
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontFamily: "'Chewy', cursive", 
                                fontSize: '1.6rem',
                                letterSpacing: '0.5px',
                                lineHeight: 1
                            }}
                        >
                            Masomo Soko.
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.65rem' }}>
                            Admin Console
                        </Typography>
                    </Box>
                </Box>
                
                {/* Close Button - Only visible on Mobile */}
                <IconButton 
                    onClick={onClose} 
                    sx={{ 
                        display: { xs: 'flex', md: 'none' }, 
                        color: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* MENU ITEMS */}
            <List sx={{ flexGrow: 1 }}>
                {menu.map((item) => {
                    const isActive = selected === item.path;
                    return (
                        <ListItemButton 
                            key={item.text} 
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile && onClose) onClose();
                            }}
                            sx={{ 
                                mb: 1, 
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
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.9)'
                                }} 
                            />
                        </ListItemButton>
                    );
                })}
            </List>
            
            {/* LOGOUT SECTION */}
            <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
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
                        primary="Logout" 
                        primaryTypographyProps={{ fontWeight: 500, color: '#fff' }} 
                    />
                </ListItemButton>
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
                        bgcolor: 'transparent' // Transparent to show gradient
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
                        bgcolor: 'transparent', // Transparent to show gradient
                        overflowX: 'hidden',
                        overflowY: 'hidden',
                        '&::-webkit-scrollbar': { display: 'none' }
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default AdminSidebar;