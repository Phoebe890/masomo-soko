import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useState } from 'react';
import PropTypes from 'prop-types';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import { useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';

interface HeaderProps {
  onMenuClick?: () => void;
}

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Browse', to: '/browse' },
  { label: 'Upload', to: '/dashboard/teacher/upload-first-resource' },
  { label: 'About', to: '/about' },
];

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState('');
  const isLoggedIn = Boolean(localStorage.getItem('email'));
  const userInitial = localStorage.getItem('email')?.[0]?.toUpperCase() || 'U';
  const location = useLocation();
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [hasNotifications, setHasNotifications] = useState(false); // You can wire this up to real data
  const role = localStorage.getItem('role');

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };
  const handleNotifClose = () => {
    setNotifAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('email');
    window.location.href = '/';
  };

  return (
    <header>
      <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Toolbar component="nav" aria-label="Main navigation" sx={{ minHeight: 64, px: { xs: 1, md: 3 } }}>
          {/* Left: Logo */}
          <Box sx={{ flex: { xs: '0 0 auto', md: '0 0 180px' }, display: 'flex', alignItems: 'center', mr: 2 }}>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
              aria-label="EduHub homepage"
          sx={{
            textDecoration: 'none',
                color: theme.palette.primary.main,
                fontWeight: 800,
                fontSize: '1.7rem',
                letterSpacing: '-0.02em',
                outline: 'none',
                '&:focus': {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: 2,
                },
          }}
              tabIndex={0}
        >
          EduHub
        </Typography>
          </Box>
          {/* Center: Nav links + Search */}
          {!isMobile && (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
              {navLinks.map(link => (
                <Button
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  color="inherit"
                  sx={{
                    fontWeight: 500,
                    minWidth: 44,
                    minHeight: 44,
                    px: 2,
                    color: location.pathname === link.to ? theme.palette.primary.main : 'inherit',
                    borderBottom: location.pathname === link.to ? `2px solid ${theme.palette.primary.main}` : 'none',
                    borderRadius: 0,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    outline: 'none',
                    '&:focus': {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: 2,
                    },
                  }}
                  tabIndex={0}
                >
                  {link.label}
                </Button>
              ))}
              <Box sx={{ ml: 3, display: 'flex', alignItems: 'center', bgcolor: 'grey.100', borderRadius: 2, px: 1, py: 0.5, minWidth: 180 }}>
                <SearchIcon sx={{ color: 'grey.600', mr: 1 }} />
                <InputBase
                  placeholder="Search…"
                  inputProps={{ 'aria-label': 'search' }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  sx={{ width: 120, fontSize: '1rem' }}
                />
              </Box>
            </Box>
          )}
          {/* Right: User actions */}
          <Box sx={{ flex: { xs: '0 0 auto', md: '0 0 180px' }, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
            {isLoggedIn ? (
              <>
                <Button
                  component={RouterLink}
                  to={role === 'teacher' ? '/dashboard/teacher' : '/dashboard/student'}
                  color="primary"
                  variant="contained"
                  sx={{ fontWeight: 700, minWidth: 44, minHeight: 44, borderRadius: 2 }}
                  tabIndex={0}
                >
                  {role === 'teacher' ? 'My Dashboard' : 'Dashboard'}
                </Button>
                <IconButton onClick={handleNotifClick} sx={{ width: 44, height: 44, position: 'relative' }} aria-label="Notifications">
                  <NotificationsIcon />
                  {hasNotifications && (
                    <Box sx={{ position: 'absolute', top: 8, right: 8, width: 10, height: 10, bgcolor: 'error.main', borderRadius: '50%' }} />
                  )}
                </IconButton>
                <Menu anchorEl={notifAnchorEl} open={Boolean(notifAnchorEl)} onClose={handleNotifClose} MenuListProps={{ 'aria-label': 'Notifications' }}>
                  <MenuItem disabled>No new notifications</MenuItem>
                </Menu>
                <IconButton onClick={handleAvatarClick} sx={{ width: 44, height: 44 }} aria-label="User menu">
                  <Avatar>{userInitial}</Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} onClick={handleMenuClose} MenuListProps={{ 'aria-label': 'User menu' }}>
                  <MenuItem component={RouterLink} to="/profile">Profile</MenuItem>
                  <MenuItem component={RouterLink} to="/account">Account Settings</MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              </>
            ) : (
              <>
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
                  sx={{ fontWeight: 500, minWidth: 44, minHeight: 44, outline: 'none', border: '1.5px solid', borderColor: theme.palette.primary.main, borderRadius: 2, mr: 1, '&:focus': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 } }}
                  tabIndex={0}
          >
                  Log In
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
                  sx={{ fontWeight: 700, minWidth: 44, minHeight: 44, borderRadius: 2, boxShadow: 2, '&:focus': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 2 } }}
                  tabIndex={0}
          >
            Sign Up
          </Button>
              </>
            )}
        </Box>
          {/* Mobile: Hamburger menu */}
          {isMobile && (
            <IconButton
              edge="end"
              color="inherit"
              aria-label="Open navigation menu"
              onClick={onMenuClick || (() => setDrawerOpen(true))}
              sx={{ ml: 1, width: 48, height: 48 }}
              tabIndex={0}
            >
              <MenuIcon fontSize="large" />
            </IconButton>
          )}
          {/* Mobile: Drawer nav */}
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
                  <ListItem button component={RouterLink} to={link.to} key={link.to} onClick={() => setDrawerOpen(false)} tabIndex={0}>
                    <ListItemText primary={link.label} />
                  </ListItem>
                ))}
                <Divider />
                {isLoggedIn ? (
                  <>
                    <ListItem button component={RouterLink} to="/dashboard/teacher" onClick={() => setDrawerOpen(false)} tabIndex={0}>
                      <ListItemText primary="Dashboard" />
                    </ListItem>
                    <ListItem button component={RouterLink} to="/profile" onClick={() => setDrawerOpen(false)} tabIndex={0}>
                      <ListItemText primary="Profile" />
                    </ListItem>
                    <ListItem button onClick={handleLogout} tabIndex={0}>
                      <ListItemText primary="Logout" />
                    </ListItem>
                  </>
                ) : (
                  <>
                    <ListItem button component={RouterLink} to="/login" onClick={() => setDrawerOpen(false)} tabIndex={0}>
                      <ListItemText primary="Sign In" />
                    </ListItem>
                    <ListItem button component={RouterLink} to="/register" onClick={() => setDrawerOpen(false)} tabIndex={0}>
                      <ListItemText primary="Get Started" />
                    </ListItem>
                  </>
                )}
              </List>
            </nav>
          </Drawer>
      </Toolbar>
    </AppBar>
    </header>
  );
};

Header.propTypes = {
  onMenuClick: PropTypes.func,
};

export default Header; 