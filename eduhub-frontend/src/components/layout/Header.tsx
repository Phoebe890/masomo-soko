import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, useTheme, Avatar, IconButton, 
  Menu, MenuItem, Divider, Drawer, List, ListItemButton, ListItemText, 
  InputAdornment, TextField, Badge, ListItemIcon, Stack 
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'; 
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import HomeIcon from '@mui/icons-material/Home';
import StorefrontIcon from '@mui/icons-material/Storefront';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import LoginIcon from '@mui/icons-material/Login';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School'; // <--- NEW IMPORT

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const isLoggedIn = Boolean(localStorage.getItem('email'));
  const userInitial = localStorage.getItem('email')?.[0]?.toUpperCase() || 'U';
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false); 
    }
  };

  const navLinks = [
    { label: 'Browse', to: '/browse', icon: <StorefrontIcon /> },
    { label: 'Upload', to: '/upload', icon: <CloudUploadIcon /> },
    { label: 'Teach', to: '/seller', icon: <DashboardIcon /> }
  ];

  // --- STYLES ---
  const styles = {
    appBar: {
      backgroundColor: '#fff', 
      borderBottom: `1px solid ${theme.palette.divider}`,
      width: '100%', 
    },
    navLink: {
      position: 'relative',
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.95rem',
      color: '#4b5563', 
      mx: 0.5,
      '&:after': {
        content: '""',
        position: 'absolute',
        width: '0%',
        height: '2px',
        bottom: '6px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: theme.palette.primary.main,
        transition: 'width 0.3s ease-in-out',
      },
      '&:hover': {
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
        '&:after': { width: '80%' },
      },
    },
    searchField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 50,
        backgroundColor: '#f3f4f6', 
        height: 46,
        paddingRight: 1,
        transition: 'all 0.2s ease',
        '& fieldset': { borderWidth: '1px', borderColor: 'transparent' },
        '&:hover': { backgroundColor: '#e5e7eb' },
        '&.Mui-focused': {
          backgroundColor: '#fff',
          boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`,
          '& fieldset': { borderColor: theme.palette.primary.main },
        },
      }
    },
    signUpBtn: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 50,
      px: 3,
      py: 1,
      boxShadow: `0 4px 14px 0 ${theme.palette.primary.main}40`,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: `0 6px 20px 0 ${theme.palette.primary.main}60`,
      }
    }
  };

  return (
    <Box component="header" sx={{ width: '100%' }}>
      <AppBar position="sticky" elevation={0} sx={styles.appBar}>
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
          
          {/* --- NEW LOGO (Matches Footer) --- */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Box sx={{ 
                  bgcolor: theme.palette.primary.main, 
                  borderRadius: '50%', 
                  width: 40, 
                  height: 40,
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: 1.5
              }}>
                 <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
              </Box>
              
              <Typography variant="h5" fontWeight={800} color="primary" sx={{ letterSpacing: '-0.5px' }}>
                EduHub
              </Typography>
          </Box>

          {/* DESKTOP SEARCH */}
          {!isMobile && (
            <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, mx: 4, maxWidth: 600 }}>
              <TextField
                fullWidth
                placeholder="Search resources, teachers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                sx={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 1 }}>
                      <SearchIcon color="disabled" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {/* ACTIONS & NAVIGATION */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {/* Mobile Search Icon */}
            {isMobile && (
              <IconButton onClick={() => setSearchOpen(true)} sx={{ color: 'text.primary' }}>
                <SearchIcon />
              </IconButton>
            )}

            {/* Desktop Navigation Links */}
            {!isMobile && !isLoggedIn && navLinks.map(l => (
              <Button key={l.to} component={RouterLink} to={l.to} sx={styles.navLink}>
                {l.label}
              </Button>
            ))}

            {isLoggedIn ? (
              // LOGGED IN
              <>
                {!isMobile && (
                  <>
                     <IconButton component={RouterLink} to="/cart">
                        <ShoppingCartOutlinedIcon />
                     </IconButton>
                     <IconButton>
                        <Badge color="error" variant="dot">
                           <NotificationsNoneOutlinedIcon />
                        </Badge>
                     </IconButton>
                  </>
                )}
                
                <IconButton onClick={handleAvatarClick} sx={{ ml: 1, border: `2px solid ${theme.palette.primary.light}`, p: 0.5 }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: '0.9rem' }}>
                    {userInitial}
                  </Avatar>
                </IconButton>

                {/* Dropdown Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{ sx: { mt: 2, minWidth: 200, borderRadius: 3, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={RouterLink} to="/profile"><ListItemIcon><PersonIcon fontSize="small"/></ListItemIcon> Profile</MenuItem>
                  <MenuItem component={RouterLink} to="/account"><ListItemIcon><SettingsIcon fontSize="small"/></ListItemIcon> Settings</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                      <ListItemIcon><LogoutIcon fontSize="small" color="error"/></ListItemIcon> Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // LOGGED OUT
              !isMobile && (
                <>
                  <Button component={RouterLink} to="/login" sx={styles.navLink}>Log In</Button>
                  <Button component={RouterLink} to="/register?role=teacher" variant="contained" color="primary" sx={styles.signUpBtn}>Sign Up</Button>
                </>
              )
            )}

            {/* Mobile Hamburger Trigger */}
            {isMobile && (
              <IconButton edge="end" onClick={() => setDrawerOpen(true)} sx={{ ml: 1, color: 'text.primary' }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>

        {/* ---------------- MOBILE DRAWER ---------------- */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{ zIndex: theme.zIndex.appBar + 100 }} 
          PaperProps={{ 
            sx: { 
              width: '85%', 
              maxWidth: 320,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            } 
          }}
          ModalProps={{ keepMounted: true }}
        >
          {/* Header Section */}
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, 
            color: '#fff' 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
               
               {/* Mobile Menu Logo (White version) */}
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ 
                      bgcolor: 'white', 
                      borderRadius: '50%', 
                      width: 36, 
                      height: 36,
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      mr: 1.5
                  }}>
                     <SchoolIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
                  </Box>
                  <Typography variant="h6" fontWeight={800} color="white">
                    EduHub
                  </Typography>
               </Box>

              <IconButton 
                onClick={() => setDrawerOpen(false)} 
                sx={{ 
                    color: 'white', 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {isLoggedIn && (
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, p: 1.5, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                  <Avatar sx={{ bgcolor: '#fff', color: theme.palette.primary.main }}>{userInitial}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Signed in as</Typography>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1 }}>{localStorage.getItem('email') || 'User'}</Typography>
                  </Box>
               </Box>
            )}
          </Box>

          {/* Scrollable List */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
            <List component="nav">
              <ListItemButton component={RouterLink} to="/" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 1 }}>
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}><HomeIcon /></ListItemIcon>
                <ListItemText primary="Home" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>

              {navLinks.map(link => (
                <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              ))}

              <Divider sx={{ my: 2 }} />

              {/* Mobile Profile Actions */}
              {isLoggedIn && (
                 <>
                    <ListItemButton component={RouterLink} to="/profile" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
                        <ListItemText primary="My Profile" />
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to="/cart" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><ShoppingCartOutlinedIcon /></ListItemIcon>
                        <ListItemText primary="My Cart" />
                    </ListItemButton>
                 </>
              )}
            </List>
          </Box>

          {/* Footer Section */}
          <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: '#f9fafb' }}>
            {!isLoggedIn ? (
              <Stack spacing={2}>
                <Button 
                  fullWidth
                  component={RouterLink} 
                  to="/login" 
                  variant="outlined"
                  startIcon={<LoginIcon />}
                  onClick={() => setDrawerOpen(false)}
                >
                  Log In
                </Button>
                <Button 
                  fullWidth
                  component={RouterLink} 
                  to="/register?role=teacher" 
                  variant="contained" 
                  startIcon={<HowToRegIcon />}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ boxShadow: 2 }}
                >
                  Sign Up
                </Button>
              </Stack>
            ) : (
                <Button 
                  fullWidth
                  color="error"
                  variant="outlined"
                  startIcon={<LogoutIcon />}
                  onClick={() => { setDrawerOpen(false); handleLogout(); }}
                >
                  Logout
                </Button>
            )}
            <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mt: 3 }}>
                © 2025 EduHub Inc.
            </Typography>
          </Box>
        </Drawer>

        {/* ---------------- MOBILE SEARCH DRAWER ---------------- */}
        <Drawer 
            anchor="top" 
            open={searchOpen} 
            onClose={() => setSearchOpen(false)}
            sx={{ zIndex: theme.zIndex.tooltip + 1 }} 
        >
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }} component="form" onSubmit={handleSearch}>
            <TextField
              autoFocus
              fullWidth
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ 
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                sx: { borderRadius: 50, backgroundColor: '#f3f4f6' }
              }}
              variant="outlined"
              size="small"
            />
            <Button onClick={() => setSearchOpen(false)} sx={{ minWidth: 'auto', p: 1 }}>Cancel</Button>
          </Box>
        </Drawer>

      </AppBar>
    </Box>
  );
};

export default Header;