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
import AppNotification from '@/components/AppNotification';

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
     
      localStorage.setItem('role', 'STUDENT'); 
      setToast({ open: true, message: "Account created! Let's set up your teacher profile.", severity: 'success' });
      setTimeout(() => navigate('/dashboard/teacher/onboarding'), 1500);
  } else {
      localStorage.setItem('role', data.role);
      navigate('/dashboard/student');
  }
};
 const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse: any) => { 
      startLoading();
      try { 
        const res = await api.post('/api/auth/google-signup', { 
          token: tokenResponse.access_token,
          role: formData.role.toUpperCase() 
        });
        handleAuthSuccess(res.data);
      } catch (err: any) { 
        const errorMsg = err.response?.data || "Google authentication failed.";
        setToast({ open: true, message: errorMsg, severity: 'error' });
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
        name: formData.name, email: formData.email, password: formData.password, role: formData.role.toUpperCase()
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
  <Box sx={{ maxWidth: '420px', mx: 'auto' }}>
    <AnimatePresence mode="wait">
      <motion.div 
        key={formData.role} 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -10 }} 
        transition={{ duration: 0.3 }}
      >
        <Box component={RouterLink} to="/" sx={{ display: 'flex', justifyContent: 'center', mb: 1.5, textDecoration: 'none' }}>
          <Box component="img" src={logoIcon} alt="Logo" sx={{ height: { xs: 45, md: 60 }, width: 'auto' }} />
        </Box>

        <Typography 
          variant="h4" 
          fontWeight={800} 
          sx={{ color: '#1a1b1d', fontSize: { xs: '1.6rem', md: '2.1rem' }, textAlign: 'center', mb: 0.5 }}
        >
          Sign up as a {formData.role === 'teacher' ? 'Teacher' : 'Student'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'center', fontSize: '0.9rem' }}>
          {formData.role === 'teacher' ? 'Start selling today.' : 'Join to start learning.'}
        </Typography>
      </motion.div>
    </AnimatePresence>

    <Button 
      fullWidth 
      variant="outlined" 
      onClick={() => googleSignup()} 
      startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{ width: 18 }} />} 
      sx={{ py: 1, mb: 2, borderRadius: '8px', fontWeight: 600, textTransform: 'none' }}
    >
      Sign up with Google
    </Button>

    <Divider sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>OR EMAIL</Typography>
    </Divider>

    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={1.5}> {/* Tightened spacing */}
        <TextField size="small" fullWidth label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        <TextField size="small" fullWidth label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        <TextField 
          size="small"
          fullWidth 
          label="Password" 
          type={showPassword ? 'text' : 'password'} 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
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
        <TextField size="small" fullWidth label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
      </Stack>

      <Box sx={{ mt: 1 }}>
        <FormControlLabel 
          control={<Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} size="small" />} 
          label={<Typography variant="caption" color="text.secondary">I agree to the Terms and Privacy Policy.</Typography>} 
        />
      </Box>

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2, py: 1.5, borderRadius: '8px', fontWeight: 700, textTransform: 'none' }}>
        Create Account
      </Button>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
          Looking to {formData.role === 'teacher' ? 'buy' : 'sell'}? {' '}
          <Link component="button" type="button" onClick={switchRole} sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
            Sign up as a {formData.role === 'teacher' ? 'Student' : 'Teacher'}
          </Link>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
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

     {/*  NOTIFICATION */}
      <AppNotification 
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast({ ...toast, open: false })}
      />
    </Box>
  );
};

export default Register;