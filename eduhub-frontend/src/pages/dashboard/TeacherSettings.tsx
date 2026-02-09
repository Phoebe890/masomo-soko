import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  CircularProgress, Snackbar, Alert, Divider, InputAdornment, 
  Avatar, alpha, Stack, createTheme, ThemeProvider, IconButton
} from '@mui/material';
import { api } from '@/api/axios';

// Layout & Icons
import TeacherLayout from '../../components/TeacherLayout';
import { 
    User, CreditCard, Camera, Save, 
    ArrowLeft, Layout, CheckCircle, Info, 
    AtSign, Smartphone 
} from 'lucide-react';

const BRAND_BLUE = '#2563EB';
const BRAND_GREEN = '#10B981';
const BORDER_COLOR = '#E2E8F0';

const settingsTheme = createTheme({
    typography: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    components: {
        MuiTypography: {
            styleOverrides: { root: { fontFamily: "'Plus Jakarta Sans', sans-serif !important" } },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: { borderRadius: '2px', backgroundColor: '#F8FAFC' },
            },
        },
    },
});

const TeacherSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Photo and File state
    const [profilePic, setProfilePic] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

    // Form State
    const [formData, setFormData] = useState({
        displayName: '',
        headline: '',
        bio: '',
        mpesaNumber: ''
    });

    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        api.get('/api/teacher/settings')
            .then(res => {
                const p = res.data.profile || {};
                const u = p.user || {};
                
                setFormData({
                    displayName: u.name || '',
                    headline: p.headline || '',
                    bio: p.bio || '',
                    mpesaNumber: p.paymentNumber || ''
                });
                setProfilePic(p.profilePicPath || '');
            })
            .catch(err => console.error("Failed to load settings", err))
            .finally(() => setLoading(false));
    }, []);

    const getAvatarSrc = () => {
        if (previewUrl) return previewUrl; 
        if (!profilePic) return undefined;
        if (profilePic.startsWith('http')) return profilePic; 
        const cleanPath = profilePic.startsWith('/') ? profilePic.substring(1) : profilePic;
        return `${BACKEND_URL}/${cleanPath}`; 
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const uploadData = new FormData();
            uploadData.append('name', formData.displayName);
            uploadData.append('bio', formData.bio);
            uploadData.append('headline', formData.headline);
            uploadData.append('paymentNumber', formData.mpesaNumber);
            uploadData.append('subjects', JSON.stringify([])); 
            uploadData.append('grades', JSON.stringify([]));

            if (selectedFile) {
                uploadData.append('profilePic', selectedFile);
            }

            const response = await api.post('/api/teacher/onboarding', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.profilePicPath) {
                setProfilePic(response.data.profilePicPath);
                setPreviewUrl('');
                setSelectedFile(null);
            }

            setToast({ open: true, msg: 'Profile updated successfully!', severity: 'success' });
        } catch (error) {
            setToast({ open: true, msg: 'Failed to update profile.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <ThemeProvider theme={settingsTheme}>
            <TeacherLayout title="Settings" selectedRoute="/teacher/settings">
                
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 15 }}>
                        <CircularProgress size={30} sx={{ color: BRAND_BLUE }} />
                        <Typography variant="caption" sx={{ mt: 2, fontWeight: 700, color: 'text.secondary' }}>LOADING PREFERENCES...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 5, animation: 'fadeIn 0.5s ease-out' }}>
                        
                        {/* HEADER */}
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>Account Settings</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Update your profile information and payout preferences.</Typography>
                        </Box>

                        <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
                            
                            {/* SECTION 1: IDENTITY */}
                            <Box sx={{ mb: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, borderRadius: '2px', width: 32, height: 32 }}>
                                        <User size={18} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Public Identity</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                                    <Box sx={{ position: 'relative' }}>
                                        <Avatar 
                                            src={getAvatarSrc()} 
                                            sx={{ width: 100, height: 100, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, bgcolor: '#F8FAFC' }} 
                                        />
                                        <IconButton 
                                            component="label"
                                            sx={{ 
                                                position: 'absolute', bottom: -10, right: -10, bgcolor: '#0F172A', color: 'white', 
                                                '&:hover': { bgcolor: '#1E293B' }, width: 32, height: 32, border: '2px solid white'
                                            }}
                                        >
                                            <Camera size={16} />
                                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) { setSelectedFile(file); setPreviewUrl(URL.createObjectURL(file)); }
                                            }} />
                                        </IconButton>
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Profile Photo</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, maxWidth: 300 }}>
                                            This will be displayed on your store page and resource listings.
                                        </Typography>
                                        {previewUrl && (
                                            <Button size="small" variant="outlined" color="error" sx={{ borderRadius: '2px', textTransform: 'none', fontWeight: 700 }} onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}>
                                                Cancel Changes
                                            </Button>
                                        )}
                                    </Box>
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>FULL DISPLAY NAME</Typography>
                                        <TextField 
                                            fullWidth name="displayName" value={formData.displayName} onChange={handleChange}
                                            placeholder="John Doe"
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>PROFESSIONAL HEADLINE</Typography>
                                        <TextField 
                                            fullWidth name="headline" value={formData.headline} onChange={handleChange} 
                                            placeholder="e.g. Senior Mathematics Teacher"
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>BIO / DESCRIPTION</Typography>
                                        <TextField 
                                            fullWidth multiline rows={4} name="bio" value={formData.bio} onChange={handleChange} 
                                            placeholder="Tell students about your experience and teaching style..."
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ mb: 6 }} />

                            {/* SECTION 2: PAYOUTS */}
                            <Box sx={{ mb: 6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Avatar sx={{ bgcolor: alpha(BRAND_GREEN, 0.1), color: BRAND_GREEN, borderRadius: '2px', width: 32, height: 32 }}>
                                        <CreditCard size={18} />
                                    </Avatar>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Financial Details</Typography>
                                </Box>

                                <Grid container spacing={3}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>M-PESA PAYOUT NUMBER</Typography>
                                        <TextField 
                                            fullWidth name="mpesaNumber" value={formData.mpesaNumber} onChange={handleChange}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><Smartphone size={16} style={{marginRight: 8}} /> +254</InputAdornment> }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ p: 2.5, bgcolor: alpha(BRAND_GREEN, 0.05), border: `1px solid ${alpha(BRAND_GREEN, 0.1)}`, borderRadius: '2px', display: 'flex', gap: 2 }}>
                                            <Info size={20} color={BRAND_GREEN} style={{ flexShrink: 0 }} />
                                            <Typography variant="caption" sx={{ fontWeight: 500, color: '#065F46' }}>
                                                Earnings are automatically settled to this M-Pesa number. Ensure the number is active to avoid payout delays.
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Box>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={handleSave} 
                                    disabled={saving}
                                    sx={{ 
                                        fontWeight: 800, borderRadius: '2px', px: 5, py: 1.5,
                                        bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' },
                                        boxShadow: 'none', transition: '0.2s'
                                    }}
                                >
                                    {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                                </Button>
                            </Box>

                        </Paper>
                    </Box>
                )}

                <Snackbar 
                    open={toast.open} autoHideDuration={4000} 
                    onClose={() => setToast({...toast, open: false})}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={toast.severity} variant="filled" sx={{ borderRadius: '2px', fontWeight: 700 }}>
                        {toast.msg}
                    </Alert>
                </Snackbar>
            </TeacherLayout>
        </ThemeProvider>
    );
};

export default TeacherSettings;