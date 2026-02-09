import React from 'react';
import { 
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
    ListItemText, Divider, IconButton, Typography
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.svg';

// High-End Icons (Lucide)
import { 
    LayoutDashboard, 
    Library, 
    History, 
    Settings, 
    LogOut, 
    X 
} from 'lucide-react';

const drawerWidth = 260;
const SHARP_RADIUS = '2px';

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const StudentSidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose, activeTab, onTabChange }) => {
    const navigate = useNavigate();

    const menuItems = [
        { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { id: 'library', label: 'My Library', icon: <Library size={20} /> },
        { id: 'history', label: 'Purchase History', icon: <History size={20} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
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
        }}>
            {/* Logo Area */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box 
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    <img src={logoIcon} alt="Logo" style={{ height: 32 }} />
                </Box>
                {/* Close button for mobile only */}
                <IconButton onClick={onClose} sx={{ display: { md: 'none' }, color: '#fff' }}>
                    <X size={20} />
                </IconButton>
            </Box>

            {/* Navigation List */}
            <List sx={{ px: 2, mt: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    onTabChange(item.id);
                                    if (mobileOpen) onClose();
                                }}
                                sx={{
                                    borderRadius: SHARP_RADIUS,
                                    py: 1.2,
                                    bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                                    transition: 'all 0.2s ease',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#fff' : '#94A3B8' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText 
                                    primary={item.label} 
                                    primaryTypographyProps={{ 
                                        fontSize: '0.875rem', 
                                        fontWeight: isActive ? 700 : 500,
                                        color: isActive ? '#fff' : '#94A3B8'
                                    }} 
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            {/* Bottom Actions */}
            <Box sx={{ p: 2 }}>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 2 }} />
                
               

                <ListItemButton 
                    onClick={handleLogout}
                    sx={{ borderRadius: SHARP_RADIUS, py: 1.2, color: '#94A3B8', '&:hover': { color: '#EF4444' } }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
            {/* MOBILE DRAWER */}
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
                        bgcolor: '#0F172A', 
                        border: 'none',
                        boxShadow: 'none'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* DESKTOP DRAWER */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth, 
                        bgcolor: '#0F172A', 
                        border: 'none',
                        boxShadow: 'none'
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default StudentSidebar;