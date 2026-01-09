import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Grid, Paper, Chip, CircularProgress, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    alpha, useTheme, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from './AdminLayout';

// Icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'; // For Resources
import RequestQuoteIcon from '@mui/icons-material/RequestQuote'; // For Payouts
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

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
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentWithdrawals, setRecentWithdrawals] = useState<Withdrawal[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats, payouts, and notifications in parallel
                const [statsRes, payoutsRes] = await Promise.all([
                    api.get('/api/admin/stats'),
                    api.get('/api/admin/payouts'),
                ]);

                setStats(statsRes.data);

                // Process Payouts for Table
                const allPayouts: Withdrawal[] = payoutsRes.data;
                setRecentWithdrawals(allPayouts.slice(0, 5)); // Only show top 5

                // Process Chart Data (Last 7 days volume)
                setChartData(processChartData(allPayouts));
            } catch (err) {
                console.error("Failed to load admin dashboard", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Helper to format chart data
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

    // Reusable Widget Component (Matches TeacherDashboard style)
    const StatWidget = ({ title, value, icon, color }: any) => (
        <Paper
            elevation={0}
            sx={{
                p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                border: `1px solid ${theme.palette.divider}`, borderRadius: 4,
                transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: alpha(color, 0.1), color: color }}>{icon}</Box>
                <Chip icon={<ArrowUpwardIcon sx={{ width: 14 }} />} label="+12%" size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 700, borderRadius: 1 }} />
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            </Box>
        </Paper>
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    return (
        <AdminLayout title="Overview" selectedRoute="/admin/dashboard">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>
                    Admin Console
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Platform overview and financial statistics.
                </Typography>
            </Box>

            {/* 1. STATS GRID */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget 
                        title="Platform Revenue" 
                        value={`KES ${stats?.platformRevenue.toLocaleString() || 0}`} 
                        icon={<AttachMoneyIcon fontSize="large" />} 
                        color="#10B981" // Green
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget 
                        title="Total Users" 
                        value={stats?.totalUsers.toLocaleString() || 0} 
                        icon={<PeopleIcon fontSize="large" />} 
                        color="#3B82F6" // Blue
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget 
                        title="Total Resources" 
                        value={stats?.totalResources || 0} 
                        icon={<LibraryBooksIcon fontSize="large" />} 
                        color="#8B5CF6" // Purple
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget 
                        title="Pending Payouts" 
                        value={stats?.pendingPayouts || 0} 
                        icon={<RequestQuoteIcon fontSize="large" />} 
                        color="#F59E0B" // Orange
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                {/* 2. CHART SECTION */}
                <Grid item xs={12} md={8}>
    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: 400, mb: 3 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Payout Volume (Last 7 Days)</Typography>
        
        {/* --- FIX: Wrap ResponsiveContainer in a div with explicit dimensions --- */}
        <div style={{ width: '100%', height: '300px' }}> 
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorVol)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
        {/* --- END FIX --- */}
        
    </Paper>
</Grid>

                {/* 3. RECENT PAYOUTS TABLE */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 0, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                        <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h6" fontWeight={700}>Recent Requests</Typography>
                            <IconButton size="small" onClick={() => navigate('/admin/payouts')}><VisibilityOutlinedIcon /></IconButton>
                        </Box>
                        
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 600 }}>Amount</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>Status</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {recentWithdrawals.length === 0 && (
                                        <TableRow><TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>No recent requests</TableCell></TableRow>
                                    )}
                                    {recentWithdrawals.map((row) => (
                                        <TableRow key={row.id} hover>
                                            <TableCell>{row.teacherName}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 700 }}>{row.amount}</TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={row.status} 
                                                    size="small" 
                                                    color={row.status === 'PENDING' ? 'warning' : 'success'}
                                                    sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>
        </AdminLayout>
    );
};

export default AdminDashboard;