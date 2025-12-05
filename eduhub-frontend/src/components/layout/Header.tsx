import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, useTheme, Avatar, IconButton, 
  Menu, MenuItem, Divider, Drawer, List, ListItemButton, ListItemText, 
  InputAdornment, TextField, Badge, ListItemIcon 
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

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
import useMediaQuery from '@mui/material/useMediaQuery';

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const isLoggedIn = Boolean(localStorage.getItem('email'));
  const role = (localStorage.getItem('role') || '').toLowerCase();
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
      backgroundColor: '#fff', // Pure white
      borderBottom: `1px solid ${theme.palette.divider}`,
      width: '100%', 
      left: 0,
      right: 0,
      zIndex: theme.zIndex.drawer + 1,
    },
    // The "Underline Slide" Effect for Links
    navLink: {
      position: 'relative',
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.95rem',
      color: '#4b5563', // Modern dark grey
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
        '&:after': {
          width: '80%',
        },
      },
    },
    // The "Pill" Search Bar
    searchField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 50,
        backgroundColor: '#f3f4f6', // Very light grey
        height: 46,
        paddingRight: 1,
        transition: 'all 0.2s ease',
        '& fieldset': { borderWidth: '1px', borderColor: 'transparent' },
        '&:hover': {
          backgroundColor: '#e5e7eb',
        },
        '&.Mui-focused': {
          backgroundColor: '#fff',
          boxShadow: `0 0 0 4px ${theme.palette.primary.main}20`, // Glow effect
          '& fieldset': { borderColor: theme.palette.primary.main },
        },
      }
    },
    // "Sign Up" Pill Button
    signUpBtn: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: 50, // Fully rounded
      px: 3,
      py: 1,
      boxShadow: `0 4px 14px 0 ${theme.palette.primary.main}40`, // Colored shadow
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)', // Lift effect
        boxShadow: `0 6px 20px 0 ${theme.palette.primary.main}60`,
      }
    }
  };

  return (
    <Box component="header" sx={{ width: '100%' }}>
      <AppBar position="sticky" elevation={0} sx={styles.appBar}>
        <Toolbar sx={{ minHeight: 72, px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
          
          {/* LOGO */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', gap: 1 }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill={theme.palette.primary.main} />
                <path d="M16 8L28 12L16 16L4 12L16 8Z" fill="#fff" />
                <path d="M16 16V24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                <ellipse cx="16" cy="24.5" rx="4" ry="1.5" fill="#fff" />
              </svg>
              {!isMobile && (
                <Typography variant="h6" fontWeight={800} color="primary" sx={{ letterSpacing: '-0.5px', ml: 1 }}>
                  EduHub
                </Typography>
              )}
            </Box>
          </Box>

          {/* SEARCH (Desktop) */}
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

          {/* NAVIGATION (Desktop) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {/* Mobile Search Trigger */}
            {isMobile && (
              <IconButton onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            )}

            {/* Desktop Links with Hover Effect */}
            {!isMobile && !isLoggedIn && navLinks.map(l => (
              <Button key={l.to} component={RouterLink} to={l.to} sx={styles.navLink}>
                {l.label}
              </Button>
            ))}

            {isLoggedIn ? (
              // LOGGED IN STATE
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

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{ sx: { mt: 2, minWidth: 200, borderRadius: 3, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)' } }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={RouterLink} to="/profile">Profile</MenuItem>
                  <MenuItem component={RouterLink} to="/account">Settings</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              // LOGGED OUT STATE
              !isMobile && (
                <>
                  {/* Clean Text Link for Login */}
                  <Button 
                    component={RouterLink} 
                    to="/login" 
                    sx={styles.navLink}
                  >
                    Log In
                  </Button>
                  
                  {/* Modern Pill Button for Sign Up */}
                  <Button 
                    component={RouterLink} 
                    to="/register?role=teacher" 
                    variant="contained" 
                    color="primary"
                    sx={styles.signUpBtn}
                  >
                    Sign Up
                  </Button>
                </>
              )
            )}

            {/* Mobile Hamburger */}
            {isMobile && (
              <IconButton edge="end" onClick={() => setDrawerOpen(true)} sx={{ ml: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>

        {/* ---------------- MOBILE DRAWER (Modernized) ---------------- */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ 
            sx: { 
              width: 280, 
              borderTopLeftRadius: 20, 
              borderBottomLeftRadius: 20 
            } 
          }}
          // Backdrop blur effect
          componentsProps={{ backdrop: { sx: { backdropFilter: 'blur(3px)', backgroundColor: 'rgba(0,0,0,0.2)' } } }}
        >
          {/* Drawer Header with Gradient */}
          <Box sx={{ 
            p: 3, 
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, 
            color: '#fff' 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Menu</Typography>
              <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'rgba(255,255,255,0.8)' }}>
                <CloseIcon />
              </IconButton>
            </Box>
            {isLoggedIn && (
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <Avatar sx={{ bgcolor: '#fff', color: theme.palette.primary.main }}>{userInitial}</Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Welcome back,</Typography>
                    <Typography variant="subtitle1" fontWeight={700}>{userInitial}</Typography>
                  </Box>
               </Box>
            )}
          </Box>

          <List sx={{ p: 2 }}>
            <ListItemButton component={RouterLink} to="/" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}><HomeIcon /></ListItemIcon>
              <ListItemText primary="Home" />
            </ListItemButton>

            {navLinks.map(link => (
              <ListItemButton key={link.to} component={RouterLink} to={link.to} onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2, mb: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 40, color: theme.palette.primary.main }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            ))}

            <Divider sx={{ my: 2 }} />

            {!isLoggedIn ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  component={RouterLink} 
                  to="/login" 
                  startIcon={<LoginIcon />}
                  sx={{ justifyContent: 'flex-start', color: '#4b5563', textTransform: 'none' }}
                  onClick={() => setDrawerOpen(false)}
                >
                  Log In
                </Button>
                <Button 
                  component={RouterLink} 
                  to="/register?role=teacher" 
                  variant="contained" 
                  startIcon={<HowToRegIcon />}
                  sx={{ borderRadius: 50, py: 1.5, fontWeight: 700, textTransform: 'none', boxShadow: 4 }}
                  onClick={() => setDrawerOpen(false)}
                >
                  Sign Up for Free
                </Button>
              </Box>
            ) : (
              <>
                <ListItemButton component={RouterLink} to="/dashboard" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><DashboardIcon /></ListItemIcon>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
                <ListItemButton component={RouterLink} to="/profile" onClick={() => setDrawerOpen(false)} sx={{ borderRadius: 2 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
                  <ListItemText primary="Profile" />
                </ListItemButton>
                <ListItemButton onClick={() => { setDrawerOpen(false); handleLogout(); }} sx={{ borderRadius: 2, color: 'error.main' }}>
                   <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}><LoginIcon sx={{ transform: 'rotate(180deg)' }} /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </>
            )}
          </List>
        </Drawer>

        {/* ---------------- SEARCH DRAWER ---------------- */}
        <Drawer anchor="top" open={searchOpen} onClose={() => setSearchOpen(false)}>
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
            />
            <IconButton onClick={() => setSearchOpen(false)}><CloseIcon /></IconButton>
          </Box>
        </Drawer>

      </AppBar>
    </Box>
  );
};

export default Header;