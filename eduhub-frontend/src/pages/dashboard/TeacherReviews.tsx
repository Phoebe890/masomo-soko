import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, Typography, Paper, Rating, Grid, Chip, CircularProgress, 
    Avatar, Stack, Divider, alpha, createTheme, ThemeProvider, 
    Select, MenuItem, FormControl, InputLabel, TablePagination
} from '@mui/material';
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';

// High-End Icons (Lucide) - RESTORED
import { 
    Star, MessageSquare, Filter, Calendar, 
    BookOpen, Users, ArrowUpRight, MessageCircle 
} from 'lucide-react';

const BRAND_BLUE = '#2563EB';
const BRAND_ORANGE = '#F97316';
const BORDER_COLOR = '#E2E8F0';

const reviewsTheme = createTheme({
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

const TeacherReviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('All');
    
    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(6);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await api.get('/api/teacher/reviews');
            const rawData = Array.isArray(res.data) ? res.data : (res.data.reviews || []);
            
            
            const mapped = rawData.map((r: any) => ({
                id: r.id,
                rating: r.rating,
                comment: r.comment,
                resourceTitle: r.resource?.title || r.resourceTitle || "Resource",
                resourceId: r.resource?.id || r.resourceId,
                studentName: r.student?.name || r.user?.name || r.studentName || "Student",
                date: r.createdAt || r.date || new Date()
            }));

            setReviews(mapped);
        } catch (err) {
            console.error("Error fetching reviews:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- ACCURATE STATS CALCULATION  ---
    const stats = useMemo(() => {
        if (reviews.length === 0) return { avg: "0.0", total: 0, uniqueResources: 0 };
        const sum = reviews.reduce((acc, curr) => acc + (curr.rating || 0), 0);
        const uniqueIds = new Set(reviews.map(r => r.resourceId || r.resourceTitle));
        return {
            avg: (sum / reviews.length).toFixed(1),
            total: reviews.length,
            uniqueResources: uniqueIds.size
        };
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        let result = filterRating === 'All' ? reviews : reviews.filter(r => r.rating === parseInt(filterRating));
        return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [reviews, filterRating]);

    const paginatedReviews = filteredReviews.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleChangePage = (_: any, newPage: number) => setPage(newPage);

    // ---  STAT WIDGET  ---
    const StatWidget = ({ label, value, icon, color }: any) => (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', 
                height: '100%', bgcolor: '#FFF', position: 'relative', overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: color, transform: 'translateY(-2px)' }
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ p: 1, bgcolor: alpha(color, 0.1), color: color, display: 'flex' }}>
                    {icon}
                </Box>
                <ArrowUpRight size={16} color="#CBD5E1" />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.04em' }}>{value}</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase' }}>
                {label}
            </Typography>
        </Paper>
    );

    return (
        <ThemeProvider theme={reviewsTheme}>
            <TeacherLayout title="Reviews" selectedRoute="/teacher/reviews">
                <Box sx={{ width: '100%', animation: 'fadeIn 0.6s ease-out' }}>
                    
                    {/* --- HEADER --- */}
                    <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${BORDER_COLOR}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>
                                Student Feedback
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                Analyze ratings and comments from students who purchased your work.
                            </Typography>
                        </Box>
                        
                        <FormControl size="small" sx={{ minWidth: 180 }}>
                            <Select
                                value={filterRating}
                                onChange={(e) => { setFilterRating(e.target.value); setPage(0); }}
                                displayEmpty
                                sx={{ borderRadius: '2px', height: 42, bgcolor: '#FFF', fontWeight: 700 }}
                            >
                                <MenuItem value="All">All Reviews</MenuItem>
                                {[5, 4, 3, 2, 1].map(num => (
                                    <MenuItem key={num} value={num.toString()}>{num} Stars</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {/* --- STATS ROW --- */}
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        <Grid item xs={12} sm={4}>
                            <StatWidget label="Average Rating" value={stats.avg} icon={<Star size={20} />} color="#F59E0B" />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatWidget label="Total Reviews" value={stats.total} icon={<Users size={20} />} color={BRAND_BLUE} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatWidget label="Resources Reviewed" value={stats.uniqueResources} icon={<BookOpen size={20} />} color={BRAND_ORANGE} />
                        </Grid>
                    </Grid>

                    {/* --- REVIEWS LIST --- */}
                    {loading ? (
                        <Box sx={{ py: 10, textAlign: 'center' }}><CircularProgress size={30} sx={{ color: BRAND_BLUE }} /></Box>
                    ) : (
                        <Box>
                            <Stack spacing={2.5}>
                                {paginatedReviews.length === 0 ? (
                                    <Paper sx={{ p: 10, textAlign: 'center', border: `1px dashed ${BORDER_COLOR}`, bgcolor: '#F8FAFC', borderRadius: '2px' }}>
                                        <MessageCircle size={48} color="#CBD5E1" style={{ marginBottom: 16 }} />
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#475569' }}>No feedback found</Typography>
                                        <Typography variant="body2" color="text.secondary">When students review your resources, they will appear here.</Typography>
                                    </Paper>
                                ) : (
                                    paginatedReviews.map((review) => (
                                        <Paper 
                                            key={review.id} 
                                            elevation={0} 
                                            sx={{ 
                                                p: 3, border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px',
                                                transition: 'all 0.2s ease',
                                                '&:hover': { borderColor: BRAND_BLUE, bgcolor: '#FBFCFF' }
                                            }}
                                        >
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={9}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                                                        <Chip 
                                                            label={review.resourceTitle} 
                                                            size="small" 
                                                            sx={{ borderRadius: '2px', fontWeight: 800, bgcolor: alpha(BRAND_BLUE, 0.08), color: BRAND_BLUE, fontSize: '0.65rem' }} 
                                                        />
                                                        <Rating value={review.rating} readOnly size="small" sx={{ color: '#F59E0B' }} />
                                                    </Box>
                                                    
                                                    <Typography variant="body1" sx={{ fontWeight: 600, color: '#334155', mb: 1, lineHeight: 1.6 }}>
                                                        {review.comment ? `"${review.comment}"` : <span style={{ color: '#94A3B8', fontStyle: 'italic' }}>No comment provided.</span>}
                                                    </Typography>
                                                </Grid>

                                                <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: { md: 'flex-end' }, alignItems: 'center' }}>
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                                                                {review.studentName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                                                <Calendar size={12} /> {new Date(review.date).toLocaleDateString()}
                                                            </Typography>
                                                        </Box>
                                                        <Avatar 
                                                            sx={{ 
                                                                width: 44, height: 44, borderRadius: '2px', 
                                                                bgcolor: '#F1F5F9', color: BRAND_BLUE, 
                                                                fontWeight: 800, fontSize: '1rem', border: `1px solid ${BORDER_COLOR}`
                                                            }}
                                                        >
                                                            {review.studentName ? review.studentName[0].toUpperCase() : '?'}
                                                        </Avatar>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    ))
                                )}
                            </Stack>

                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                                <TablePagination
                                    component="div"
                                    count={filteredReviews.length}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                    rowsPerPageOptions={[6, 12, 24]}
                                    sx={{ borderTop: 'none', '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': { fontWeight: 700, color: '#64748B' } }}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </TeacherLayout>
        </ThemeProvider>
    );
};

export default TeacherReviews;