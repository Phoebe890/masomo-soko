import React from 'react';
import { 
    Drawer, Box, List, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, 
    useMediaQuery, IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CloseIcon from '@mui/icons-material/Close';

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

    const drawerContent = (
        <>
            {/* Header Section with Close Button */}
            <Box sx={{ 
                p: 3, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 32 }} />
                    <Box>
                        {/* UPDATED BRAND NAME */}
                        <Typography variant="h6" fontWeight={700} lineHeight={1}>Masomo Soko</Typography>
                        <Typography variant="caption" color="text.secondary">Admin Console</Typography>
                    </Box>
                </Box>
                
                {/* Close Button - Only visible on Mobile (md down) */}
                <IconButton 
                    onClick={onClose} 
                    sx={{ 
                        color: 'gray', 
                        display: { xs: 'flex', md: 'none' }, 
                        '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } 
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', mb: 2 }} />
            
            <List sx={{ px: 2 }}>
                {menu.map((item) => (
                    <ListItemButton 
                        key={item.text} 
                        onClick={() => {
                            navigate(item.path);
                            // Close sidebar automatically on mobile when a link is clicked
                            if (isMobile && onClose) onClose();
                        }}
                        sx={{ 
                            borderRadius: 2, mb: 1, 
                            bgcolor: selected === item.path ? 'primary.main' : 'transparent',
                            color: selected === item.path ? 'white' : '#9CA3AF',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: 'white' }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText 
                            primary={item.text} 
                            primaryTypographyProps={{ fontWeight: selected === item.path ? 600 : 400 }} 
                        />
                    </ListItemButton>
                ))}
            </List>
            
            <Box sx={{ mt: 'auto', p: 2 }}>
                <ListItemButton 
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    sx={{ borderRadius: 2, color: '#EF4444', '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                >
                    <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </Box>
        </>
    );

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* Mobile Drawer (Temporary) */}
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
                        bgcolor: '#111827', 
                        color: 'white' 
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop Drawer (Permanent) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth, 
                        bgcolor: '#111827', 
                        color: 'white', 
                        borderRight: 'none' 
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