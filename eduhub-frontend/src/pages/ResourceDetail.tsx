import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Paper, Avatar, Grid, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, 
  Stack, Rating, Chip, Container, Breadcrumbs, Link, Snackbar, Alert
} from '@mui/material';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VerifiedIcon from '@mui/icons-material/Verified';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

const paymentMethods = [
  { label: 'M-Pesa (Mobile Money)', value: 'mpesa' },
  { label: 'Credit / Debit Card', value: 'card' },
];

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Data State
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<any>(null);
  const isLoggedIn = Boolean(localStorage.getItem('email')); 

  // Payment State
  const [buyOpen, setBuyOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [processing, setProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false); // New state for waiting UI
  const [loginPrompt, setLoginPrompt] = useState(false);

  // Notification State
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'info',
  });

  // --- FETCH DATA ---
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8081/api/teacher/resources/${id}`)
      .then(async res => {
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setResource(data.resource || data);
      })
      .catch(() => setResource(null))
      .finally(() => setLoading(false));
  }, [id]);

  // --- POLLING LOGIC (Real-time status check) ---
  const pollPaymentStatus = async (checkoutRequestId: string) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 30; // Timeout after 60 seconds

    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(`http://localhost:8081/api/payment/status/${checkoutRequestId}`, {
            credentials: 'include'
        });
        const data = await res.json();

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setIsPolling(false);
          setBuyOpen(false);
          setToast({ open: true, message: "Payment Successful! Redirecting...", severity: 'success' });
          setTimeout(() => navigate('/purchase-confirmation'), 1500);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setIsPolling(false);
          setToast({ open: true, message: "Payment Failed or Cancelled by user.", severity: 'error' });
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setIsPolling(false);
          setToast({ open: true, message: "Payment timed out. Please try again.", severity: 'warning' });
        }
      } catch (e) {
        // Ignore network glitches during polling
      }
    }, 2000); // Check every 2 seconds
  };

  // --- HANDLERS ---
  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setLoginPrompt(true);
      return;
    }
    setBuyOpen(true);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  const handlePayment = () => {
    if (paymentMethod === 'mpesa' && !phoneNumber) {
        setToast({ open: true, message: "Please enter your M-Pesa phone number.", severity: 'error' });
        return;
    }

    setProcessing(true);
    
    fetch('http://localhost:8081/api/payment/pay', {
      method: 'POST',
      credentials: 'include', 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `phone=${encodeURIComponent(phoneNumber)}&resourceId=${encodeURIComponent(id || '')}`
    })
    .then(async res => {
      setProcessing(false);
      if (res.ok) {
        const data = await res.json();
        
        // Start Polling if we got an ID back
        if (data.checkoutRequestId) {
            pollPaymentStatus(data.checkoutRequestId);
        } else {
            // Fallback for older backend versions
            setBuyOpen(false);
            setToast({ open: true, message: "STK Push Sent!", severity: 'success' });
        }
      } else {
        const errorText = await res.text();
        setToast({ open: true, message: errorText || 'Payment initiation failed.', severity: 'error' });
      }
    })
    .catch(() => {
      setProcessing(false);
      setToast({ open: true, message: 'Network error. Check your connection.', severity: 'error' });
    });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;
  if (!resource) return <Typography sx={{ mt: 10, textAlign: 'center' }}>Resource not found.</Typography>;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
        
        {/* HEADER */}
        <Box sx={{ borderBottom: '1px solid #eee', py: 2 }}>
            <Container maxWidth="lg">
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/" sx={{ fontSize: '0.9rem' }}>Home</Link>
                    <Link underline="hover" color="inherit" href="/browse" sx={{ fontSize: '0.9rem' }}>Resources</Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{resource.title}</Typography>
                </Breadcrumbs>
            </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Grid container spacing={6}>
                
                {/* LEFT CONTENT */}
                <Grid item xs={12} md={8}>
                    <Box sx={{ 
                        bgcolor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', mb: 4,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
                        minHeight: 300, border: '1px solid #E5E7EB'
                    }}>
                         {resource.previewImageUrl ? (
                             <img src={resource.previewImageUrl} alt={resource.title} style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }} />
                         ) : (
                             <Box sx={{ textAlign: 'center', py: 8 }}>
                                 <Avatar variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'white', color: '#ccc', mx: 'auto', mb: 2 }}>
                                     <FileDownloadIcon sx={{ fontSize: 40 }} />
                                 </Avatar>
                                 <Typography color="text.secondary" fontWeight={500}>No Preview Available</Typography>
                             </Box>
                         )}
                         <Box sx={{ position: 'absolute', bottom: 20, right: 20, bgcolor: 'rgba(0,0,0,0.7)', color: 'white', px: 2, py: 0.5, borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>
                             PREVIEW MODE
                         </Box>
                    </Box>

                    <Typography variant="h3" fontWeight={800} sx={{ mb: 2, lineHeight: 1.2, color: '#111827', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>
                        {resource.title}
                    </Typography>

                    <Stack direction="row" spacing={2} sx={{ mb: 4 }} alignItems="center">
                         <Chip label={resource.subject} size="small" sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                         <Chip label={resource.grade || "General"} size="small" sx={{ fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }} />
                         <Stack direction="row" spacing={0.5} alignItems="center">
                             <Rating value={resource.averageRating || 0} precision={0.5} readOnly size="small" />
                             <Typography variant="body2" fontWeight={600} color="text.secondary">
                                 ({resource.reviews?.length || 0})
                             </Typography>
                         </Stack>
                    </Stack>
                    
                    <Divider sx={{ mb: 4 }} />

                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: '#111827' }}>{resource.teacherName?.[0] || 'T'}</Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700}>{resource.teacherName || 'Instructor'}</Typography>
                            <Typography variant="body2" color="text.secondary">Verified Teacher</Typography>
                        </Box>
                    </Stack>

                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>About this resource</Typography>
                        <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            {resource.description}
                        </Typography>
                    </Box>
                </Grid>

                {/* RIGHT COLUMN: BUY WIDGET */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'sticky', top: 100 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E5E7EB', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
                            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
                                <Typography variant="h3" fontWeight={800} color="#111827">KES {resource.price || 0}</Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>One-time payment</Typography>
                            </Stack>

                            <Button 
                                variant="contained" fullWidth size="large" onClick={handleBuyNow}
                                sx={{ py: 1.8, borderRadius: 3, fontWeight: 700, fontSize: '1rem', mb: 2, textTransform: 'none', boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)' }}
                            >
                                Buy Now
                            </Button>

                            <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mb: 3 }}>
                                Secure payment via M-Pesa
                            </Typography>

                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <CheckCircleIcon color="success" fontSize="small" />
                                    <Typography variant="body2">Instant Download</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <VerifiedIcon color="primary" fontSize="small" />
                                    <Typography variant="body2">Quality Checked</Typography>
                                </Stack>
                            </Stack>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Container>

        {/* --- CHECKOUT DIALOG --- */}
        <Dialog 
            open={buyOpen} 
            onClose={() => !isPolling && setBuyOpen(false)} // Prevent closing while polling
            maxWidth="xs" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: 800 }}>
                {isPolling ? "Waiting for Payment..." : "Checkout"}
            </DialogTitle>
            
            <DialogContent sx={{ textAlign: isPolling ? 'center' : 'left', py: isPolling ? 4 : 2 }}>
                {!isPolling ? (
                    // NORMAL FORM
                    <>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Purchase <b>{resource.title}</b>
                        </Typography>
                        
                        <TextField
                            select
                            label="Payment Method"
                            fullWidth
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            sx={{ mb: 3 }}
                        >
                            {paymentMethods.map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </TextField>

                        {paymentMethod === 'mpesa' && (
                            <Box sx={{ bgcolor: '#F0FDF4', p: 2, borderRadius: 2, border: '1px solid #DCFCE7' }}>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                                    <PhoneIphoneIcon color="success" fontSize="small" />
                                    <Typography variant="subtitle2" fontWeight={700} color="success.main">M-Pesa Number</Typography>
                                </Stack>
                                <TextField
                                    fullWidth
                                    placeholder="e.g. 0712345678"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    size="small"
                                    sx={{ bgcolor: 'white' }}
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    You will receive a prompt on this phone to enter your PIN.
                                </Typography>
                            </Box>
                        )}
                    </>
                ) : (
                    // POLLING STATE
                    <Box>
                        <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: '#16A34A' }} />
                        <Typography variant="h6" fontWeight={700} gutterBottom>
                            Check your phone
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}>
                            We've sent a prompt to <b>{phoneNumber}</b>. Please enter your M-Pesa PIN to complete the transaction.
                        </Typography>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                {!isPolling && (
                    <>
                        <Button onClick={() => setBuyOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
                        <Button 
                            variant="contained" 
                            onClick={handlePayment} 
                            disabled={processing}
                            sx={{ borderRadius: 2, px: 3, fontWeight: 700, boxShadow: 'none' }}
                        >
                            {processing ? "Sending..." : `Pay KES ${resource.price}`}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
        
        <Dialog open={loginPrompt} onClose={() => setLoginPrompt(false)}>
            <DialogTitle>Log in Required</DialogTitle>
            <DialogContent>
                <Typography>Please log in to purchase this resource.</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setLoginPrompt(false)}>Cancel</Button>
                <Button onClick={() => navigate('/login')} variant="contained">Log In</Button>
            </DialogActions>
        </Dialog>

        {/* --- SNACKBAR --- */}
        <Snackbar
            open={toast.open}
            autoHideDuration={6000}
            onClose={handleCloseToast}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
            <Alert 
                onClose={handleCloseToast} 
                severity={toast.severity} 
                variant="filled"
                sx={{ width: '100%', borderRadius: 3, fontWeight: 600 }}
            >
                {toast.message}
            </Alert>
        </Snackbar>

    </Box>
  );
};

export default ResourceDetail;