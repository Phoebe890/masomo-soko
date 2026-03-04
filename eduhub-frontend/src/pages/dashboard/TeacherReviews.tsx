import React, { useEffect, useState, useMemo } from 'react';
import { 
    Box, Typography, Paper, Rating, Grid, Chip, CircularProgress, 
    Avatar, Stack, Divider, alpha, createTheme, ThemeProvider, 
    Select, MenuItem, FormControl, InputLabel, TablePagination,
    IconButton, Skeleton, Dialog, DialogTitle, DialogContent, DialogActions, Button // Added new UI components
} from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Added for back button
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';
import AppNotification from '@/components/AppNotification';

// High-End Icons (Lucide)
import { 
    Star, MessageSquare, Filter, Calendar, 
    BookOpen, Users, ArrowUpRight, MessageCircle, 
    ArrowLeft, Trash2, AlertCircle // Added new icons
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
    const navigate = useNavigate(); // Initialize navigate
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterRating, setFilterRating] = useState('All');
    
    // Deletion State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', type: 'success' as 'success' | 'error' });

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
            // Small timeout for smooth skeleton transition
            setTimeout(() => setLoading(false), 800);
        }
    };

    // --- DELETE REVIEW LOGIC ---
    const handleDeleteConfirm = async () => {
        if (!reviewToDelete) return;
        setIsDeleting(true);
        try {
            await api.delete(`/api/teacher/reviews/${reviewToDelete}`);
            setSnackbar({ open: true, msg: "Review deleted successfully", type: 'success' });
            setReviews(reviews.filter(r => r.id !== reviewToDelete));
            setDeleteDialogOpen(false);
        } catch (error) {
            setSnackbar({ open: true, msg: "Failed to delete review", type: 'error' });
        } finally {
            setIsDeleting(false);
            setReviewToDelete(null);
        }
    };

    // --- ACCURATE STATS CALCULATION ---
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

    // --- STAT WIDGET ---
    const StatWidget = ({ label, value, icon, color, isLoading }: any) => (
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
            {isLoading ? <Skeleton width="60%" height={40} /> : <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5, letterSpacing: '-0.04em' }}>{value}</Typography>}
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', letterSpacing: 1, textTransform: 'uppercase' }}>
                {label}
            </Typography>
        </Paper>
    );

    return (
        <ThemeProvider theme={reviewsTheme}>
            <TeacherLayout title="Reviews" selectedRoute="/teacher/reviews">
                <Box sx={{ width: '100%', animation: 'fadeIn 0.6s ease-out' }}>
                    
                    {/* --- HEADER WITH BACK BUTTON --- */}
                    <Box sx={{ mb: 4, pb: 3, borderBottom: `1px solid ${BORDER_COLOR}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <IconButton 
                                onClick={() => navigate('/dashboard/teacher')} 
                                sx={{ border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', bgcolor: 'white' }}
                            >
                                <ArrowLeft size={20} />
                            </IconButton>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.04em' }}>
                                    Student Feedback
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Analyze ratings and comments from students who purchased your work.
                                </Typography>
                            </Box>
                        </Stack>
                        
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
                            <StatWidget label="Average Rating" value={stats.avg} icon={<Star size={20} />} color="#F59E0B" isLoading={loading} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatWidget label="Total Reviews" value={stats.total} icon={<Users size={20} />} color={BRAND_BLUE} isLoading={loading} />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <StatWidget label="Resources Reviewed" value={stats.uniqueResources} icon={<BookOpen size={20} />} color={BRAND_ORANGE} isLoading={loading} />
                        </Grid>
                    </Grid>

                    {/* --- REVIEWS LIST --- */}
                    <Box>
                        <Stack spacing={2.5}>
                            {loading ? (
                                /* SKELETON LIST ITEMS */
                                [...Array(3)].map((_, i) => (
                                    <Paper key={i} sx={{ p: 3, border: `1px solid ${BORDER_COLOR}` }}>
                                        <Skeleton width="40%" height={25} sx={{ mb: 1 }} />
                                        <Skeleton variant="rectangular" width="100%" height={60} />
                                    </Paper>
                                ))
                            ) : paginatedReviews.length === 0 ? (
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
                                                    
                                                    {/* DELETE BUTTON */}
                                                    <IconButton 
                                                        size="small" 
                                                        onClick={() => { setReviewToDelete(review.id); setDeleteDialogOpen(true); }}
                                                        sx={{ ml: 'auto', color: '#EF4444', bgcolor: alpha('#EF4444', 0.05), borderRadius: '2px', display: { xs: 'flex', md: 'none' } }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </IconButton>
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
                                                    
                                                    {/* DESKTOP DELETE BUTTON */}
                                                    <IconButton 
                                                        onClick={() => { setReviewToDelete(review.id); setDeleteDialogOpen(true); }}
                                                        sx={{ color: '#EF4444', border: `1px solid ${BORDER_COLOR}`, borderRadius: '2px', ml: 1, display: { xs: 'none', md: 'flex' } }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
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
                </Box>

                {/* DELETE CONFIRMATION DIALOG */}
                <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '2px' } }}>
                    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
                        <AlertCircle size={48} color="#EF4444" style={{ marginBottom: 16 }} />
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>Remove Review?</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                            This feedback will be removed from your dashboard. This action cannot be undone.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Button fullWidth variant="outlined" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                            <Button 
                                fullWidth variant="contained" 
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                sx={{ bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}
                            >
                                {isDeleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
                            </Button>
                        </Stack>
                    </Box>
                </Dialog>

                <AppNotification 
                    open={snackbar.open}
                    message={snackbar.msg}
                    severity={snackbar.type}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                />
            </TeacherLayout>
        </ThemeProvider>
    );
};

export default TeacherReviews;