import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Link, useTheme, 
  InputAdornment, IconButton, Divider, Stack, FormControlLabel, Checkbox,
  Container, Snackbar, Alert
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '@/api/axios'; 
import logoIcon from '@/assets/logo-icon.svg';
// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const Register: React.FC = () => {
  const theme = useTheme();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const initialRole = params.get('role') === 'teacher' ? 'teacher' : 'student';
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: initialRole,
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Local Notification State (eCitizen Style)
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success'
  });

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleAuthSuccess = (data: any) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('email', data.email);
    localStorage.setItem('role', data.role);
    localStorage.setItem('name', data.name);
    if(data.photoUrl) localStorage.setItem('photoUrl', data.photoUrl);

    const userRole = data.role?.toUpperCase();

  if (userRole === 'TEACHER') {
      // Force them to be a 'STUDENT' in localStorage so the TeacherGuard kicks them out of the dashboard
      localStorage.setItem('role', 'STUDENT'); 
      setToast({ open: true, message: "Account created! Let's set up your teacher profile.", severity: 'success' });
      setTimeout(() => navigate('/dashboard/teacher/onboarding'), 1500);
  } else {
      localStorage.setItem('role', data.role);
      navigate('/dashboard/student');
  }
};
  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      startLoading();
      try {
        const res = await api.post('/api/auth/google', { 
            token: tokenResponse.access_token,
            role: formData.role.toUpperCase() 
        });
        handleAuthSuccess(res.data);
      } catch (err: any) {
        setToast({ open: true, message: "Google authentication failed.", severity: 'error' });
      } finally {
        stopLoading();
      }
    },
    onError: () => setToast({ open: true, message: "Google Signup Failed", severity: 'error' }),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) { setToast({ open: true, message: 'Please enter a valid email.', severity: 'error' }); return; }
    if (formData.password !== formData.confirmPassword) { setToast({ open: true, message: 'Passwords do not match.', severity: 'error' }); return; }
    if (!agreedToTerms) { setToast({ open: true, message: 'You must agree to the Terms of Service.', severity: 'error' }); return; }

    startLoading();
    try {
      await api.post('/api/auth/signup', {
        name: formData.name, email: formData.email, password: formData.password, role: formData.role
      });
      setToast({ open: true, message: 'Account created! Redirecting to login...', severity: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setToast({ open: true, message: error.response?.data || 'Registration failed.', severity: 'error' });
    } finally {
      stopLoading();
    }
  };

  const switchRole = () => {
    const newRole = formData.role === 'teacher' ? 'student' : 'teacher';
    setFormData({ ...formData, role: newRole });
    navigate(`/register?role=${newRole}`, { replace: true });
  };

  const illustration = formData.role === 'teacher' 
    ? 'https://plus.unsplash.com/premium_vector-1682301063286-76f90a3d3219?q=80&w=829&auto=format&fit=crop' 
    : 'https://plus.unsplash.com/premium_vector-1721133314546-5e26b47c0338?q=80&w=1000&auto=format&fit=crop';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: { xs: 'flex-start', md: 'center' } }}>
        <Container maxWidth="lg">
          <Grid 
            container 
            alignItems={{ xs: 'flex-start', md: 'center' }} 
            sx={{ pt: { xs: 5, md: 0 }, pb: { xs: 5, md: 0 } }}
          >
            {/* LEFT SIDE: FORM */}
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: '440px', mx: 'auto' }}>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={formData.role} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }} 
                    transition={{ duration: 0.3 }}
                  >
                   {/* --- CHANGE 2: ADD THE LOGO ICON HERE --- */}
        <Box 
          component={RouterLink} 
          to="/"
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', // Centers logo horizontally
            mb: { xs: 3, md: 1 },    // Small gap on desktop, larger on mobile
            textDecoration: 'none'
          }}
        >
          <Box 
            component="img"
            src={logoIcon}
            alt="Masomo Soko"
            sx={{ 
              height: { xs: 50, md: 70 }, 
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </Box>
  
                    <Typography 
                      variant="h3" 
                      fontWeight={800} 
                      gutterBottom 
                      sx={{ color: '#1a1b1d', fontSize: { xs: '2.2rem', md: '2.5rem' }, lineHeight: 1.1 ,textAlign: 'center'}}
                    >
                      Sign up as a {formData.role === 'teacher' ? 'Teacher' : 'Student'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1rem', textAlign: 'center' }}>
                      {formData.role === 'teacher' 
                        ? 'Start your journey to financial freedom.' 
                        : 'Join thousands of students mastering their coursework.'}
                    </Typography>
                  </motion.div>
                </AnimatePresence>

                {/* RESTORED ORIGINAL BLUE BORDER GOOGLE BUTTON */}
                <Button 
                  fullWidth 
                  variant="outlined" 
                  onClick={() => googleSignup()} 
                  startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />} 
                  sx={{ 
                    py: 1.5, 
                    mb: 3, 
                    borderRadius: '8px',
                    borderColor: theme.palette.primary.main, // Restored Blue Border
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                        borderColor: theme.palette.primary.dark,
                        bgcolor: 'rgba(47, 107, 255, 0.04)'
                    }
                  }}
                >
                  Sign up with Google
                </Button>

                <Divider sx={{ mb: 3 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>OR WITH EMAIL</Typography>
                </Divider>

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={2}>
                    <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    <TextField fullWidth label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                    <TextField 
                      fullWidth 
                      label="Password" 
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
                        ) 
                      }} 
                    />
                    <TextField fullWidth label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                  </Stack>

                  <Box sx={{ mt: 1.5 }}>
                    <FormControlLabel 
                      control={<Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} color="primary" size="small" />} 
                      label={<Typography variant="body2" color="text.secondary">I agree to the Terms and Privacy Policy.</Typography>} 
                    />
                  </Box>

                  <Button 
                    type="submit" 
                    fullWidth 
                    variant="contained" 
                    sx={{ 
                      mt: 3, 
                      py: 2, 
                      borderRadius: '8px', 
                      fontWeight: 700, 
                      bgcolor: theme.palette.primary.main,
                      textTransform: 'none',
                      fontSize: '1rem',
                      boxShadow: '0 4px 12px rgba(47, 107, 255, 0.25)'
                    }}
                  >
                    Create Account
                  </Button>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Looking to {formData.role === 'teacher' ? 'buy' : 'sell'}? {' '}
                      <Link 
                        component="button" 
                        type="button" 
                        onClick={switchRole} 
                        sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                      >
                        Sign up as a {formData.role === 'teacher' ? 'Student' : 'Teacher'}
                      </Link>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Already have an account? <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>

            {/* RIGHT SIDE: ILLUSTRATION */}
            <Grid item xs={false} md={6} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
              <motion.div
                key={illustration}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box 
                  component="img"
                  src={"https://plus.unsplash.com/premium_vector-1682301063286-76f90a3d3219?q=80&w=829&auto=format&fit=crop"}
                  sx={{ 
                    width: '100%', 
                    maxWidth: '550px', 
                    height: 'auto',
                    filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.05))' 
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ECITIZEN STYLE NOTIFICATION */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={5000} 
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setToast({ ...toast, open: false })} 
          severity={toast.severity}
          sx={{ 
            width: '100%', 
            minWidth: '320px',
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

export default Register;