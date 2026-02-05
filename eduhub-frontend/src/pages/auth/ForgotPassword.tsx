import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, Typography, TextField, Button, Container, 
  Snackbar, Alert, Stack, IconButton, InputAdornment, Fade 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { api } from '@/api/axios';
import { useLoading } from '../../context/LoadingContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [showTopBanner, setShowTopBanner] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for resend and Banner auto-hide
  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // AUTO-HIDE THE SUCCESS BANNER logic
  useEffect(() => {
    if (showTopBanner) {
      const bannerTimer = setTimeout(() => {
        setShowTopBanner(false);
      }, 6000); // Banner disappears after 6 seconds
      return () => clearTimeout(bannerTimer);
    }
  }, [showTopBanner]);

  // Standard Snackbar Close Handler
  const handleCloseToast = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    startLoading();
    try {
      await api.post('/api/auth/forgot-password', { email: email.trim().toLowerCase() });
      setStep(2);
      setShowTopBanner(true);
      setTimer(60);
      setCanResend(false);
      // Optional: also show a toast
      setToast({ open: true, message: "Verification code sent!", severity: 'success' });
    } catch (err: any) {
      setToast({ open: true, message: err.response?.data || "Failed to send OTP.", severity: 'error' });
    } finally {
      stopLoading();
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const val = value.replace(/\D/g, ''); // Numbers only
    if (!val && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length < 6) {
      setToast({ open: true, message: "Please enter all 6 digits", severity: 'error' });
      return;
    }
    setStep(3);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setToast({ open: true, message: "Passwords do not match", severity: 'error' });
      return;
    }

    startLoading();
    try {
      await api.post('/api/auth/reset-password', { 
        email: email.trim().toLowerCase(), 
        otp: otp.join(''), 
        password 
      });
      setToast({ open: true, message: "Password updated successfully!", severity: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setToast({ open: true, message: err.response?.data || "Error resetting password.", severity: 'error' });
    } finally {
      stopLoading();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', pt: 6 }}>
      <Container maxWidth="sm">
        
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/login')}
          sx={{ mb: 3, textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
        >
          {step === 1 ? "Back to Login" : "Back"}
        </Button>

        <AnimatePresence mode="wait">
          {/* STEP 1 */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: '#1a1b1d' }}>Forgot Password</Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>Enter your registered email to receive a 6-digit verification code.</Typography>
              <Box component="form" onSubmit={handleSendOtp}>
                <TextField 
                   fullWidth label="Email Address" value={email} 
                   onChange={(e) => setEmail(e.target.value)} required 
                />
                <Button 
                   type="submit" fullWidth variant="contained" 
                   sx={{ mt: 3, py: 1.5, bgcolor: '#1976d2', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}
                >
                  Send OTP
                </Button>
              </Box>
            </motion.div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Fade in={showTopBanner}>
                <Box>
                  {showTopBanner && (
                    <Alert 
                      severity="success" 
                      onClose={() => setShowTopBanner(false)}
                      icon={<CheckCircleOutlineIcon fontSize="inherit" />}
                      sx={{ mb: 4, borderRadius: '12px', border: '1px solid #c3e6cb', bgcolor: '#edf7ed' }}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>Success!</Typography>
                      6 Digit OTP has been sent to your email address
                    </Alert>
                  )}
                </Box>
              </Fade>

              <Typography variant="h3" fontWeight={900} textAlign="center" sx={{ color: '#0d1b3e', mb: 4 }}>
                OTP verification
              </Typography>

              <Box component="form" onSubmit={handleVerifyOtpNext}>
                <Typography variant="body1" fontWeight={600} sx={{ mb: 2, textAlign: 'center' }}>Enter OTP</Typography>
                
                <Stack direction="row" spacing={1.2} justifyContent="center" sx={{ mb: 4 }}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      style={{
                        width: '48px', height: '60px', textAlign: 'center', fontSize: '24px',
                        fontWeight: 'bold', borderRadius: '8px', border: digit ? '2px solid #1976d2' : '2px solid #e0e0e0',
                        backgroundColor: digit ? '#f0f7ff' : '#fff', outline: 'none', transition: '0.2s'
                      }}
                    />
                  ))}
                </Stack>

                <Button 
                  type="submit" fullWidth variant="contained" 
                  sx={{ 
                    py: 2, bgcolor: '#00a651', '&:hover': { bgcolor: '#008e45' }, 
                    borderRadius: '50px', fontWeight: 700, fontSize: '18px', textTransform: 'none' 
                  }}
                >
                  Next
                </Button>

                <Typography textAlign="center" sx={{ mt: 3 }} color="text.secondary">
                  Didn't receive OTP? {canResend ? (
                    <Button onClick={handleSendOtp} sx={{ fontWeight: 700, textTransform: 'none' }}>Resend Now</Button>
                  ) : (
                    <Typography component="span" fontWeight={700} color="primary.main">
                      Resend in 00:{timer.toString().padStart(2, '0')}
                    </Typography>
                  )}
                </Typography>
              </Box>
            </motion.div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>Create New Password</Typography>
              <Typography color="text.secondary" sx={{ mb: 4 }}>Ensure your password is at least 8 characters long.</Typography>
              
              <Stack component="form" onSubmit={handleResetPassword} spacing={3}>
                <TextField 
                  fullWidth label="New Password" 
                  type={showPassword ? 'text' : 'password'}
                  value={password} onChange={(e) => setPassword(e.target.value)} required 
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
                <TextField 
                  fullWidth label="Confirm Password" type="password" 
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required 
                />
                <Button 
                  type="submit" fullWidth variant="contained" 
                  sx={{ py: 1.5, bgcolor: '#1976d2', fontWeight: 700, borderRadius: '10px', textTransform: 'none' }}
                >
                  Reset Password
                </Button>
              </Stack>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* SNACKBAR - THIS WILL AUTO-HIDE NOW */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} // Automatically hides after 4 seconds
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toast.severity} 
          variant="filled"
          sx={{ width: '100%', boxShadow: 6, borderRadius: '8px' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPassword;