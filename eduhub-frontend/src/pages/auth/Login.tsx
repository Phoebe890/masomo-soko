import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Link, useTheme, 
  InputAdornment, IconButton, Divider, Stack, Checkbox, 
  FormControlLabel
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';

// GOOGLE IMPORT
import { useGoogleLogin } from '@react-oauth/google';

// IMPORT API INSTANCE (The fix)
import { api } from '@/api/axios';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // --- GOOGLE LOGIN HANDLER ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      startLoading();
      setMessage(null);
      try {
        // USE API instead of fetch
        const res = await api.post('/api/auth/google', { 
            token: tokenResponse.access_token 
        });

        const data = res.data;
        localStorage.setItem('email', data.email);
        localStorage.setItem('role', data.role);
        
        setMessage('Google Login Successful! Redirecting...');
        setTimeout(() => {
             const userRole = data.role?.toUpperCase();
             if (userRole === 'TEACHER') navigate('/dashboard/teacher');
             else if (userRole === 'STUDENT') navigate('/dashboard/student');
             else if (userRole === 'ADMIN') navigate('/admin/dashboard');
             else navigate('/');
        }, 800);

      } catch (err: any) {
        console.error(err);
        setMessage('Google authentication failed. ' + (err.response?.data || ''));
      } finally {
        stopLoading();
      }
    },
    onError: () => setMessage('Google Login Failed'),
  });

  // --- NORMAL FORM SUBMIT ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startLoading();

    try {
      // USE API instead of fetch
      const response = await api.post('/api/auth/login', formData);

      const data = response.data;
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role);
      
      setMessage('Welcome back! Redirecting...');
      setTimeout(() => {
        const userRole = data.role?.toUpperCase();
        if (userRole === 'TEACHER') navigate('/dashboard/teacher');
        else if (userRole === 'STUDENT') navigate('/dashboard/student');
        else if (userRole === 'ADMIN') navigate('/admin/dashboard');
        else navigate('/');
      }, 800);

    } catch (error: any) {
      const errorText = error.response?.data || 'Invalid email or password.';
      setMessage(typeof errorText === 'string' ? errorText : 'Login Failed');
    } finally {
      stopLoading();
    }
  };

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      
      {/* LEFT SIDE */}
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 3, sm: 6, md: 8 }, bgcolor: '#fff' }}>
        <Box maxWidth="sm" sx={{ mx: 'auto', width: '100%' }}>
          
          <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/" sx={{ mb: 4, color: 'text.secondary', pl: 0 }}>Back to Home</Button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d' }}>Welcome back</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Please enter your details to sign in.</Typography>

            {/* --- UPDATED GOOGLE BUTTON --- */}
            <Button
              fullWidth
              variant="outlined"
              onClick={() => googleLogin()}
              startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />}
              sx={{ py: 1.5, mb: 3, color: '#3c4043', bgcolor: '#fff', borderColor: '#dadce0', textTransform: 'none', fontWeight: 500, fontSize: '1rem', borderRadius: '8px', boxShadow: '0 1px 2px 0 rgba(60,64,67,0.30), 0 1px 3px 1px rgba(60,64,67,0.15)', transition: 'all 0.2s ease-in-out', '&:hover': { bgcolor: '#f7f8f8', borderColor: '#dadce0', boxShadow: '0 1px 3px 0 rgba(60,64,67,0.30), 0 4px 8px 3px rgba(60,64,67,0.15)' } }}
            >
              Sign in with Google
            </Button>

            <Divider sx={{ mb: 3 }}><Typography variant="caption" color="text.secondary">OR WITH EMAIL</Typography></Divider>

            {/* FORM */}
            <Box component="form" onSubmit={handleSubmit}>
              {message && (
                <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: message.includes('Welcome') || message.includes('Success') ? 'success.light' : 'error.light', color: message.includes('Welcome') || message.includes('Success') ? 'success.contrastText' : 'error.contrastText' }}>
                  <Typography variant="body2" fontWeight={500}>{message}</Typography>
                </Box>
              )}

              <Stack spacing={2.5}>
                <TextField fullWidth label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                
                <Box>
                  <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2" color="text.secondary">Remember me</Typography>} />
                    <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary" underline="hover" fontWeight={600}>Forgot password?</Link>
                  </Box>
                </Box>
              </Stack>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.8, borderRadius: 2, fontSize: '1.1rem', fontWeight: 700, textTransform: 'none', boxShadow: 'none', bgcolor: theme.palette.primary.main }}>
                Sign In
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account yet? <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
                </Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Grid>

      {/* RIGHT SIDE (Image) */}
      <Grid item xs={false} md={6} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative', backgroundImage: 'url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)' }} />
      </Grid>
    </Grid>
  );
};

export default Login;