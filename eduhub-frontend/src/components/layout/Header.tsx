import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Box, InputBase, useTheme, Avatar, IconButton, Menu, MenuItem, Divider, Drawer, List, ListItem, ListItemText } from '@mui/material';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
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

  const navLinks = [
    { label: 'Browse', to: '/browse' },
    { label: 'Upload', to: '/upload' },
  ];

  return (
    <header>
      <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
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
          {/* Center: Search Bar (hide on mobile) */}
          {!isMobile && (
            <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, mx: 4, maxWidth: 420, display: 'flex', alignItems: 'center', bgcolor: '#f5f6fa', borderRadius: 2, px: 2, py: 0.5 }}>
              <IconButton type="submit" sx={{ color: 'grey.600', mr: 1 }} aria-label="search">
                <SearchIcon />
              </IconButton>
              <InputBase
                placeholder="Search for resources..."
                inputProps={{ 'aria-label': 'search' }}
                sx={{ width: 320, fontSize: '1rem' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(e); }}
              />
            </Box>
          )}
          {/* Right: Nav Links and Auth Buttons or Hamburger */}
          {isMobile ? (
            <IconButton edge="end" color="inherit" aria-label="Open navigation menu" onClick={() => setDrawerOpen(true)} sx={{ ml: 1, width: 48, height: 48 }}>
              <MenuIcon fontSize="large" />
            </IconButton>
          ) : !isLoggedIn ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button component={RouterLink} to="/browse" color="inherit" sx={{ fontWeight: 500, fontSize: '1rem', textTransform: 'none' }}>
                Browse
              </Button>
              <Button component={RouterLink} to="/upload" color="inherit" sx={{ fontWeight: 500, fontSize: '1rem', textTransform: 'none' }}>
                Upload
              </Button>
              <Button component={RouterLink} to="/login" color="inherit" sx={{ fontWeight: 500, fontSize: '1rem', textTransform: 'none', ml: 2 }}>
                Sign In
              </Button>
              <Button component={RouterLink} to="/register?role=teacher" variant="contained" color="primary" sx={{ fontWeight: 700, fontSize: '1rem', borderRadius: 2, ml: 1, boxShadow: 2, textTransform: 'none' }}>
                Sign Up as a Teacher
              </Button>
              <Button component={RouterLink} to="/register?role=student" variant="outlined" color="primary" sx={{ fontWeight: 700, fontSize: '1rem', borderRadius: 2, ml: 1, textTransform: 'none' }}>
                Sign Up as a Student
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
                    <ListItemText primary="Sign Up as a Teacher" />
                  </ListItem>
                  <ListItem button component={RouterLink} to="/register?role=student" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Sign Up as a Student" />
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
      </AppBar>
    </header>
  );
};

export default Header; 