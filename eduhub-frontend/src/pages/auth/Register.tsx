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
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const Register: React.FC = () => {
  const theme = useTheme();
  // Check if screen is mobile/tablet for conditional logic
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

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
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
        localStorage.setItem('email', formData.email.trim().toLowerCase());
        localStorage.setItem('role', formData.role.toLowerCase());
        const target = formData.role.toLowerCase() === 'teacher' 
          ? '/dashboard/teacher/onboarding' 
          : '/purchase-confirmation';
        
        setMessage('Success! Redirecting...');
        setTimeout(() => navigate(target), 1200);
      } else {
        const data = await response.text();
        setMessage(data || 'Registration failed.');
      }
    } catch (error) {
      setMessage('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const switchRole = () => {
    const newRole = formData.role === 'teacher' ? 'student' : 'teacher';
    setFormData({ ...formData, role: newRole });
    navigate(`/register?role=${newRole}`);
  };

  // Dynamic Content based on Role
  const bgImage = formData.role === 'teacher' 
    ? 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' 
    : 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80';

  const tagline = formData.role === 'teacher'
    ? "Turn your classroom resources into income."
    : "Master your exams with verified resources.";

  return (
    <Grid container component="main" sx={{ minHeight: '100vh' }}>
      
      {/* LEFT SIDE: FORM (Full width on Mobile, Half on Desktop) */}
      <Grid 
        item 
        xs={12} 
        md={6} 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center',
          // Responsive Padding: Less on mobile, More on desktop
          p: { xs: 3, sm: 6, md: 8 }, 
          bgcolor: '#fff'
        }}
      >
        <Box maxWidth="sm" sx={{ mx: 'auto', width: '100%' }}>
          
          <Button 
            startIcon={<ArrowBackIcon />} 
            component={RouterLink} 
            to="/" 
            sx={{ mb: 4, color: 'text.secondary', pl: 0 }}
          >
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d', fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Create {formData.role} account
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              {formData.role === 'teacher' 
                ? 'Join EduHub to sell exams, notes, and plans.' 
                : 'Access thousands of verified study materials.'}
            </Typography>

            {/* Social Login */}
            <Button
              fullWidth
              variant="outlined"
              startIcon={<GoogleIcon />}
              sx={{ 
                py: 1.5, 
                mb: 3, 
                color: '#555', 
                borderColor: '#ddd',
                textTransform: 'none',
                fontWeight: 600,
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
                <Box sx={{ 
                  p: 2, 
                  mb: 2, 
                  bgcolor: message.includes('Success') ? 'success.light' : 'error.light', 
                  color: message.includes('Success') ? 'success.contrastText' : 'error.contrastText',
                  borderRadius: 2
                }}>
                  <Typography variant="body2">{message}</Typography>
                </Box>
              )}

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
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
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Stack>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 4,
                  py: 1.8,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: 'none',
                  bgcolor: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  },
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Want to {formData.role === 'teacher' ? 'buy' : 'sell'} instead?{' '}
                  <Link 
                    component="button"
                    type="button"
                    onClick={switchRole}
                    sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                  >
                     Register as {formData.role === 'teacher' ? 'Student' : 'Teacher'}
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
          </motion.div>
        </Box>
      </Grid>

      {/* RIGHT SIDE: IMAGE (Hidden on Mobile/Tablet) */}
      <Grid 
        item 
        xs={false} // Hidden on xs
        md={6}     // Visible on md
        sx={{ 
          display: { xs: 'none', md: 'block' },
          position: 'relative',
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            p: 8,
            color: 'white'
          }}
        >
          <motion.div
            key={formData.role}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
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