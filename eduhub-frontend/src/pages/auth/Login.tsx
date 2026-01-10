import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Link, useTheme, 
  InputAdornment, IconButton, Divider, Stack, Checkbox, 
  FormControlLabel
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useGoogleLogin } from '@react-oauth/google';
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

  // --- LOGIC FIX: Inject Token & Check Onboarding ---
  const handleAuthSuccess = (data: any) => {
    const authToken = data.token || data.accessToken;
    if (!authToken) { setMessage("Login failed: No token received."); return; }

    localStorage.setItem('token', authToken);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    if (data.name) localStorage.setItem('name', data.name);
    if (data.photoUrl) localStorage.setItem('photoUrl', data.photoUrl);

    // Prevent 401 Bounce Back
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    setTimeout(() => {
         const userRole = data.role?.toUpperCase();
         if (userRole === 'TEACHER') {
             // Check flag from backend
             if (data.onboardingComplete === true) navigate('/dashboard/teacher');
             else navigate('/dashboard/teacher/onboarding');
         }
         else if (userRole === 'STUDENT') navigate('/dashboard/student');
         else if (userRole === 'ADMIN') navigate('/admin/dashboard');
         else navigate('/');
    }, 500);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      startLoading();
      setMessage(null);
      try {
        const res = await api.post('/api/auth/google', { token: tokenResponse.access_token });
        setMessage('Google Login Successful! Redirecting...');
        handleAuthSuccess(res.data);
      } catch (err: any) {
        setMessage('Google authentication failed. ' + (err.response?.data || ''));
      } finally {
        stopLoading();
      }
    },
    onError: () => setMessage('Google Login Failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startLoading();
    try {
      const response = await api.post('/api/auth/login', formData);
      setMessage('Welcome back! Redirecting...');
      handleAuthSuccess(response.data);
    } catch (error: any) {
      if (error.response && error.response.data) {
        // Handle "Use Google Login" error from backend
        setMessage(typeof error.response.data === 'string' ? error.response.data : 'Invalid email or password.');
      } else {
        setMessage('Login failed. Please check your connection.');
      }
    } finally {
      stopLoading();
    }
  };

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 3, sm: 6, md: 8 }, bgcolor: '#fff' }}>
        <Box maxWidth="sm" sx={{ mx: 'auto', width: '100%' }}>
          <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/" sx={{ mb: 4, color: 'text.secondary', pl: 0 }}>Back to Home</Button>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d' }}>Welcome back</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>Please enter your details to sign in.</Typography>
            
            <Button fullWidth variant="outlined" onClick={() => googleLogin()} startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />} sx={{ py: 1.5, mb: 3, color: '#3c4043', bgcolor: '#fff', borderColor: '#dadce0', textTransform: 'none', fontWeight: 500, borderRadius: '8px' }}>Sign in with Google</Button>
            
            <Divider sx={{ mb: 3 }}><Typography variant="caption" color="text.secondary">OR WITH EMAIL</Typography></Divider>
            
            <Box component="form" onSubmit={handleSubmit}>
              {message && (
                <Box sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: message.includes('Welcome') || message.includes('Successful') ? 'success.light' : 'error.light', color: 'white' }}>
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
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.8, borderRadius: 2, fontWeight: 700, bgcolor: theme.palette.primary.main }}>Sign In</Button>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">Don't have an account yet? <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link></Typography>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </Grid>
      <Grid item xs={false} md={6} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative', backgroundImage: 'url(https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1650&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)' }} />
      </Grid>
    </Grid>
  );
};

export default Login;