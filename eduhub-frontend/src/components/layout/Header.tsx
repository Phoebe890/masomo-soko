import React, { useState, useEffect } from 'react';
import { 
  AppBar, Toolbar, Typography, Button, Box, useTheme, Avatar, IconButton, 
  Menu, MenuItem, Divider, Drawer, List, ListItemButton, ListItemText, 
  InputAdornment, TextField, Badge, ListItemIcon, Stack, Tooltip,
  Autocomplete, CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import { api } from '@/api/axios';
import logo from '@/assets/logo.svg';
import logoIcon from '@/assets/logo-icon.svg';
// Icons
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
//import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined'; 
//import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import DashboardIcon from '@mui/icons-material/Dashboard'; 
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; 

const Header: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  // THE COLOR UPDATE
  const charcoal = '#1c1d1f';

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
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // --- SEARCH SUGGESTION LOGIC (RESTORED) ---
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const res = await api.get(`/api/teacher/resources?search=${encodeURIComponent(searchTerm)}`);
        const data = res.data.resources || [];
        setSuggestions(data.slice(0, 8));
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  
  const handleLogout = () => {
    localStorage.clear(); 
    window.location.href = '/';
  };

  const handleSearchNavigation = (value: string) => {
    if (value.trim()) {
      navigate(`/browse?search=${encodeURIComponent(value.trim())}`);
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
      fontWeight: 600,
      fontSize: '0.95rem',
      color: '#4b5563', 
      mx: 0.5,
      '&:hover': { color: '#0056d2', bgcolor: 'transparent' }, 
    },
    searchField: {
      '& .MuiOutlinedInput-root': {
        borderRadius: 2, 
        backgroundColor: '#fff', 
        height: 40,
        paddingRight: '14px !important',
        paddingLeft: '8px !important',
        border: '1px solid #d1d7dc',
        transition: 'all 0.2s ease',
        '& fieldset': { border: 'none' },
        '&:hover': { border: '1px solid #0056d2' },
        '&.Mui-focused': { border: `2px solid #0056d2` },
      },
      '& input': { fontSize: '0.9rem', color: '#333' }
    },
    menuPaper: {
      mt: 1.5, minWidth: 240, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }
  };

  return (
    <Box component="header" sx={{ width: '100%' }}>
      {/* THE FONT FIX: Ensure families are separated and weights are defined */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chewy&family=Inter:wght@400;600;700&display=swap');
      `}</style>

      <AppBar position="fixed" elevation={0} sx={{ ...styles.appBar, zIndex: 1100 }}>
        <Toolbar sx={{ minHeight: 70, px: { xs: 2, md: 3 }, justifyContent: 'space-between' }}>
          
          {/* --- LEFT: HAMBURGER (CHARCOAL) + LOGO --- */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <IconButton 
                edge="start" 
                onClick={() => setDrawerOpen(true)} 
                sx={{ mr: 1, color: charcoal }} // UPDATED TO CHARCOAL
              >
                <MenuIcon />
              </IconButton>
            )}
            
           <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
  <img 
     src={isMobile ? logoIcon : logo}
    alt="Masomo Soko" 
    style={{ 
     height: isMobile ? '32px' : '45px', // Adjust this to fit your 70px navbar
      width: 'auto',
      display: 'block'
    }} 
  />
</Box>
          </Box>

          {/* --- CENTER: DESKTOP SEARCH --- */}
          {!isMobile && (
            <Box sx={{ flex: 1, mx: 6, maxWidth: 500 }}>
              <Autocomplete
                freeSolo
                disableClearable
                options={suggestions}
                getOptionLabel={(option: any) => (typeof option === 'string' ? option : option.title)}
                onInputChange={(_, newValue) => setSearchTerm(newValue)}
                onChange={(_, newValue: any) => {
                  if (newValue?.id) navigate(`/resource/${newValue.id}`);
                  else handleSearchNavigation(newValue);
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', cursor: 'pointer' }}>
                    <SearchIcon sx={{ mr: 2, fontSize: 18, color: '#6a6f73' }} />
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1c1d1f' }}>{option.title}</Typography>
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="What do you want to learn?"
                    sx={styles.searchField}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSearchNavigation(searchTerm); }}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (<InputAdornment position="start" sx={{ pl: 1.5 }}><SearchIcon sx={{ color: '#666', fontSize: 20 }} /></InputAdornment>),
                      endAdornment: loadingSuggestions ? <CircularProgress size={20} /> : params.InputProps.endAdornment
                    }}
                  />
                )}
                componentsProps={{
                  paper: { sx: { borderRadius: '4px', mt: 1, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid #d1d7dc' } }
                }}
              />
            </Box>
          )}

          {/* --- RIGHT: ACTIONS --- */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 2 } }}>
            {isMobile && (
              <IconButton onClick={() => setSearchOpen(true)}>
                <SearchIcon sx={{ color: charcoal }} /> {/* UPDATED TO CHARCOAL */}
              </IconButton>
            )}

            {!isMobile && (
              <>
                <Button component={RouterLink} to="/browse" sx={styles.navLink}>Explore</Button>
                <Button component={RouterLink} to="/about" sx={styles.navLink}>About</Button>
              </>
            )}

            {isLoggedIn ? (
              <>
                {!isMobile && (
                  <>
                     {isTeacher && <Button component={RouterLink} to="/dashboard/teacher/upload-first-resource" sx={styles.navLink}>Teach</Button>}
                    {/* <IconButton component={RouterLink} to="/cart" size="small"><ShoppingCartOutlinedIcon /></IconButton>
                     <IconButton size="small"><Badge color="error" variant="dot"><NotificationsNoneOutlinedIcon /></Badge></IconButton>*/}
                  </>
                )}
                <IconButton onClick={handleAvatarClick} size="small" sx={{ ml: 1, p: 0.5 }}>
                  <Avatar sx={{ bgcolor: '#0056d2', width: 32, height: 32, fontSize: '0.9rem', fontWeight: 700 }}>{userInitial}</Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  PaperProps={{ sx: styles.menuPaper }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <MenuItem component={RouterLink} to={dashboardRoute} onClick={handleMenuClose} sx={{ py: 1.5, px: 2.5 }}>
                      <ListItemIcon><DashboardIcon sx={{ color: '#0056d2' }} /></ListItemIcon>
                      <ListItemText primary="My Dashboard" />
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: 'error.main' }}>
                      <ListItemIcon><LogoutIcon fontSize="small" color="error"/></ListItemIcon> 
                      Log out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              !isMobile && (
                <>
                  <Button component={RouterLink} to="/login" sx={{ ...styles.navLink, color: '#0056d2' }}>Log in</Button>
                  <Button component={RouterLink} to="/register" variant="contained" sx={{ borderRadius: '4px', textTransform: 'none', fontWeight: 700, px: 3, bgcolor: '#0056d2', boxShadow: 'none', '&:hover': { bgcolor: '#00419e', boxShadow: 'none' } }}>Join for Free</Button>
                </>
              )
            )}
          </Box>
        </Toolbar>

       {/* --- MOBILE DRAWER --- */}
<Drawer
  anchor="left" 
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  PaperProps={{ sx: { width: '85%', maxWidth: 300 } }}
>
  <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
    
    {/* --- NEW LOGO FOR DRAWER --- */}
    <Box 
      component={RouterLink} 
      to="/" 
      onClick={() => setDrawerOpen(false)} // Closes drawer when navigating home
      sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
    >
      <Box 
        component="img"
         src={isMobile ? logoIcon : logo} // This is the logo you imported at the top
        alt="Masomo Soko"
        sx={{ 
          height: 40, // Height for mobile drawer (slightly smaller than navbar)
          width: 'auto',
          objectFit: 'contain' 
        }}
      />
    </Box>

    <IconButton onClick={() => setDrawerOpen(false)}>
      <CloseIcon sx={{ color: charcoal }} />
    </IconButton>
  </Box>

          <Box sx={{ p: 2 }}>
            <List>
               {!isLoggedIn && (
                 <Stack spacing={2} sx={{ mb: 3 }}>
                    <Button variant="contained" fullWidth component={RouterLink} to="/register" onClick={() => setDrawerOpen(false)} sx={{ bgcolor: '#0056d2' }}>Sign up</Button>
                    <Button variant="outlined" fullWidth component={RouterLink} to="/login" onClick={() => setDrawerOpen(false)} sx={{ color: '#0056d2', borderColor: '#0056d2' }}>Log in</Button>
                 </Stack>
               )}

               <ListItemButton component={RouterLink} to="/browse" onClick={() => setDrawerOpen(false)}>
                   <ListItemIcon><StorefrontIcon /></ListItemIcon>
                   <ListItemText primary="Browse Resources" />
               </ListItemButton>

               <ListItemButton component={RouterLink} to="/about" onClick={() => setDrawerOpen(false)}>
                   <ListItemIcon><InfoOutlinedIcon /></ListItemIcon>
                   <ListItemText primary="About Us" />
               </ListItemButton>

               {isLoggedIn && (
                   <ListItemButton component={RouterLink} to={dashboardRoute} onClick={() => setDrawerOpen(false)}>
                       <ListItemIcon><DashboardIcon /></ListItemIcon>
                       <ListItemText primary="Dashboard" />
                   </ListItemButton>
               )}
            </List>
          </Box>
        </Drawer>

        {/* --- MOBILE SEARCH OVERLAY (RESTORED FULL LOGIC) --- */}
        <Drawer 
            anchor="top" 
            open={searchOpen} 
            onClose={() => setSearchOpen(false)}
            PaperProps={{ sx: { height: '100%', width: '100%', borderRadius: 0 } }}
            sx={{ zIndex: 1300 }}
        >
          <Box sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                    <Autocomplete
                        freeSolo
                        disableClearable
                        options={suggestions}
                        getOptionLabel={(option: any) => (typeof option === 'string' ? option : option.title)}
                        onInputChange={(_, newValue) => setSearchTerm(newValue)}
                        onChange={(_, newValue: any) => {
                            if (newValue?.id) { navigate(`/resource/${newValue.id}`); setSearchOpen(false); }
                            else { handleSearchNavigation(newValue); }
                        }}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                                <SearchIcon sx={{ mr: 2, fontSize: 20, color: '#6a6f73' }} />
                                <Typography sx={{ fontWeight: 600 }}>{option.title}</Typography>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                autoFocus
                                placeholder="What do you want to learn?"
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: '8px', bgcolor: '#f3f4f6', height: '48px',
                                        '& fieldset': { border: 'none' },
                                        '&.Mui-focused': { bgcolor: '#fff', borderColor: '#0056d2', border: '2px solid #0056d2' }
                                    } 
                                }}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#1c1d1f' }} /></InputAdornment>),
                                }}
                            />
                        )}
                    />
                </Box>
                <Typography onClick={() => setSearchOpen(false)} sx={{ color: '#0056d2', fontWeight: 600, cursor: 'pointer' }}>Close</Typography>
            </Stack>
          </Box>
        </Drawer>

      </AppBar>
      <Toolbar sx={{ minHeight: 70 }} />
    </Box>
  );
};

export default Header;