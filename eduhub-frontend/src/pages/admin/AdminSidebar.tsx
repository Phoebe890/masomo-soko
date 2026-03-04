import React from 'react';
import { 
    Drawer, Box, List, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, 
    useMediaQuery, IconButton 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

// Logo Asset 
import logoIcon from '@/assets/logo-icon.svg';

// High-End Icons (Lucide)
import { 
    LayoutDashboard, Wallet, Users, Library, LogOut, X 
} from 'lucide-react';

const drawerWidth = 260;
const SHARP_RADIUS = '2px';
const SLATE_BG = '#0F172A'; // High-end Slate Black

interface SidebarProps {
    mobileOpen?: boolean;
    onClose?: () => void;
}

const AdminSidebar = ({ mobileOpen, onClose }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const menuItems = [
        { text: 'Overview', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
        { text: 'Payouts', icon: <Wallet size={20} />, path: '/admin/payouts' },
        { text: 'Users', icon: <Users size={20} />, path: '/admin/users' },
        { text: 'Content', icon: <Library size={20} />, path: '/admin/resources' },
    ];

    const drawerContent = (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            bgcolor: SLATE_BG, // Ensure background fills the box
        }}>
            {/* Logo Area  */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img src={logoIcon} alt="Logo" style={{ height: 32 }} />
                    <Box>
                        <Typography 
                            variant="h6" 
                            sx={{ 
                                color: '#fff', 
                                fontWeight: 800, 
                                fontSize: '1.1rem', 
                                fontFamily: "'Plus Jakarta Sans', sans-serif",
                                letterSpacing: '-0.02em'
                            }}
                        >
                            Masomo Admin
                        </Typography>
                    </Box>
                </Box>
                {isMobile && (
                    <IconButton onClick={onClose} sx={{ color: '#94A3B8' }}>
                        <X size={20} />
                    </IconButton>
                )}
            </Box>

            {/* Menu Items */}
            <List sx={{ px: 2, mt: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItemButton
                            key={item.text}
                            onClick={() => {
                                navigate(item.path);
                                if (mobileOpen && onClose) onClose();
                            }}
                            sx={{
                                borderRadius: SHARP_RADIUS,
                                py: 1.2,
                                mb: 0.5,
                                bgcolor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                                borderLeft: isActive ? '3px solid #2563EB' : '3px solid transparent',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#fff' : '#94A3B8' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                                primary={item.text} 
                                primaryTypographyProps={{ 
                                    fontSize: '0.875rem', 
                                    fontWeight: isActive ? 700 : 500,
                                    color: isActive ? '#fff' : '#94A3B8'
                                }} 
                            />
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Bottom Section */}
            <Box sx={{ p: 2 }}>
                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.05)', mb: 2 }} />
                <ListItemButton 
                    onClick={() => { localStorage.clear(); navigate('/login'); }}
                    sx={{ borderRadius: SHARP_RADIUS, py: 1.2, color: '#94A3B8' }}
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
                        bgcolor: SLATE_BG,
                        border: 'none'
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
                        bgcolor: SLATE_BG, 
                        borderRight: 'none', 
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

export default AdminSidebar;