import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, CircularProgress, Paper, Avatar, Grid, Dialog, 
  DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Divider, 
  Stack, Rating, Chip, Container, Breadcrumbs, Link
} from '@mui/material';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import VerifiedIcon from '@mui/icons-material/Verified';

const paymentMethods = [
  { label: 'M-Pesa (Mobile Money)', value: 'mpesa' },
  { label: 'Credit / Debit Card', value: 'card' },
];

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<any>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processing, setProcessing] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('email')); // Or better check role cookie

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

  // --- HANDLERS ---
  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setLoginPrompt(true);
      return;
    }
    setBuyOpen(true);
  };

  const handlePayment = () => {
    setProcessing(true);
    
    // Using fetch with credentials: 'include' sends the JSESSIONID cookie
    // This authenticates the user on the backend without sending email in body
    fetch('http://localhost:8081/api/student/purchase', {
      method: 'POST',
      credentials: 'include', // <--- CRITICAL FIX
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `resourceId=${encodeURIComponent(id || '')}`
    })
    .then(async res => {
      setProcessing(false);
      if (res.ok) {
        setBuyOpen(false);
        navigate('/purchase-confirmation'); // Ensure you have this route or change to dashboard
      } else {
        const errorText = await res.text();
        alert(errorText || 'Purchase failed.');
      }
    })
    .catch(() => {
      setProcessing(false);
      alert('Network error during purchase.');
    });
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 20 }}><CircularProgress /></Box>;
  if (!resource) return <Typography sx={{ mt: 10, textAlign: 'center' }}>Resource not found.</Typography>;

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 10 }}>
        
        {/* 1. HEADER / BREADCRUMBS */}
        <Box sx={{ borderBottom: '1px solid #eee', py: 2 }}>
            <Container maxWidth="lg">
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" href="/" sx={{ fontSize: '0.9rem' }}>Home</Link>
                    <Link underline="hover" color="inherit" href="/browse" sx={{ fontSize: '0.9rem' }}>{resource.subject || "Resources"}</Link>
                    <Typography color="text.primary" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>{resource.title}</Typography>
                </Breadcrumbs>
            </Container>
        </Box>

        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Grid container spacing={6}>
                
                {/* 2. LEFT COLUMN: IMAGES & DESCRIPTION */}
                <Grid item xs={12} md={8}>
                    
                    {/* Hero Image / Preview */}
                    <Box sx={{ 
                        bgcolor: '#F3F4F6', 
                        borderRadius: 4, 
                        overflow: 'hidden', 
                        mb: 4,
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        position: 'relative',
                        minHeight: 300,
                        border: '1px solid #E5E7EB'
                    }}>
                         {resource.previewImageUrl ? (
                             <img 
                                src={resource.previewImageUrl} 
                                alt={resource.title} 
                                style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }} 
                             />
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

                    {/* Title & Metadata */}
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

                    {/* Teacher Info */}
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
                        <Avatar sx={{ width: 56, height: 56, bgcolor: '#111827' }}>
                            {resource.teacherName?.[0] || 'T'}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                Created by {resource.teacherName || 'Instructor'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Verified Teacher • Last updated {new Date().toLocaleDateString()}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Description Content */}
                    <Box sx={{ mb: 6 }}>
                        <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>About this resource</Typography>
                        <Typography variant="body1" sx={{ color: '#4B5563', lineHeight: 1.8, fontSize: '1.05rem' }}>
                            {resource.description}
                        </Typography>
                    </Box>

                    {/* Reviews Section */}
                    <Box>
                         <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Student Reviews</Typography>
                         {(resource.reviews || []).length === 0 ? (
                             <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: 'center', bgcolor: '#F9FAFB', border: 'none' }}>
                                 <Typography color="text.secondary">No reviews yet. Be the first to review!</Typography>
                             </Paper>
                         ) : (
                             resource.reviews.map((rev: any, idx: number) => (
                                 <Box key={idx} sx={{ mb: 3, pb: 3, borderBottom: '1px solid #eee' }}>
                                     <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
                                         <Avatar sx={{ width: 40, height: 40, bgcolor: '#E5E7EB', color: '#666', fontSize: '0.9rem' }}>
                                             {rev.studentName?.[0]}
                                         </Avatar>
                                         <Box>
                                             <Typography variant="subtitle2" fontWeight={700}>{rev.studentName}</Typography>
                                             <Stack direction="row" spacing={1} alignItems="center">
                                                <Rating value={rev.rating} readOnly size="small" />
                                             </Stack>
                                         </Box>
                                     </Stack>
                                     <Typography variant="body2" color="text.secondary" sx={{ ml: 7 }}>
                                         "{rev.comment}"
                                     </Typography>
                                 </Box>
                             ))
                         )}
                    </Box>

                </Grid>

                {/* 3. RIGHT COLUMN: STICKY BUY WIDGET */}
                <Grid item xs={12} md={4}>
                    <Box sx={{ position: 'sticky', top: 100 }}>
                        <Paper elevation={0} sx={{ 
                            p: 4, 
                            borderRadius: 4, 
                            border: '1px solid #E5E7EB',
                            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)' 
                        }}>
                            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
                                <Typography variant="h3" fontWeight={800} color="#111827">
                                    KES {resource.price || 0}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                    One-time payment
                                </Typography>
                            </Stack>

                            <Button 
                                variant="contained" 
                                fullWidth 
                                size="large" 
                                onClick={handleBuyNow}
                                sx={{ 
                                    py: 1.8, 
                                    borderRadius: 3, 
                                    fontWeight: 700, 
                                    fontSize: '1rem',
                                    mb: 2,
                                    textTransform: 'none',
                                    boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)'
                                }}
                            >
                                Buy Now
                            </Button>

                            <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ mb: 3 }}>
                                30-Day Money-Back Guarantee
                            </Typography>

                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <CheckCircleIcon color="success" fontSize="small" />
                                    <Typography variant="body2">Instant Download</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <CheckCircleIcon color="success" fontSize="small" />
                                    <Typography variant="body2">Full Lifetime Access</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <VerifiedIcon color="primary" fontSize="small" />
                                    <Typography variant="body2">Quality Checked</Typography>
                                </Stack>
                            </Stack>

                            <Divider sx={{ my: 3 }} />
                            
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" color="text.secondary">
                                <LockIcon fontSize="small" />
                                <Typography variant="caption" fontWeight={600}>Secure Payment via M-Pesa</Typography>
                            </Stack>
                        </Paper>
                    </Box>
                </Grid>
            </Grid>
        </Container>

        {/* --- DIALOGS (Login / Buy) --- */}
        <Dialog 
            open={buyOpen} 
            onClose={() => setBuyOpen(false)} 
            maxWidth="xs" 
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
            <DialogTitle sx={{ fontWeight: 800 }}>Checkout</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Securely pay for <b>{resource.title}</b>
                </Typography>
                <TextField
                    select
                    label="Choose Payment Method"
                    fullWidth
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    sx={{ mb: 2 }}
                >
                    {paymentMethods.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    ))}
                </TextField>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={() => setBuyOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>Cancel</Button>
                <Button 
                    variant="contained" 
                    onClick={handlePayment} 
                    disabled={processing}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 700, boxShadow: 'none' }}
                >
                    {processing ? "Processing..." : `Pay KES ${resource.price}`}
                </Button>
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

    </Box>
  );
};

export default ResourceDetail;