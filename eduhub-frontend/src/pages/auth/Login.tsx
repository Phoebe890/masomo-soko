import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Link, 
  useTheme, 
  InputAdornment, 
  IconButton, 
  Divider,
  Stack,
  Checkbox,
  FormControlLabel,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// 1. IMPORT LOADING HOOK
import { useLoading } from '../../context/LoadingContext';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  // Check media query to hide image on mobile
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  // 2. GET LOADING FUNCTIONS
  const { startLoading, stopLoading } = useLoading();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    // 3. START LOADING
    startLoading();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store user details
        localStorage.setItem('email', data.email);
        localStorage.setItem('role', data.role);
        
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }

        setMessage('Welcome back! Redirecting...');
        
        // Delay slightly for animation
        setTimeout(() => {
          const userRole = data.role?.toUpperCase();
          
          if (userRole === 'TEACHER') {
            navigate('/dashboard/teacher');
          } else if (userRole === 'STUDENT') {
            navigate('/dashboard/student');
          } else if (userRole === 'ADMIN' || userRole === 'ROLE_ADMIN') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }, 800);
      } else {
        const errorText = await response.text();
        setMessage(errorText || 'Invalid email or password.');
      }
    } catch (error) {
      setMessage('Network error. Please try again later.');
    } finally {
      // 4. STOP LOADING (Always runs)
      stopLoading();
    }
  };

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      
      {/* LEFT SIDE: FORM */}
      <Grid 
        item 
        xs={12} 
        md={6} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          p: { xs: 3, sm: 6, md: 8 }, 
          bgcolor: '#fff'
        }}
      >
        <Box maxWidth="sm" sx={{ mx: 'auto', width: '100%' }}>
          
          <Button 
            startIcon={<ArrowBackIcon />} 
            component={RouterLink} 
            to="/" 
            sx={{ mb: 4, color: 'text.secondary', pl: 0, '&:hover': { bgcolor: 'transparent', color: 'primary.main' } }}
          >
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Welcome back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Please enter your details to sign in.
            </Typography>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ 
                py: 1.5, mb: 3, color: '#555', borderColor: '#ddd', textTransform: 'none', fontWeight: 600,
                '&:hover': { bgcolor: '#f5f5f5', borderColor: '#ccc' }
              }}
              onClick={() => setMessage('Social login coming soon!')}
            >
              Sign in with Google
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">OR WITH EMAIL</Typography>
            </Divider>

            <Box component="form" onSubmit={handleSubmit}>
              {message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Box sx={{ 
                    p: 2, mb: 3, borderRadius: 2,
                    bgcolor: message.includes('Welcome') ? 'success.light' : 'error.light', 
                    color: message.includes('Welcome') ? 'success.contrastText' : 'error.contrastText',
                  }}>
                    <Typography variant="body2" fontWeight={500}>{message}</Typography>
                  </Box>
                </motion.div>
              )}

              <Stack spacing={2.5}>
                <TextField
                  fullWidth label="Email Address" type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                
                <Box>
                  <TextField
                    fullWidth label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          value={rememberMe} 
                          onChange={(e) => setRememberMe(e.target.checked)} 
                          color="primary" 
                          size="small"
                        />
                      }
                      label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
                    />
                    <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary" underline="hover" fontWeight={600}>
                      Forgot password?
                    </Link>
                  </Box>
                </Box>
              </Stack>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3, py: 1.8, borderRadius: 2, fontSize: '1.1rem', fontWeight: 700, textTransform: 'none', boxShadow: 'none',
                  bgcolor: theme.palette.primary.main,
                  '&:hover': { bgcolor: theme.palette.primary.dark, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
                }}
              >
                Sign In
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account yet?{' '}
                  <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Grid>

      {/* RIGHT SIDE: IMAGE */}
      <Grid 
        item 
        xs={false} 
        md={6} 
        sx={{ 
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          backgroundImage: 'url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 8, color: 'white'
          }}
        >
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
              Education is the passport to the future.
            </Typography>
            <Typography variant="h6" fontWeight={400} sx={{ opacity: 0.9 }}>
              Pick up exactly where you left off.
            </Typography>
          </motion.div>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Login;