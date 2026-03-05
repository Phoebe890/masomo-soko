import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Paper, Chip, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    alpha, createTheme, ThemeProvider, IconButton, Avatar, Button, Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from './AdminLayout';

// High-End Icons (Lucide)
import { 
    DollarSign, Users, Library, Clock, 
    TrendingUp, Eye, FileText, ChevronRight, Settings
} from 'lucide-react';

// --- 1. FONTS & THEME ---
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";

const dashboardTheme = createTheme({
    typography: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: { fontFamily: "'Plus Jakarta Sans', sans-serif !important" },
            },
        },
    },
});

interface DashboardStats {
    totalUsers: number;
    totalResources: number;
    totalVolume: number;
    platformRevenue: number;
    pendingPayouts: number;
}

interface Withdrawal {
    id: number;
    teacherName: string;
    amount: number;
    status: string;
    date: string;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentWithdrawals, setRecentWithdrawals] = useState<Withdrawal[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    // Brand Colors
    const BRAND_BLUE = '#2563EB'; 
    const BRAND_ORANGE = '#F97316'; 
    const BORDER_COLOR = '#E2E8F0';

   
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, payoutsRes] = await Promise.all([
                    api.get('/api/admin/stats'),
                    api.get('/api/admin/payouts'),
                ]);
                setStats(statsRes.data);
                const allPayouts: Withdrawal[] = payoutsRes.data;
                setRecentWithdrawals(allPayouts.slice(0, 5));
                setChartData(processChartData(allPayouts));
            } catch (err) {
                console.error("Failed to load admin dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const processChartData = (payouts: Withdrawal[]) => {
        const last7Days = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); 
            d.setDate(new Date().getDate() - i);
            last7Days.set(d.toLocaleDateString('en-US', { weekday: 'short' }), 0);
        }
        payouts.forEach(p => {
            const d = new Date(p.date); 
            const key = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (last7Days.has(key)) {
                last7Days.set(key, (last7Days.get(key) || 0) + p.amount);
            }
        });
        return Array.from(last7Days, ([name, amount]) => ({ name, amount }));
    };

    // --- SHARP UI COMPONENTS ---
    const StatWidget = ({ title, value, icon, color }: any) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: '100%',
                borderRadius: '2px',
                border: `1px solid ${BORDER_COLOR}`,
                bgcolor: '#FFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                    borderColor: color, 
                    boxShadow: `0 0 0 4px ${alpha(color, 0.05)}`,
                    transform: 'translateY(-2px)' 
                }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: alpha(color, 0.1), color: color, display: 'flex', borderRadius: '2px' }}>
                    {React.cloneElement(icon, { size: 20 })}
                </Box>
            </Box>
            <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5, letterSpacing: '-0.03em' }}>
                    {value}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1 }}>
                    {title.toUpperCase()}
                </Typography>
            </Box>
        </Paper>
    );

    if (loading) return (
        <AdminLayout title="Dashboard" selectedRoute="/admin/dashboard">
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
        </AdminLayout>
    );

    return (
        <ThemeProvider theme={dashboardTheme}>
            <link rel="stylesheet" href={FONT_LINK} />
            <AdminLayout title="Overview" selectedRoute="/admin/dashboard">
                <Box sx={{ 
                    fontFamily: "'Plus Jakarta Sans', sans-serif !important",
                    animation: 'fadeIn 0.6s ease-out',
                    "@keyframes fadeIn": {
                        "0%": { opacity: 0, transform: 'translateY(10px)' },
                        "100%": { opacity: 1, transform: 'translateY(0)' }
                    }
                }}>
                    
                    {/* --- COMMAND HEADER --- */}
                    <Box sx={{ 
                        mb: 4, display: 'flex', justifyContent: 'space-between', 
                        alignItems: 'center', pb: 3, borderBottom: `1px solid ${BORDER_COLOR}` 
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>
                                Admin Console
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Platform overview and financial control panel.
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button 
                                variant="outlined" 
                                startIcon={<FileText size={16} />}
                                sx={{ borderRadius: '2px', borderColor: BORDER_COLOR, color: '#0F172A', fontWeight: 700, px: 3, textTransform: 'none' }}
                                onClick={() => navigate('/admin/payouts')}
                            >
                                All Payouts
                            </Button>
                            <IconButton sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
                                <Settings size={18} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* --- STATS GRID --- */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={2.4}>
        <StatWidget 
            title="Total Volume" 
            value={`KES ${stats?.totalVolume.toLocaleString() || 0}`} 
            icon={<TrendingUp />} 
            color="#6366F1" // Indigo
        />
    </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatWidget 
                                title="Platform Revenue" 
                                value={`KES ${stats?.platformRevenue.toLocaleString() || 0}`} 
                                icon={<DollarSign />} 
                                color="#10B981" 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatWidget 
                                title="Total Users" 
                                value={stats?.totalUsers.toLocaleString() || 0} 
                                icon={<Users />} 
                                color={BRAND_BLUE} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatWidget 
                                title="Active Resources" 
                                value={stats?.totalResources || 0} 
                                icon={<Library />} 
                                color="#8B5CF6" 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <StatWidget 
                                title="Pending Payouts" 
                                value={stats?.pendingPayouts || 0} 
                                icon={<Clock />} 
                                color={BRAND_ORANGE} 
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={3}>
                        {/* --- REVENUE CHART --- */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', height: 450 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <TrendingUp size={20} color={BRAND_ORANGE} />
                                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Payout Volume</Typography>
                                    </Box>
                                    <Chip label="Last 7 Days" variant="outlined" sx={{ borderRadius: '2px', fontWeight: 700 }} />
                                </Box>
                                <ResponsiveContainer width="100%" height="80%">
                                    <AreaChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                        <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                        <RechartsTooltip contentStyle={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }} />
                                        <Area type="monotone" dataKey="amount" stroke={BRAND_ORANGE} strokeWidth={2} fill={alpha(BRAND_ORANGE, 0.1)} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* --- RECENT PAYOUTS TABLE --- */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', height: '100%', overflow: 'hidden' }}>
                                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Recent Requests</Typography>
                                    <Button 
                                        size="small" 
                                        endIcon={<ChevronRight size={14} />}
                                        sx={{ fontWeight: 700, textTransform: 'none', color: BRAND_BLUE }}
                                        onClick={() => navigate('/admin/payouts')}
                                    >
                                        View All
                                    </Button>
                                </Box>
                                
                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>Teacher</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>Amount</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'text.secondary', textTransform: 'uppercase' }}>Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentWithdrawals.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary', fontWeight: 500 }}>
                                                        No pending requests
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                recentWithdrawals.map((row) => (
                                                    <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#0F172A' }}>{row.teacherName}</Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{new Date(row.date).toLocaleDateString()}</Typography>
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                                            {row.amount.toLocaleString()}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Chip 
                                                                label={row.status} 
                                                                size="small" 
                                                                sx={{ 
                                                                    height: 20, fontSize: '0.65rem', fontWeight: 800, borderRadius: '2px',
                                                                    bgcolor: row.status === 'PENDING' ? alpha('#F59E0B', 0.1) : alpha('#10B981', 0.1),
                                                                    color: row.status === 'PENDING' ? '#B45309' : '#059669'
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
                </Box>
            </AdminLayout>
        </ThemeProvider>
    );
};

export default AdminDashboard;