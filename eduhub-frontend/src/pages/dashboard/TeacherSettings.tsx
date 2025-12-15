import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button, Avatar, 
    Divider, Alert, CircularProgress, Stack, 
    List, ListItemButton, ListItemIcon, ListItemText, useTheme, useMediaQuery,
    Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LanguageIcon from '@mui/icons-material/Language';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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

    // Data State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        subjects: '',
        paymentNumber: '',
        isZoomConnected: false,
        profilePicPreview: '',
        grades: [] as string[] // Needed for backend compatibility
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // --- 1. FETCH DATA ---
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/teacher/settings`, { withCredentials: true });
                const { profile, isZoomConnected } = res.data;

                // Handle case where profile might be null (new user)
                setFormData({
                    name: res.data.profile?.user?.name || 'Instructor',
                    email: res.data.profile?.user?.email || '',
                    bio: profile?.bio || '',
                    subjects: profile?.subjects ? profile.subjects.join(', ') : '',
                    paymentNumber: profile?.paymentNumber || '',
                    isZoomConnected: isZoomConnected || false,
                    profilePicPreview: profile?.profilePicPath || '',
                    grades: profile?.grades || [] // Keep existing grades
                });
            } catch (err) {
                console.error("Error loading settings:", err);
                setStatus({ type: 'error', msg: 'Could not load profile data.' });
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    // --- 2. HANDLERS ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setFormData({ ...formData, profilePicPreview: URL.createObjectURL(file) });
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);

        try {
            const data = new FormData();
            
            // Append Fields
            data.append('bio', formData.bio);
            data.append('paymentNumber', formData.paymentNumber);
            
            // Format Subjects Array
            const subjectsArray = formData.subjects.split(',').map(s => s.trim()).filter(s => s !== '');
            data.append('subjects', JSON.stringify(subjectsArray));
            
            // Send Grades (Required by Backend)
            data.append('grades', JSON.stringify(formData.grades));

            // Append File if selected
            if (selectedFile) {
                data.append('profilePic', selectedFile);
            }

            // POST to Backend
            await axios.post(`${BACKEND_URL}/api/teacher/onboarding`, data, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setStatus({ type: 'success', msg: 'Settings saved successfully.' });
        } catch (e: any) {
            console.error(e);
            setStatus({ type: 'error', msg: e.response?.data || 'Failed to save settings.' });
        } finally {
            setSaving(false);
        }
    };

    const handleZoomAction = async () => {
        if (formData.isZoomConnected) {
            if(window.confirm("Disconnect Zoom?")) {
                try {
                    await axios.post(`${BACKEND_URL}/api/teacher/zoom/disconnect`, {}, { withCredentials: true });
                    setFormData(prev => ({ ...prev, isZoomConnected: false }));
                    setStatus({ type: 'success', msg: 'Zoom disconnected.' });
                } catch(e) { console.error(e); }
            }
        } else {
            // This is a redirect, not an AJAX call
            window.location.href = `${BACKEND_URL}/api/auth/zoom/authorize`;
        }
    };

    // --- RENDER ---
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <TeacherSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                selectedRoute="/teacher/settings" 
            />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 } }}>
                <Container maxWidth="lg">
                    
                    {/* Page Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 1 }}>Settings</Typography>
                        <Typography variant="body1" color="text.secondary">Manage your profile, payout methods, and integrations.</Typography>
                    </Box>

                    <Grid container spacing={4}>
                        
                        {/* LEFT MENU (Desktop) */}
                        {!isMobile && (
                            <Grid item md={3}>
                                <List sx={{ p: 0 }}>
                                    {[
                                        { id: 'profile', label: 'Public Profile', icon: <PersonOutlineIcon /> },
                                        { id: 'payout', label: 'Payouts', icon: <AccountBalanceWalletOutlinedIcon /> },
                                        { id: 'integrations', label: 'Integrations', icon: <LanguageIcon /> },
                                        { id: 'security', label: 'Security', icon: <ShieldOutlinedIcon /> },
                                    ].map((item) => (
                                        <ListItemButton 
                                            key={item.id}
                                            selected={activeSection === item.id}
                                            onClick={() => setActiveSection(item.id)}
                                            sx={{ 
                                                borderRadius: 2, 
                                                mb: 0.5,
                                                '&.Mui-selected': { bgcolor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', color: 'primary.main' } 
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

                        {/* RIGHT CONTENT AREA */}
                        <Grid item xs={12} md={9}>
                            <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: 'white', border: '1px solid #E5E7EB' }}>
                                
                                {status && (
                                    <Alert severity={status.type} sx={{ mb: 3, borderRadius: 2 }}>
                                        {status.msg}
                                    </Alert>
                                )}

                                {/* --- PROFILE SECTION --- */}
                                {activeSection === 'profile' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Profile Details</Typography>
                                            <Typography variant="body2" color="text.secondary">This info is visible on your course pages.</Typography>
                                        </Box>
                                        
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <Avatar 
                                                src={formData.profilePicPreview} 
                                                sx={{ width: 80, height: 80, border: '1px solid #eee' }} 
                                            />
                                            <Button variant="outlined" component="label" sx={{ textTransform: 'none', borderRadius: 2 }}>
                                                Change Photo
                                                <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                            </Button>
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Full Name</Typography>
                                                <TextField fullWidth size="small" value={formData.name} disabled />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Email</Typography>
                                                <TextField fullWidth size="small" value={formData.email} disabled />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Bio / Headline</Typography>
                                                <TextField 
                                                    fullWidth multiline rows={4} 
                                                    placeholder="e.g. Senior Math Teacher with 10 years experience..."
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Subjects (Comma separated)</Typography>
                                                <TextField 
                                                    fullWidth size="small" 
                                                    placeholder="Math, English, Science"
                                                    value={formData.subjects}
                                                    onChange={(e) => setFormData({...formData, subjects: e.target.value})}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Stack>
                                )}

                                {/* --- PAYOUT SECTION --- */}
                                {activeSection === 'payout' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Payout Preferences</Typography>
                                            <Typography variant="body2" color="text.secondary">Update where we send your earnings.</Typography>
                                        </Box>

                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, border: '2px solid', borderColor: 'primary.main', bgcolor: '#F0F9FF' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <AccountBalanceWalletOutlinedIcon color="primary" fontSize="large" />
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>Active Method</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {formData.paymentNumber || 'No payment method set'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ flexGrow: 1 }} />
                                                <CheckCircleIcon color="primary" />
                                            </Stack>
                                        </Paper>

                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>M-Pesa Number / Bank Account</Typography>
                                            <TextField 
                                                fullWidth size="small" 
                                                value={formData.paymentNumber}
                                                onChange={(e) => setFormData({...formData, paymentNumber: e.target.value})}
                                                helperText="Format: 0712345678 or BankName:Account"
                                            />
                                        </Box>
                                    </Stack>
                                )}

                                {/* --- INTEGRATIONS SECTION --- */}
                                {activeSection === 'integrations' && (
                                    <Stack spacing={4}>
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>Connected Apps</Typography>
                                        </Box>

                                        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                                <Box sx={{ bgcolor: '#2D8CFF', p: 1, borderRadius: 2 }}>
                                                    <VideocamOutlinedIcon sx={{ color: 'white' }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={700}>Zoom Meetings</Typography>
                                                    <Typography variant="body2" color="text.secondary">Auto-generate links for coaching.</Typography>
                                                </Box>
                                            </Box>
                                            <Button 
                                                variant={formData.isZoomConnected ? "outlined" : "contained"} 
                                                color={formData.isZoomConnected ? "error" : "primary"}
                                                onClick={handleZoomAction}
                                                size="small"
                                            >
                                                {formData.isZoomConnected ? "Disconnect" : "Connect"}
                                            </Button>
                                        </Paper>
                                    </Stack>
                                )}
                                
                                {/* --- SECURITY SECTION --- */}
                                {activeSection === 'security' && (
                                    <Box sx={{ textAlign: 'center', py: 5 }}>
                                        <ShieldOutlinedIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                                        <Typography variant="h6" fontWeight={700} color="text.secondary">Security Settings</Typography>
                                        <Typography variant="body2" color="text.secondary">Password change functionality coming soon.</Typography>
                                    </Box>
                                )}

                                <Divider sx={{ my: 4 }} />

                                {/* FOOTER ACTIONS */}
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                                    <Button variant="text" sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}>Cancel</Button>
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSave}
                                        disabled={saving}
                                        sx={{ 
                                            textTransform: 'none', 
                                            fontWeight: 700, 
                                            borderRadius: 2, 
                                            px: 4, 
                                            boxShadow: 'none',
                                            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
                                        }}
                                    >
                                        {saving ? 'Saving Changes...' : 'Save Changes'}
                                    </Button>
                                </Box>

                            </Paper>

                            {/* DANGER ZONE */}
                            <Box sx={{ mt: 4, p: 3, borderRadius: 3, border: '1px solid #FECACA', bgcolor: '#FEF2F2' }}>
                                <Typography variant="subtitle1" fontWeight={700} color="#991B1B">Danger Zone</Typography>
                                <Typography variant="body2" color="#B91C1C" sx={{ mb: 2 }}>
                                    Deleting your account will remove all your resources and data. This action cannot be undone.
                                </Typography>
                                <Button variant="contained" color="error" size="small" sx={{ textTransform: 'none', boxShadow: 'none', fontWeight: 700 }}>
                                    Delete Account
                                </Button>
                            </Box>

                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
};

export default TeacherSettings;