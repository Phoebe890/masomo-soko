import React, { useState } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, useTheme, Avatar, IconButton, 
  Menu, MenuItem, Divider, Drawer, List, ListItemButton, ListItemText, 
  InputAdornment, TextField, Badge, ListItemIcon, Stack, Tooltip 
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'; 
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DashboardIcon from '@mui/icons-material/Dashboard'; 
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SchoolIcon from '@mui/icons-material/School'; 
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Icon for About Us

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Auth State
  const isLoggedIn = Boolean(localStorage.getItem('email'));
  const userInitial = localStorage.getItem('email')?.[0]?.toUpperCase() || 'U';
  const userRole = localStorage.getItem('role'); 
  const isTeacher = userRole === 'TEACHER' || userRole === 'ROLE_TEACHER';
  const dashboardRoute = isTeacher ? '/dashboard/teacher' : '/dashboard/student';

  // UI State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/';
  };

  const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false); 
    }
  };

  // --- STYLES ---
  const styles = {
    appBar: {
      backgroundColor: '#fff', 
      borderBottom: `1px solid ${theme.palette.divider}`,
      width: '100%', 
    },
    navLink: {
      textTransform: 'none',
      fontWeight: 500,
      fontSize: '0.95rem',
      color: '#4b5563', 
      mx: 0.5,
      '&:hover': { 
        color: '#ea580c', // Orange on hover (DESKTOP ONLY)
        bgcolor: 'transparent' 
      },
    },
    searchField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 50,
        backgroundColor: '#f8f9fa', 
        height: 48,
        paddingRight: 1,
        border: '1px solid transparent',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '& fieldset': { border: 'none' },
        '&:hover': { 
            backgroundColor: '#fff',
            border: '1px solid #d1d7dc',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        },
        '&.Mui-focused': {
          backgroundColor: '#fff',
          border: `1px solid ${theme.palette.primary.main}`,
          boxShadow: `0 0 0 4px ${theme.palette.primary.main}15`,
        },
      },
      '& input': { fontSize: '0.95rem', color: '#333' }
    },
    menuPaper: {
      mt: 1.5, 
      minWidth: 240, 
      borderRadius: 3, 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      overflow: 'visible',
      '&:before': { 
        content: '""',
        display: 'block',
        position: 'absolute',
        top: 0,
        right: 14,
        width: 10,
        height: 10,
        bgcolor: 'background.paper',
        transform: 'translateY(-50%) rotate(45deg)',
        zIndex: 0,
      },
    }
  };

  return (
    <Box component="header" sx={{ width: '100%' }}>
      
      {/* 1. IMPORT CHEWY FONT (Replaced Playfair Display) */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Chewy&display=swap');`}
      </style>

      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ ...styles.appBar, zIndex: 1100 }}
      >
        <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
          
          {/* --- BRANDING (Updated with Chewy font) --- */}
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              {/* Icon is now Orange to match */}
             {/* <SchoolIcon sx={{ color: '#ea580c', fontSize: 32, mr: 1 }} />*/}
              
              <Typography 
                variant="h5" 
                className="logo-font" 
                sx={{ 
                    fontFamily: "'Chewy', cursive", // CHANGED: Using Chewy font
                    fontWeight: 400, // Chewy only has regular weight
                    color: '#ea580c', // Orange color for entire text
                    letterSpacing: '-0.5px',
                    fontSize: '2rem', // Slightly larger for Chewy font
                    lineHeight: 1,
                }}
              >
                Masomo Soko.
              </Typography>
          </Box>

          {/* 2. DESKTOP SEARCH */}
          {!isMobile && (
            <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, mx: 6, maxWidth: 500 }}>
              <TextField
                fullWidth
                placeholder="Search for resources..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                sx={styles.searchField}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ pl: 1.5, mr: -0.5 }}>
                      <SearchIcon sx={{ color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          )}

          {/* 3. NAVIGATION & ACTIONS */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
            {isMobile && (
              <IconButton onClick={() => setSearchOpen(true)}>
                <SearchIcon />
              </IconButton>
            )}

            {!isMobile && (
              <>
                <Button component={RouterLink} to="/browse" sx={styles.navLink}>
                  Browse
                </Button>
                {/* --- ADDED ABOUT LINK HERE --- */}
                <Button component={RouterLink} to="/about" sx={styles.navLink}>
                  About Us
                </Button>
              </>
            )}

            {isLoggedIn ? (
              // --- LOGGED IN ---
              <>
                {!isMobile && (
                  <>
                     {isTeacher && (
                        <Button component={RouterLink} to="/dashboard/teacher/upload-first-resource" sx={styles.navLink}>
                           Teach
                        </Button>
                     )}
                     <Tooltip title="Shopping Cart">
                        <IconButton component={RouterLink} to="/cart" size="small">
                            <ShoppingCartOutlinedIcon />
                        </IconButton>
                     </Tooltip>
                     <Tooltip title="Notifications">
                        <IconButton size="small">
                            <Badge color="error" variant="dot">
                                <NotificationsNoneOutlinedIcon />
                            </Badge>
                        </IconButton>
                     </Tooltip>
                  </>
                )}
                
                <IconButton 
                    onClick={handleAvatarClick} 
                    size="small"
                    sx={{ ml: 1, p: 0.5, border: `1px solid ${theme.palette.divider}` }}
                >
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 32, height: 32, fontSize: '0.9rem', fontWeight: 700 }}>
                    {userInitial}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  onClick={handleMenuClose}
                  PaperProps={{ sx: styles.menuPaper }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={RouterLink} to={dashboardRoute} sx={{ py: 1.5, px: 2.5 }}>
                      <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="Dashboard" />
                  </MenuItem>
                  <Divider />
                  <MenuItem component={RouterLink} to="/profile" sx={{ py: 1.5 }}>
                      <ListItemIcon><PersonOutlineIcon fontSize="small"/></ListItemIcon> 
                      Public Profile
                  </MenuItem>
                  <MenuItem component={RouterLink} to="/account" sx={{ py: 1.5 }}>
                      <ListItemIcon><SettingsOutlinedIcon fontSize="small"/></ListItemIcon> 
                      Account Settings
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                      <ListItemIcon><LogoutIcon fontSize="small" color="error"/></ListItemIcon> 
                      Log out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              // --- LOGGED OUT ---
              !isMobile && (
                <>
                  <Button component={RouterLink} to="/login" sx={{ ...styles.navLink, fontWeight: 700 }}>Log in</Button>
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="contained" 
                    sx={{ 
                        borderRadius: 50, textTransform: 'none', fontWeight: 700, px: 3, boxShadow: 'none'
                    }}
                  >
                    Sign up
                  </Button>
                </>
              )
            )}

            {isMobile && (
              <IconButton edge="end" onClick={() => setDrawerOpen(true)}>
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
          sx={{ zIndex: 1200 }} // Over Navbar
          PaperProps={{ sx: { width: '85%', maxWidth: 300 } }}
        >
          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
            {/* Branding in Mobile Menu */}
            <Typography 
                variant="h6" 
                sx={{ 
                    fontFamily: "'Chewy', cursive", // CHANGED: Using Chewy font
                    fontWeight: 400, 
                    color: '#ea580c', // Orange color
                    fontSize: '1.8rem',
                    lineHeight: 1,
                }}
            >
                masomo soko.
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)}>
                <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <List>
               {isLoggedIn ? (
                 <>
                    <ListItemButton 
                        component={RouterLink} 
                        to={dashboardRoute} 
                        onClick={() => setDrawerOpen(false)}
                        sx={{ bgcolor: theme.palette.primary.main + '15', borderRadius: 2, mb: 1 }}
                    >
                        <ListItemIcon><DashboardIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="Dashboard" />
                    </ListItemButton>
                    <ListItemButton component={RouterLink} to="/profile" onClick={() => setDrawerOpen(false)}>
                        <ListItemIcon><PersonOutlineIcon /></ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                 </>
               ) : (
                 <Stack spacing={2} sx={{ mb: 3 }}>
                    <Button variant="contained" fullWidth component={RouterLink} to="/register" size="large" onClick={() => setDrawerOpen(false)}>
                        Sign up
                    </Button>
                    <Button variant="outlined" fullWidth component={RouterLink} to="/login" size="large" onClick={() => setDrawerOpen(false)}>
                        Log in
                    </Button>
                 </Stack>
               )}

               <Divider sx={{ my: 2 }} />

               <ListItemButton component={RouterLink} to="/browse" onClick={() => setDrawerOpen(false)}>
                   <ListItemIcon><StorefrontIcon /></ListItemIcon>
                   <ListItemText primary="Browse Resources" />
               </ListItemButton>

               {/* --- ADDED ABOUT LINK IN MOBILE MENU --- */}
               <ListItemButton component={RouterLink} to="/about" onClick={() => setDrawerOpen(false)}>
                   <ListItemIcon><InfoOutlinedIcon /></ListItemIcon>
                   <ListItemText primary="About Us" />
               </ListItemButton>
               
               {isLoggedIn && (
                   <ListItemButton onClick={() => { setDrawerOpen(false); handleLogout(); }}>
                       <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                       <ListItemText primary="Log out" primaryTypographyProps={{ color: 'error' }} />
                   </ListItemButton>
               )}
            </List>
          </Box>
        </Drawer>

        {/* ---------------- MOBILE SEARCH OVERLAY ---------------- */}
        <Drawer 
            anchor="top" 
            open={searchOpen} 
            onClose={() => setSearchOpen(false)}
            sx={{ zIndex: 1200 }}
        >
          <Box sx={{ p: 2, display: 'flex', gap: 1 }} component="form" onSubmit={handleSearch}>
            <TextField
              autoFocus
              fullWidth
              placeholder="Search..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 50, bgcolor: '#f8f9fa' } }}
            />
            <Button onClick={() => setSearchOpen(false)}>Cancel</Button>
          </Box>
        </Drawer>

      </AppBar>
      <Toolbar sx={{ minHeight: 70 }} />
    </Box>
  );
};

export default Header;