import React, { useState } from 'react';
import { Box, Container, Typography, TextField, Button, Paper, Link, useTheme } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setMessage('Login successful! Redirecting to your dashboard...');
        localStorage.setItem('email', data.email);
        localStorage.setItem('role', data.role);
        setTimeout(() => {
          const userRole = data.role.toLowerCase();
          if (userRole === 'teacher') {
            navigate('/dashboard/teacher');
          } else if (userRole === 'student') {
            navigate('/dashboard/student');
          } else {
            navigate('/');
          }
        }, 1000);
      } else {
        const data = await response.text();
        setMessage(data || 'Login failed.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(45deg, ${theme.palette.primary.light} 30%, ${theme.palette.primary.main} 90%)`,
        py: 4
      }}
    >
      <Container maxWidth="xs" sx={{ minHeight: { xs: '100vh', md: '80vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 6 } }}>
        <Box sx={{ width: '100%', mt: { xs: 2, md: 8 } }}>
          <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Login
          </Typography>
          <Typography 
            variant="body1" 
            align="center" 
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            Sign in to continue your learning journey
          </Typography>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              sx={{ mt: 2 }}
            >
              {message && <Typography color="success.main" align="center">{message}</Typography>}
              <TextField
                fullWidth
                label="Email"
                type="email"
                margin="normal"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  mb: { xs: 2, md: 3 }
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                margin="normal"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  mb: { xs: 2, md: 3 }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 3,
                  '&:hover': {
                    boxShadow: 6,
                  },
                  minHeight: 48,
                  fontSize: { xs: '1rem', md: '1.1rem' }
                }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link 
                    component={RouterLink} 
                    to="/register"
                    sx={{ 
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;