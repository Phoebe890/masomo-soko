import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, Typography, Grid, Paper, Chip, CircularProgress, 
    List, ListItem, ListItemAvatar, Avatar, ListItemText, Divider, alpha, 
    IconButton, createTheme, ThemeProvider,Button,Snackbar, Alert,
} from '@mui/material';
// Logic Imports
import { api } from '@/api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import TeacherLayout from '../../components/TeacherLayout';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@mui/material';
import AppNotification from '@/components/AppNotification';
// High-End Icons (Lucide)
import { 
    DollarSign, ShoppingBag, Users, Star, 
    TrendingUp, Bell, Edit3, Wallet, X, CheckCircle, ArrowUpRight ,Plus
} from 'lucide-react';

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";


import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';

// --- 2. THEME CONFIG  ---
const dashboardTheme = createTheme({
    typography: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
    },
    components: {
        MuiTypography: {
            styleOverrides: {
                root: {
                    fontFamily: "'Plus Jakarta Sans', sans-serif !important", 
                },
            },
        },
    },
});


const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });
    // Color Palette
    const BRAND_BLUE = '#2563EB'; 
    const BRAND_ORANGE = '#F97316'; 
    const BORDER_COLOR = '#E2E8F0';

   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const dashRes = await api.get('/api/teacher/dashboard');
                setData(dashRes.data);

                if (dashRes.data.notifications && Array.isArray(dashRes.data.notifications)) {
                    const mappedNotifs = dashRes.data.notifications.map((n: any) => ({
                        id: n.id,
                        title: "New Update",
                        subtitle: n.message,
                        type: n.read ? "read" : "info"
                    }));
                    setNotifications(mappedNotifs);
                }

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

    const handleDismissNotification = async (id: number) => {
    try {
        setNotifications(prev => prev.filter(n => n.id !== id));
        await api.delete(`/api/teacher/notifications/${id}`);
        
        // Show Success Toast
        setSnackbar({ open: true, message: 'Notification dismissed', severity: 'success' });
    } catch (error) {
        setSnackbar({ open: true, message: 'Failed to delete notification', severity: 'error' });
    }
};

    const parseArray = (item: any) => {
        if (Array.isArray(item)) return item;
        if (typeof item === 'string') {
            try { return JSON.parse(item); } catch { return []; }
        }
        return [];
    };

    
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
                <Box sx={{ p: 1, bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>
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
    <TeacherLayout title="Dashboard" selectedRoute="/dashboard/teacher">
        <Box sx={{ p: 1 }}>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={300} height={20} sx={{ mb: 4 }} />
            
            <Grid container spacing={3}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid item xs={12} sm={6} md={3} key={i}>
                        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: '2px' }} />
                    </Grid>
                ))}
                <Grid item xs={12} md={8}>
                    <Skeleton variant="rectangular" height={450} sx={{ borderRadius: '2px' }} />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Skeleton variant="rectangular" height={450} sx={{ borderRadius: '2px' }} />
                </Grid>
            </Grid>
        </Box>
    </TeacherLayout>
);

    const profile = data?.profile || {};
    const user = profile?.user || {};
    const skills = parseArray(profile.grades || []);
    const subjects = parseArray(profile.subjects || []);

    return (
        <ThemeProvider theme={dashboardTheme}>
            {/* 1. Inject the Font Link */}
            <link rel="stylesheet" href={FONT_LINK} />
            
            <TeacherLayout title="Dashboard" selectedRoute="/dashboard/teacher">
                {/* 2. Main Container Box */}
               <Box 
    sx={{ 
        fontFamily: "'Plus Jakarta Sans', sans-serif !important",
        width: '100%',
                        overflowX: 'hidden',
        animation: 'fadeIn 0.6s ease-out', // Add the animation
        "@keyframes fadeIn": {
            "0%": { opacity: 0, transform: 'translateY(10px)' },
            "100%": { opacity: 1, transform: 'translateY(0)' }
        }
    }}
>
                    
                   
                    <Box sx={{ 
                        mb: 4, 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between', 
                        alignItems: { md: 'center' },
                        gap: 2,
                        pb: 3,
                        borderBottom: `1px solid ${BORDER_COLOR}`
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>
                                Dashboard
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Management and analytics for {user.name || 'Teacher'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <Button 
                                variant="outlined" 
                                startIcon={<TrendingUp size={16} />}
                                sx={{ 
                                    borderRadius: '2px', 
                                    borderColor: BORDER_COLOR, 
                                    color: '#0F172A',
                                    fontWeight: 700,
                                    px: 3,
                                    textTransform: 'none'
                                }}
                                onClick={() => navigate('/teacher/earnings')}
                            >
                                Reports
                            </Button>
                            <Button 
                                variant="contained" 
                                startIcon={<Plus size={16} />}
                                sx={{ 
                                    borderRadius: '2px', 
                                    bgcolor: '#0F172A', 
                                    '&:hover': { bgcolor: '#1E293B' },
                                    fontWeight: 700,
                                    px: 3,
                                    boxShadow: 'none',
                                    textTransform: 'none'
                                }}
                                onClick={() => navigate('/dashboard/teacher/upload-first-resource')}
                            >
                                New Resource
                            </Button>
                        </Box>
                    </Box>

                     {/* --- STAT CARDS --- */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Withdrawable Balance" value={`KES ${data?.currentBalance?.toLocaleString() || 0}`}  icon={<Wallet />} color={BRAND_BLUE} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Total Sales" value={data?.totalSales || 0} icon={<ShoppingBag />} color={BRAND_ORANGE} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Resources" value={data?.resources?.length || 0} icon={<Users />} color="#0EA5E9" />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatWidget title="Avg Rating" value={getAvgRating()} icon={<Star />} color="#F59E0B" />
                        </Grid>
                    </Grid>

                    {/* --- CHARTS & SIDEBAR SECTION --- */}
                    <Grid container spacing={3}>
                       <Grid item xs={12} md={8}>
    {/* --- REVENUE CHART --- */}
    <Paper 
        elevation={0} 
        sx={{ 
            p: 3, 
            border: `1px solid ${BORDER_COLOR}`, 
            borderRadius: '2px', 
            height: 450, 
            mb: 3 
        }}
    >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TrendingUp size={20} color={BRAND_BLUE} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Revenue Analytics</Typography>
            </Box>
            <Chip label="Last 30 Days" variant="outlined" sx={{ borderRadius: '2px', fontWeight: 700 }} />
        </Box>
        <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '2px' }} />
                <Area type="monotone" dataKey="sales" stroke={BRAND_BLUE} strokeWidth={2} fill={alpha(BRAND_BLUE, 0.1)} />
            </AreaChart>
        </ResponsiveContainer>
    </Paper>

    {/* ---  DYNAMIC ACTIVITY FEED  --- */}
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>Live Activity Feed</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Real-time updates
            </Typography>
        </Box>

        <Grid container spacing={2}>
            {notifications.length === 0 ? (
                <Grid item xs={12}>
                    <Box sx={{ py: 4, textAlign: 'center', bgcolor: '#F8FAFC', border: `1px dashed ${BORDER_COLOR}` }}>
                        <Typography variant="body2" color="text.secondary">
                            Waiting for your first sale or review to show activity...
                        </Typography>
                    </Box>
                </Grid>
            ) : (
                notifications.slice(0, 4).map((notif) => {
                    const isSale = notif.subtitle.toLowerCase().includes('purchased') || notif.title.toLowerCase().includes('sale');
                    const isReview = notif.subtitle.toLowerCase().includes('review') || notif.subtitle.toLowerCase().includes('rated');

                    return (
                        <Grid item xs={12} sm={6} key={notif.id}>
                            <Box 
                                sx={{ 
                                    p: 2, 
                                    height: '100%',
                                    bgcolor: '#FFF', 
                                    border: `1px solid ${BORDER_COLOR}`, 
                                    borderRadius: '2px',
                                    transition: 'all 0.2s',
                                    '&:hover': { bgcolor: '#F8FAFC', borderColor: BRAND_BLUE }
                                }}
                            >
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                    <Avatar 
                                        sx={{ 
                                            width: 36, height: 36, borderRadius: '2px',
                                            bgcolor: isSale ? alpha('#10B981', 0.1) : isReview ? alpha('#F59E0B', 0.1) : alpha(BRAND_BLUE, 0.1),
                                            color: isSale ? '#059669' : isReview ? '#D97706' : BRAND_BLUE,
                                        }}
                                    >
                                        {isSale ? <DollarSign size={18} /> : isReview ? <Star size={18} /> : <CheckCircle size={18} />}
                                    </Avatar>
                                    <Box sx={{ flexGrow: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2, mb: 0.5 }}>
                                            {isSale ? 'Successful Sale' : isReview ? 'New Resource Review' : 'System Update'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mb: 1 }}>
                                            {notif.subtitle}
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: BRAND_BLUE, display: 'block' }}>
                                            Just Now
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                    );
                })
            )}
        </Grid>
    </Paper>
</Grid>

                        <Grid item xs={12} md={4}>
                            {/* PROFILE CARD */}
                            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', mb: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Profile</Typography>
                                   
                                    <IconButton 
                                        size="small" 
                                        onClick={() => navigate('/teacher/settings')} 
                                        sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', color: BRAND_BLUE }}
                                    >
                                        <Edit3 size={16} />
                                    </IconButton>
                                </Box>
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>BIO</Typography>
                                
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        mt: 1, mb: 3, color: '#334155', fontWeight: 500,
                                        wordBreak: 'break-word',
                                        display: 'block',
                                        lineHeight: 1.6
                                    }}
                                >
                                    {profile.bio || "No bio added yet."}
                                </Typography>
                                <Divider sx={{ mb: 3 }} />
                                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>EXPERTISE</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, mb: 3 }}>
                                    {subjects.map((sub: string, i: number) => (
                                        <Chip key={i} label={sub} size="small" sx={{ borderRadius: '2px', bgcolor: '#F1F5F9', fontWeight: 700, fontSize: '0.7rem' }} />
                                    ))}
                                </Box>
                                <Box sx={{ p: 2, bgcolor: '#F8FAFC', border: `1px solid ${BORDER_COLOR}`, display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Wallet size={20} color={BRAND_ORANGE} />
                                    <Box>
                                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 600 }}>Payout Number</Typography>
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>+254 {profile.paymentNumber || 'Not Set'}</Typography>
                                    </Box>
                                </Box>
                            </Paper>
{/* ---  RESOURCE LIST --- */}
<Paper 
    elevation={0} 
    sx={{ 
        p: 3, 
        border: `1px solid ${BORDER_COLOR}`, 
        borderRadius: '2px', 
        mb: 3 
    }}
>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Top Resources</Typography>
        <Typography 
            variant="caption" 
            sx={{ fontWeight: 700, color: BRAND_BLUE, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard/teacher/resources')}
        >
            View All
        </Typography>
    </Box>

    <List disablePadding>
        {(!data?.resources || data.resources.length === 0) ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No active resources yet.
            </Typography>
        ) : (
            data.resources.slice(0, 3).map((res: any, i: number) => (
                <ListItem 
                    key={i} 
                    disableGutters 
                    sx={{ 
                        py: 1.5, 
                        borderBottom: i === (data.resources.slice(0, 3).length - 1) ? 'none' : `1px solid #F1F5F9`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, overflow: 'hidden', mr: 2 }}>
                        <Box sx={{ 
                            minWidth: 32, height: 32, 
                            bgcolor: '#F8FAFC', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            border: `1px solid ${BORDER_COLOR}` 
                        }}>
                            <ShoppingBag size={14} color={BRAND_BLUE} />
                        </Box>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                fontWeight: 700, 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                maxWidth: '150px' 
                            }}
                        >
                            {res.title}
                        </Typography>
                    </Box>
                    <Chip 
    
    label={`${res.salesCount ?? 0} Sold`} 
    size="small" 
    sx={{ 
        borderRadius: '2px', 
        height: 20, 
        fontSize: '0.65rem', 
        fontWeight: 800, 
        bgcolor: alpha('#10B981', 0.1), 
        color: '#059669',
        border: 'none',
        flexShrink: 0 
    }} 
/>

                </ListItem>
            ))
        )}
    </List>
</Paper>
                            {/* Notifications Card */}
                            <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', maxHeight: 400, overflowY: 'auto' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1.5 }}>
                                    <Bell size={20} color={BRAND_ORANGE} />
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Notifications</Typography>
                                </Box>
                                <List disablePadding>
                                  {notifications.length === 0 ? (
    <Box sx={{ 
        py: 8, 
        textAlign: 'center', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        opacity: 0.6 
    }}>
        <Box sx={{ 
            mb: 2, p: 2, 
            bgcolor: '#F8FAFC', 
            borderRadius: '2px', 
            border: `1px solid ${BORDER_COLOR}`,
            display: 'flex' 
        }}>
            <Bell size={32} strokeWidth={1.5} color={BRAND_ORANGE} />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
            All caught up!
        </Typography>
        <Typography variant="caption" sx={{ maxWidth: '200px', mt: 0.5 }}>
            You have no new notifications to review right now.
        </Typography>
    </Box>
) : (
                                        notifications.map((note) => (
                                           <ListItem 
    key={note.id}
    sx={{ 
        px: 0, 
        py: 1.5,
        borderBottom: `1px solid #F1F5F9`,
        display: 'flex',
        alignItems: 'flex-start', 
        position: 'relative'
    }}
>
    <ListItemAvatar sx={{ minWidth: 48 }}>
        <Avatar sx={{ borderRadius: '2px', bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, width: 32, height: 32 }}>
            <CheckCircle size={16} />
        </Avatar>
    </ListItemAvatar>
    
    <ListItemText 
        sx={{ 
            m: 0, 
            pr: 4 
        }}
        primary={<Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.2 }}>{note.title}</Typography>}
        secondary={<Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mt: 0.5 }}>{note.subtitle}</Typography>}
    />

   
    <IconButton 
        size="small" 
        onClick={() => handleDismissNotification(note.id)}
        sx={{ 
            position: 'absolute', 
            right: -4, 
            top: 8,
            color: '#94A3B8',
            '&:hover': { color: '#EF4444' }
        }}
    >
        <X size={14}/>
    </IconButton>
</ListItem>
                                        ))
                                    )}
                                </List>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box> {/* Closes Main Container Box */}
            </TeacherLayout>
           
            <AppNotification 
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </ThemeProvider>
    );
};

export default TeacherDashboard;