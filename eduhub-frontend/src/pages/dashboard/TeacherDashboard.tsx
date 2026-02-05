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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const TeacherDashboard = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    // Brand Colors
    const BRAND_BLUE = '#2563EB'; 
    const BRAND_ORANGE = '#F97316'; 

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Dashboard Data
                const dashRes = await api.get('/api/teacher/dashboard');
                setData(dashRes.data);

                // Notifications
                if (dashRes.data.notifications && Array.isArray(dashRes.data.notifications)) {
                    const mappedNotifs = dashRes.data.notifications.map((n: any) => ({
                        id: n.id,
                        title: "New Update",
                        subtitle: n.message,
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

   

const handleDismissNotification = async (id: number) => {
    try {
        // Update local dashboard state
        setNotifications(prev => prev.filter(n => n.id !== id));
        
        // Call API to delete from Database
        await api.delete(`/api/teacher/notifications/${id}`);
    } catch (error) {
        console.error("Error dismissing notification:", error);
    }
};

    // Updated Vibrant Stat Widget with Responsive Fonts
    const StatWidget = ({ title, value, icon, gradient, textColor = '#fff' }: any) => (
        <Paper
            elevation={3} 
            sx={{
                p: { xs: 2, md: 3 }, // Less padding on mobile
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                borderRadius: 4,
                background: gradient, 
                color: textColor,
                transition: 'all 0.3s ease', 
                '&:hover': { 
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.15)' 
                },
                position: 'relative',
                overflow: 'hidden',
                minHeight: { xs: 140, md: 160 } // Ensure cards align in height
            }}
        >
            {/* Background Decoration Circle */}
            <Box sx={{
                position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', zIndex: 0
            }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, zIndex: 1 }}>
                <Box sx={{ 
                    p: 1, 
                    borderRadius: 3, 
                    bgcolor: 'rgba(255,255,255, 0.2)', 
                    backdropFilter: 'blur(5px)',
                    color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {/* Make icon slightly smaller on mobile */}
                    {React.cloneElement(icon, { fontSize: 'small' })} 
                </Box>
            </Box>
            
            <Box sx={{ zIndex: 1 }}>
                {/* RESPONSIVE FONT SIZE: smaller on xs, bigger on md */}
                <Typography 
                    fontWeight={800} 
                    sx={{ 
                        fontSize: { xs: '1.25rem', md: '2rem' }, 
                        mb: 0.5, 
                        letterSpacing: '-0.5px',
                        lineHeight: 1.2
                    }}
                >
                    {value}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 500, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                    {title}
                </Typography>
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
            
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#111827', mb: 1, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        Hello, <span style={{ color: BRAND_BLUE }}>{user.name || 'Teacher'}</span> 
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Here's what's happening today.
                    </Typography>
                </Box>
            </Box>

            {/* STAT CARDS GRID - CHANGED TO XS={6} */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={6} md={3}>
                    <StatWidget 
                        title="Earnings" // Shortened title for mobile
                        value={`KES ${data?.currentBalance?.toLocaleString() || 0}`} 
                        icon={<AttachMoneyIcon />} 
                        gradient="linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatWidget 
                        title="Total Sales" 
                        value={data?.totalSales || 0} 
                        icon={<ShoppingBagIcon />} 
                        gradient="linear-gradient(135deg, #F97316 0%, #EA580C 100%)" 
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatWidget 
                        title="Resources" 
                        value={data?.resources?.length || 0} 
                        icon={<PeopleIcon />} 
                        gradient="linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)"
                    />
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                    <StatWidget 
                        title="Avg Rating" 
                        value={getAvgRating()} 
                        icon={<StarIcon />} 
                        gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                    />
                </Grid>
            </Grid>

            {/* Charts & Profile Section */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, height: 420, mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, mr: 2 }}>
                                <TrendingUpIcon />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>Revenue Analytics</Typography>
                        </Box>
                        
                        <ResponsiveContainer width="100%" height="85%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={BRAND_BLUE} stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor={BRAND_BLUE} stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{fontSize: 12, fill: '#6B7280'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    tick={{fontSize: 12, fill: '#6B7280'}} 
                                    axisLine={false} 
                                    tickLine={false} 
                                />
                                <RechartsTooltip 
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                                    cursor={{ stroke: BRAND_ORANGE, strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke={BRAND_BLUE} 
                                    strokeWidth={4} 
                                    fillOpacity={1} 
                                    fill="url(#colorSales)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    {/* Profile Card */}
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ color: '#111827' }}>My Profile</Typography>
                            <IconButton 
                                size="small" 
                                onClick={() => navigate('/dashboard/teacher/settings')}
                                sx={{ bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, '&:hover': { bgcolor: alpha(BRAND_BLUE, 0.2) } }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        
                        <Box sx={{ mb: 2.5 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Bio</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, color: '#374151', lineHeight: 1.6 }}>
                                {profile.bio || "No bio added yet."}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Box sx={{ mb: 2.5 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">Expertise</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                {subjects.map((sub: string, i: number) => (
                                    <Chip 
                                        key={i} 
                                        label={sub} 
                                        size="small" 
                                        sx={{ bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, fontWeight: 600, border: 'none' }} 
                                    />
                                ))}
                                {skills.map((skill: string, i: number) => (
                                    <Chip 
                                        key={i} 
                                        label={skill} 
                                        size="small" 
                                        sx={{ bgcolor: alpha(BRAND_ORANGE, 0.1), color: '#C2410C', fontWeight: 600 }} 
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ 
                            background: `linear-gradient(135deg, #fff 0%, ${alpha(BRAND_ORANGE, 0.05)} 100%)`, 
                            p: 2, 
                            borderRadius: 3, 
                            border: `1px solid ${alpha(BRAND_ORANGE, 0.2)}`,
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2 
                        }}>
                            <Box sx={{ p: 1, bgcolor: '#FFF7ED', borderRadius: '50%' }}>
                                <AccountBalanceWalletIcon sx={{ color: BRAND_ORANGE }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" display="block" color="text.secondary">Payout Method</Typography>
                                <Typography variant="body2" fontWeight={700} sx={{ color: '#111827' }}>
                                    M-Pesa: {profile.paymentNumber ? `+254 ${profile.paymentNumber}` : 'Not Set'}
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>

                    {/* Notifications Card */}
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: `1px solid ${theme.palette.divider}`, maxHeight: 300, overflowY: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <NotificationsActiveIcon sx={{ color: BRAND_ORANGE, mr: 1, fontSize: 20 }} />
                            <Typography variant="h6" fontWeight={700}>Notifications</Typography>
                        </Box>
                        
                        <List disablePadding>
                            {notifications.length === 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, opacity: 0.5 }}>
                                    <NotificationsActiveIcon fontSize="large" sx={{ mb: 1, color: '#ccc' }} />
                                    <Typography variant="body2">No new notifications.</Typography>
                                </Box>
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
                                            sx={{ py: 1.5 }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar sx={{ 
                                                    bgcolor: note.type === 'tip' ? alpha(BRAND_BLUE, 0.1) : alpha(BRAND_ORANGE, 0.1), 
                                                    color: note.type === 'tip' ? BRAND_BLUE : BRAND_ORANGE 
                                                }}>
                                                    {note.type === 'tip' ? <CheckCircleOutlineIcon fontSize="small" /> : <NotificationsActiveIcon fontSize="small" />}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText 
                                                primary={<Typography variant="subtitle2" fontWeight={600} sx={{ color: '#111827' }}>{note.title}</Typography>}
                                                secondary={<Typography variant="caption" color="text.secondary">{note.subtitle}</Typography>} 
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