import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Avatar, 
    List, ListItemButton, ListItemIcon, ListItemText, Alert, CircularProgress, Stack, 
    useTheme, MenuItem, Select, FormControl, InputLabel, useMediaQuery
} from '@mui/material';
import { api } from '@/api/axios';
import TeacherLayout from  '../../components/TeacherLayout';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const BACKEND_URL = "http://localhost:8081";

const TeacherSettings = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // Form States
    const [profileData, setProfileData] = useState({ name: '', email: '', bio: '', subjects: '', grades: [] as string[] });
    const [previewImage, setPreviewImage] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Payout & Security States (Keeping your existing logic)
    const [payoutData, setPayoutData] = useState({ method: 'mpesa', mpesaNumber: '', bankName: '', accountNumber: '' });
    const [securityData, setSecurityData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    // Fetch Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get(`${BACKEND_URL}/api/teacher/settings`, { withCredentials: true });
                const { profile } = res.data;
                
                setProfileData({
                    name: profile?.user?.name || '',
                    email: profile?.user?.email || '',
                    bio: profile?.bio || '',
                    subjects: profile?.subjects ? profile.subjects.join(', ') : '',
                    grades: profile?.grades || []
                });

                // Set Preview Image
                if (profile?.profilePicPath) {
                    setPreviewImage(profile.profilePicPath.startsWith('http') 
                        ? profile.profilePicPath 
                        : `${BACKEND_URL}${profile.profilePicPath}`
                    );
                }

                // ... Payout logic (same as before) ...
                const paymentStr = profile?.paymentNumber || '';
                if (paymentStr.includes(':')) {
                    const parts = paymentStr.split(':');
                    setPayoutData({ method: 'bank', mpesaNumber: '', bankName: parts[0], accountNumber: parts[1] });
                } else {
                    setPayoutData({ method: 'mpesa', mpesaNumber: paymentStr, bankName: '', accountNumber: '' });
                }
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchSettings();
    }, []);

    // Handle File Selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreviewImage(URL.createObjectURL(file)); // Show immediate preview
        }
    };

    // Save Profile
    const handleSaveProfile = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const formData = new FormData();
            formData.append('bio', profileData.bio);
            
            // Handle Subjects
            const subjectsArray = profileData.subjects.split(',').map(s => s.trim()).filter(s => s !== '');
            formData.append('subjects', JSON.stringify(subjectsArray));
            
            // Handle Grades (Required by backend)
            formData.append('grades', JSON.stringify(profileData.grades.length > 0 ? profileData.grades : ["Form 1"])); 

            // Handle Profile Pic
            if (selectedFile) {
                formData.append('profilePic', selectedFile);
            }

            // Keep existing payment number (required by backend DTO)
            const paymentNum = payoutData.method === 'mpesa' ? payoutData.mpesaNumber : `${payoutData.bankName}:${payoutData.accountNumber}`;
            formData.append('paymentNumber', paymentNum);

            // POST to onboarding (which handles updates)
            await api.post(`${BACKEND_URL}/api/teacher/onboarding`, formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatus({ type: 'success', msg: 'Profile updated! Refresh to see changes in sidebar.' });
            
            // Optional: Reload page after 1.5s to update the Sidebar/Layout image
            setTimeout(() => window.location.reload(), 1500);

        } catch (e: any) {
            console.error(e);
            setStatus({ type: 'error', msg: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    // ... (Keep handleSavePayout and handleSaveSecurity from previous code) ...

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <TeacherLayout title="Account Settings" selectedRoute="/teacher/settings">
            <Grid container spacing={4}>
                {/* LEFT MENU */}
                <Grid item xs={12} md={3}>
                    <Paper elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                        <List sx={{ p: 0 }}>
                            {[
                                { id: 'profile', label: 'Public Profile', icon: <PersonOutlineIcon /> },
                                { id: 'payout', label: 'Payouts', icon: <AccountBalanceWalletOutlinedIcon /> },
                                { id: 'security', label: 'Security', icon: <ShieldOutlinedIcon /> },
                            ].map((item) => (
                                <ListItemButton 
                                    key={item.id} selected={activeSection === item.id} onClick={() => { setActiveSection(item.id); setStatus(null); }}
                                    sx={{ 
                                        borderLeft: activeSection === item.id ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                                        bgcolor: activeSection === item.id ? '#F9FAFB' : 'transparent',
                                        '&.Mui-selected': { bgcolor: '#F9FAFB', color: 'primary.main' }
                                    }}
                                >
                                    <ListItemIcon sx={{ color: activeSection === item.id ? 'primary.main' : 'inherit' }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: activeSection === item.id ? 700 : 500 }} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Grid>

                {/* RIGHT CONTENT */}
                <Grid item xs={12} md={9}>
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                        {status && <Alert severity={status.type} sx={{ mb: 3 }}>{status.msg}</Alert>}

                        {/* PROFILE FORM */}
                        {activeSection === 'profile' && (
                            <Stack spacing={3}>
                                <Box><Typography variant="h6" fontWeight={700}>Profile Details</Typography><Typography variant="body2" color="text.secondary">Visible to students.</Typography></Box>
                                
                                <Stack direction="row" spacing={3} alignItems="center">
                                    <Avatar 
                                        src={previewImage} 
                                        sx={{ width: 80, height: 80, border: '1px solid #eee' }} 
                                    />
                                    <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none' }}>
                                        Change Photo
                                        <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                    </Button>
                                </Stack>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}><TextField fullWidth label="Name" value={profileData.name} disabled helperText="Managed by account" /></Grid>
                                    <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={profileData.email} disabled /></Grid>
                                    <Grid item xs={12}><TextField fullWidth label="Bio" multiline rows={4} value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} /></Grid>
                                    <Grid item xs={12}><TextField fullWidth label="Subjects (comma separated)" value={profileData.subjects} onChange={(e) => setProfileData({...profileData, subjects: e.target.value})} /></Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSaveProfile} 
                                        disabled={saving} 
                                        startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                                    >
                                        Save Changes
                                    </Button>
                                </Box>
                            </Stack>
                        )}

                        {/* ... (Include your Payout and Security sections here as before) ... */}
                         {activeSection === 'payout' && (
                            <Stack spacing={3}>
                                <Typography variant="h6" fontWeight={700}>Payout Preferences</Typography>
                                <FormControl fullWidth>
                                    <InputLabel>Payout Method</InputLabel>
                                    <Select value={payoutData.method} label="Payout Method" onChange={(e) => setPayoutData({...payoutData, method: e.target.value})}>
                                        <MenuItem value="mpesa">M-Pesa</MenuItem>
                                        <MenuItem value="bank">Bank Transfer</MenuItem>
                                    </Select>
                                </FormControl>
                                {payoutData.method === 'mpesa' ? (
                                    <TextField fullWidth label="M-Pesa Number" value={payoutData.mpesaNumber} onChange={(e) => setPayoutData({...payoutData, mpesaNumber: e.target.value})} />
                                ) : (
                                    <>
                                        <TextField fullWidth label="Bank Name" value={payoutData.bankName} onChange={(e) => setPayoutData({...payoutData, bankName: e.target.value})} />
                                        <TextField fullWidth label="Account Number" value={payoutData.accountNumber} onChange={(e) => setPayoutData({...payoutData, accountNumber: e.target.value})} />
                                    </>
                                )}
                                 <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="contained" disabled>Save Payouts</Button>
                                </Box>
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </TeacherLayout>
    );
};

export default TeacherSettings;