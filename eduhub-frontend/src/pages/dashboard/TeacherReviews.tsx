import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Rating, Stack, Chip, CircularProgress, Avatar, useTheme } from '@mui/material';
import { api } from '@/api/axios';
import TeacherLayout from '../../components/TeacherLayout';

const BACKEND_URL = "http://localhost:8081";

const TeacherReviews = () => {
    const theme = useTheme();
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`${BACKEND_URL}/api/teacher/reviews`, { withCredentials: true })
            .then(res => setReviews(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <TeacherLayout title="Student Reviews" selectedRoute="/teacher/reviews">
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={800} sx={{ color: '#111827' }}>My Reviews</Typography>
                    <Typography color="text.secondary">Feedback from students who purchased your resources.</Typography>
                </Box>

                {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box> : (
                    <Stack spacing={3}>
                        {reviews.length === 0 ? (
                            <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${theme.palette.divider}`, bgcolor: '#F9FAFB' }} elevation={0}>
                                <Typography color="text.secondary">No reviews received yet.</Typography>
                            </Paper>
                        ) : (
                            reviews.map((review) => (
                                <Paper key={review.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" gap={2}>
                                        <Box>
                                            <Chip label={review.resourceTitle} size="small" sx={{ mb: 1.5, fontWeight: 700, bgcolor: '#EEF2FF', color: '#4F46E5', borderRadius: 1 }} />
                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                                <Rating value={review.rating} readOnly size="small" />
                                                <Typography variant="body2" fontWeight={700}>{review.rating}.0</Typography>
                                            </Stack>
                                            <Typography variant="body1" sx={{ color: '#374151', fontStyle: 'italic' }}>"{review.comment}"</Typography>
                                        </Box>
                                        
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 150 }}>
                                            <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: '#F3F4F6', color: '#6B7280' }}>
                                                {review.studentName[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>{review.studentName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{new Date(review.date).toLocaleDateString()}</Typography>
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))
                        )}
                    </Stack>
                )}
            </Box>
        </TeacherLayout>
    );
};

export default TeacherReviews;