import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import axios from 'axios';
import AdminSidebar from './AdminSidebar';

// Icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';

const AdminDashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        axios.get('http://localhost:8081/api/admin/stats', { withCredentials: true })
            .then(res => setStats(res.data))
            .catch(console.error);
    }, []);

    const StatCard = ({ title, value, icon, color }: any) => (
        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2, borderRadius: 3 }}>
            <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${color}20`, color: color }}>{icon}</Box>
            <Box>
                <Typography variant="h4" fontWeight={700}>{value}</Typography>
                <Typography color="text.secondary">{title}</Typography>
            </Box>
        </Paper>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <AdminSidebar selected="/admin/dashboard" />
            <Box component="main" sx={{ flexGrow: 1, p: 4, bgcolor: '#F3F4F6', minHeight: '100vh' }}>
                <Typography variant="h4" fontWeight={800} sx={{ mb: 4 }}>Admin Overview</Typography>
                
                {!stats ? <CircularProgress /> : (
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                            <StatCard title="Total Platform Revenue" value={`KES ${stats.platformRevenue}`} icon={<AttachMoneyIcon />} color="#10B981" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard title="Total Users" value={stats.totalUsers} icon={<PeopleIcon />} color="#3B82F6" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <StatCard title="Pending Payouts" value={stats.pendingPayouts} icon={<RequestQuoteIcon />} color="#F59E0B" />
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default AdminDashboard;