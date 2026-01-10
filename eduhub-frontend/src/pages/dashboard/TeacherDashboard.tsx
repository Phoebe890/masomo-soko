import React, { useEffect, useState } from 'react';
import { 
    Box, Typography, Grid, Paper, Chip, CircularProgress, 
    List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, alpha, useTheme,
    IconButton
} from '@mui/material';
import { api } from '@/api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import TeacherLayout from '../../components/TeacherLayout';
import { useNavigate } from 'react-router-dom';

// Icons
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import StarIcon from '@mui/icons-material/Star';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EditIcon from '@mui/icons-material/Edit';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CloseIcon from '@mui/icons-material/Close'; 
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const TeacherDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);

    // Initialize with empty array (will be filled by DB)
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Dashboard Data
                const dashRes = await api.get('/api/teacher/dashboard');
                setData(dashRes.data);

                // --- CRITICAL FIX: Set Notifications from Backend ---
                if (dashRes.data.notifications && Array.isArray(dashRes.data.notifications)) {
                    const mappedNotifs = dashRes.data.notifications.map((n: any) => ({
                        id: n.id,
                        title: "New Update",
                        subtitle: n.message, // Use 'message' from DB
                        type: n.read ? "read" : "info"
                    }));
                    setNotifications(mappedNotifs);
                }

                // 2. Get Analytics Data
                const analyticsRes = await api.get('/api/teacher/analytics');
                const rawSales = analyticsRes.data.salesLast30Days || {};
                
                const formattedChart = Object.keys(rawSales).sort().map(dateKey => ({
                    date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    sales: rawSales[dateKey]
                }));
                setChartData(formattedChart.length > 0 ? formattedChart : [{ date: 'Today', sales: 0 }]);

            } catch (error) {
                console.error("Error fetching dashboard:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getAvgRating = () => {
        if (!data?.resources) return "0.0";
        let total = 0, count = 0;
        data.resources.forEach((r: any) => r.reviews?.forEach((rv: any) => { total += rv.rating; count++; }));
        return count === 0 ? "0.0" : (total / count).toFixed(1);
    };

    const parseArray = (item: any) => {
        if (Array.isArray(item)) return item;
        if (typeof item === 'string') {
            try { return JSON.parse(item); } catch { return []; }
        }
        return [];
    };

    const handleDismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        // Optional: You could call an API here to mark it as read in DB
    };

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
                <Chip icon={<ArrowUpwardIcon sx={{ width: 14 }} />} label="Live" size="small" sx={{ bgcolor: alpha(color, 0.1), color: color, fontWeight: 700, borderRadius: 1 }} />
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
            </Box>
        </Paper>
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    const profile = data?.profile || {};
    const user = profile?.user || {};
    const skills = parseArray(profile.grades || []);
    const subjects = parseArray(profile.subjects || []);

    return (
        <TeacherLayout title="Dashboard" selectedRoute="/dashboard/teacher">
            
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>
                    Welcome back, {user.name || 'Instructor'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Here is an overview of your performance and profile.
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget title="Total Earnings" value={`KES ${data?.currentBalance?.toLocaleString() || 0}`} icon={<AttachMoneyIcon fontSize="large" />} color="#10B981" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget title="Total Sales" value={data?.totalSales || 0} icon={<ShoppingBagIcon fontSize="large" />} color="#3B82F6" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget title="Active Resources" value={data?.resources?.length || 0} icon={<PeopleIcon fontSize="large" />} color="#8B5CF6" />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatWidget title="Average Rating" value={getAvgRating()} icon={<StarIcon fontSize="large" />} color="#F59E0B" />
                </Grid>
            </Grid>

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: 400, mb: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Revenue Analytics</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                                <RechartsTooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700}>My Profile</Typography>
                            <IconButton size="small" onClick={() => navigate('/dashboard/teacher/settings')}><EditIcon fontSize="small" /></IconButton>
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Bio</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, color: '#374151', lineHeight: 1.6 }}>
                                {profile.bio || "No bio added yet."}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Expertise</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {subjects.map((sub: string, i: number) => (
                                    <Chip key={i} label={sub} size="small" color="primary" variant="outlined" />
                                ))}
                                {skills.map((skill: string, i: number) => (
                                    <Chip key={i} label={skill} size="small" sx={{ bgcolor: '#F3F4F6' }} />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ bgcolor: '#F9FAFB', p: 2, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <AccountBalanceWalletIcon color="action" />
                            <Box>
                                <Typography variant="caption" display="block" color="text.secondary">Payout Method</Typography>
                                <Typography variant="body2" fontWeight={600}>
                                    M-Pesa: {profile.paymentNumber ? `+254 ${profile.paymentNumber}` : 'Not Set'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, maxHeight: 300, overflowY: 'auto' }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Recent Notifications</Typography>
                        
                        <List disablePadding>
                            {notifications.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                    No new notifications.
                                </Typography>
                            ) : (
                                notifications.map((note) => (
                                    <Box key={note.id}>
                                        <ListItem 
                                            secondaryAction={
                                                <IconButton edge="end" size="small" onClick={() => handleDismissNotification(note.id)}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            }
                                            disableGutters
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ bgcolor: '#EEF2FF', color: '#3B82F6' }}>
                                                    {note.type === 'tip' ? <CheckCircleOutlineIcon fontSize="small" /> : <NotificationsActiveIcon fontSize="small" />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={<Typography variant="subtitle2" fontWeight={600}>{note.title}</Typography>}
                                                secondary={note.subtitle} 
                                            />
                                        </ListItem>
                                        <Divider component="li" variant="inset" />
                                    </Box>
                                ))
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </TeacherLayout>
    );
};

export default TeacherDashboard;