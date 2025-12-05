import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, InputBase, useTheme, Avatar, IconButton, Menu, MenuItem, Divider, Drawer, List, ListItem, ListItemText, Paper, InputAdornment, TextField } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import useMediaQuery from '@mui/material/useMediaQuery';

const Header: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isLoggedIn = Boolean(localStorage.getItem('email'));
  const role = (localStorage.getItem('role') || '').toLowerCase();
  const userInitial = localStorage.getItem('email')?.[0]?.toUpperCase() || 'U';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('email');
    localStorage.removeItem('role');
    window.location.href = '/';
  };

  // Search handler
  const handleSearch = (e: React.FormEvent | React.KeyboardEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const openMobileSearch = () => setSearchOpen(true);
  const closeMobileSearch = () => setSearchOpen(false);

  const navLinks = [
    { label: 'Browse', to: '/browse' },
    { label: 'Upload', to: '/upload' },
    { label: 'Teach', to: '/seller' }
  ];

  return (
    <header>
  <AppBar position="sticky" color="inherit" elevation={1} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: '#fff' }}>
        <Toolbar sx={{ minHeight: 72, px: { xs: 1, md: 3 }, justifyContent: 'space-between' }}>
          {/* Left: Logo and Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Box sx={{ mr: 1 }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <rect width="32" height="32" rx="8" fill="#2563eb" />
                  <path d="M16 8L28 12L16 16L4 12L16 8Z" fill="#fff" />
                  <path d="M16 16V24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <ellipse cx="16" cy="24.5" rx="4" ry="1.5" fill="#fff" />
                </svg>
              </Box>
              <Typography variant="h6" fontWeight={800} color="primary" sx={{ letterSpacing: '-0.5px' }}>
                EduHub
              </Typography>
            </Box>
          </Box>
          {/* Center: Search Bar (desktop) */}
          {!isMobile && (
            <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, mx: 4, maxWidth: 640, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Paper component="div" elevation={0} sx={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: 640, bgcolor: '#f5f6fa', borderRadius: 2, px: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search for resources, teachers, or topics..."
                  variant="standard"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
                  InputProps={{
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button onClick={handleSearch} sx={{ textTransform: 'none', fontWeight: 700 }}>Search</Button>
                      </InputAdornment>
                    )
                  }}
                />
              </Paper>
            </Box>
          )}
          {/* Right: Nav Links and Auth Buttons or Hamburger */}
          {isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton aria-label="search" onClick={openMobileSearch} sx={{ width: 44, height: 44 }}>
                <SearchIcon />
              </IconButton>
              <IconButton edge="end" color="inherit" aria-label="Open navigation menu" onClick={() => setDrawerOpen(true)} sx={{ ml: 1, width: 48, height: 48 }}>
                <MenuIcon fontSize="large" />
              </IconButton>
            </Box>
          ) : !isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navLinks.map(l => (
                <Button key={l.to} component={RouterLink} to={l.to} color="inherit" sx={{ fontWeight: 500, fontSize: '1rem', textTransform: 'none' }}>{l.label}</Button>
              ))}
              <Button component={RouterLink} to="/login" color="inherit" sx={{ fontWeight: 500, fontSize: '1rem', textTransform: 'none' }}>
                Sign In
              </Button>
              <Button component={RouterLink} to="/register?role=teacher" variant="contained" color="primary" sx={{ fontWeight: 700, fontSize: '1rem', borderRadius: 2, ml: 1, boxShadow: 2, textTransform: 'none' }}>
                Sign Up
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                component={RouterLink}
                to={role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'}
                color="primary"
                variant="contained"
                sx={{ fontWeight: 700, minWidth: 44, minHeight: 44, borderRadius: 2 }}
              >
                Dashboard
              </Button>
              <IconButton onClick={handleAvatarClick} sx={{ width: 44, height: 44 }} aria-label="User menu">
                <Avatar>{userInitial}</Avatar>
              </IconButton>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} onClick={handleMenuClose} MenuListProps={{ 'aria-label': 'User menu' }}>
                <MenuItem component={RouterLink} to="/profile">Profile</MenuItem>
                <MenuItem component={RouterLink} to="/account">Account Settings</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          aria-label="Mobile navigation menu"
        >
          <nav aria-label="Mobile navigation">
            <List sx={{ width: 240 }}>
              <ListItem>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="h6" fontWeight={800}>Menu</Typography>
                  <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu"><CloseIcon /></IconButton>
                </Box>
              </ListItem>
              {navLinks.map(link => (
                <ListItem button component={RouterLink} to={link.to} key={link.to} onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary={link.label} />
                </ListItem>
              ))}
              <Divider />
              {!isLoggedIn ? (
                <>
                  <ListItem button component={RouterLink} to="/login" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Sign In" />
                  </ListItem>
                  <ListItem button component={RouterLink} to="/register?role=teacher" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Sign Up" />
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem button component={RouterLink} to={role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'} onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem button component={RouterLink} to="/profile" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Profile" />
                  </ListItem>
                  <ListItem button component={RouterLink} to="/account" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Account Settings" />
                  </ListItem>
                  <Divider />
                  <ListItem button onClick={() => { setDrawerOpen(false); handleLogout(); }}>
                    <ListItemText primary="Logout" />
                  </ListItem>
                </>
              )}
            </List>
          </nav>
        </Drawer>
        {/* Mobile Search Drawer */}
        <Drawer anchor="top" open={searchOpen} onClose={closeMobileSearch} aria-label="Mobile search">
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }} component="form" onSubmit={handleSearch}>
            <TextField
              autoFocus
              fullWidth
              placeholder="Search resources..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
            <IconButton onClick={closeMobileSearch} aria-label="Close search"><CloseIcon /></IconButton>
          </Box>
        </Drawer>
      </AppBar>
    </header>
  );
};

export default Header; 