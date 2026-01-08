import React from 'react';
import { 
    Drawer, Box, List, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, IconButton 
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // FIXED: Imported RouterLink

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SchoolIcon from '@mui/icons-material/School'; 
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; 
import StarOutlineIcon from '@mui/icons-material/StarOutline'; 
import CloseIcon from '@mui/icons-material/Close';

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
        { text: 'Resource Reviews', icon: <StarOutlineIcon />, path: '/teacher/reviews' },
        { text: 'Profile Settings', icon: <AccountCircleIcon />, path: '/teacher/settings' },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0E243C', color: 'white' }}>
            
            {/* HEADER (Logo + Close Button) */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                {/* BRANDING */}
                <Box 
                    component={RouterLink} 
                    to="/" 
                    sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
                >
                    <SchoolIcon sx={{ color: '#ea580c', fontSize: 32, mr: 1 }} />
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 900, 
                            color: '#ea580c', 
                            letterSpacing: '-0.5px',
                            fontSize: '1.5rem',
                            fontStyle: 'italic' 
                        }}
                    >
                        Masomo Soko.
                    </Typography>
                </Box>

                {/* Mobile Close Button (Visible only on mobile) */}
                <IconButton 
                    onClick={onClose} 
                    sx={{ display: { md: 'none' }, color: 'rgba(255,255,255,0.7)' }}
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
                <Typography variant="subtitle2" fontWeight={700}>Teacher Account</Typography>
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