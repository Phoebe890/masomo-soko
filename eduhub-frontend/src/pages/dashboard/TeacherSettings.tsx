import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  CircularProgress, Snackbar, Alert, Divider, InputAdornment, 
  Avatar
} from '@mui/material';
import { api } from '@/api/axios';

// Layout Component
import TeacherLayout from '../../components/TeacherLayout';

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
        // Fetch current settings
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

    // Helper to determine which image to show
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
        <TeacherLayout title="Settings" selectedRoute="/teacher/settings">
            {/* 
                TeacherLayout provides the Topbar, Sidebar, and correct spacing.
                We removed the manual Header Box because "Settings" is now in the Topbar.
            */}
            
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
            ) : (
                <Paper elevation={0} sx={{ p: { xs: 2, md: 4 }, borderRadius: 4, border: '1px solid #E5E7EB', maxWidth: 800, mx: 'auto' }}>
                    
                    {/* PROFILE PICTURE SECTION */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                        <Avatar 
                            src={getAvatarSrc()} 
                            sx={{ width: 100, height: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', bgcolor: '#f1f5f9' }} 
                        />
                        <Box>
                            <Typography variant="h6" fontWeight={700}>Profile Picture</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                {previewUrl ? "Unsaved changes" : "PNG, JPG or GIF (max. 2MB)"}
                            </Typography>
                            
                            <input
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="profile-pic-upload"
                                type="file"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setSelectedFile(file);
                                        setPreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            <label htmlFor="profile-pic-upload">
                                <Button variant="outlined" component="span" size="small" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                                    Change Photo
                                </Button>
                            </label>
                            
                            {previewUrl && (
                                <Button 
                                    variant="text" color="error" size="small" sx={{ ml: 1, textTransform: 'none' }}
                                    onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                                >
                                    Cancel
                                </Button>
                            )}
                        </Box>
                    </Box>

                    <Divider sx={{ my: 4 }} />

                    {/* PUBLIC PROFILE SECTION */}
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Public Profile</Typography>
                    
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth label="Display Name" name="displayName" 
                                value={formData.displayName} disabled 
                                helperText="Contact support to change your display name"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth label="Headline" name="headline" 
                                placeholder="e.g. Senior Math Teacher"
                                value={formData.headline} onChange={handleChange} 
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField 
                                fullWidth multiline rows={4} label="Bio" name="bio" 
                                placeholder="Tell students about yourself..."
                                value={formData.bio} onChange={handleChange} 
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 4 }} />

                    {/* FINANCIAL DETAILS SECTION */}
                    <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Financial Details</Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField 
                                fullWidth label="M-Pesa Number" name="mpesaNumber" 
                                value={formData.mpesaNumber} onChange={handleChange}
                                placeholder="712345678"
                                InputProps={{ startAdornment: <InputAdornment position="start">+254</InputAdornment> }}
                                helperText="This number will be used for payouts"
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 4 }}>
                        <Button 
                            variant="contained" 
                            size="large"
                            onClick={handleSave} 
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={20} color="inherit"/> : null}
                            sx={{ 
                                fontWeight: 700, 
                                borderRadius: 2,
                                px: 4,
                                bgcolor: '#43B02A', 
                                '&:hover': { bgcolor: '#388E3C' },
                                '&.Mui-disabled': { bgcolor: '#A5D6A7', color: 'white' }
                            }}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Paper>
            )}

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})}>
                <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
            </Snackbar>
        </TeacherLayout>
    );
};

export default TeacherSettings;