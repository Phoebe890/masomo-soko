import React, { useState } from 'react';
import { 
    Box, IconButton, Typography, Avatar, Menu, MenuItem, 
    useTheme, AppBar, Toolbar, Badge, Divider, ListItemIcon 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import logoIcon from '@/assets/logo-icon.svg';
import HomeIcon from '@mui/icons-material/HomeOutlined';
// Icons
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonIcon from '@mui/icons-material/Person';

interface StudentLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    userAvatar?: string;
    userName?: string;
}

const StudentLayout: React.FC<StudentLayoutProps> = ({ children, activeTab, onTabChange, userAvatar, userName }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const navigate = useNavigate();
    const theme = useTheme();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
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
    
    {/* LEFT: Hamburger Menu + Brand Icon + Title */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
        
        {/* Hamburger Menu (Visible only on Mobile) */}
        <IconButton 
            onClick={() => setSidebarOpen(true)} 
            sx={{ display: { md: 'none' }, color: '#374151', ml: -1 }}
        >
            <MenuIcon />
        </IconButton>

        {/* --- BRAND ICON (Visible ONLY on Mobile) --- */}
        <Box 
            onClick={() => navigate('/')}
            sx={{ 
                display: { xs: 'flex', md: 'none' }, // Hides on Desktop
                alignItems: 'center',
                cursor: 'pointer',
                mr: 0.5 // Space between icon and the title
            }}
        >
            <Box 
                component="img"
                src={logoIcon}
                alt="Masomo Soko Logo"
                sx={{ 
                    height: 32, // Perfect height for the top bar
                    width: 'auto',
                    objectFit: 'contain'
                }}
            />
        </Box>

        {/* Dynamic Page Title */}
        <Typography 
            variant="h6" 
            fontWeight={800} 
            noWrap 
            sx={{ 
                color: '#111827',
                fontSize: { xs: '1rem', md: '1.25rem' }, // Responsive font size
                letterSpacing: '-0.5px'
            }}
        >
            {getTitle()}
        </Typography>
    </Box>


                        {/* RIGHT: Notifications & Profile */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton>
                                <Badge variant="dot" color="error"><NotificationsNoneOutlinedIcon /></Badge>
                            </IconButton>
                            
                            {/* Profile Trigger */}
                            <Box 
                                onClick={(e) => setAnchorEl(e.currentTarget)}
                                sx={{ 
                                    display: 'flex', alignItems: 'center', gap: 1.5, 
                                    cursor: 'pointer', p: 0.5, pr: 1.5, borderRadius: 4,
                                    '&:hover': { bgcolor: '#F3F4F6' }
                                }}
                            >
                                <Avatar 
                                    src={userAvatar} 
                                    sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36, fontSize: '0.9rem' }}
                                >
                                    {userName ? userName[0].toUpperCase() : 'S'}
                                </Avatar>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                                        {userName || 'Student'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Student Account
                                    </Typography>
                                </Box>
                            </Box>

                           {/* Profile Dropdown Menu */}
<Menu 
    anchorEl={anchorEl} 
    open={Boolean(anchorEl)} 
    onClose={() => setAnchorEl(null)}
    PaperProps={{ 
        elevation: 0, 
        sx: { 
            filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.1))', 
            mt: 1.5, 
            minWidth: 200,
            borderRadius: 2,
            border: '1px solid #E5E7EB'
        } 
    }}
    transformOrigin={{ horizontal: 'right', vertical: 'top' }} 
    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
>
    {/* Mobile-only User Info */}
    <Box sx={{ px: 2, py: 1.5, display: { sm: 'none' } }}>
        <Typography variant="subtitle2" fontWeight={700}>{userName || 'Student'}</Typography>
        <Typography variant="caption" color="text.secondary">Student Account</Typography>
    </Box>
    <Divider sx={{ display: { sm: 'none' } }} />
    
    {/* --- NEW: HOME LINK --- */}
    <MenuItem onClick={() => { 
        setAnchorEl(null); 
        navigate('/'); 
    }}>
        <ListItemIcon><HomeIcon fontSize="small" /></ListItemIcon> 
        <Typography variant="body2" fontWeight={500}>Home</Typography>
    </MenuItem>

    {/* Profile Link */}
    <MenuItem onClick={() => { 
        setAnchorEl(null); 
        onTabChange('settings'); 
    }}>
        <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon> 
        <Typography variant="body2" fontWeight={500}>Profile</Typography>
    </MenuItem>

    {/* Settings Link */}
    <MenuItem onClick={() => { 
        setAnchorEl(null); 
        onTabChange('settings'); 
    }}>
        <ListItemIcon><SettingsOutlinedIcon fontSize="small" /></ListItemIcon> 
        <Typography variant="body2" fontWeight={500}>Settings</Typography>
    </MenuItem>

    <Divider />

    {/* Logout Link */}
    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <ListItemIcon><LogoutOutlinedIcon fontSize="small" color="error" /></ListItemIcon> 
        <Typography variant="body2" fontWeight={600}>Logout</Typography>
    </MenuItem>
</Menu>
                        </Box>
                    </Toolbar>
                </AppBar>

                <Box sx={{ p: { xs: 2, md: 4 }, flexGrow: 1, overflowX: 'hidden' }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default StudentLayout;