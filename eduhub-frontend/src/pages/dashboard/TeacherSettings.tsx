import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Avatar, 
    Divider, Alert, CircularProgress, Stack, 
    List, ListItemButton, ListItemIcon, ListItemText, useTheme, useMediaQuery,
    Container, InputAdornment, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Sidebar
import TeacherSidebar from './TeacherSidebar';

const BACKEND_URL = "http://localhost:8081";

const TeacherSettings: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();

    // UI State
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    // --- FORM DATA STATE ---
    
    // 1. Profile Data
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        bio: '',
        subjects: '', // Comma separated string for display
        grades: [] as string[],
        profilePicPreview: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 2. Payout Data
    const [payoutData, setPayoutData] = useState({
        method: 'mpesa', // 'mpesa' or 'bank'
        mpesaNumber: '',
        bankName: '',
        accountNumber: ''
    });

    // 3. Security Data
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // --- FETCH SETTINGS ---
    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/api/teacher/settings`, { withCredentials: true });
            const { profile } = res.data;

            // 1. Set Profile Data
            setProfileData({
                name: profile?.user?.name || 'Instructor',
                email: profile?.user?.email || '',
                bio: profile?.bio || '',
                subjects: profile?.subjects ? profile.subjects.join(', ') : '',
                grades: profile?.grades || [],
                profilePicPreview: profile?.profilePicPath || '',
            });

            // 2. Parse Payout Data from the single 'paymentNumber' field
            // Format assumed from backend: "BankName:Account" OR "07123..."
            const paymentStr = profile?.paymentNumber || '';
            if (paymentStr.includes(':')) {
                const parts = paymentStr.split(':');
                setPayoutData({
                    method: 'bank',
                    mpesaNumber: '',
                    bankName: parts[0] || '',
                    accountNumber: parts[1] || ''
                });
            } else {
                setPayoutData({
                    method: 'mpesa',
                    mpesaNumber: paymentStr,
                    bankName: '',
                    accountNumber: ''
                });
            }

        } catch (err) {
            console.error("Error loading settings:", err);
            // Don't show error to user immediately, just log it
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setProfileData({ ...profileData, profilePicPreview: URL.createObjectURL(file) });
        }
    };

    // 1. SAVE PROFILE
    const handleSaveProfile = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const data = new FormData();
            data.append('bio', profileData.bio);
            
            // Convert "Math, Science" string -> JSON Array ["Math", "Science"]
            const subjectsArray = profileData.subjects.split(',').map(s => s.trim()).filter(s => s !== '');
            data.append('subjects', JSON.stringify(subjectsArray));
            
            // Pass grades (required by backend)
            data.append('grades', JSON.stringify(profileData.grades));
            
            // Pass existing payment number so it doesn't get wiped
            // We reconstruct it based on current payout state
            const paymentNum = payoutData.method === 'mpesa' 
                ? payoutData.mpesaNumber 
                : `${payoutData.bankName}:${payoutData.accountNumber}`;
            data.append('paymentNumber', paymentNum);

            if (selectedFile) {
                data.append('profilePic', selectedFile);
            }

            // Using /onboarding endpoint as it acts as updateProfile in your controller
            await axios.post(`${BACKEND_URL}/api/teacher/onboarding`, data, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatus({ type: 'success', msg: 'Profile updated successfully.' });
        } catch (e: any) {
            setStatus({ type: 'error', msg: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    // 2. SAVE PAYOUT
    const handleSavePayout = async () => {
        setSaving(true);
        setStatus(null);
        
        // Basic Validation
        if (payoutData.method === 'mpesa' && !payoutData.mpesaNumber) {
            setStatus({ type: 'error', msg: 'Please enter M-Pesa number' });
            setSaving(false);
            return;
        }
        if (payoutData.method === 'bank' && (!payoutData.bankName || !payoutData.accountNumber)) {
            setStatus({ type: 'error', msg: 'Please enter Bank details' });
            setSaving(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('method', payoutData.method);
            if (payoutData.method === 'mpesa') {
                formData.append('mpesa', payoutData.mpesaNumber);
            } else {
                formData.append('bank', payoutData.bankName);
                formData.append('account', payoutData.accountNumber);
            }

            await axios.post(`${BACKEND_URL}/api/teacher/payout`, formData, { withCredentials: true });
            setStatus({ type: 'success', msg: 'Payout details saved.' });
        } catch (e) {
            setStatus({ type: 'error', msg: 'Failed to save payout details.' });
        } finally {
            setSaving(false);
        }
    };

    // 3. SAVE SECURITY (Password)
    const handleSaveSecurity = async () => {
        setSaving(true);
        setStatus(null);

        if (securityData.newPassword !== securityData.confirmPassword) {
            setStatus({ type: 'error', msg: 'New passwords do not match.' });
            setSaving(false);
            return;
        }

        try {
            // Note: This requires a /api/auth/change-password endpoint in your backend
            await axios.post(`${BACKEND_URL}/api/auth/change-password`, {
                currentPassword: securityData.currentPassword,
                newPassword: securityData.newPassword
            }, { withCredentials: true });

            setStatus({ type: 'success', msg: 'Password changed successfully.' });
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (e: any) {
            setStatus({ type: 'error', msg: e.response?.data?.message || 'Failed to change password. Backend endpoint may be missing.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <TeacherSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                selectedRoute="/dashboard/teacher/settings" 
            />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 } }}>
                <Container maxWidth="lg">
                    
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 1 }}>Settings</Typography>
                        <Typography variant="body1" color="text.secondary">Manage your profile, payout methods, and security.</Typography>
                    </Box>

                    <Grid container spacing={4}>
                        
                        {/* LEFT MENU */}
                        {!isMobile && (
                            <Grid item md={3}>
                                <List sx={{ p: 0 }}>
                                    {[
                                        { id: 'profile', label: 'Public Profile', icon: <PersonOutlineIcon /> },
                                        { id: 'payout', label: 'Payouts', icon: <AccountBalanceWalletOutlinedIcon /> },
                                        { id: 'security', label: 'Security', icon: <ShieldOutlinedIcon /> },
                                        { id: 'integrations', label: 'Integrations', icon: <LanguageIcon /> }, // Visual Only
                                    ].map((item) => (
                                        <ListItemButton 
                                            key={item.id}
                                            selected={activeSection === item.id}
                                            onClick={() => { setActiveSection(item.id); setStatus(null); }}
                                            sx={{ 
                                                borderRadius: 2, mb: 0.5,
                                                '&.Mui-selected': { bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: 'primary.main', borderLeft: '4px solid', borderColor: 'primary.main' } 
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 38, color: activeSection === item.id ? 'primary.main' : 'text.secondary' }}>
                                                {item.icon}
                                            </ListItemIcon>
                                            <ListItemText 
                                                primary={item.label} 
                                                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: activeSection === item.id ? 700 : 500 }} 
                                            />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Grid>
                        )}

                        {/* RIGHT CONTENT */}
                        <Grid item xs={12} md={9}>
                            <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: 'white', border: '1px solid #E5E7EB' }}>
                                
                                {status && (
                                    <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setStatus(null)}>
                                        {status.msg}
                                    </Alert>
                                )}

                                {/* --- 1. PROFILE SECTION --- */}
                                {activeSection === 'profile' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Profile Details</Typography>
                                            <Typography variant="body2" color="text.secondary">This info is visible on your course pages.</Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Avatar 
                                                src={profileData.profilePicPreview} 
                                                sx={{ width: 80, height: 80, border: '1px solid #eee' }} 
                                            />
                                            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                                Upload New Photo
                                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                            </Button>
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth label="Full Name" size="small" 
                                                    value={profileData.name} disabled 
                                                    helperText="Managed by account settings"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth label="Email" size="small" 
                                                    value={profileData.email} disabled 
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField 
                                                    fullWidth label="Bio" multiline rows={4} 
                                                    value={profileData.bio}
                                                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                                                    helperText="Tell students about your experience."
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField 
                                                    fullWidth label="Subjects" size="small" 
                                                    value={profileData.subjects}
                                                    onChange={(e) => setProfileData({...profileData, subjects: e.target.value})}
                                                    helperText="Separate with commas (e.g. Math, Physics)"
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                variant="contained" 
                                                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                            >
                                                Save Profile
                                            </Button>
                                        </Box>
                                    </Stack>
                                )}

                                {/* --- 2. PAYOUT SECTION --- */}
                                {activeSection === 'payout' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Payout Preferences</Typography>
                                            <Typography variant="body2" color="text.secondary">Choose how you want to receive payments.</Typography>
                                        </Box>

                                        <FormControl fullWidth>
                                            <InputLabel>Payout Method</InputLabel>
                                            <Select
                                                value={payoutData.method}
                                                label="Payout Method"
                                                onChange={(e) => setPayoutData({...payoutData, method: e.target.value})}
                                            >
                                                <MenuItem value="mpesa">M-Pesa Mobile Money</MenuItem>
                                                <MenuItem value="bank">Bank Transfer</MenuItem>
                                            </Select>
                                        </FormControl>

                                        {payoutData.method === 'mpesa' ? (
                                            <TextField 
                                                fullWidth label="M-Pesa Number"
                                                value={payoutData.mpesaNumber}
                                                onChange={(e) => setPayoutData({...payoutData, mpesaNumber: e.target.value})}
                                                InputProps={{ startAdornment: <InputAdornment position="start">+254</InputAdornment> }}
                                            />
                                        ) : (
                                            <Stack spacing={3}>
                                                <TextField 
                                                    fullWidth label="Bank Name" 
                                                    placeholder="e.g. Equity Bank"
                                                    value={payoutData.bankName}
                                                    onChange={(e) => setPayoutData({...payoutData, bankName: e.target.value})}
                                                />
                                                <TextField 
                                                    fullWidth label="Account Number" 
                                                    value={payoutData.accountNumber}
                                                    onChange={(e) => setPayoutData({...payoutData, accountNumber: e.target.value})}
                                                />
                                            </Stack>
                                        )}

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                variant="contained" 
                                                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                                                onClick={handleSavePayout}
                                                disabled={saving}
                                            >
                                                Save Payout Details
                                            </Button>
                                        </Box>
                                    </Stack>
                                )}

                                {/* --- 3. SECURITY SECTION --- */}
                                {activeSection === 'security' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Security</Typography>
                                            <Typography variant="body2" color="text.secondary">Update your password.</Typography>
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField 
                                                    fullWidth type="password" label="Current Password" 
                                                    value={securityData.currentPassword}
                                                    onChange={(e) => setSecurityData({...securityData, currentPassword: e.target.value})}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth type="password" label="New Password" 
                                                    value={securityData.newPassword}
                                                    onChange={(e) => setSecurityData({...securityData, newPassword: e.target.value})}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth type="password" label="Confirm New Password" 
                                                    value={securityData.confirmPassword}
                                                    onChange={(e) => setSecurityData({...securityData, confirmPassword: e.target.value})}
                                                />
                                            </Grid>
                                        </Grid>

                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <Button 
                                                variant="contained" color="primary"
                                                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SaveIcon />}
                                                onClick={handleSaveSecurity}
                                                disabled={saving}
                                            >
                                                Update Password
                                            </Button>
                                        </Box>
                                    </Stack>
                                )}

                                {/* --- 4. INTEGRATIONS (Visual Only) --- */}
                                {activeSection === 'integrations' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Integrations</Typography>
                                            <Typography variant="body2" color="text.secondary">Third-party tools connected to your account.</Typography>
                                        </Box>

                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <Box sx={{ bgcolor: '#2D8CFF', p: 1, borderRadius: 2 }}>
                                                    <VideocamOutlinedIcon sx={{ color: 'white' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>Zoom Meetings</Typography>
                                                    <Typography variant="body2" color="text.secondary">Enable live classes and coaching sessions.</Typography>
                                                </Box>
                                            </Box>
                                            <Button variant="outlined" disabled>Coming Soon</Button>
                                        </Paper>
                                    </Stack>
                                )}

                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default TeacherSettings;