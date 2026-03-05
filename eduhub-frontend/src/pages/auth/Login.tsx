import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Link, useTheme, 
  InputAdornment, IconButton, Divider, Stack, Checkbox, 
  FormControlLabel, Container, Snackbar, Alert
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '@/api/axios';
import logoIcon from '@/assets/logo-icon.svg'; 
// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AppNotification from '@/components/AppNotification';

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAuthSuccess = (data: any) => {
  const authToken = data.token || data.accessToken;
  if (!authToken) return;

  localStorage.setItem('token', authToken);
  localStorage.setItem('email', data.email);
  const userRole = data.role?.toUpperCase();
  localStorage.setItem('role', userRole);
  const isComplete = userRole === 'TEACHER' ? (data.onboardingComplete === true) : true;
  localStorage.setItem('onboardingComplete', isComplete ? 'true' : 'false');

  api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

 
  setToast({ open: true, message: "Login Successful!", severity: 'success' });

 
  setTimeout(() => {
    if (userRole === 'TEACHER' && !isComplete) {
      navigate('/dashboard/teacher/onboarding', { replace: true });
    } else if (userRole === 'ADMIN') {
      navigate('/admin/dashboard', { replace: true });
    } else if (userRole === 'TEACHER') {
      navigate('/dashboard/teacher', { replace: true });
    } else {
      navigate('/dashboard/student', { replace: true });
    }
  }, 1000);
};
 const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      startLoading();
      try {
        const res = await api.post('/api/auth/google', { token: tokenResponse.access_token });
        handleAuthSuccess(res.data);
      } catch (err: any) {
       
        if (err.response?.status === 404) {
        setToast({ 
          open: true, 
          message: "Account not found. Please sign up first!", 
          severity: 'error' 
        });
      
      } else {
        setToast({ open: true, message: "Google Login failed.", severity: 'error' });
      }
    } finally {
      stopLoading();
    }
  },
});

 const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startLoading();
    try {
      const response = await api.post('/api/auth/login', formData);
      handleAuthSuccess(response.data);
    } catch (error: any) {
      
      
      const serverMessage = error.response?.data;
      const displayMessage = typeof serverMessage === 'string' 
        ? serverMessage 
        : "Invalid email or password.";

      setToast({ 
        open: true, 
        message: displayMessage, 
        severity: 'error' 
      });
    } finally {
      stopLoading();
    }
  };

  return (
    <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#fff', 
        display: 'flex', 
        flexDirection: 'column' 
    }}>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Container maxWidth="lg">
          <Grid 
            container 
            alignItems={{ xs: 'flex-start', md: 'center' }} 
            sx={{ pt: { xs: 5, md: 0 }, pb: { xs: 5, md: 0 } }} 
          >
            {/* LEFT SIDE: FORM */}
  <Grid item xs={12} md={6}>
  <Box sx={{ maxWidth: '400px', mx: 'auto' }}>
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box component={RouterLink} to="/" sx={{ display: 'flex', justifyContent: 'center', mb: 1, textDecoration: 'none' }}>
        <Box component="img" src={logoIcon} alt="Logo" sx={{ height: { xs: 50, md: 65 }, width: 'auto' }} />
      </Box>

      <Typography variant="h4" fontWeight={800} sx={{ color: '#1a1b1d', fontSize: { xs: '1.8rem', md: '2.4rem' }, textAlign: {xs: 'center', md: 'left'}, mb: 0.5 }}>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: {xs: 'center', md: 'left'} }}>
        Sign in to continue your journey.
      </Typography>
      
      <Button 
        fullWidth variant="outlined" onClick={() => googleLogin()} 
        startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: 18 }} />} 
        sx={{ py: 1.2, mb: 2, borderRadius: '8px', fontWeight: 600, textTransform: 'none' }}
      >
        Sign in with Google
      </Button>
      
      <Divider sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>OR EMAIL</Typography>
      </Divider>
      
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField size="small" fullWidth label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          <Box>
            <TextField 
              size="small"
              fullWidth label="Password" type={showPassword ? 'text' : 'password'} 
              value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              required 
              InputProps={{ 
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ) 
              }} 
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
              <FormControlLabel 
                control={<Checkbox size="small" />} 
                label={<Typography variant="caption" color="text.secondary">Remember me</Typography>} 
              />
              <Link component={RouterLink} to="/forgot-password" variant="caption" color="primary" sx={{ fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
            </Box>
          </Box>
        </Stack>
        
        <Button 
          type="submit" fullWidth variant="contained" 
          sx={{ mt: 2, py: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}
        >
          Sign In
        </Button>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            New here? <Link component={RouterLink} to="/register" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
          </Typography>
        </Box>
      </Box>
    </motion.div>
  </Box>
</Grid>

            {/* RIGHT SIDE: ILLUSTRATION */}
            <Grid item xs={false} md={6} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
              <Box 
                component="img"
                src="https://plus.unsplash.com/premium_vector-1682301063286-76f90a3d3219?q=80&w=829&auto=format&fit=crop"
                sx={{ 
                  width: '100%', 
                  maxWidth: '550px', 
                  height: 'auto',
                  filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.05))' 
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

     {/* NOTIFICATION */}
      <AppNotification 
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
};
   

export default Login;