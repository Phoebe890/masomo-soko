import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, Grid, 
  CircularProgress, Snackbar, Alert, Divider, InputAdornment, 
  Container, IconButton, useTheme, useMediaQuery
} from '@mui/material';
import { api } from '@/api/axios';
import SaveIcon from '@mui/icons-material/Save';
import MenuIcon from '@mui/icons-material/Menu';

// Components
import TeacherSidebar from '../../components/TeacherSidebar';

const TeacherSettings = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    // Form State to allow editing
    const [formData, setFormData] = useState({
        displayName: '',
        headline: '',
        bio: '',
        mpesaNumber: ''
    });

    const [toast, setToast] = useState({ open: false, msg: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        // Fetch existing data to populate the form
        api.get('/api/teacher/dashboard')
            .then(res => {
                const p = res.data.profile || {};
                const u = res.data.profile?.user || {};
                
                setFormData({
                    displayName: u.name || '',
                    headline: p.headline || '',
                    bio: p.bio || '',
                    mpesaNumber: p.paymentNumber || ''
                });
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const uploadData = new FormData();
            uploadData.append('bio', formData.bio);
            // Assuming your backend uses 'paymentNumber' field
            uploadData.append('paymentNumber', formData.mpesaNumber);
            // NOTE: If you have a 'headline' field in your backend onboarding API, append it here too
            // uploadData.append('headline', formData.headline); 

            // We use the onboarding endpoint to update details as it usually accepts the same fields
            await api.post('/api/teacher/onboarding', uploadData); 
            setToast({ open: true, msg: 'Profile updated successfully!', severity: 'success' });
        } catch (error) {
            setToast({ open: true, msg: 'Failed to update profile.', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth={false} disableGutters sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA', p: 0 }}>
             <TeacherSidebar 
                selectedRoute="/teacher/settings"
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
            />

            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, md: 4 }, width: '100%' }}>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    {isMobile && <IconButton onClick={() => setSidebarOpen(true)}><MenuIcon /></IconButton>}
                    <Box>
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>Settings</Typography>
                        <Typography variant="body1" color="text.secondary">Manage your profile and financial details.</Typography>
                    </Box>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>
                ) : (
                    <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid #E5E7EB', maxWidth: 800 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Public Profile</Typography>
                        
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth label="Display Name" name="displayName" 
                                    value={formData.displayName} onChange={handleChange} 
                                    disabled 
                                    helperText="Contact support to change your display name"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField 
                                    fullWidth label="Headline" name="headline" 
                                    placeholder="e.g. Senior Math Teacher"
                                    value={formData.headline} onChange={handleChange} 
                                    helperText="A short description that appears on your profile"
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
                                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                                sx={{ fontWeight: 700, borderRadius: 2 }}
                            >
                                Save Changes
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})}>
                <Alert severity={toast.severity} variant="filled">{toast.msg}</Alert>
            </Snackbar>
        </Container>
    );
};

export default TeacherSettings;