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

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Login: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  
  // Local Notification State
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleAuthSuccess = (data: any) => {
    const authToken = data.token || data.accessToken;
    if (!authToken) { 
        setToast({ open: true, message: "Login failed: No token received.", severity: 'error' });
        return; 
    }

    localStorage.setItem('token', authToken);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    setToast({ open: true, message: "Login Successful! Accessing your account...", severity: 'success' });

    setTimeout(() => {
         const userRole = data.role?.toUpperCase();
         if (userRole === 'TEACHER') {
             if (data.onboardingComplete === true) navigate('/dashboard/teacher');
             else navigate('/dashboard/teacher/onboarding');
         }
         else if (userRole === 'STUDENT') navigate('/dashboard/student');
         else if (userRole === 'ADMIN') navigate('/admin/dashboard');
         else navigate('/');
    }, 1000);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      startLoading();
      try {
        const res = await api.post('/api/auth/google', { token: tokenResponse.access_token });
        handleAuthSuccess(res.data);
      } catch (err: any) {
        setToast({ open: true, message: "Google Login failed.", severity: 'error' });
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
      setToast({ open: true, message: "Invalid email or password.", severity: 'error' });
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
              <Box sx={{ maxWidth: '420px', mx: { xs: 'auto', md: '0' } }}>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d', fontSize: { xs: '2.2rem', md: '2.8rem' }, lineHeight: 1.1 }}>
                    Welcome back
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.05rem' }}>
                    Sign in to continue your learning journey.
                  </Typography>
                  
                  <Button 
                    fullWidth 
                    variant="outlined" 
                    onClick={() => googleLogin()} 
                    startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />} 
                    sx={{ py: 1.5, mb: 3, color: '#3c4043', borderColor: '#dadce0', textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                  >
                    Sign in with Google
                  </Button>
                  
                  <Divider sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>OR EMAIL</Typography>
                  </Divider>
                  
                  <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2.5}>
                      <TextField 
                        fullWidth 
                        label="Email Address" 
                        type="email" 
                        variant="outlined"
                        value={formData.email} 
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                        required 
                      />
                      <Box>
                        <TextField 
                          fullWidth 
                          label="Password" 
                          type={showPassword ? 'text' : 'password'} 
                          variant="outlined"
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
                            ) 
                          }} 
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2" color="text.secondary">Remember me</Typography>} />
                          <Link component={RouterLink} to="/forgot-password" variant="body2" color="primary" underline="hover" fontWeight={600}>Forgot password?</Link>
                        </Box>
                      </Box>
                    </Stack>
                    
                    <Button 
                      type="submit" 
                      fullWidth 
                      variant="contained" 
                      sx={{ 
                        mt: 4, 
                        py: 2, 
                        borderRadius: '8px', 
                        fontWeight: 700, 
                        bgcolor: theme.palette.primary.main, 
                        textTransform: 'none', 
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(47, 107, 255, 0.25)',
                        '&:hover': { bgcolor: theme.palette.primary.dark }
                      }}
                    >
                      Sign In
                    </Button>
                    
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
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

      {/* ECITIZEN STYLE NOTIFICATION */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity}
          sx={{ 
            width: '100%', 
            minWidth: '300px',
            bgcolor: '#fff', 
            color: '#1a1b1d', 
            fontWeight: 700,
            borderRadius: '4px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            borderLeft: `6px solid ${toast.severity === 'success' ? '#43B02A' : '#d32f2f'}`,
            '& .MuiAlert-icon': { 
                color: toast.severity === 'success' ? '#43B02A' : '#d32f2f' 
            }
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;