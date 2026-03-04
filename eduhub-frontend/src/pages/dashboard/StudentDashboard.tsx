import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Grid, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, TextField, Chip, Card, 
    CardContent, CardMedia, CardActions, Stack, CircularProgress, 
    IconButton, alpha, Snackbar, Alert, Avatar, Divider, createTheme, ThemeProvider,TablePagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { api } from '@/api/axios'; 
import StudentLayout from '../../components/StudentLayout';
import ReviewModal from '../../components/ReviewModal';
import AppNotification from '@/components/AppNotification';

// High-End Icons (Lucide)
import { 
    BookOpen, Download, History, Settings, Search, Star, 
    PlayCircle, CheckCircle, Wallet, Rocket, ArrowRight, 
    ExternalLink, ChevronRight, X, Flame, TrendingUp,Camera,User
} from 'lucide-react';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

// --- THEME & CONSTANTS ---
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap";
const BRAND_BLUE = '#2563EB'; 
const BRAND_ORANGE = '#F97316'; 
const BORDER_COLOR = '#E2E8F0';

const dashboardTheme = createTheme({
    typography: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    components: {
        MuiTypography: { styleOverrides: { root: { fontFamily: "'Plus Jakarta Sans', sans-serif !important" } } },
        MuiButton: { styleOverrides: { root: { borderRadius: '2px', textTransform: 'none', fontWeight: 700 } } },
    },
});

interface Resource {
    id: number;
    title: string;
    teacherName: string;
    subject: string;
    grade?: string;
    previewImageUrl?: string;
}

interface DashboardData {
    student: { name: string; email: string; avatar?: string };
    stats: { downloads: number; sessions: number; wishlist: number; totalSpent: number; };
    recentPurchase?: { title: string; teacher: string; id: number } | null;
    streak?: { currentStreak: number; isActiveToday: boolean };
    activityChart?: any[];
}

// --- SUB-COMPONENTS ---

const StreakWidget = ({ streakData }: { streakData: any }) => {
    const currentStreak = streakData?.currentStreak || 0;
    const isActiveToday = streakData?.isActiveToday || false;

    return (
        <Paper elevation={0} sx={{ 
            p: 3, mb: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px',
            background: isActiveToday ? `linear-gradient(135deg, ${alpha(BRAND_ORANGE, 0.05)} 0%, #FFFFFF 100%)` : '#FFF',
            position: 'relative', overflow: 'hidden'
        }}>
            <Flame size={80} style={{ position: 'absolute', right: -10, bottom: -10, opacity: 0.05, color: BRAND_ORANGE }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ 
                    p: 1, bgcolor: isActiveToday ? BRAND_ORANGE : '#94A3B8', color: '#FFF', borderRadius: '2px', display: 'flex',
                    animation: isActiveToday ? 'pulse 2s infinite' : 'none',
                    "@keyframes pulse": { "0%": { boxShadow: `0 0 0 0 ${alpha(BRAND_ORANGE, 0.4)}` }, "70%": { boxShadow: `0 0 0 10px ${alpha(BRAND_ORANGE, 0)}` }, "100%": { boxShadow: `0 0 0 0 ${alpha(BRAND_ORANGE, 0)}` } }
                }}>
                    <Flame size={20} />
                </Box>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{currentStreak} Day Streak</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                        {isActiveToday ? "You're on fire! Keep it up." : "Log in tomorrow to start a streak!"}
                    </Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                {[...Array(7)].map((_, i) => (
                    <Box key={i} sx={{ width: '12%', height: 6, borderRadius: '1px', bgcolor: i < (currentStreak % 8) ? BRAND_ORANGE : '#E2E8F0' }} />
                ))}
            </Box>
        </Paper>
    );
};

const LearningAnalytics = ({ chartData }: any) => (
    <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', height: 350, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <TrendingUp size={20} color={BRAND_BLUE} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>Learning Activity</Typography>
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>LAST 30 DAYS</Typography>
        </Box>
        <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={chartData && chartData.length > 0 ? chartData : [{date: 'Today', activity: 0}]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: '2px', fontWeight: 700 }} />
                <Area type="monotone" dataKey="activity" stroke={BRAND_BLUE} strokeWidth={2} fill={alpha(BRAND_BLUE, 0.1)} />
            </AreaChart>
        </ResponsiveContainer>
    </Paper>
);

const EmptyState = ({ title, description, buttonText, onButtonClick, icon }: any) => (
    <Box sx={{ 
        textAlign: 'center', py: 8, px: 2, bgcolor: '#F8FAFC', 
        borderRadius: '2px', border: `1px dashed ${BORDER_COLOR}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
        <Box sx={{ p: 2, bgcolor: alpha(BRAND_BLUE, 0.05), color: BRAND_BLUE, borderRadius: '2px', mb: 2 }}>
            {React.cloneElement(icon, { size: 40 })}
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#0F172A' }}>{title}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400, mb: 3, fontWeight: 500 }}>
            {description}
        </Typography>
        {buttonText && (
            <Button variant="contained" onClick={onButtonClick} sx={{ bgcolor: '#0F172A', px: 4 }}>
                {buttonText}
            </Button>
        )}
    </Box>
);

// --- MAIN DASHBOARD ---

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedReviewResource, setSelectedReviewResource] = useState<any>(null);

    useEffect(() => {
        api.get('/api/student/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
    }, []);

    const handleOpenReview = (res: Resource) => {
        setSelectedReviewResource({ id: res.id, title: res.title });
        setReviewModalOpen(true);
    };

    if (loading) return (
        <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
             <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress sx={{ color: BRAND_BLUE }} /></Box>
        </StudentLayout>
    );

    return (
       <ThemeProvider theme={dashboardTheme}>
            <link rel="stylesheet" href={FONT_LINK} />
            <StudentLayout activeTab={activeTab} onTabChange={setActiveTab}>
                <Box sx={{ animation: 'fadeIn 0.5s ease-out', "@keyframes fadeIn": { "0%": { opacity: 0, transform: 'translateY(10px)' }, "100%": { opacity: 1, transform: 'translateY(0)' } } }}>
                    
                    {activeTab === 'overview' && data && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={8}>
                                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>
                                            Dashboard
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                            Welcome back, {data.student.name}
                                        </Typography>
                                    </Box>
                                    <Button 
                                        variant="contained" 
                                        startIcon={<Search size={16} />} 
                                        onClick={() => navigate('/browse')}
                                        sx={{ bgcolor: '#0F172A' }}
                                    >
                                        Browse
                                    </Button>
                                </Box>

                                <LearningAnalytics chartData={data.activityChart} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>My Library</Typography>
                                    <Button 
                                        endIcon={<ChevronRight size={16}/>} 
                                        onClick={() => setActiveTab('library')}
                                        sx={{ color: BRAND_BLUE, fontWeight: 800 }}
                                    >
                                        View All
                                    </Button>
                                </Box>
                               <LibrarySection onReview={handleOpenReview} limit={4} /> 
        </Grid>

                            <Grid item xs={12} md={4}>
                                <StreakWidget streakData={data.streak} />

                                {data.recentPurchase && (
                                    <Paper elevation={0} sx={{ p: 3, mb: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', bgcolor: '#F8FAFC' }}>
                                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                                            <Rocket size={20} color={BRAND_BLUE} />
                                            <Typography variant="caption" sx={{ fontWeight: 800, color: BRAND_BLUE, textTransform: 'uppercase' }}>Jump Back In</Typography>
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 800, mb: 2 }}>{data.recentPurchase.title}</Typography>
                                        <Button 
                                            fullWidth variant="contained" 
                                            onClick={() => setActiveTab('library')}
                                            sx={{ bgcolor: '#0F172A', boxShadow: 'none' }}
                                        >
                                            Resume Learning
                                        </Button>
                                    </Paper>
                                )}

                                <Paper elevation={0} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 3 }}>Learning Summary</Typography>
                                    <Stack spacing={2.5}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <BookOpen size={16} color="#64748B" />
                                                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Total Books</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>{data.stats.downloads}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Wallet size={16} color="#64748B" />
                                                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>Total Spent</Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>KES {data.stats.totalSpent}</Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                    
                    {activeTab === 'library' && (
                         <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>My Library</Typography>
                           <LibrarySection onReview={handleOpenReview} isPaginated={true} />
                         </Box>
                    )}
                    {activeTab === 'history' && (
                        <Box>
                             <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Purchase History</Typography>
                             <HistorySection />
                        </Box>
                    )}
                    {activeTab === 'settings' && (
                        <Box>
                             <Typography variant="h4" sx={{ fontWeight: 800, mb: 3 }}>Account Settings</Typography>
                             <AccountSettingsSection />
                        </Box>
                    )}

                    <ReviewModal 
                        open={reviewModalOpen} 
                        onClose={() => setReviewModalOpen(false)} 
                        resourceId={selectedReviewResource?.id || null} 
                        resourceTitle={selectedReviewResource?.title || ''} 
                        onSuccess={() => setReviewModalOpen(false)} 
                    />
                </Box>
            </StudentLayout>
       </ThemeProvider>
    );
};

// --- SECTION FUNCTIONS ---

function LibrarySection({ onReview, limit, isPaginated }: { onReview: (res: Resource) => void, limit?: number, isPaginated?: boolean }) {
    const navigate = useNavigate();
    
    // Logic States
    const [resources, setResources] = useState<Resource[]>([]);
    const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // Pagination State
    const [page, setPage] = useState(0);
    const rowsPerPage = 8; 

    // -- FETCH PURCHASES ---
    useEffect(() => {
        api.get('/api/student/purchases')
            .then(res => {
                const data = res.data.resources || [];
                setResources(data);
                setFilteredResources(data);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    // --- SEARCH FILTERING ---
    useEffect(() => {
        const result = resources.filter(r => 
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.subject.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredResources(result);
        setPage(0); // Reset pagination on search
    }, [searchTerm, resources]);

    // --- DOWNLOAD HANDLER ---
    const handleDownload = async (resourceId: number, title: string, openInNewTab: boolean = false) => {
        try {
            setDownloadingId(resourceId);
            const response = await api.get(`/api/student/download/${resourceId}`, {
                responseType: 'blob',
            });
            const file = new Blob([response.data], { type: response.headers['content-type'] });
            const fileURL = URL.createObjectURL(file);

            if (openInNewTab) {
                window.open(fileURL, '_blank');
            } else {
                const link = document.createElement('a');
                link.href = fileURL;
                link.setAttribute('download', `${title}.pdf`); 
                document.body.appendChild(link);
                link.click();
                link.remove();
            }
        } catch (error) {
            console.error("Download failed", error);
        } finally {
            setDownloadingId(null);
        }
    };

    // --- DISPLAY LOGIC: LIMIT VS PAGINATION ---
    const displayResources = limit 
        ? filteredResources.slice(0, limit) 
        : (isPaginated 
            ? filteredResources.slice(page * rowsPerPage, (page + 1) * rowsPerPage) 
            : filteredResources);

    const totalPages = Math.ceil(filteredResources.length / rowsPerPage);

    if (loading) return <Box sx={{ py: 5, textAlign: 'center' }}><CircularProgress size={30} sx={{ color: BRAND_BLUE }} /></Box>;

    if (resources.length === 0) {
        return (
            <EmptyState 
                title="Your library is empty" 
                description="Browse our collection to find exams, notes, and schemes of work to start your streak."
                buttonText="Browse Resources"
                onButtonClick={() => navigate('/browse')} 
                icon={<BookOpen />}
            />
        );
    }

    return (
        <Box>
            {/* SEARCH BAR: Only shows in Full Library tab, hidden in Dashboard Overview */}
            {!limit && (
                <Paper elevation={0} sx={{ p: 1.5, mb: 4, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, display: 'flex', alignItems: 'center', bgcolor: '#F8FAFC' }}>
                    <Search size={18} style={{ marginLeft: 8, marginRight: 12, color: '#64748B' }} />
                    <TextField 
                        fullWidth 
                        placeholder="Search your library..." 
                        variant="standard"
                        InputProps={{ disableUnderline: true, style: { fontWeight: 600, fontSize: '0.9rem' } }}
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </Paper>
            )}
            
            <Grid container spacing={3}>
                {displayResources.map((res) => (
                    <Grid item xs={12} sm={6} md={limit ? 6 : 4} lg={limit ? 6 : 3} key={res.id}>
                        <Card 
                            elevation={0} 
                            sx={{ 
                                height: '100%', borderRadius: '2px', 
                                border: `1px solid ${BORDER_COLOR}`,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': { transform: 'translateY(-4px)', borderColor: BRAND_BLUE, boxShadow: `0 10px 20px ${alpha(BRAND_BLUE, 0.05)}` }
                            }}
                        >
                            <Box sx={{ height: 140, bgcolor: '#F1F5F9', position: 'relative', overflow: 'hidden' }}>
                                {res.previewImageUrl ? (
                                    <CardMedia component="img" image={res.previewImageUrl} sx={{ height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <BookOpen size={40} color={alpha(BRAND_BLUE, 0.1)} />
                                    </Box>
                                )}
                                <Chip 
                                    label={res.subject} 
                                    sx={{ 
                                        position: 'absolute', top: 10, left: 10, 
                                        borderRadius: '2px', bgcolor: 'white', 
                                        fontWeight: 800, fontSize: '0.65rem',
                                        border: `1px solid ${BORDER_COLOR}`,
                                        height: 20
                                    }} 
                                />
                            </Box>
                            
                            <CardContent sx={{ p: 2 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', height: 40, overflow: 'hidden', mb: 1, lineHeight: 1.3 }}>
                                    {res.title}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CheckCircle size={12} color={BRAND_BLUE} /> {res.teacherName || 'Instructor'}
                                </Typography>
                            </CardContent>

                            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
                                <Button 
                                    variant="contained" 
                                    fullWidth
                                    size="small"
                                    disabled={downloadingId === res.id}
                                    onClick={() => handleDownload(res.id, res.title, true)}
                                    sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' }, boxShadow: 'none' }}
                                >
                                    {downloadingId === res.id ? <CircularProgress size={16} color="inherit" /> : 'Open'}
                                </Button>
                                
                                <IconButton 
                                    onClick={() => onReview(res)} 
                                    size="small"
                                    sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', color: BRAND_ORANGE }}
                                >
                                    <Star size={16} />
                                </IconButton>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* PAGINATION CONTROLS: Only shows in Full Library tab if more than 1 page exists */}
            {isPaginated && totalPages > 1 && (
                <Box sx={{ mt: 6, py: 3, borderTop: `1px solid ${BORDER_COLOR}`, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 3 }}>
                    <Button 
                        size="small"
                        disabled={page === 0} 
                        onClick={() => setPage(p => p - 1)}
                        variant="outlined"
                        sx={{ borderColor: BORDER_COLOR, color: '#0F172A', fontWeight: 700, px: 3 }}
                    >
                        Previous
                    </Button>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>
                        PAGE {page + 1} OF {totalPages}
                    </Typography>
                    <Button 
                        size="small"
                        disabled={(page + 1) >= totalPages} 
                        onClick={() => setPage(p => p + 1)}
                        variant="outlined"
                        sx={{ borderColor: BORDER_COLOR, color: '#0F172A', fontWeight: 700, px: 3 }}
                    >
                        Next
                    </Button>
                </Box>
            )}

            {/* Empty search result fallback */}
            {filteredResources.length === 0 && resources.length > 0 && (
                 <Box sx={{ py: 10, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        No results match your search.
                    </Typography>
                 </Box>
            )}
        </Box>
    );
}

function HistorySection() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        api.get('/api/student/order-history')
            .then(res => setOrders(res.data.orders || []))
            .finally(() => setLoading(false));
    }, []);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    if (loading) return <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress size={30} /></Box>;

    if (orders.length === 0) {
        return (
            <EmptyState 
                title="No purchase history" 
                description="You haven't made any purchases yet. Your receipts will appear here once you buy a resource."
                buttonText="Start Learning"
                onButtonClick={() => window.location.href = '/browse'}
                icon={<History />}
            />
        );
    }

    return (
        <Paper 
            elevation={0} 
            sx={{ 
                border: `1px solid ${BORDER_COLOR}`, 
                borderRadius: '2px',
                overflow: 'hidden' 
            }}
        >
            <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ bgcolor: '#F8FAFC' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', py: 2 }}>
                                DATE
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>
                                RESOURCE NAME
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>
                                SUBJECT
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>
                                PRICE
                            </TableCell>
                            <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem' }}>
                                STATUS
                            </TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', pr: 3 }}>
                                ACTION
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((order) => (
                            <TableRow 
                                key={order.id} 
                                hover
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell sx={{ fontWeight: 600, color: '#0F172A', py: 2.5 }}>
                                    {new Date(order.purchasedAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', month: 'short', day: 'numeric' 
                                    })}
                                </TableCell>
                                <TableCell sx={{ fontWeight: 800, color: '#0F172A' }}>
                                    {order.resource?.title}
                                </TableCell>
                                <TableCell>
                                    <Chip 
                                        label={order.resource?.subject} 
                                        size="small" 
                                        sx={{ 
                                            borderRadius: '2px', 
                                            fontWeight: 700, 
                                            fontSize: '0.65rem',
                                            bgcolor: alpha(BRAND_BLUE, 0.05),
                                            color: BRAND_BLUE,
                                            border: `1px solid ${alpha(BRAND_BLUE, 0.1)}`
                                        }} 
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>
                                    KES {order.price?.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#10B981' }} />
                                        <Typography variant="caption" sx={{ fontWeight: 800, color: '#059669' }}>
                                            Paid
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell align="right" sx={{ pr: 3 }}>
                                    <Button 
                                        size="small" 
                                        startIcon={<ExternalLink size={14} />}
                                        sx={{ 
                                            color: '#64748B', 
                                            fontWeight: 700, 
                                            fontSize: '0.75rem',
                                            '&:hover': { color: BRAND_BLUE, bgcolor: 'transparent' }
                                        }}
                                    >
                                        Receipt
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/*  PAGINATION BAR */}
            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={orders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{
                    borderTop: `1px solid ${BORDER_COLOR}`,
                    bgcolor: '#F8FAFC',
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        color: '#64748B'
                    },
                    '& .MuiTablePagination-select': {
                        fontWeight: 800,
                        fontSize: '0.75rem'
                    }
                }}
            />
        </Paper>
    );
}
function AccountSettingsSection() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicPath, setProfilePicPath] = useState('');
    const [saving, setSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    
    // Snackbar State 
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        api.get('/api/student/account-settings').then(res => {
            setName(res.data.name || '');
            setEmail(res.data.email || '');
            setProfilePicPath(res.data.profilePicPath || '');
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (selectedFile) formData.append('profilePic', selectedFile);
            
            await api.post('/api/student/account-settings', formData);
            
            // Success Feedback
            setSnackbar({ open: true, message: 'Settings updated successfully!', severity: 'success' });
            setSelectedFile(null); // Clear pending file
        } catch (e) { 
            console.error(e); 
            setSnackbar({ open: true, message: 'Failed to update settings.', severity: 'error' });
        } finally { 
            setSaving(false); 
        }
    };

    return (
        <Paper elevation={0} sx={{ p: 4, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', maxWidth: 800 }}>
            {/* SECTION: IDENTITY */}
            <Box sx={{ mb: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Avatar sx={{ bgcolor: alpha(BRAND_BLUE, 0.1), color: BRAND_BLUE, borderRadius: '2px', width: 32, height: 32 }}>
                        <User size={18} />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>Public Identity</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar 
                            src={previewUrl || (profilePicPath?.startsWith('http') ? profilePicPath : `${import.meta.env.VITE_API_URL}/${profilePicPath}`)} 
                            sx={{ width: 100, height: 100, borderRadius: '2px', border: `1px solid ${BORDER_COLOR}`, bgcolor: '#F8FAFC' }} 
                        />
                        <IconButton 
                            component="label"
                            sx={{ 
                                position: 'absolute', bottom: -10, right: -10, bgcolor: '#0F172A', color: 'white', 
                                '&:hover': { bgcolor: '#1E293B' }, width: 32, height: 32, border: '2px solid white'
                            }}
                        >
                            <Camera size={16} />
                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) { 
                                    setSelectedFile(file); 
                                    setPreviewUrl(URL.createObjectURL(file)); 
                                }
                            }} />
                        </IconButton>
                    </Box>
                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>Profile Photo</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, maxWidth: 300 }}>
                            This photo will be displayed alongside your resource reviews.
                        </Typography>
                        {previewUrl && (
                            <Button 
                                size="small" 
                                variant="outlined" 
                                color="error" 
                                sx={{ borderRadius: '2px', textTransform: 'none', fontWeight: 700, mt: 1 }} 
                                onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                            >
                                Cancel Changes
                            </Button>
                        )}
                    </Box>
                </Box>
            </Box>

            <Divider sx={{ mb: 4 }} />

            {/* SECTION: FORM FIELDS */}
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1, letterSpacing: 1 }}>
                        FULL NAME
                    </Typography>
                    <TextField 
                        fullWidth 
                        variant="outlined"
                        placeholder="e.g. John Doe"
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px' } }}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1, letterSpacing: 1 }}>
                        EMAIL ADDRESS
                    </Typography>
                    <TextField 
                        fullWidth 
                        disabled
                        value={email} 
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#F8FAFC' } }}
                    />
                </Grid>
            </Grid>

            {/* SAVE BUTTON */}
            <Box sx={{ mt: 6, pt: 4, borderTop: `1px solid ${BORDER_COLOR}`, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                    variant="contained" 
                    onClick={handleSave} 
                    disabled={saving}
                    sx={{ bgcolor: '#0F172A', px: 6, py: 1.5, '&:hover': { bgcolor: '#1E293B' }, boxShadow: 'none' }}
                >
                    {saving ? <CircularProgress size={20} color="inherit" /> : 'Save Profile Changes'}
                </Button>
            </Box>

           
            <AppNotification 
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            />
        </Paper>
    );
}
export default StudentDashboard;