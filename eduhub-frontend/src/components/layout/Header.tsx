import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Header: React.FC = () => {
  const theme = useTheme();

  return (
    <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
            fontWeight: 700,
            fontSize: '1.5rem'
          }}
        >
          EduHub
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={RouterLink}
            to="/login"
            color="inherit"
            sx={{ fontWeight: 500 }}
          >
            Login
          </Button>
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            color="primary"
            sx={{ fontWeight: 500 }}
          >
            Sign Up
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 