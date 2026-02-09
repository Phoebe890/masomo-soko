import { 
    Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, 
    ListItemText, Typography, Divider, useTheme, useMediaQuery, 
    IconButton 
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import logoIcon from '@/assets/logo-icon.svg';
import { 
    LayoutDashboard, Library, UploadCloud, 
    Wallet, Star, Settings, LogOut, X 
} from 'lucide-react';

const drawerWidth = 260;
const SHARP_RADIUS = '2px';

const TeacherSidebar = ({ mobileOpen, onClose }: any) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard/teacher' },
        { text: 'My Resources', icon: <Library size={20} />, path: '/dashboard/teacher/resources' },
        { text: 'Upload New', icon: <UploadCloud size={20} />, path: '/dashboard/teacher/upload-first-resource' },
        { text: 'Earnings', icon: <Wallet size={20} />, path: '/teacher/earnings' },
        { text: 'Reviews', icon: <Star size={20} />, path: '/teacher/reviews' },
        { text: 'Settings', icon: <Settings size={20} />, path: '/teacher/settings' },
    ];

    const drawerContent = (
        <Box sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            // No border-right here, we handle it in the Drawer style
        }}>
            {/* Logo Area */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <img src={logoIcon} alt="Logo" style={{ height: 32 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>
                        MASOMO
                    </Typography>
                </Box>
                {/* Close button for mobile only */}
                <IconButton onClick={onClose} sx={{ display: { md: 'none' }, color: '#fff' }}>
                    <X size={20} />
                </IconButton>
            </Box>

            <List sx={{ px: 2, mt: 2, flexGrow: 1 }}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (mobileOpen) onClose(); // Close drawer on mobile after click
                                }}
                                sx={{
                                    borderRadius: SHARP_RADIUS,
                                    py: 1.2,
                                    bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
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
                        </ListItem>
                    );
                })}
            </List>

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
            {/* MOBILE DRAWER (Temporary) */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }} // Better open performance on mobile
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth, 
                        bgcolor: '#0F172A', // Background color directly on paper
                        border: 'none',
                        boxShadow: 'none'
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* DESKTOP DRAWER (Permanent) */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': { 
                        boxSizing: 'border-box', 
                        width: drawerWidth, 
                        bgcolor: '#0F172A', // Background color directly on paper
                        border: 'none', // REMOVES WHITE LINE
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

export default TeacherSidebar;