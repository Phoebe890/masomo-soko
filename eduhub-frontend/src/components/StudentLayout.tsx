import React, { useState, useEffect } from 'react';
import { 
    Box, IconButton, Typography, Avatar, Menu, MenuItem, 
    useTheme, AppBar, Toolbar, Badge, Divider, ListItemIcon,
    Popover, Button, alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios'; 
import StudentSidebar from './StudentSidebar';
import logoIcon from '@/assets/logo-icon.svg';

// High-End Icons (Lucide)
import { 
    Bell, User, LogOut, Settings, Home, 
    Menu as MenuLucide, X, Info 
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";
const BORDER_COLOR = '#E2E8F0';
const BRAND_BLUE = '#2563EB';

interface StudentLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, activeTab, onTabChange }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
    const [userData, setUserData] = useState({ name: '', avatar: '', email: '' });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/student/account-settings');
                setUserData({
                    name: res.data.name || 'Student',
                    avatar: res.data.profilePicPath || '',
                    email: res.data.email || ''
                });
            } catch (err) {
                console.error("Failed to load profile", err);
            }
        };
        fetchProfile();
    }, [activeTab]);

    const handleLogout = () => {
        setAnchorEl(null);
        localStorage.clear();
        navigate('/login');
    };

    const getAvatarSrc = (path: string) => {
        if (!path || path === "null") return undefined;
        if (path.startsWith('http')) return path;
        const cleanPath = path.startsWith('/') ? path.substring(1) : path;
        return `${BACKEND_URL}/${cleanPath}`;
    };

    const getTitle = () => {
        switch(activeTab) {
            case 'overview': return 'Dashboard';
            case 'library': return 'My Library';
            case 'history': return 'Purchase History';
            case 'settings': return 'Account Settings';
            default: return 'Student Portal';
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8FAFC' }}>
            <StudentSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                activeTab={activeTab}
                onTabChange={onTabChange}
            />

            <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - 260px)` }, display: 'flex', flexDirection: 'column' }}>
                
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: `1px solid ${BORDER_COLOR}`, color: '#1F2937' }}>
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 }, minHeight: '64px !important' }}>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { md: 'none' }, color: '#374151' }}>
                                <MenuLucide size={20} />
                            </IconButton>
                            
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', display: { xs: 'none', sm: 'block' } }}>
                                {getTitle()}
                            </Typography>
                            
                            <Box onClick={() => navigate('/')} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', cursor: 'pointer' }}>
                                <img src={logoIcon} alt="Logo" style={{ height: 32 }} />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            
                            <IconButton 
                                onClick={(e) => setNotifAnchorEl(e.currentTarget)}
                                sx={{ 
                                    border: `1px solid ${BORDER_COLOR}`, 
                                    borderRadius: '2px', 
                                    p: 1,
                                    color: BRAND_BLUE 
                                }}
                            >
                                <Badge variant="dot" color="error">
                                    <Bell size={18} strokeWidth={2.5} />
                                </Badge>
                            </IconButton>

                            <Divider orientation="vertical" flexItem sx={{ mx: 0.5, height: 24, alignSelf: 'center' }} />

                            {/* --- UPDATED AVATAR: MATCHES TEACHER LAYOUT EXACTLY --- */}
                            <Box 
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}
                            >
                                <Avatar 
                                    src={getAvatarSrc(userData.avatar)}
                                    sx={{ 
                                        width: 36, height: 36, 
                                        border: `2px solid ${alpha(BRAND_BLUE, 0.1)}`,
                                    }}
                                >
                                    {userData.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#0F172A', lineHeight: 1 }}>
                                        {userData.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Student</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Notifications Popover */}
                <Popover
                    open={Boolean(notifAnchorEl)}
                    anchorEl={notifAnchorEl}
                    onClose={() => setNotifAnchorEl(null)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    PaperProps={{ 
                        sx: { 
                            width: 320, mt: 1.5, borderRadius: '2px', 
                            border: `1px solid ${BORDER_COLOR}`, 
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' 
                        } 
                    }}
                >
                    <Box sx={{ p: 2, borderBottom: `1px solid #F1F5F9` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Notifications</Typography>
                    </Box>
                    <Box sx={{ py: 4, textAlign: 'center', px: 2 }}>
                        <Typography variant="body2" color="text.secondary">No new notifications</Typography>
                    </Box>
                </Popover>

                {/* Profile Menu */}
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
                        <Typography variant="subtitle2" fontWeight={800}>{userData.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{userData.email}</Typography>
                    </Box>
                    <Divider />
                    <MenuItem onClick={() => navigate('/')} sx={{ py: 1.2 }}>
                        <ListItemIcon><Home size={18} color={BRAND_BLUE} /></ListItemIcon> 
                        <Typography variant="body2" fontWeight={600}>Home</Typography>
                    </MenuItem>
                    <MenuItem onClick={() => { setAnchorEl(null); onTabChange('settings'); }} sx={{ py: 1.2 }}>
                        <ListItemIcon><User size={18} color={BRAND_BLUE} /></ListItemIcon> 
                        <Typography variant="body2" fontWeight={600}>Profile Settings</Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
                        <ListItemIcon><LogOut size={18} color={theme.palette.error.main} /></ListItemIcon> 
                        <Typography variant="body2" fontWeight={800}>Logout</Typography>
                    </MenuItem>
                </Menu>

                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default StudentLayout;