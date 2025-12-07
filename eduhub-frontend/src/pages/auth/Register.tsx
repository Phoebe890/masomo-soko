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
  useMediaQuery,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Register: React.FC = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const navigate = useNavigate();

  const initialRole = params.get('role') === 'teacher' ? 'teacher' : 'student';
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: initialRole,
  });

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // 1. Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setMessage('You must agree to the Terms of Service to continue.');
      return;
    }

    setLoading(true);

    try {
      // 2. API Call
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role
        })
      });

      if (response.ok) {
        // 3. Store Session Data
        localStorage.setItem('email', formData.email.trim().toLowerCase());
        localStorage.setItem('role', formData.role.toLowerCase());
        
        // 4. SMART REDIRECT LOGIC
        // If Teacher -> Go to the new Onboarding Wizard
        // If Student -> Go to Student Dashboard (or previous page)
        let target = '/dashboard/student';
        if (formData.role.toLowerCase() === 'teacher') {
          target = '/dashboard/teacher/onboarding';
        }
        
        setMessage('Success! Redirecting...');
        setTimeout(() => navigate(target), 1000);
      } else {
        const data = await response.text();
        setMessage(data || 'Registration failed.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = () => {
    const newRole = formData.role === 'teacher' ? 'student' : 'teacher';
    setFormData({ ...formData, role: newRole });
    navigate(`/register?role=${newRole}`, { replace: true });
  };

  // Dynamic Content assets
  const bgImage = formData.role === 'teacher' 
    ? 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80' 
    : 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=1650&q=80';

  const tagline = formData.role === 'teacher'
    ? "Inspire students. Earn income. Teach your way."
    : "Your grades, upgraded. Access top-tier study materials.";

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

          <AnimatePresence mode="wait">
            <motion.div
              key={formData.role} // Animates when role switches
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                Sign up as a {formData.role === 'teacher' ? 'Teacher' : 'Student'}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                {formData.role === 'teacher' 
                  ? 'Start your journey to financial freedom through education.' 
                  : 'Join thousands of students mastering their coursework.'}
              </Typography>
            </motion.div>
          </AnimatePresence>

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
              Sign up with Google
            </Button>

            <Divider sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">OR WITH EMAIL</Typography>
            </Divider>

            <Box component="form" onSubmit={handleSubmit}>
              {message && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <Box sx={{ 
                    p: 2, mb: 2, borderRadius: 2,
                    bgcolor: message.includes('Success') ? 'success.light' : 'error.light', 
                    color: message.includes('Success') ? 'success.contrastText' : 'error.contrastText',
                  }}>
                    <Typography variant="body2" fontWeight={500}>{message}</Typography>
                  </Box>
                </motion.div>
              )}

              <Stack spacing={2.5}>
                <TextField
                  fullWidth label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <TextField
                  fullWidth label="Email Address" type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
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
                />
                <TextField
                  fullWidth label="Confirm Password" type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </Stack>

              {/* Terms Checkbox - Critical for Sellers */}
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      value={agreedToTerms} 
                      onChange={(e) => setAgreedToTerms(e.target.checked)} 
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I agree to the <Link href="#">Terms of Service</Link> and <Link href="#">Privacy Policy</Link>.
                    </Typography>
                  }
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3, py: 1.8, borderRadius: 2, fontSize: '1.1rem', fontWeight: 700, textTransform: 'none', boxShadow: 'none',
                  bgcolor: theme.palette.primary.main,
                  '&:hover': { bgcolor: theme.palette.primary.dark }
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Looking to {formData.role === 'teacher' ? 'buy resources' : 'sell resources'}?{' '}
                  <Link 
                    component="button" type="button" onClick={switchRole}
                    sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                  >
                     Sign up as a {formData.role === 'teacher' ? 'Student' : 'Teacher'}
                  </Link>
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}>
                    Log in
                  </Link>
                </Typography>
              </Box>
            </Box>
        </Box>
      </Grid>

      {/* RIGHT SIDE: IMAGE */}
      <Grid 
        item xs={false} md={6} 
        sx={{ 
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={formData.role} // Re-renders image on role change
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </AnimatePresence>
        
        <Box
          sx={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: 8, color: 'white'
          }}
        >
          <motion.div
            key={tagline}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <Typography variant="h3" fontWeight={800} gutterBottom sx={{ lineHeight: 1.2 }}>
              {tagline}
            </Typography>
          </motion.div>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Register;