import React from 'react';
import { 
    Drawer, Box, List, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, IconButton 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import DashboardCustomizeOutlinedIcon from '@mui/icons-material/DashboardCustomizeOutlined';
import LocalLibraryOutlinedIcon from '@mui/icons-material/LocalLibraryOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SchoolIcon from '@mui/icons-material/School'; 
import CloseIcon from '@mui/icons-material/Close';

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

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0E243C', color: 'white' }}>
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box onClick={() => navigate('/')} sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: theme.palette.primary.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SchoolIcon sx={{ color: 'white' }} />
                    </Box>
                    {/* CHANGED NAME HERE */}
                    <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 1 }}>Mwalimu Soko</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'rgba(255,255,255,0.7)', display: { xs: 'flex', md: 'none' } }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

            <List sx={{ px: 2 }}>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <ListItemButton 
                            key={item.id} 
                            onClick={() => { onTabChange(item.id); onClose(); }}
                            sx={{
                                mb: 1, borderRadius: 2,
                                bgcolor: isActive ? theme.palette.primary.main : 'transparent',
                                color: isActive ? 'white' : '#94A3B8',
                                '&:hover': { bgcolor: isActive ? theme.palette.primary.dark : 'rgba(255,255,255,0.05)', color: 'white' }
                            }}
                        >
                            <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
                        </ListItemButton>
                    );
                })}
            </List>

            <Box sx={{ mt: 'auto', p: 3, bgcolor: 'rgba(0,0,0,0.2)' }}>
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mb: 1 }}>Logged in as</Typography>
                <Typography variant="subtitle2" fontWeight={700}>Student Account</Typography>
            </Box>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: 280 }, flexShrink: { md: 0 } }}>
            <Drawer 
                variant="temporary" open={mobileOpen} onClose={onClose} ModalProps={{ keepMounted: true }} 
                sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: '#0E243C', border: 'none' } }}
            >
                {drawerContent}
            </Drawer>
            <Drawer 
                variant="permanent" open
                sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, bgcolor: '#0E243C', border: 'none' } }} 
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default StudentSidebar;