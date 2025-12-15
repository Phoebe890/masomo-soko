import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Rating, Stack, Chip, CircularProgress, Container, Avatar } from '@mui/material';
import axios from 'axios';
import TeacherSidebar from './TeacherSidebar';

// Icons
import StarIcon from '@mui/icons-material/Star';

const BACKEND_URL = "http://localhost:8081";

const TeacherReviews = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${BACKEND_URL}/api/teacher/reviews`, { withCredentials: true })
            .then(res => setReviews(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <TeacherSidebar 
                mobileOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
                selectedRoute="/teacher/reviews" 
            />

            <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 5 } }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 1, color: '#111827' }}>
                        Student Reviews
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 4 }}>
                        Feedback from students who purchased your resources.
                    </Typography>

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>
                    ) : reviews.length === 0 ? (
                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px dashed #E5E7EB' }} elevation={0}>
                            <StarIcon sx={{ fontSize: 60, color: '#E5E7EB', mb: 2 }} />
                            <Typography color="text.secondary" fontWeight={500}>No reviews yet.</Typography>
                        </Paper>
                    ) : (
                        <Stack spacing={3}>
                            {reviews.map((review) => (
                                <Paper key={review.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" gap={2}>
                                        <Box>
                                            <Chip label={review.resourceTitle} size="small" sx={{ mb: 1.5, fontWeight: 700, color: '#4F46E5', bgcolor: '#EEF2FF', borderRadius: 1 }} />
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <Rating value={review.rating} readOnly size="small" />
                                                <Typography variant="body2" fontWeight={700} color="text.primary">{review.rating}.0</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#374151', lineHeight: 1.6 }}>
                                                "{review.comment}"
                                            </Typography>
                                        </Box>
                                        
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 140, justifyContent: 'flex-end' }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#F3F4F6', color: '#6B7280' }}>
                                                {review.studentName[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} color="#111827">
                                                    {review.studentName}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(review.date).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </Container>
            </Box>
        </Box>
    );
};

export default TeacherReviews;