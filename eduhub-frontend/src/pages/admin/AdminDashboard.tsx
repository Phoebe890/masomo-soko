import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Button, Avatar,
    Grid, IconButton, Menu, MenuItem,
    useTheme, useMediaQuery, Chip, Container, Paper,
    Divider, List, ListItem, ListItemAvatar, ListItemText,
    CircularProgress, Badge, Popover, Tooltip, Alert,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// Icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import MenuIcon from '@mui/icons-material/Menu';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import AdminSidebar from './AdminSidebar';

const BACKEND_URL = "http://localhost:8081";

// --- Types ---
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
    mpesaNumber: string;
    status: string;
    date: string;
}

interface Notification {
    id: number;
    message: string;
    createdAt: string;
    read: boolean;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // Layout State
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
    const [error, setError] = useState<string | null>(null);

    // Data State
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentWithdrawals, setRecentWithdrawals] = useState<Withdrawal[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, payoutsRes, notifRes] = await Promise.all([
                    api.get(`${BACKEND_URL}/api/admin/stats`, { withCredentials: true }),
                    api.get(`${BACKEND_URL}/api/admin/payouts`, { withCredentials: true }),
                    api.get(`${BACKEND_URL}/api/admin/notifications`, { withCredentials: true }).catch(() => ({ data: [] }))
                ]);

                setStats(statsRes.data);
                setNotifications(notifRes.data);

                const allPayouts: Withdrawal[] = payoutsRes.data;
                // For the Table: Take top 10
                setRecentWithdrawals(allPayouts.slice(0, 10));

                // Process Chart
                setChartData(processChartData(allPayouts));
                setError(null);
            } catch (err) {
                console.error("Dashboard Error:", err);
                setError("Failed to connect to backend services.");
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
            if (last7Days.has(key)) last7Days.set(key, (last7Days.get(key) || 0) + p.amount);
        });
        return Array.from(last7Days, ([name, amount]) => ({ name, amount }));
    };

    const handleMarkAllRead = async () => {
        try {
            await api.post(`${BACKEND_URL}/api/admin/notifications/clear`, {}, { withCredentials: true });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    const NotificationsPopover = () => (
        <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={() => setNotifAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ sx: { width: 320, maxHeight: 400, borderRadius: 3, mt: 1.5 } }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontWeight={700}>Notifications</Typography>
                <Typography variant="caption" sx={{ cursor: 'pointer', color: 'primary.main' }} onClick={handleMarkAllRead}>Mark all read</Typography>
            </Box>
            <List>
                {notifications.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}><Typography variant="body2" color="text.secondary">No new notifications</Typography></Box>
                ) : (
                    notifications.map(n => (
                        <ListItem key={n.id} sx={{ bgcolor: n.read ? 'white' : '#F3F4F6' }}>
                            <ListItemText primary={n.message} secondary={new Date(n.createdAt).toLocaleDateString()} />
                        </ListItem>
                    ))
                )}
            </List>
        </Popover>
    );

    const StatWidget = ({ title, value, icon, color, subValue }: any) => (
        <Paper elevation={0} sx={{ 
            p: 3, borderRadius: 3, border: '1px solid #eee', 
            height: '100%', display: 'flex', flexDirection: 'column', 
            justifyContent: 'space-between' 
        }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color }}>{icon}</Box>
                <Chip icon={<ArrowUpwardIcon sx={{ width: 14 }} />} label="Live" size="small" sx={{ bgcolor: `${color}15`, color: color, fontWeight: 700, fontSize: '0.7rem' }} />
            </Box>
            <Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0E243C' }}>{value}</Typography>
                <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
                {subValue && <Typography variant="caption" sx={{ color: color, mt: 1, display: 'block', fontWeight: 600 }}>{subValue}</Typography>}
            </Box>
        </Paper>
    );

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '100vh', alignItems: 'center' }}><CircularProgress /></Box>;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
            
            <AdminSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                selected={location.pathname} 
            />

            <Box component="main" sx={{ flexGrow: 1, width: { sm: `calc(100% - 260px)` } }}>
                
                {/* Navbar */}
                <Box sx={{ bgcolor: 'white', px: { xs: 2, md: 4 }, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E0E0E0', position: 'sticky', top: 0, zIndex: 100 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton 
                            onClick={() => setSidebarOpen(!sidebarOpen)} 
                            sx={{ display: { md: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" fontWeight={800} color="text.primary">Admin Console</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton onClick={(e) => setNotifAnchorEl(e.currentTarget)}>
                            <Badge badgeContent={notifications.filter(n => !n.read).length} color="error"><NotificationsNoneIcon /></Badge>
                        </IconButton>
                        <NotificationsPopover />
                        <Avatar onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ cursor: 'pointer', bgcolor: '#111827' }}>A</Avatar>
                        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                            <MenuItem onClick={() => navigate('/login')}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Box>

                <Container maxWidth="xl" sx={{ p: { xs: 2, md: 4 } }}>
                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    {stats && (
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatWidget title="Platform Revenue" value={`KES ${stats.platformRevenue.toLocaleString()}`} icon={<AttachMoneyIcon />} color="#10B981" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatWidget title="Total Users" value={stats.totalUsers.toLocaleString()} icon={<PeopleIcon />} color="#3B82F6" />
                            </Grid>
                            <Grid item xs={12} sm={6} md={4}>
                                <StatWidget title="Pending Payouts" value={stats.pendingPayouts} icon={<RequestQuoteIcon />} color="#F59E0B" />
                            </Grid>
                        </Grid>
                    )}

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {/* Chart */}
                        <Grid item xs={12} md={8}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: 400 }}>
                                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Volume Trends</Typography>
                                <ResponsiveContainer width="100%" height="90%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorAdmin" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="url(#colorAdmin)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Paper>
                        </Grid>

                        {/* Summary Widget */}
                        <Grid item xs={12} md={4}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #eee', height: '100%', bgcolor: '#1F2937', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                <ReceiptLongIcon sx={{ fontSize: 60, opacity: 0.8, mb: 2 }} />
                                <Typography variant="h5" fontWeight={700}>{recentWithdrawals.length} Recent Requests</Typography>
                                <Button variant="outlined" sx={{ mt: 2, color: 'white', borderColor: 'white' }} onClick={() => navigate('/admin/payouts')}>Manage Payouts</Button>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* RESTORED TABLE SECTION */}
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', overflow: 'hidden' }}>
                                <Box sx={{ p: 3, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" fontWeight={700}>Recent Transaction History</Typography>
                                    <IconButton size="small"><MoreVertIcon /></IconButton>
                                </Box>
                                <TableContainer>
                                    <Table>
                                        <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>TEACHER</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>DATE</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>MPESA NO.</TableCell>
                                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>STATUS</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>AMOUNT</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {recentWithdrawals.map((row) => (
                                                <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                                    <TableCell sx={{ fontWeight: 500 }}>{row.teacherName}</TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{new Date(row.date).toLocaleDateString()}</TableCell>
                                                    <TableCell sx={{ color: 'text.secondary' }}>{row.mpesaNumber}</TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={row.status} 
                                                            size="small" 
                                                            sx={{ 
                                                                fontWeight: 700, borderRadius: 1,
                                                                bgcolor: row.status === 'PAID' ? '#DCFCE7' : row.status === 'PENDING' ? '#FEF3C7' : '#FEE2E2',
                                                                color: row.status === 'PAID' ? '#166534' : row.status === 'PENDING' ? '#B45309' : '#991B1B'
                                                            }} 
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                        {new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(row.amount)}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {recentWithdrawals.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                                                        No data available
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Paper>
                        </Grid>
                    </Grid>

                </Container>
            </Box>
        </Box>
    );
};

export default AdminDashboard;