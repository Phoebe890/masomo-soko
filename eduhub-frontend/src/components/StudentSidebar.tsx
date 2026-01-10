import React from 'react';
import { 
    Drawer, Box, List, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, IconButton, Avatar 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SchoolIcon from '@mui/icons-material/School'; 
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/LogoutOutlined'; // Added Logout Icon

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const StudentSidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, activeTab, onTabChange }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: <DashboardCustomizeOutlinedIcon /> },
        { id: 'library', label: 'My Library', icon: <LocalLibraryOutlinedIcon /> },
        { id: 'history', label: 'Purchase History', icon: <ReceiptLongOutlinedIcon /> },
        { id: 'settings', label: 'Settings', icon: <SettingsOutlinedIcon /> },
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
            {/* Import Font */}
            <style>
                {`@import url('https://fonts.googleapis.com/css2?family=Chewy&display=swap');`}
            </style>

            {/* HEADER */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, py: 3, mb: 1 }}>
                <Box 
                    onClick={() => navigate('/')} 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.9 }
                    }}
                >
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', width: 42, height: 42 }}>
                        <SchoolIcon fontSize="medium" />
                    </Avatar>
                    
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
                </Box>

                <IconButton 
                    onClick={onClose} 
                    sx={{ 
                        display: { md: 'none' }, 
                        color: 'rgba(255,255,255,0.9)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* NAV ITEMS */}
            <List sx={{ flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <ListItemButton 
                            key={item.id} 
                            onClick={() => { onTabChange(item.id); onClose(); }}
                            sx={{
                                mb: 1, 
                                borderRadius: 3,
                                py: 1.5,
                                px: 2,
                                transition: 'all 0.3s ease',
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
                                primary={item.label} 
                                primaryTypographyProps={{ 
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#fff' : 'rgba(255,255,255,0.9)'
                                }} 
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* BOTTOM SECTION: LOGOUT + USER INFO */}
            <Box sx={{ mt: 'auto' }}>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
                
                {/* LOGOUT BUTTON */}
                <ListItemButton 
                    onClick={handleLogout}
                    sx={{
                        mb: 2,
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
                        primaryTypographyProps={{ fontWeight: 500, color: '#fff' }} 
                    />
                </ListItemButton>

                {/* LOGGED IN AS INFO */}
                <Box sx={{ 
                    p: 2, 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    borderRadius: 3,
                    backdropFilter: 'blur(5px)'
                }}>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', display: 'block', mb: 0.5 }}>
                        Logged in as
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
                        Student Account
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}>
            <Drawer 
                variant="temporary" 
                open={mobileOpen} 
                onClose={onClose} 
                ModalProps={{ keepMounted: true }} 
                sx={{ 
                    display: { xs: 'block', md: 'none' }, 
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: 280, 
                        border: 'none', 
                        bgcolor: 'transparent'
                    } 
                }}
            >
                {drawerContent}
            </Drawer>
            <Drawer 
                variant="permanent" 
                open
                sx={{ 
                    display: { xs: 'none', md: 'block' }, 
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: 280, 
                        border: 'none', 
                        bgcolor: 'transparent',
                        overflowX: 'hidden',
                        overflowY: 'hidden',
                        '&::-webkit-scrollbar': { display: 'none' }
                    } 
                }} 
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default StudentSidebar;