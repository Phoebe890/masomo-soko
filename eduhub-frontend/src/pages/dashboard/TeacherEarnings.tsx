import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, CircularProgress, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    InputAdornment, Alert, Snackbar, useTheme, alpha, createTheme, ThemeProvider, Skeleton, Divider
} from '@mui/material';
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';

// Premium Lucide Icons
import { 
    Wallet, History, ArrowDownCircle, Landmark, 
    TrendingUp, ArrowUpRight, CheckCircle2, 
    Clock, AlertCircle, MoreHorizontal, Filter 
} from 'lucide-react';

// --- 1. THEME CONFIG (Sharp & Specific) ---
const dashboardTheme = createTheme({
    typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    shape: { borderRadius: 2 }
});

const BORDER_COLOR = '#E2E8F0';
const BRAND_BLUE = '#2563EB';
const SLATE_DARK = '#0F172A';

const TeacherEarnings = () => {
    // --- EXISTING LOGIC (PRESERVED) ---
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0.0);
    const [mpesaNumber, setMpesaNumber] = useState('');
    const [history, setHistory] = useState<any[]>([]);
    
    const [withdrawOpen, setWithdrawOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState<{ open: boolean; msg: string; type: 'success'|'error' }>({ open: false, msg: '', type: 'success' });

    const fetchWallet = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/wallet/summary');
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
            await api.post('/api/wallet/withdraw', params);
            setToast({ open: true, msg: "Payout request sent!", type: 'success' });
            setWithdrawOpen(false);
            setWithdrawAmount('');
            fetchWallet();
        } catch (err: any) {
            setToast({ open: true, msg: err.response?.data || "Failed", type: 'error' });
        } finally { setProcessing(false); }
    };

    // --- REFINEMENT: STATS CALCULATIONS ---
    const totalWithdrawn = history
        .filter(item => item.status === 'PAID')
        .reduce((sum, item) => sum + item.amount, 0);

    return (
        <ThemeProvider theme={dashboardTheme}>
            <TeacherLayout title="Finance" selectedRoute="/teacher/earnings">
                <Box sx={{ animation: 'fadeIn 0.5s ease-out', "@keyframes fadeIn": { "0%": { opacity: 0 }, "100%": { opacity: 1 } } }}>
                    
                    {/* 1. TOP STATS BAR (BENTO STYLE) */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER_COLOR}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, borderRadius: '2px' }}><TrendingUp size={18} /></Box>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>LIFETIME REVENUE</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>KES {(totalWithdrawn + balance).toLocaleString()}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER_COLOR}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, bgcolor: alpha('#10B981', 0.1), color: '#059669', borderRadius: '2px' }}><CheckCircle2 size={18} /></Box>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>TOTAL WITHDRAWN</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>KES {totalWithdrawn.toLocaleString()}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER_COLOR}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ p: 1, bgcolor: alpha('#F59E0B', 0.1), color: '#D97706', borderRadius: '2px' }}><Clock size={18} /></Box>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>PENDING PAYOUTS</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                        KES {history.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.amount, 0).toLocaleString()}
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        {/* 2. MAIN LEDGER (Left) */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={0} sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', overflow: 'hidden', height: '100%' }}>
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>Transaction History</Typography>
                                    <Button size="small" startIcon={<Filter size={14} />} sx={{ fontWeight: 700, color: 'text.secondary' }}>Filter</Button>
                                </Box>
                                <TableContainer sx={{ maxHeight: 500 }}>
                                    <Table stickyHeader>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Date</TableCell>
                                                <TableCell sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Transaction Ref</TableCell>
                                                <TableCell sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Amount</TableCell>
                                                <TableCell align="right" sx={{ bgcolor: '#F8FAFC', color: '#64748B', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {loading ? [1,2,3,4].map(i => (<TableRow key={i}><TableCell colSpan={4}><Skeleton height={40} /></TableCell></TableRow>)) : (
                                                history.map((item) => (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell sx={{ fontWeight: 600 }}>{new Date(item.requestedAt).toLocaleDateString()}</TableCell>
                                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontFamily: 'monospace' }}>TRX-{item.id}992X</TableCell>
                                                        <TableCell sx={{ fontWeight: 800 }}>KES {item.amount.toLocaleString()}</TableCell>
                                                        <TableCell align="right">
                                                            <Chip 
                                                                label={item.status} size="small" 
                                                                sx={{ 
                                                                    fontWeight: 800, fontSize: '0.65rem', borderRadius: '2px',
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

                        {/* 3. VAULT & ACTIONS (Right) */}
                        <Grid item xs={12} md={4}>
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 3, mb: 3, 
                                    bgcolor: SLATE_DARK, color: '#FFF', 
                                    borderRadius: '2px', position: 'relative', overflow: 'hidden' 
                                }}
                            >
                                <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, letterSpacing: 1 }}>CURRENT WALLET</Typography>
                                <Typography variant="h3" sx={{ fontWeight: 800, my: 1, letterSpacing: '-0.04em' }}>KES {balance.toLocaleString()}</Typography>
                                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}><Landmark size={16} /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>M-Pesa Payout</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{mpesaNumber || 'Not Linked'}</Typography>
                                    </Box>
                                </Box>
                                <Button 
                                    fullWidth variant="contained" 
                                    onClick={() => setWithdrawOpen(true)}
                                    startIcon={<ArrowDownCircle size={18} />}
                                    sx={{ bgcolor: '#FFF', color: SLATE_DARK, fontWeight: 800, '&:hover': { bgcolor: '#F1F5F9' } }}
                                >
                                    Withdraw Funds
                                </Button>
                            </Paper>

                            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Payout Policy</Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                    Withdrawals are processed within 24 hours. Minimum amount: <b>KES 50</b>.
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: BRAND_BLUE }}>
                                    <AlertCircle size={14} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Need help with payments?</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* WITHDRAWAL DIALOG */}
                <Dialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '2px' } }}>
                    <DialogTitle sx={{ fontWeight: 800 }}>Confirm Payout</DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ mb: 3 }}>Funds will be sent to <b>{mpesaNumber}</b></Typography>
                        <TextField
                            autoFocus label="Amount" type="number" fullWidth
                            value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                            InputProps={{ 
                                startAdornment: <InputAdornment position="start"><Typography variant="body2" sx={{ fontWeight: 800 }}>KES</Typography></InputAdornment>,
                                sx: { fontWeight: 800 }
                            }}
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setWithdrawOpen(false)} sx={{ fontWeight: 700, color: 'text.secondary' }}>Cancel</Button>
                        <Button 
                            onClick={handleWithdraw} variant="contained" 
                            disabled={processing}
                            sx={{ bgcolor: SLATE_DARK, fontWeight: 800, px: 3 }}
                        >
                            {processing ? <CircularProgress size={20} color="inherit" /> : "Transfer Now"}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Snackbar 
                    open={toast.open} autoHideDuration={3000} 
                    onClose={() => setToast({...toast, open: false})}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={toast.type} variant="filled" sx={{ fontWeight: 700, borderRadius: '2px', bgcolor: toast.type === 'success' ? SLATE_DARK : '#EF4444' }}>
                        {toast.msg}
                    </Alert>
                </Snackbar>
            </TeacherLayout>
        </ThemeProvider>
    );
};

export default TeacherEarnings;