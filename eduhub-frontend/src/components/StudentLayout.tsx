import React, { useState, useEffect } from 'react';
import { 
    Box, IconButton, Typography, Avatar, Menu, MenuItem, 
    useTheme, AppBar, Toolbar, Badge, Divider, ListItemIcon 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios'; // Import API
import StudentSidebar from './StudentSidebar';
import logoIcon from '@/assets/logo-icon.svg';
import HomeIcon from '@mui/icons-material/HomeOutlined';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/Person';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

interface StudentLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, activeTab, onTabChange }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [userData, setUserData] = useState({ name: '', avatar: '' }); // Local state for top bar
    const navigate = useNavigate();
    const theme = useTheme();

    // --- FETCH PROFILE DATA ON MOUNT ---
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/student/account-settings');
                setUserData({
                    name: res.data.name || 'Student',
                    avatar: res.data.profilePicPath || ''
                });
            } catch (err) {
                console.error("Failed to load top bar profile", err);
            }
        };
        fetchProfile();
    }, [activeTab]); // Re-fetch when tab changes (to catch updates from settings tab)

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

  const getAvatarSrc = (path: string) => {
    if (!path || path === "null") return undefined;

    // 1. If it's a Google or Cloudinary URL, it starts with http. Use it directly.
    if (path.startsWith('http')) {
        return path;
    }

    // 2. If it's a local file path, append your backend URL
    // Ensure there isn't a double slash between BACKEND_URL and path
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${BACKEND_URL}/${cleanPath}`;
};
    const getTitle = () => {
        switch(activeTab) {
            case 'overview': return 'Dashboard Overview';
            case 'library': return 'My Library';
            case 'history': return 'Purchase History';
            case 'settings': return 'Account Settings';
            default: return 'Student Dashboard';
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <StudentSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                activeTab={activeTab}
                onTabChange={onTabChange}
            />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 280px)` }, display: 'flex', flexDirection: 'column' }}>
                <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'white', borderBottom: '1px solid #E5E7EB', color: '#1F2937' }}>
                    <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 3 } }}>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                            <IconButton onClick={() => setSidebarOpen(true)} sx={{ display: { md: 'none' }, color: '#374151', ml: -1 }}>
                                <MenuIcon />
                            </IconButton>
                            <Box onClick={() => navigate('/')} sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', cursor: 'pointer' }}>
                                <Box component="img" src={logoIcon} alt="Logo" sx={{ height: 32, width: 'auto' }} />
                            </Box>
                            <Typography variant="h6" fontWeight={800} sx={{ color: '#111827', fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                {getTitle()}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton>
                                <Badge variant="dot" color="error"><NotificationsNoneOutlinedIcon /></Badge>
                            </IconButton>
                            
                            <Box 
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{ 
                                    display: 'flex', alignItems: 'center', gap: 1.5, 
                                    cursor: 'pointer', p: 0.5, pr: 1.5, borderRadius: 4,
                                    '&:hover': { bgcolor: '#F3F4F6' }
                                }}
                            >
                                <Avatar 
                                    src={getAvatarSrc(userData.avatar)} 
                                    sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}
                                >
                                    {userData.name ? userData.name[0].toUpperCase() : 'S'}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                                        {userData.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Student Account</Typography>
                                </Box>
                            </Box>

                            <Menu 
                                anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}
                                PaperProps={{ elevation: 0, sx: { filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.1))', mt: 1.5, minWidth: 200, borderRadius: 2, border: '1px solid #E5E7EB' } }}
                                transformOrigin={{ horizontal: 'right', vertical: 'top' }} 
                                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            >
                                <MenuItem onClick={() => { setAnchorEl(null); navigate('/'); }}>
                                    <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon> 
                                    <Typography variant="body2">Home</Typography>
                                </MenuItem>
                                <MenuItem onClick={() => { setAnchorEl(null); onTabChange('settings'); }}>
                                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> 
                                    <Typography variant="body2">Profile Settings</Typography>
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                    <ListItemIcon><LogoutOutlinedIcon fontSize="small" color="error" /></ListItemIcon> 
                                    <Typography variant="body2" fontWeight={600}>Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default StudentLayout;