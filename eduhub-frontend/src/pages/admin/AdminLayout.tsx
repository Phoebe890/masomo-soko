import React, { useState } from 'react';
import { Box, IconButton, Typography, Avatar, Menu, MenuItem, useTheme, useMediaQuery, AppBar, Toolbar, Badge } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    selectedRoute: string; // To highlight the sidebar
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, selectedRoute }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F3F4F6' }}>
            {/* 1. SIDEBAR (Managed here) */}
            <AdminSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                selected={selectedRoute} 
            />

            {/* 2. MAIN CONTENT WRAPPER */}
            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 260px)` }, display: 'flex', flexDirection: 'column' }}>
                
                {/* 3. NAVBAR (Sticky) */}
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', color: '#1F2937' }}>
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton 
                                onClick={() => setSidebarOpen(true)} 
                                sx={{ display: { md: 'none' }, color: '#374151' }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Typography variant="h6" fontWeight={800} noWrap>
                                {title || 'Admin Console'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton>
                                <Badge badgeContent={0} color="error">
                                    <NotificationsNoneIcon />
                                </Badge>
                            </IconButton>
                            <Avatar 
                                onClick={(e) => setAnchorEl(e.currentTarget)} 
                                sx={{ cursor: 'pointer', bgcolor: '#111827', width: 36, height: 36, fontSize: '0.9rem' }}
                            >
                                A
                            </Avatar>
                            <Menu 
                                anchorEl={anchorEl} 
                                open={Boolean(anchorEl)} 
                                onClose={() => setAnchorEl(null)}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem onClick={() => navigate('/admin/settings')}><SettingsIcon fontSize="small" sx={{ mr: 1 }}/> Settings</MenuItem>
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}><LogoutIcon fontSize="small" sx={{ mr: 1 }}/> Logout</MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* 4. ACTUAL PAGE CONTENT */}
                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, overflowX: 'hidden' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;