import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Grid, Button, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Chip, CircularProgress, 
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
    InputAdornment, Alert, Snackbar, useTheme, alpha, createTheme, ThemeProvider, Skeleton, Divider, Stack, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Added for back button
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';
import AppNotification from '@/components/AppNotification';
// Premium Lucide Icons
import { 
    Wallet, History, ArrowDownCircle, Landmark, 
    TrendingUp, ArrowUpRight, CheckCircle2, 
    Clock, AlertCircle, MoreHorizontal, Filter, ArrowLeft // Added ArrowLeft
} from 'lucide-react';


const dashboardTheme = createTheme({
    typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    shape: { borderRadius: 2 }
});

const BORDER_COLOR = '#E2E8F0';
const BRAND_BLUE = '#2563EB';
const SLATE_DARK = '#0F172A';

const TeacherEarnings = () => {
    const navigate = useNavigate();
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
        } catch (err) { 
            console.error(err); 
        } finally { 
            // Small delay to make skeleton look smooth
            setTimeout(() => setLoading(false), 800); 
        }
    };

    useEffect(() => { fetchWallet(); }, []);

    const handleWithdraw = async () => {
        const amount = parseFloat(withdrawAmount);
        if (!amount || amount < 1) return setToast({ open: true, msg: "Min withdrawal KES 1", type: 'error' });
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

    const totalWithdrawn = history
        .filter(item => item.status === 'PAID')
        .reduce((sum, item) => sum + item.amount, 0);

    return (
        <ThemeProvider theme={dashboardTheme}>
            <TeacherLayout title="Finance" selectedRoute="/teacher/earnings">
                <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
                    
                    {/* --- HEADER WITH BACK BUTTON --- */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton 
                            onClick={() => navigate('/dashboard/teacher')} 
                            sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', bgcolor: 'white' }}
                        >
                            <ArrowLeft size={20} />
                        </IconButton>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>Earnings & Payouts</Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Monitor your sales revenue and manage your wallet.</Typography>
                        </Box>
                    </Box>

                    {/* 1. TOP STATS BAR (BENTO STYLE) */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                        {[
                            { label: 'LIFETIME REVENUE', val: (totalWithdrawn + balance), icon: <TrendingUp size={18}/>, color: BRAND_BLUE },
                            { label: 'TOTAL WITHDRAWN', val: totalWithdrawn, icon: <CheckCircle2 size={18}/>, color: '#059669' },
                            { label: 'PENDING PAYOUTS', val: history.filter(i => i.status !== 'PAID').reduce((s, i) => s + i.amount, 0), icon: <Clock size={18}/>, color: '#D97706' }
                        ].map((stat, i) => (
                            <Grid item xs={12} md={4} key={i}>
                                <Paper elevation={0} sx={{ p: 2, border: `1px solid ${BORDER_COLOR}`, display: 'flex', alignItems: 'center', gap: 2 }}>
                                    {loading ? (
                                        <Skeleton variant="circular" width={40} height={40} />
                                    ) : (
                                        <Box sx={{ p: 1, bgcolor: alpha(stat.color, 0.1), color: stat.color, borderRadius: '2px' }}>{stat.icon}</Box>
                                    )}
                                    <Box sx={{ width: '100%' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{stat.label}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                                            {loading ? <Skeleton width="60%" /> : `KES ${stat.val.toLocaleString()}`}
                                        </Typography>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
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
                                            {loading ? (
                                                [...Array(5)].map((_, i) => (
                                                    <TableRow key={i}>
                                                        <TableCell><Skeleton variant="text" /></TableCell>
                                                        <TableCell><Skeleton variant="text" /></TableCell>
                                                        <TableCell><Skeleton variant="text" /></TableCell>
                                                        <TableCell align="right"><Skeleton variant="rectangular" width={60} height={24} /></TableCell>
                                                    </TableRow>
                                                ))
                                            ) : history.length === 0 ? (
                                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No transactions yet.</Typography></TableCell></TableRow>
                                            ) : (
                                                history.map((item) => (
                                                    <TableRow key={item.id} hover>
                                                        <TableCell sx={{ fontWeight: 600 }}>{new Date(item.requestedAt).toLocaleDateString()}</TableCell>
                                                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.75rem', fontFamily: 'monospace' }}>
  
    {item.referenceNumber || `REF-${item.id}`}
    
   
    {item.status === 'PAID' && item.transactionCode && (
        <Typography 
            variant="caption" 
            sx={{ 
                display: 'block', 
                color: '#10B981', 
                fontWeight: 800, 
                mt: 0.5, 
                fontFamily: 'sans-serif' 
            }}
        >
            M-Pesa: {item.transactionCode}
        </Typography>
    )}
</TableCell>
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
                                {loading ? (
                                    <Skeleton variant="text" width="80%" height={60} sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 1 }} />
                                ) : (
                                    <Typography variant="h3" sx={{ fontWeight: 800, my: 1, letterSpacing: '-0.04em' }}>KES {balance.toLocaleString()}</Typography>
                                )}
                                <Divider sx={{ bgcolor: 'rgba(255,255,255,0.1)', my: 2 }} />
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}><Landmark size={16} /></Box>
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', opacity: 0.6 }}>M-Pesa Payout</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{loading ? <Skeleton width={100} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} /> : (mpesaNumber || 'Not Linked')}</Typography>
                                    </Box>
                                </Box>
                                <Button 
                                    fullWidth variant="contained" 
                                    onClick={() => setWithdrawOpen(true)}
                                    disabled={loading}
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
                                
                                {/* PAYMENT HELP SECTION WITH EMAIL */}
                                <Box sx={{ p: 2, bgcolor: alpha(BRAND_BLUE, 0.05), borderRadius: '2px', border: `1px solid ${alpha(BRAND_BLUE, 0.1)}` }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: BRAND_BLUE, mb: 1 }}>
                                        <AlertCircle size={16} />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Need payment help?</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                                        If you encounter any issues with your withdrawals or wallet balance, please contact us:
                                    </Typography>
                                    <Typography 
                                        component="a" 
                                        href="mailto:info@masomosoko.co.ke" 
                                        variant="body2" 
                                        sx={{ 
                                            fontWeight: 800, color: BRAND_BLUE, textDecoration: 'none',
                                            '&:hover': { textDecoration: 'underline' }
                                        }}
                                    >
                                        info@masomosoko.co.ke
                                    </Typography>
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

                <AppNotification 
                    open={toast.open}
                    message={toast.msg} 
                    severity={toast.type} 
                    onClose={() => setToast({ ...toast, open: false })}
                />
            </TeacherLayout>
        </ThemeProvider>
    );
};

export default TeacherEarnings;