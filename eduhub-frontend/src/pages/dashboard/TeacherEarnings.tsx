import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, CircularProgress, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    Alert, Snackbar, Container
} from '@mui/material';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import HistoryIcon from '@mui/icons-material/History';

const BACKEND_URL = "http://localhost:8081";

const TeacherEarnings = () => {
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0.0);
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    const [mobileOpen, setMobileOpen] = useState(false);
    
    // Withdrawal Dialog
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success'|'error' }>({ open: false, msg: '', type: 'success' });

    // --- FETCH DATA ---
    const fetchWallet = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${BACKEND_URL}/api/wallet/summary`, { withCredentials: true });
            setBalance(res.data.balance || 0.0);
            setMpesaNumber(res.data.mpesaNumber || '');
            setHistory(res.data.history || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    // --- HANDLERS ---
    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount < 50) {
            setToast({ open: true, msg: "Minimum withdrawal is KES 50", type: 'error' });
            return;
        }
        if (amount > balance) {
            setToast({ open: true, msg: "Insufficient funds", type: 'error' });
            return;
        }

        setProcessing(true);
        try {
            const params = new URLSearchParams();
            params.append('amount', amount.toString());
            
            await axios.post(`${BACKEND_URL}/api/wallet/withdraw`, params, { withCredentials: true });
            
            setToast({ open: true, msg: "Withdrawal request submitted!", type: 'success' });
            setWithdrawOpen(false);
            setWithdrawAmount('');
            fetchWallet(); // Refresh data
        } catch (err: any) {
            setToast({ open: true, msg: err.response?.data || "Failed to withdraw", type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <TeacherSidebar selectedRoute="/teacher/earnings" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 } }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 4, color: '#111827' }}>
                        Earnings & Payouts
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
                    ) : (
                        <Grid container spacing={4}>
                            {/* --- BALANCE CARD --- */}
                            <Grid item xs={12} md={5}>
                                <Paper elevation={0} sx={{ 
                                    p: 4, borderRadius: 4, 
                                    background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                                    color: 'white', position: 'relative', overflow: 'hidden'
                                }}>
                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600, mb: 1 }}>AVAILABLE BALANCE</Typography>
                                        <Typography variant="h2" fontWeight={800} sx={{ mb: 3 }}>KES {balance.toLocaleString()}</Typography>
                                        
                                        <Button 
                                            variant="contained" 
                                            onClick={() => setWithdrawOpen(true)}
                                            startIcon={<RequestQuoteIcon />}
                                            sx={{ 
                                                bgcolor: 'white', color: '#0F172A', 
                                                fontWeight: 700, borderRadius: 50, px: 3,
                                                '&:hover': { bgcolor: '#F1F5F9' }
                                            }}
                                        >
                                            Withdraw Funds
                                        </Button>
                                    </Box>
                                    {/* Decoration */}
                                    <AccountBalanceWalletIcon sx={{ position: 'absolute', right: -20, bottom: -20, fontSize: 180, opacity: 0.1 }} />
                                </Paper>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary">PAYOUT METHOD</Typography>
                                    <Paper elevation={0} sx={{ p: 2, mt: 1, borderRadius: 3, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 40, height: 40, bgcolor: '#DCFCE7', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#166534', fontWeight: 800 }}>M</Box>
                                        <Box>
                                            <Typography fontWeight={600}>M-Pesa</Typography>
                                            <Typography variant="caption" color="text.secondary">{mpesaNumber || "No number set"}</Typography>
                                        </Box>
                                    </Paper>
                                </Box>
                            </Grid>

                            {/* --- HISTORY TABLE --- */}
                            <Grid item xs={12} md={7}>
                                <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                                    <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <HistoryIcon color="action" />
                                        <Typography variant="h6" fontWeight={700}>Withdrawal History</Typography>
                                    </Box>
                                    <TableContainer sx={{ maxHeight: 400 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {history.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No withdrawals yet</TableCell>
                                                    </TableRow>
                                                ) : (
                                                    history.map((item) => (
                                                        <TableRow key={item.id}>
                                                            <TableCell>{new Date(item.requestedAt).toLocaleDateString()}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>KES {item.amount.toLocaleString()}</TableCell>
                                                            <TableCell>
                                                                <Chip 
                                                                    label={item.status} 
                                                                    size="small" 
                                                                    color={item.status === 'PENDING' ? 'warning' : item.status === 'PAID' ? 'success' : 'default'}
                                                                    sx={{ fontWeight: 700, borderRadius: 1 }}
                                                                />
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </Container>
            </Box>

            {/* WITHDRAW DIALOG */}
            <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800 }}>Withdraw Funds</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Funds will be sent to <b>{mpesaNumber}</b>.
                    </Typography>
                    <TextField
                        autoFocus
                        label="Amount (KES)"
                        type="number"
                        fullWidth
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Min 50"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setWithdrawOpen(false)} color="inherit">Cancel</Button>
                    <Button variant="contained" onClick={handleWithdraw} disabled={processing}>
                        {processing ? "Processing..." : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* TOAST */}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherEarnings;