import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Paper, Avatar, Grid, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, 
  Stack, Rating, Chip, Container, Breadcrumbs, Link, Snackbar, Alert
} from '@mui/material';
import { api } from '@/api/axios'; // FIXED: Import api

// Icons
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import MessageIcon from '@mui/icons-material/Message';

const paymentMethods = [
  { label: 'M-Pesa (Mobile Money)', value: 'mpesa' },
];

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<any>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [processing, setProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const isFree = resource && (!resource.price || resource.price === 0);
  const pollIntervalRef = useRef<any>(null);

  const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false, message: '', severity: 'info',
  });

  useEffect(() => {
    setLoading(true);
    // FIXED: Using api instance
    api.get(`/api/teacher/resources/${id}`)
      .then(res => {
        const data = res.data;
        setResource(data.resource || data);
      })
      .catch(() => setResource(null))
      .finally(() => setLoading(false));
      
    return () => stopPolling();
  }, [id]);

  const stopPolling = () => {
      if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
      }
      setIsPolling(false);
  };

  const pollPaymentStatus = async (checkoutRequestId: string) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 60; 

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        // FIXED: Using api instance
        const res = await api.get(`/api/payment/status/${checkoutRequestId}`);
        const data = res.data;

        if (data.status === 'COMPLETED') {
          stopPolling();
          setBuyOpen(false);
          setToast({ open: true, message: "Payment Successful! Redirecting...", severity: 'success' });
          setTimeout(() => navigate('/dashboard/student'), 2000);
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          stopPolling();
          setToast({ open: true, message: "Payment Failed or Cancelled.", severity: 'error' });
        }

        if (attempts >= maxAttempts) {
          stopPolling();
          setToast({ open: true, message: "We haven't received confirmation yet. If you paid, check your dashboard shortly.", severity: 'warning' });
          setBuyOpen(false);
        }
      } catch (e) {
        // Ignore network glitches
      }
    }, 2000);
  };

  const handleBuyNow = () => { setBuyOpen(true); };

  const handleIPaid = () => {
      stopPolling();
      setBuyOpen(false);
      setToast({ open: true, message: "We are processing your payment in the background. Check your dashboard in a minute.", severity: 'info' });
      setTimeout(() => navigate('/dashboard/student'), 2000);
  };

  const handleManualCancel = () => {
      stopPolling();
      setBuyOpen(false);
      setToast({ open: true, message: "Payment process cancelled.", severity: 'info' });
  };
const handleGetFree = () => {
    const isAuthenticated = !!localStorage.getItem('token'); 

    if (!isAuthenticated) {
        setLoginPrompt(true);
        return;
    }
    setProcessing(true);
    
    // Create params for the existing purchase endpoint
    const params = new URLSearchParams();
    params.append('resourceId', id || '');

    api.post('/api/student/purchase', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(() => {
        setToast({ open: true, message: "Added to your library for free!", severity: 'success' });
        setTimeout(() => navigate('/dashboard/student'), 1500);
    })
    .catch((err) => {
         if (err.response?.status === 401 || err.response?.status === 403) {
            setLoginPrompt(true);
        } else {
            setToast({ open: true, message: "Failed to process request.", severity: 'error' });
        }
    })
    .finally(() => setProcessing(false));
  };

  const handlePayment = () => {
    if (paymentMethod === 'mpesa' && !phoneNumber) {
        setToast({ open: true, message: "Please enter your M-Pesa phone number.", severity: 'error' });
        return;
    }

    setProcessing(true);
    
    // FIXED: Using URLSearchParams for form-encoded post
    const params = new URLSearchParams();
    params.append('phone', phoneNumber);
    params.append('resourceId', id || '');

    api.post('/api/payment/pay', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(res => {
      setProcessing(false);
      const data = res.data;
      if (data.checkoutRequestId) {
          pollPaymentStatus(data.checkoutRequestId);
      } else {
          setBuyOpen(false);
          setToast({ open: true, message: "Request Sent!", severity: 'success' });
      }
    })
    .catch((err) => {
      setProcessing(false);
      if (err.response?.status === 401 || err.response?.status === 403) {
          setBuyOpen(false);
          setLoginPrompt(true);
          return;
      }
      setToast({ open: true, message: err.response?.data || 'Payment initiation failed.', severity: 'error' });
    });
  };

  const handleCloseToast = () => { setToast({ ...toast, open: false }); };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;
  if (!resource) return <Typography sx={{ mt: 10, textAlign: 'center' }}>Resource not found.</Typography>;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
        {/* Render Logic stays exactly as you provided */}
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
                <Grid item xs={12} md={8}>
                    <Box sx={{ bgcolor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', minHeight: 300, border: '1px solid #E5E7EB' }}>
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
                    </Box> bcv 
                    <Typography variant="h3" fontWeight={800} sx={{ mb: 2, lineHeight: 1.2, color: '#111827', fontSize: { xs: '1.8rem', md: '2.5rem' } }}>{resource.title}</Typography>
                    <Stack direction="row" spacing={2} sx={{ mb: 4 }} alignItems="center">
                         <Chip label={resource.subject} size="small" sx={{ fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                         <Chip label={resource.grade || "General"} size="small" sx={{ fontWeight: 600, bgcolor: '#F3F4F6', color: '#374151' }} />
                         <Stack direction="row" spacing={0.5} alignItems="center">
                             <Rating value={resource.averageRating || 0} precision={0.5} readOnly size="small" />
                             <Typography variant="body2" fontWeight={600} color="text.secondary">({resource.reviews?.length || 0})</Typography>
                         </Stack>
                    </Stack>
                    <Divider sx={{ mb: 4 }} />
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: '#111827' }}>{resource.teacherName?.[0] || 'T'}</Avatar>
                        <Box><Typography variant="subtitle1" fontWeight={700}>{resource.teacherName || 'Instructor'}</Typography><Typography variant="body2" color="text.secondary">Verified Teacher</Typography></Box>
                    </Stack>
                    <Box sx={{ mb: 6 }}><Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>About this resource</Typography><Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.8, fontSize: '1.05rem' }}>{resource.description}</Typography></Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'sticky', top: 100 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E5E7EB', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' }}>
                            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
                                 <Typography variant="h3" fontWeight={800} color="#111827">
            {isFree ? "Free" : `KES ${resource.price}`}
        </Typography>
         {!isFree && <Typography variant="body2" color="text.secondary" fontWeight={500}>One-time payment</Typography>}
        </Stack>
                              <Button 
        variant="contained" 
        fullWidth 
        size="large" 
        disabled={processing}
        onClick={isFree ? handleGetFree : handleBuyNow} 
        sx={{ py: 1.8, borderRadius: 3, fontWeight: 700, fontSize: '1rem', mb: 2, textTransform: 'none' }}
    >
        {processing ? <CircularProgress size={24} color="inherit" /> : (isFree ? "Get for Free" : "Buy Now")}
    </Button>
                             <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mb: 3 }}>
        {isFree ? "No payment required" : "Secure payment via M-Pesa"}
    </Typography>
                            <Stack spacing={2}><Stack direction="row" spacing={1.5} alignItems="center"><CheckCircleIcon color="success" fontSize="small" /><Typography variant="body2">Instant Download</Typography></Stack><Stack direction="row" spacing={1.5} alignItems="center"><VerifiedIcon color="primary" fontSize="small" /><Typography variant="body2">Quality Checked</Typography></Stack></Stack>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Container>
=
        <Dialog open={buyOpen} onClose={handleManualCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 800 }}>{isPolling ? "Processing..." : "Checkout"}</DialogTitle>
            <DialogContent sx={{ textAlign: isPolling ? 'center' : 'left', py: isPolling ? 4 : 2 }}>
                {!isPolling ? (
                    <><Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Purchase <b>{resource.title}</b></Typography>
                    <TextField select label="Payment Method" fullWidth value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} sx={{ mb: 3 }}>
                        {paymentMethods.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                    </TextField>
                    {paymentMethod === 'mpesa' && (
                        <Box sx={{ bgcolor: '#F0FDF4', p: 2, borderRadius: 2, border: '1px solid #DCFCE7' }}>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}><PhoneIphoneIcon color="success" fontSize="small" /><Typography variant="subtitle2" fontWeight={700} color="success.main">M-Pesa Number</Typography></Stack>
                            <TextField fullWidth placeholder="e.g. 0712345678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} size="small" sx={{ bgcolor: 'white' }} />
                        </Box>
                    )}</>
                ) : (
                    <Box><CircularProgress size={60} thickness={4} sx={{ mb: 3, color: '#16A34A' }} /><Typography variant="h6" fontWeight={700} gutterBottom>Check your phone</Typography><Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}>We've sent a prompt to <b>{phoneNumber}</b>. Enter your PIN.</Typography></Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, flexDirection: isPolling ? 'column' : 'row', gap: 2 }}>
                {isPolling ? (
                    <><Button onClick={handleIPaid} variant="contained" fullWidth color="success" sx={{ borderRadius: 2, fontWeight: 700 }}>I have received the SMS</Button><Button onClick={handleManualCancel} fullWidth color="inherit">Cancel Payment</Button></>
                ) : (
                    <><Button onClick={() => setBuyOpen(false)} sx={{ fontWeight: 600 }}>Cancel</Button><Button variant="contained" onClick={handlePayment} disabled={processing}>{processing ? "Sending..." : `Pay KES ${resource.price}`}</Button></>
                )}
            </DialogActions>
        </Dialog>
        
        <Dialog open={loginPrompt} onClose={() => setLoginPrompt(false)}>
    <DialogTitle sx={{ fontWeight: 700 }}>
        {isFree ? "Account Required" : "Log in Required"}
    </DialogTitle>
    <DialogContent>
        <Typography>
            {isFree 
                ? "Please log in to add this free resource to your library so you can access it anytime." 
                : "Please log in to purchase this resource."}
        </Typography>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
        <Button onClick={() => setLoginPrompt(false)} color="inherit">Cancel</Button>
        <Button 
            onClick={() => navigate('/login')} 
            variant="contained"
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
        >
            Log In / Sign Up
        </Button>
    </DialogActions>
</Dialog>
        <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}><Alert onClose={handleCloseToast} severity={toast.severity} variant="filled">{toast.message}</Alert></Snackbar>
    </Box>
  );
};

export default ResourceDetail;