import React from 'react';
import { Drawer, Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentsIcon from '@mui/icons-material/Payments';
import LogoutIcon from '@mui/icons-material/Logout';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const AdminSidebar = ({ selected }: { selected: string }) => {
    const navigate = useNavigate();

    const menu = [
        { text: 'Overview', icon: <DashboardIcon />, path: '/admin/dashboard' },
        { text: 'Payouts', icon: <PaymentsIcon />, path: '/admin/payouts' },
        { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    ];

    return (
        <Drawer variant="permanent" sx={{ width: 260, flexShrink: 0, '& .MuiDrawer-paper': { width: 260, bgcolor: '#111827', color: 'white' } }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <AdminPanelSettingsIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>EduHub Admin</Typography>
            </Box>
            <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
            <List sx={{ p: 2 }}>
                {menu.map((item) => (
                    <ListItemButton 
                        key={item.text} 
                        onClick={() => navigate(item.path)}
                        sx={{ 
                            borderRadius: 2, mb: 1, 
                            bgcolor: selected === item.path ? 'primary.main' : 'transparent',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                        }}
                    >
                        <ListItemIcon sx={{ color: 'white', minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItemButton>
                ))}
            </List>
            <Box sx={{ mt: 'auto', p: 2 }}>
                <ListItemButton onClick={() => { localStorage.clear(); navigate('/login'); }}>
                    <ListItemIcon sx={{ color: 'red' }}><LogoutIcon /></ListItemIcon>
                    <ListItemText primary="Logout" />
                </ListItemButton>
            </Box>
        </Drawer>
    );
};

export default AdminSidebar;