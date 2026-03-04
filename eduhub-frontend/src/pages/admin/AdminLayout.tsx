import React, { useState } from 'react';
import { 
    Box, IconButton, Typography, Avatar, Menu, MenuItem, 
    useTheme, AppBar, Toolbar, Badge, Divider, ListItemIcon,
    Popover, Button, alpha, createTheme, ThemeProvider, CssBaseline 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// High-End Icons (Lucide)
import { 
    Bell, User, LogOut, Settings, 
    ShieldCheck, Menu as MenuIcon, X, Info, 
    DollarSign, Star, ChevronDown 
} from 'lucide-react';

import AdminSidebar from './AdminSidebar';

// Constants for branding
const BORDER_COLOR = '#E2E8F0';
const BRAND_BLUE = '#2563EB';
const SLATE_DARK = '#0F172A';

// --- 1. THEME CONFIG ---
const adminTheme = createTheme({
    typography: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: { fontFamily: "'Plus Jakarta Sans', sans-serif !important" },
            },
        },
    },
});

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    selectedRoute: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, selectedRoute }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    // UI States
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);

    // Placeholder Notifications (Logic to be added later to fetch from /api/admin/notifications)
    const [notifications] = useState<any[]>([]); 
    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.clear();
        navigate('/login');
    };

    return (
        <ThemeProvider theme={adminTheme}>
            <CssBaseline />
            {/* Font Injection */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" />

            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
                
                {/* --- 1. SIDEBAR --- */}
                <AdminSidebar 
                    mobileOpen={sidebarOpen} 
                    onClose={() => setSidebarOpen(false)} 
                />

                <Box component="main" sx={{ 
                    flexGrow: 1, 
                    width: { md: `calc(100% - 260px)` }, 
                    display: 'flex', 
                    flexDirection: 'column' 
                }}>
                    
                    {/* --- 2. APPBAR --- */}
                    <AppBar 
                        position="sticky" 
                        elevation={0} 
                        sx={{ 
                            bgcolor: 'white', 
                            borderBottom: `1px solid ${BORDER_COLOR}`, 
                            color: '#1F2937' 
                        }}
                    >
                        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <IconButton 
                                    onClick={() => setSidebarOpen(true)} 
                                    sx={{ display: { md: 'none' }, color: '#374151' }}
                                >
                                    <MenuIcon size={20} />
                                </IconButton>
                                <Typography 
                                    variant="h6" 
                                    sx={{ fontWeight: 800, color: SLATE_DARK, letterSpacing: '-0.02em' }}
                                >
                                    {title || 'Admin Console'}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                
                                {/* Sharp Notification Bell */}
                                <IconButton 
                                    onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                                    sx={{ 
                                        border: `1px solid ${BORDER_COLOR}`, 
                                        borderRadius: '2px', 
                                        p: 1,
                                        color: SLATE_DARK 
                                    }}
                                >
                                    <Badge badgeContent={unreadCount} color="error">
                                        <Bell size={18} strokeWidth={2} />
                                    </Badge>
                                </IconButton>

                                <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

                                {/* Profile Section */}
                                <Box 
                                    onClick={(e) => setAnchorEl(e.currentTarget)}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1.5, 
                                        cursor: 'pointer',
                                        p: 0.5,
                                        px: 1,
                                        borderRadius: '2px',
                                        '&:hover': { bgcolor: '#F8FAFC' }
                                    }}
                                >
                                    <Avatar 
                                        sx={{ 
                                            width: 32, height: 32, 
                                            bgcolor: SLATE_DARK,
                                            fontSize: '0.8rem',
                                            fontWeight: 800
                                        }}
                                    >
                                        A
                                    </Avatar>
                                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                        <Typography variant="subtitle2" fontWeight={800} sx={{ color: SLATE_DARK, lineHeight: 1 }}>
                                            Administrator
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>System Root</Typography>
                                    </Box>
                                    <ChevronDown size={14} color="#64748B" />
                                </Box>
                            </Box>
                        </Toolbar>
                    </AppBar>

                    {/* --- 3. NOTIFICATIONS POPOVER --- */}
                    <Popover
                        open={Boolean(notifAnchorEl)}
                        anchorEl={notifAnchorEl}
                        onClose={() => setNotifAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        PaperProps={{ 
                            sx: { 
                                width: 360, mt: 1.5, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, 
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
                            } 
                        }}
                    >
                        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid #F1F5F9` }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Notifications</Typography>
                            <Button size="small" sx={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'none' }}>Mark all read</Button>
                        </Box>
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <Box sx={{ mb: 1, color: '#94A3B8' }}><Bell size={24} style={{ margin: 'auto' }} /></Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: SLATE_DARK }}>No new alerts</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>System is running smoothly.</Typography>
                        </Box>
                    </Popover>

                    {/* --- 4. PROFILE MENU --- */}
                    <Menu 
                        anchorEl={anchorEl} 
                        open={Boolean(anchorEl)} 
                        onClose={() => setAnchorEl(null)}
                        PaperProps={{ 
                            sx: { 
                                minWidth: 220, mt: 1.5, borderRadius: '2px', 
                                border: `1px solid ${BORDER_COLOR}`, 
                                boxShadow: '0 10px 25px rgba(0,0,0,0.05)' 
                            } 
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>System Admin</Typography>
                            <Typography variant="caption" color="text.secondary">admin@masomosoko.com</Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={() => navigate('/admin/settings')} sx={{ py: 1.2 }}>
                            <ListItemIcon><Settings size={18} color={BRAND_BLUE} /></ListItemIcon> 
                            <Typography variant="body2" fontWeight={600}>System Settings</Typography>
                        </MenuItem>
                        <MenuItem onClick={() => navigate('/admin/users')} sx={{ py: 1.2 }}>
                            <ListItemIcon><ShieldCheck size={18} color={BRAND_BLUE} /></ListItemIcon> 
                            <Typography variant="body2" fontWeight={600}>Access Control</Typography>
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
                            <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon> 
                            <Typography variant="body2" fontWeight={800}>Logout</Typography>
                        </MenuItem>
                    </Menu>

                    {/* --- 5. PAGE CONTENT --- */}
                    <Box sx={{ 
                        p: { xs: 2, md: 4 }, 
                        flexGrow: 1, 
                        animation: 'fadeIn 0.5s ease-out',
                        "@keyframes fadeIn": {
                            "0%": { opacity: 0, transform: 'translateY(10px)' },
                            "100%": { opacity: 1, transform: 'translateY(0)' }
                        }
                    }}>
                        {children}
                    </Box>
                </Box>
            </Box>
        </ThemeProvider>
    );
};

export default AdminLayout;