import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Paper, Avatar, Grid, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, 
  Stack, Rating, Chip, Container, Breadcrumbs, Link, alpha, createTheme, ThemeProvider
} from '@mui/material';
import { api } from '@/api/axios';
import AppNotification from '@/components/AppNotification';

// Icons
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VerifiedIcon from '@mui/icons-material/Verified';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import ShieldCheckIcon from '@mui/icons-material/ShieldMoon'; // Using for trust
import { BookOpen, User, Star, ArrowLeft } from 'lucide-react';

const BRAND_BLUE = '#2563EB';
const BORDER_COLOR = '#E2E8F0';
const SLATE_DARK = '#0F172A';

const resourceTheme = createTheme({
    typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
});

const paymentMethods = [{ label: 'M-Pesa (Mobile Money)', value: 'mpesa' }];

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Logic States
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

  // --- LOGIC: FETCHING ---
  useEffect(() => {
    setLoading(true);
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

  // --- LOGIC: PAYMENT POLLING ---
  const pollPaymentStatus = async (checkoutRequestId: string) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 60; 

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const res = await api.get(`/api/payment/status/${checkoutRequestId}`);
        const data = res.data;

        if (data.status === 'COMPLETED') {
          stopPolling();
          setBuyOpen(false);
          setToast({ open: true, message: "Payment Successful! Added to your library.", severity: 'success' });
          setTimeout(() => navigate('/dashboard/student'), 2000);
        } else if (data.status === 'FAILED' || data.status === 'CANCELLED') {
          stopPolling();
          setToast({ open: true, message: "Payment Failed or Cancelled.", severity: 'error' });
        }

        if (attempts >= maxAttempts) {
          stopPolling();
          setToast({ open: true, message: "Still processing. Check your dashboard in a moment.", severity: 'warning' });
          setBuyOpen(false);
        }
      } catch (e) { /* silent ignore glitches */ }
    }, 2000);
  };

  // --- LOGIC: ACTIONS ---
  const handleBuyNow = () => setBuyOpen(true);

  const handleManualCancel = () => {
      stopPolling();
      setBuyOpen(false);
      setToast({ open: true, message: "Transaction cancelled.", severity: 'info' });
  };

  const handleGetFree = () => {
    const isAuthenticated = !!localStorage.getItem('token'); 
    if (!isAuthenticated) { setLoginPrompt(true); return; }
    setProcessing(true);
    
    const params = new URLSearchParams();
    params.append('resourceId', id || '');

    api.post('/api/student/purchase', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(() => {
        setToast({ open: true, message: "Success! Resource added to library.", severity: 'success' });
        setTimeout(() => navigate('/dashboard/student'), 1500);
    })
    .catch((err) => {
         if (err.response?.status === 401) setLoginPrompt(true);
         else setToast({ open: true, message: "Processing failed.", severity: 'error' });
    })
    .finally(() => setProcessing(false));
  };

  const handlePayment = () => {
    if (paymentMethod === 'mpesa' && !phoneNumber) {
        setToast({ open: true, message: "Enter M-Pesa number.", severity: 'error' });
        return;
    }
    setProcessing(true);
    const paymentData = { phoneNumber, resourceId: id, amount: resource.price };

    api.post('/api/payment/pay', paymentData)
    .then(res => {
      setProcessing(false);
      if (res.data.checkoutRequestId) pollPaymentStatus(res.data.checkoutRequestId);
      else { setBuyOpen(false); setToast({ open: true, message: "Request Sent!", severity: 'success' }); }
    })
    .catch((err) => {
      setProcessing(false);
      if (err.response?.status === 401) { setBuyOpen(false); setLoginPrompt(true); return; }
      setToast({ open: true, message: err.response?.data || 'Failed to initiate.', severity: 'error' });
    });
  };

  const handleCloseToast = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast(prev => ({ ...prev, open: false }));
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 2 }}>
        <CircularProgress sx={{ color: BRAND_BLUE }} />
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>LOADING RESOURCE...</Typography>
    </Box>
  );

  if (!resource) return (
    <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" fontWeight={800}>Resource not found.</Typography>
        <Button startIcon={<ArrowLeft />} sx={{ mt: 2 }} onClick={() => navigate('/browse')}>Back to Browse</Button>
    </Container>
  );

  return (
    <ThemeProvider theme={resourceTheme}>
        <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
            
            {/* 1. BREADCRUMBS BAR */}
            <Box sx={{ borderBottom: `1px solid ${BORDER_COLOR}`, py: 1.5, bgcolor: '#F8FAFC' }}>
                <Container maxWidth="lg">
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ '& .MuiTypography-root': { fontSize: '0.8rem', fontWeight: 600 } }}>
                        <Link component={Button} onClick={() => navigate('/')} color="inherit">Home</Link>
                        <Link component={Button} onClick={() => navigate('/browse')} color="inherit">Marketplace</Link>
                        <Typography color="text.primary">{resource.title}</Typography>
                    </Breadcrumbs>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 5 }}>
                <Grid container spacing={6}>
                    
                    {/* LEFT COLUMN: MAIN CONTENT */}
                    <Grid item xs={12} md={8}>
                        
                        {/* PREVIEW IMAGE BOX */}
                        <Paper elevation={0} sx={{ bgcolor: '#F1F5F9', borderRadius: '4px', border: `1px solid ${BORDER_COLOR}`, mb: 4, overflow: 'hidden', position: 'relative', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {resource.previewImageUrl ? (
                                <img src={resource.previewImageUrl} alt={resource.title} style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'contain' }} />
                            ) : (
                                <Stack alignItems="center" spacing={2}>
                                    <Avatar sx={{ width: 80, height: 80, bgcolor: '#FFF', border: `1px solid ${BORDER_COLOR}` }}><BookOpen color={BRAND_BLUE} size={40} /></Avatar>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>Digital Resource Preview</Typography>
                                </Stack>
                            )}
                        </Paper>

                        {/* PRODUCT HEADER */}
                        <Typography variant="h3" sx={{ fontWeight: 900, color: SLATE_DARK, letterSpacing: '-0.04em', lineHeight: 1.1, mb: 2 }}>
                            {resource.title}
                        </Typography>

                        <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
                            <Chip label={resource.subject} sx={{ fontWeight: 800, bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, borderRadius: '4px' }} />
                            <Chip label={resource.grade || "General"} sx={{ fontWeight: 800, bgcolor: '#F1F5F9', borderRadius: '4px' }} />
                            {resource.curriculum && <Chip label={resource.curriculum} variant="outlined" sx={{ fontWeight: 800, borderRadius: '4px' }} />}
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ ml: 2 }}>
                                <Rating value={resource.averageRating || 0} precision={0.5} readOnly size="small" />
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>({resource.reviews?.length || 0} Reviews)</Typography>
                            </Stack>
                        </Stack>

                        <Divider sx={{ mb: 4 }} />

                        {/* TEACHER INFO */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 5 }}>
                            <Avatar sx={{ width: 50, height: 50, bgcolor: SLATE_DARK, borderRadius: '4px' }}>
                                {resource.teacherName?.[0] || <User />}
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{resource.teacherName || 'Instructor'}</Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <VerifiedIcon sx={{ fontSize: 16, color: BRAND_BLUE }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>Verified Educator</Typography>
                                </Stack>
                            </Box>
                        </Box>

                        {/* DESCRIPTION */}
                        <Box sx={{ mb: 6 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Resource Description</Typography>
                            <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                                {resource.description}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* RIGHT COLUMN: STICKY BUY CARD */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ position: 'sticky', top: 100 }}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: '4px', border: `1px solid ${BORDER_COLOR}`, bgcolor: '#FFF', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
                                
                                <Typography variant="caption" sx={{ fontWeight: 800, color: BRAND_BLUE, letterSpacing: 1.5, display: 'block', mb: 1 }}>
                                    LIFETIME ACCESS
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900, mb: 3 }}>
                                    {isFree ? "Free" : `KES ${resource.price}`}
                                </Typography>

                                <Button 
                                    variant="contained" 
                                    fullWidth 
                                    size="large" 
                                    disabled={processing}
                                    onClick={isFree ? handleGetFree : handleBuyNow} 
                                    sx={{ 
                                        py: 2, borderRadius: '4px', fontWeight: 800, fontSize: '1.1rem', mb: 2,
                                        bgcolor: SLATE_DARK, boxShadow: 'none', '&:hover': { bgcolor: '#1e293b' } 
                                    }}
                                >
                                    {processing ? <CircularProgress size={24} color="inherit" /> : (isFree ? "Add to Library" : "Buy Resource")}
                                </Button>

                                <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                                    {isFree ? "Safe & Free Download" : "Secure Payment via M-Pesa"}
                                </Typography>

                                <Stack spacing={2.5}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <CheckCircleIcon sx={{ color: '#10B981', fontSize: 20 }} />
                                        <Typography variant="body2" fontWeight={600}>Instant PDF Access</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <FileDownloadIcon sx={{ color: BRAND_BLUE, fontSize: 20 }} />
                                        <Typography variant="body2" fontWeight={600}>Unlimited Downloads</Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <ShieldCheckIcon sx={{ color: '#64748B', fontSize: 20 }} />
                                        <Typography variant="body2" fontWeight={600}>Verified Authentic Content</Typography>
                                    </Stack>
                                </Stack>
                            </Paper>
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* CHECKOUT DIALOG */}
            <Dialog open={buyOpen} onClose={handleManualCancel} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '4px', p: 1 } }}>
                <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', pb: 0 }}>
                    {isPolling ? "Verifying..." : "M-Pesa Checkout"}
                </DialogTitle>
                <DialogContent sx={{ py: 3 }}>
                    {!isPolling ? (
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>PAYMENT METHOD</Typography>
                                <TextField select fullWidth value={paymentMethod} size="small">
                                    {paymentMethods.map(opt => (<MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>))}
                                </TextField>
                            </Box>
                            
                            <Box sx={{ p: 2, bgcolor: '#F0FDF4', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: '#166534', display: 'block', mb: 1.5 }}>
                                    ENTER SAFARICOM NUMBER
                                </Typography>
                                <TextField 
                                    fullWidth 
                                    placeholder="0712345678" 
                                    value={phoneNumber} 
                                    onChange={(e) => setPhoneNumber(e.target.value)} 
                                    size="small" 
                                    sx={{ bgcolor: 'white' }}
                                    InputProps={{ startAdornment: <PhoneIphoneIcon sx={{ mr: 1, fontSize: 18, color: '#166534' }} /> }}
                                />
                            </Box>
                        </Stack>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress size={50} sx={{ color: '#16A34A', mb: 3 }} />
                            <Typography variant="h6" fontWeight={800} gutterBottom>Check your phone</Typography>
                            <Typography variant="body2" color="text.secondary">We've sent a payment prompt to <b>{phoneNumber}</b>. Enter your PIN to complete the purchase.</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
                    {isPolling ? (
                        <Button onClick={handleManualCancel} fullWidth variant="outlined" color="inherit" sx={{ fontWeight: 700 }}>Cancel</Button>
                    ) : (
                        <>
                            <Button onClick={() => setBuyOpen(false)} sx={{ fontWeight: 700 }}>Cancel</Button>
                            <Button variant="contained" onClick={handlePayment} disabled={processing} sx={{ bgcolor: SLATE_DARK, fontWeight: 800, px: 4 }}>
                                {processing ? "Initiating..." : `Pay KES ${resource.price}`}
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
            
            {/* LOGIN PROMPT DIALOG */}
            <Dialog open={loginPrompt} onClose={() => setLoginPrompt(false)} PaperProps={{ sx: { borderRadius: '4px' } }}>
                <DialogTitle sx={{ fontWeight: 900 }}>Account Required</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Please log in to your account to {isFree ? "add this to your library" : "purchase this resource"}. This ensures your downloads are saved forever.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setLoginPrompt(false)} sx={{ fontWeight: 700 }}>Close</Button>
                    <Button onClick={() => navigate('/login')} variant="contained" sx={{ bgcolor: BRAND_BLUE, fontWeight: 800 }}>Sign In Now</Button>
                </DialogActions>
            </Dialog>

            {/* CONSISTENT NOTIFICATION */}
            <AppNotification 
                open={toast.open}
                message={toast.message}
                severity={(toast.severity === 'error' || toast.severity === 'warning') ? 'error' : 'success'}
                onClose={handleCloseToast}
            />
        </Box>
    </ThemeProvider>
  );
};

export default ResourceDetail;