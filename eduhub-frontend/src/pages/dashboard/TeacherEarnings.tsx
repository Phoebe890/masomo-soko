import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, CircularProgress, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    InputAdornment, Alert, Snackbar, useTheme, alpha
} from '@mui/material';
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';
// Icons
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import HistoryIcon from '@mui/icons-material/History';

const BACKEND_URL = "http://localhost:8081";

const TeacherEarnings = () => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0.0);
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    
    // Withdrawal Logic
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success'|'error' }>({ open: false, msg: '', type: 'success' });

    const fetchWallet = async () => {
        setLoading(true);
        try {
            const res = await api.get(`${BACKEND_URL}/api/wallet/summary`, { withCredentials: true });
            setBalance(res.data.balance || 0.0);
            setMpesaNumber(res.data.mpesaNumber || '');
            setHistory(res.data.history || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => { fetchWallet(); }, []);

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount < 50) return setToast({ open: true, msg: "Min withdrawal KES 50", type: 'error' });
        if (amount > balance) return setToast({ open: true, msg: "Insufficient funds", type: 'error' });

        setProcessing(true);
        try {
            const params = new URLSearchParams();
            params.append('amount', amount.toString());
            await api.post(`${BACKEND_URL}/api/wallet/withdraw`, params, { withCredentials: true });
            setToast({ open: true, msg: "Request Submitted!", type: 'success' });
            setWithdrawOpen(false);
            setWithdrawAmount('');
            fetchWallet();
        } catch (err: any) {
            setToast({ open: true, msg: err.response?.data || "Failed", type: 'error' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <TeacherLayout title="Earnings & Payouts" selectedRoute="/teacher/earnings">
            {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box> : (
                <Grid container spacing={4}>
                    {/* WALLET CARD */}
                    <Grid item xs={12} md={5}>
                        <Paper 
                            elevation={0}
                            sx={{ 
                                p: 4, borderRadius: 4, border: `1px solid ${theme.palette.divider}`,
                                bgcolor: '#1F2937', color: 'white',
                                display: 'flex', flexDirection: 'column', gap: 2,
                                position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            <Box sx={{ zIndex: 1 }}>
                                <Typography variant="caption" sx={{ opacity: 0.7, letterSpacing: 1, fontWeight: 700 }}>AVAILABLE BALANCE</Typography>
                                <Typography variant="h3" fontWeight={800} sx={{ my: 1 }}>KES {balance.toLocaleString()}</Typography>
                                <Typography variant="body2" sx={{ opacity: 0.8, mb: 3 }}>
                                    Active Method: M-Pesa ({mpesaNumber || 'Not Set'})
                                </Typography>
                                <Button 
                                    variant="contained" 
                                    onClick={() => setWithdrawOpen(true)}
                                    startIcon={<RequestQuoteIcon />}
                                    sx={{ bgcolor: 'white', color: '#1F2937', fontWeight: 700, '&:hover': { bgcolor: '#F3F4F6' } }}
                                >
                                    Withdraw Funds
                                </Button>
                            </Box>
                            <AccountBalanceWalletIcon sx={{ position: 'absolute', right: -30, bottom: -40, fontSize: 200, opacity: 0.1 }} />
                        </Paper>
                    </Grid>

                    {/* HISTORY TABLE */}
                    <Grid item xs={12} md={7}>
                        <Paper elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                            <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryIcon color="action" />
                                <Typography variant="h6" fontWeight={700}>Transaction History</Typography>
                            </Box>
                            <TableContainer sx={{ overflowX: 'auto', maxHeight: 400 }}>
                                <Table stickyHeader>
                                    <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Amount</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {history.length === 0 ? (
                                            <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6, color: 'text.secondary' }}>No transactions yet.</TableCell></TableRow>
                                        ) : (
                                            history.map((item) => (
                                                <TableRow key={item.id} hover>
                                                    <TableCell>{new Date(item.requestedAt).toLocaleDateString()}</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>KES {item.amount.toLocaleString()}</TableCell>
                                                    <TableCell align="right">
                                                        <Chip 
                                                            label={item.status} size="small" 
                                                            sx={{ 
                                                                fontWeight: 700, borderRadius: 1,
                                                                bgcolor: item.status === 'PAID' ? alpha('#10B981', 0.1) : alpha('#F59E0B', 0.1),
                                                                color: item.status === 'PAID' ? '#059669' : '#D97706'
                                                            }} 
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

            {/* WITHDRAWAL DIALOG */}
            <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>Withdraw Funds</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>Available: <b>KES {balance}</b></Typography>
                    <TextField
                        autoFocus label="Amount" type="number" fullWidth
                        value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                        InputProps={{ startAdornment: <InputAdornment position="start">KES</InputAdornment> }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                    <Button onClick={handleWithdraw} variant="contained" disabled={processing}>Confirm</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={3000} onClose={() => setToast({...toast, open: false})}><Alert severity={toast.type}>{toast.msg}</Alert></Snackbar>
        </TeacherLayout>
    );
};

export default TeacherEarnings;