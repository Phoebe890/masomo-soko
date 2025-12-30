import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, CircularProgress, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    Alert, Snackbar, Container, InputAdornment
} from '@mui/material';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';

// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import HistoryIcon from '@mui/icons-material/History';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const BACKEND_URL = "http://localhost:8081";
const MPESA_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png";

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
            <TeacherSidebar selectedRoute="/dashboard/teacher/earnings" mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 6 } }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 4, color: '#111827' }}>
                        Earnings & Payouts
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>
                    ) : (
                        <Grid container spacing={4}>
                            {/* --- BALANCE CARD --- */}
                            <Grid item xs={12} md={5}>
                                <Paper elevation={0} sx={{ 
                                    p: 4, borderRadius: 4, 
                                    background: 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                                    color: 'white', position: 'relative', overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}>
                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                        <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: 600, mb: 1, letterSpacing: 1 }}>AVAILABLE BALANCE</Typography>
                                        <Typography variant="h2" fontWeight={800} sx={{ mb: 4 }}>KES {balance.toLocaleString()}</Typography>
                                        
                                        <Button 
                                            variant="contained" 
                                            onClick={() => setWithdrawOpen(true)}
                                            startIcon={<RequestQuoteIcon />}
                                            sx={{ 
                                                bgcolor: 'white', color: '#0F172A', 
                                                fontWeight: 700, borderRadius: 50, px: 4, py: 1.5,
                                                '&:hover': { bgcolor: '#F1F5F9' }
                                            }}
                                        >
                                            Withdraw Funds
                                        </Button>
                                    </Box>
                                    {/* Decoration */}
                                    <AccountBalanceWalletIcon sx={{ position: 'absolute', right: -30, bottom: -40, fontSize: 200, opacity: 0.1 }} />
                                </Paper>

                                <Box sx={{ mt: 4 }}>
                                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>ACTIVE PAYOUT METHOD</Typography>
                                    <Paper elevation={0} sx={{ 
                                        p: 3, borderRadius: 3, border: '2px solid #22c55e', 
                                        bgcolor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'space-between' 
                                    }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                            <Box 
                                                component="img" 
                                                src={MPESA_LOGO} 
                                                sx={{ height: 40, objectFit: 'contain' }}
                                            />
                                            <Box>
                                                <Typography fontWeight={700} color="#111827">M-Pesa Mobile Money</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {mpesaNumber ? mpesaNumber : "No number configured"}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <CheckCircleIcon color="success" />
                                    </Paper>
                                </Box>
                            </Grid>

                            {/* --- HISTORY TABLE --- */}
                            <Grid item xs={12} md={7}>
                                <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: '1px solid #E5E7EB', overflow: 'hidden', minHeight: 400 }}>
                                    <Box sx={{ p: 3, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <HistoryIcon color="action" />
                                        <Typography variant="h6" fontWeight={700}>Withdrawal History</Typography>
                                    </Box>
                                    <TableContainer sx={{ maxHeight: 400 }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Date</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB' }}>Amount</TableCell>
                                                    <TableCell sx={{ fontWeight: 700, bgcolor: '#F9FAFB', textAlign: 'right' }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {history.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 8 }}>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, opacity: 0.5 }}>
                                                                <RequestQuoteIcon sx={{ fontSize: 48 }} />
                                                                <Typography>No withdrawal history yet</Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    history.map((item) => (
                                                        <TableRow key={item.id} hover>
                                                            <TableCell>{new Date(item.requestedAt).toLocaleDateString()}</TableCell>
                                                            <TableCell sx={{ fontWeight: 600 }}>KES {item.amount.toLocaleString()}</TableCell>
                                                            <TableCell align="right">
                                                                <Chip 
                                                                    label={item.status} 
                                                                    size="small" 
                                                                    color={item.status === 'PENDING' ? 'warning' : item.status === 'PAID' ? 'success' : 'default'}
                                                                    sx={{ fontWeight: 700, borderRadius: 1, minWidth: 80 }}
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
                        Available Balance: <b>KES {balance.toLocaleString()}</b>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Funds will be sent to <b>{mpesaNumber || "your configured number"}</b>.
                    </Typography>
                    <TextField
                        autoFocus
                        label="Amount to Withdraw"
                        type="number"
                        fullWidth
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="Min 50"
                        InputProps={{
                            startAdornment: <InputAdornment position="start">KES</InputAdornment>,
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setWithdrawOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
                    <Button variant="contained" onClick={handleWithdraw} disabled={processing} sx={{ fontWeight: 700, px: 3 }}>
                        {processing ? <CircularProgress size={24} color="inherit" /> : "Confirm Withdraw"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* TOAST */}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast({...toast, open: false})} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={toast.type} variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}>{toast.msg}</Alert>
            </Snackbar>
        </Box>
    );
};

export default TeacherEarnings;