import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, Grid, CircularProgress, Alert, Avatar, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios'; // FIXED: Use Axios instance
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DisconnectIcon from '@mui/icons-material/LinkOff';
import InfoIcon from '@mui/icons-material/Info';

const TeacherSettings = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [zoomConnected, setZoomConnected] = useState(false);
    const [connectionStatusChecked, setConnectionStatusChecked] = useState(false);
    const [disconnectDialogOpen, setDisconnectDialogOpen] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // FIXED: Dynamic Zoom Redirect URI
    const handleZoomConnect = () => {
        const clientID = '8YDG3EW2S0aVSE9PrveiNQ';
        // Gets the backend URL from your Axios base or environment
        const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:8081';
        const redirectUri = `${backendBase}/api/auth/zoom/callback`; 
        
        const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
        window.location.href = zoomAuthUrl;
    };

    const handleZoomDisconnect = async () => {
        setDisconnecting(true);
        try {
            // FIXED: Using relative path via axios instance
            await api.post('/api/teacher/zoom/disconnect');
            setZoomConnected(false);
            setMessage({ type: 'success', text: 'Zoom account disconnected successfully!' });
            setDisconnectDialogOpen(false);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to disconnect Zoom account' });
        } finally {
            setDisconnecting(false);
        }
    };
    
    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('zoom_connected') === 'true') {
            setZoomConnected(true);
            setMessage({ type: 'success', text: 'Zoom account connected successfully!' });
        }
    }, []);

    useEffect(() => {
        const fetchTeacherData = async () => {
            setLoading(true);
            try {
                // FIXED: Using relative path via axios instance
                const response = await api.get('/api/teacher/settings');
                const data = response.data;
                setProfile(data.profile);
                setZoomConnected(data.isZoomConnected);
                setConnectionStatusChecked(true);
            } catch (error) {
                console.error("Error fetching teacher settings:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacherData();
    }, []);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button onClick={() => navigate('/dashboard/teacher')} sx={{ mb: 2 }}>
                ← Back to Dashboard
            </Button>
            <Typography variant="h4" fontWeight={700} gutterBottom>Account Settings</Typography>

            {message && (<Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message.text}</Alert>)}

            {loading ? (<CircularProgress />) : (
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>My Profile</Typography>
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar src={profile?.profilePicPath || ''} sx={{ width: 80, height: 80 }} />
                                <Box>
                                    <Typography variant="h5">{profile?.user?.name}</Typography>
                                    <Typography color="text.secondary">{profile?.user?.email}</Typography>
                                </Box>
                            </Box>
                            <Typography sx={{mt: 2}}><strong>Bio:</strong> {profile?.bio}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3, borderRadius: 2 }}>
                            <Typography variant="h6" gutterBottom>Integrations</Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <img src="https://seeklogo.com/images/Z/zoom-logo-EFF5D37265-seeklogo.com.png" alt="Zoom logo" style={{ width: '40px', height: '40px' }} />
                                    <Box>
                                        <Typography fontWeight="600">Zoom</Typography>
                                        <Typography variant="body2" color="text.secondary">Connect your Zoom account to automatically create meetings.</Typography>
                                    </Box>
                                </Box>
                                {connectionStatusChecked && (
                                    zoomConnected ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                                                <CheckCircleIcon /><Typography fontWeight="600">Connected</Typography>
                                            </Box>
                                            <Button variant="outlined" color="error" startIcon={<DisconnectIcon />} onClick={() => setDisconnectDialogOpen(true)}>Disconnect</Button>
                                        </Box>
                                    ) : (
                                        <Button variant="contained" color="primary" onClick={handleZoomConnect}>Connect to Zoom</Button>
                                    )
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            <Dialog open={disconnectDialogOpen} onClose={() => setDisconnectDialogOpen(false)}>
                <DialogTitle>Disconnect Zoom Account</DialogTitle>
                <DialogContent><Typography>Are you sure you want to disconnect your Zoom account?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setDisconnectDialogOpen(false)} disabled={disconnecting}>Cancel</Button>
                    <Button onClick={handleZoomDisconnect} color="error" variant="contained" disabled={disconnecting}>
                        {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};
export default TeacherSettings;