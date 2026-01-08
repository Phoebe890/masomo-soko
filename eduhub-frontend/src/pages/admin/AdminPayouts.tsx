import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, TableContainer,
    Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    Stack, Alert, CircularProgress, Snackbar 
} from '@mui/material';
import { api } from '@/api/axios'; // FIXED: api instance is already configured with baseURL
import AdminLayout from './AdminLayout';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    const [notes, setNotes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
        open: false, message: '', severity: 'success'
    });

    const fetchPayouts = () => {
        // FIXED: Using relative path. Axios handles the domain and credentials.
        api.get('/api/admin/payouts')
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

    const handleSubmit = async () => {
        if (!selectedPayout) return;
        setProcessing(true);
        try {
            // FIXED: Using relative path
            await api.post(`/api/admin/payouts/${selectedPayout.id}/${actionType}`, { notes });
            setOpen(false);
            fetchPayouts();
            setToast({ open: true, message: 'Action processed successfully.', severity: 'success' });
        } catch (e) {
            setToast({ open: true, message: "Action failed.", severity: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AdminLayout title="Payout Requests" selectedRoute="/admin/payouts">
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                {loading ? <Box sx={{ p: 5, textAlign: 'center' }}><CircularProgress /></Box> : (
                    <TableContainer sx={{ overflowX: 'auto' }}>
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Teacher</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>M-Pesa</TableCell>
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
                                                sx={{ fontWeight: 700, borderRadius: 1 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {p.status === 'PENDING' && (
                                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                                    <Button size="small" variant="contained" color="success" onClick={() => handleOpen(p, 'approve')}>Pay</Button>
                                                    <Button size="small" variant="outlined" color="error" onClick={() => handleOpen(p, 'reject')}>Reject</Button>
                                                </Stack>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {payouts.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>No payouts found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>{actionType === 'approve' ? 'Confirm Payout' : 'Reject Request'}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2, mt: 1 }}>
                        {actionType === 'approve' ? `Confirm payment of KES ${selectedPayout?.amount}?` : 'Refund to teacher wallet?'}
                    </Typography>
                    <TextField label="Notes / Transaction Code" fullWidth value={notes} onChange={(e) => setNotes(e.target.value)} size="small" />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color={actionType === 'approve' ? 'success' : 'error'} disabled={processing}>Confirm</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({ ...toast, open: false })}>
                <Alert severity={toast.severity} variant="filled">{toast.message}</Alert>
            </Snackbar>
        </AdminLayout>
    );
};

export default AdminPayouts;