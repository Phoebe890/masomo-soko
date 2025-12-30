import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, 
    Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    Stack, Alert, CircularProgress, Snackbar 
} from '@mui/material';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const BACKEND_URL = "http://localhost:8081";

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal State
    const [open, setOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);

    // Toast Notification State
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false,
        message: '',
        severity: 'success'
    });

    const fetchPayouts = () => {
        axios.get(`${BACKEND_URL}/api/admin/payouts`, { withCredentials: true })
            .then(res => setPayouts(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => { fetchPayouts(); }, []);

    const handleOpen = (payout: any, type: 'approve' | 'reject') => {
        setSelectedPayout(payout);
        setActionType(type);
        setNotes('');
        setOpen(true);
    };

    const handleCloseToast = () => {
        setToast({ ...toast, open: false });
    };

    const handleSubmit = async () => {
        if (!selectedPayout) return;
        setProcessing(true);
        try {
            await axios.post(`${BACKEND_URL}/api/admin/payouts/${selectedPayout.id}/${actionType}`, 
                { notes }, 
                { withCredentials: true }
            );
            setOpen(false);
            fetchPayouts();
            setToast({ 
                open: true, 
                message: `Withdrawal ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`, 
                severity: 'success' 
            });
        } catch (e) {
            setToast({ 
                open: true, 
                message: "Action failed. Please try again.", 
                severity: 'error' 
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <AdminSidebar selected="/admin/payouts" />
            <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 4, color: '#111827' }}>Payout Requests</Typography>
                
                <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    {loading ? <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box> : (
                        <Table>
                            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Teacher</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>M-Pesa Number</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {payouts.map((p) => (
                                    <TableRow key={p.id} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{p.teacherName}</TableCell>
                                        <TableCell>KES {p.amount.toLocaleString()}</TableCell>
                                        <TableCell sx={{ fontFamily: 'monospace' }}>{p.mpesaNumber}</TableCell>
                                        <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Chip 
                                                label={p.status} 
                                                size="small" 
                                                color={p.status === 'PENDING' ? 'warning' : p.status === 'PAID' ? 'success' : 'error'}
                                                variant={p.status === 'PENDING' ? 'filled' : 'outlined'}
                                                sx={{ fontWeight: 700 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {p.status === 'PENDING' && (
                                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                                    <Button 
                                                        size="small" 
                                                        variant="contained" 
                                                        color="success" 
                                                        startIcon={<CheckCircleIcon />}
                                                        onClick={() => handleOpen(p, 'approve')}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Pay
                                                    </Button>
                                                    <Button 
                                                        size="small" 
                                                        variant="outlined" 
                                                        color="error" 
                                                        startIcon={<CancelIcon />}
                                                        onClick={() => handleOpen(p, 'reject')}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {payouts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No pending payouts.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Paper>
            </Box>

            {/* CONFIRMATION DIALOG */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {actionType === 'approve' ? 'Confirm Payout' : 'Reject Withdrawal'}
                </DialogTitle>
                <DialogContent>
                    {actionType === 'approve' ? (
                        <>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Please ensure you have manually sent <b>KES {selectedPayout?.amount}</b> to <b>{selectedPayout?.mpesaNumber}</b> before confirming.
                            </Alert>
                            <TextField label="Transaction Code (Optional)" fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} size="small" />
                        </>
                    ) : (
                        <>
                            <Typography sx={{ mb: 2 }}>This will refund the amount back to the teacher's wallet.</Typography>
                            <TextField label="Reason for Rejection" fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} size="small" />
                        </>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        color={actionType === 'approve' ? 'success' : 'error'}
                        disabled={processing}
                    >
                        {processing ? 'Processing...' : actionType === 'approve' ? 'Confirm Paid' : 'Reject Request'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* SNACKBAR NOTIFICATION */}
            <Snackbar 
                open={toast.open} 
                autoHideDuration={4000} 
                onClose={handleCloseToast}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', fontWeight: 600 }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AdminPayouts;