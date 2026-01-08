import React, { useState } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, Link, useTheme, 
  InputAdornment, IconButton, Divider, Stack, FormControlLabel, Checkbox 
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../../context/LoadingContext';
import { useGoogleLogin } from '@react-oauth/google';
import { api } from '@/api/axios'; 

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
  const [message, setMessage] = useState<string | null>(null);

  const googleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      startLoading();
      setMessage(null);
      try {
        const res = await api.post('/api/auth/google', { 
            token: tokenResponse.access_token,
            role: formData.role.toUpperCase() 
        });

        const data = res.data;
        localStorage.setItem('email', data.email);
        localStorage.setItem('role', data.role);
        
        setMessage('Google Signup Successful! Redirecting...');
        setTimeout(() => {
            const userRole = data.role?.toUpperCase();
            if (userRole === 'TEACHER') navigate('/dashboard/teacher/onboarding');
            else if (userRole === 'STUDENT') navigate('/dashboard/student');
            else navigate('/');
        }, 1000);
      } catch (err: any) {
        setMessage('Google authentication failed. ' + (err.response?.data || ''));
      } finally {
        stopLoading();
      }
    },
    onError: () => setMessage('Google Signup Failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setMessage('You must agree to the Terms of Service.');
      return;
    }

    startLoading();
    try {
      await api.post('/api/auth/signup', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });

      setMessage('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: any) {
      setMessage(error.response?.data || 'Registration failed.');
    } finally {
      stopLoading();
    }
  };

  const switchRole = () => {
    const newRole = formData.role === 'teacher' ? 'student' : 'teacher';
    setFormData({ ...formData, role: newRole });
    navigate(`/register?role=${newRole}`, { replace: true });
  };

  const bgImage = formData.role === 'teacher' 
    ? 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1650&q=80' 
    : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1650&q=80';

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 3, sm: 6, md: 8 }, bgcolor: '#fff' }}>
        <Box maxWidth="sm" sx={{ mx: 'auto', width: '100%' }}>
          <Button startIcon={<ArrowBackIcon />} component={RouterLink} to="/" sx={{ mb: 4, color: 'text.secondary', pl: 0 }}>Back to Home</Button>
          <AnimatePresence mode="wait">
            <motion.div key={formData.role} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d' }}>Sign up as a {formData.role === 'teacher' ? 'Teacher' : 'Student'}</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>{formData.role === 'teacher' ? 'Start your journey to financial freedom.' : 'Join thousands of students mastering their coursework.'}</Typography>
            </motion.div>
          </AnimatePresence>
          <Button fullWidth variant="outlined" onClick={() => googleSignup()} startIcon={<img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: 20, height: 20 }} />} sx={{ py: 1.5, mb: 3, borderRadius: '8px' }}>Sign up with Google</Button>
          <Divider sx={{ mb: 3 }}><Typography variant="caption" color="text.secondary">OR WITH EMAIL</Typography></Divider>
          <Box component="form" onSubmit={handleSubmit}>
            {message && (
              <Box sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: message.includes('created') ? 'success.light' : 'error.light', color: 'white' }}>
                <Typography variant="body2" fontWeight={500}>{message}</Typography>
              </Box>
            )}
            <Stack spacing={2.5}>
              <TextField fullWidth label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <TextField fullWidth label="Email Address" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <TextField fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }} />
              <TextField fullWidth label="Confirm Password" type="password" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
            </Stack>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel control={<Checkbox checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} color="primary" />} label={<Typography variant="body2" color="text.secondary">I agree to the Terms and Privacy Policy.</Typography>} />
            </Box>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, py: 1.8, borderRadius: 2, fontWeight: 700, bgcolor: theme.palette.primary.main }}>Create Account</Button>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Looking to {formData.role === 'teacher' ? 'buy' : 'sell'}? <Link component="button" type="button" onClick={switchRole} sx={{ color: 'primary.main', fontWeight: 600 }}>Sign up as a {formData.role === 'teacher' ? 'Student' : 'Teacher'}</Link></Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
      <Grid item xs={false} md={6} sx={{ display: { xs: 'none', md: 'block' }, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      </Grid>
    </Grid>
  );
};

export default Register;