import React from 'react';
import { 
    Drawer, Box, List, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SchoolIcon from '@mui/icons-material/School'; 
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; 
import StarOutlineIcon from '@mui/icons-material/StarOutline'; 
import CloseIcon from '@mui/icons-material/Close'; // <--- Added this

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
    selectedRoute: string;
}

const TeacherSidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, selectedRoute }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard/teacher' },
        { text: 'My Resources', icon: <LibraryBooksIcon />, path: '/dashboard/teacher/resources' },
        { text: 'Upload New', icon: <CloudUploadIcon />, path: '/dashboard/teacher/upload-first-resource' },
        { text: 'Earnings', icon: <MonetizationOnIcon />, path: '/teacher/earnings' },
        { text: 'Student Reviews', icon: <StarOutlineIcon />, path: '/teacher/reviews' },
        { text: 'Profile Settings', icon: <AccountCircleIcon />, path: '/teacher/settings' },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0E243C', color: 'white' }}>
            
            {/* HEADER (Logo + Close Button) */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box 
                    onClick={() => navigate('/')} 
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                >
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SchoolIcon sx={{ color: 'white' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 1 }}>EduHub</Typography>
                </Box>

                {/* Close Button (Visible only on mobile) */}
                <IconButton 
                    onClick={onClose}
                    sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        display: { xs: 'flex', md: 'none' }, // <--- Hidden on Desktop
                        '&:hover': { color: 'white' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

            {/* NAV ITEMS */}
            <List sx={{ px: 2 }}>
                {menuItems.map((item) => {
                    const isActive = selectedRoute === item.path;
                    return (
                        <ListItemButton 
                            key={item.text} 
                            onClick={() => { navigate(item.path); onClose(); }}
                            sx={{
                                mb: 1, borderRadius: 2,
                                bgcolor: isActive ? theme.palette.primary.main : 'transparent',
                                color: isActive ? 'white' : '#94A3B8',
                                '&:hover': { bgcolor: isActive ? theme.palette.primary.dark : 'rgba(255,255,255,0.05)', color: 'white' }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* USER INFO */}
            <Box sx={{ mt: 'auto', p: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1 }}>Logged in as</Typography>
                <Typography variant="subtitle2" fontWeight={700}>Instructor Account</Typography>
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
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: 'none', bgcolor: '#0E243C' } }}
            >
                {drawerContent}
            </Drawer>
            <Drawer 
                variant="permanent" 
                sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, border: 'none', bgcolor: '#0E243C' } }} 
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default TeacherSidebar;