import React, { useState } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    Button, TextField, Rating, Typography, Box, Alert, 
    Fade, IconButton, Stack, Avatar 
} from '@mui/material';
import axios from 'axios';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';

const BACKEND_URL = "http://localhost:8081";

interface ReviewModalProps {
    open: boolean;
    onClose: () => void;
    resourceId: number | null;
    resourceTitle: string;
    onSuccess: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ open, onClose, resourceId, resourceTitle, onSuccess }) => {
    const [rating, setRating] = useState<number | null>(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [step, setStep] = useState<'form' | 'success'>('form');

    const handleClose = () => {
        // Reset state when closing
        setStep('form');
        setRating(0);
        setComment('');
        setError('');
        onClose();
    };

    const handleSubmit = async () => {
        if (!rating) {
            setError("Please select a star rating to continue.");
            return;
        }
        if (!resourceId) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('resourceId', resourceId.toString());
            formData.append('rating', rating.toString());
            formData.append('comment', comment);

            await axios.post(`${BACKEND_URL}/api/student/review`, formData, { 
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Show success state instead of alert
            setStep('success');
            setTimeout(() => {
                onSuccess(); // Refresh parent
                handleClose();
            }, 2000);

        } catch (err: any) {
            // Clean Error Message
            const msg = err.response?.data || "Unable to submit review. Please try again later.";
            setError(typeof msg === 'string' ? msg : "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            fullWidth 
            maxWidth="sm" 
            PaperProps={{ 
                sx: { 
                    borderRadius: 4, 
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden'
                } 
            }}
        >
            {/* Header with Close Button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, pb: 0 }}>
                <Typography variant="h6" fontWeight={800} color="#111827">
                    {step === 'form' ? 'Write a Review' : ''}
                </Typography>
                <IconButton onClick={handleClose} size="small" sx={{ bgcolor: '#F3F4F6' }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 4, pt: 2 }}>
                
                {step === 'form' ? (
                    <Fade in={true}>
                        <Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Share your experience with <Box component="span" fontWeight={700} color="#111827">"{resourceTitle}"</Box> to help other students.
                            </Typography>

                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {/* Rating Section */}
                            <Box sx={{ textAlign: 'center', mb: 4 }}>
                                <Rating
                                    name="rating"
                                    value={rating}
                                    onChange={(event, newValue) => {
                                        setRating(newValue);
                                        if(error) setError(''); // Clear error on interaction
                                    }}
                                    size="large"
                                    sx={{ fontSize: '3rem' }}
                                    emptyIcon={<StarIcon style={{ opacity: 0.2 }} fontSize="inherit" />}
                                />
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                                    {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : rating === 5 ? "Excellent" : "Tap to rate"}
                                </Typography>
                            </Box>

                            {/* Comment Section */}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>Your Feedback (Optional)</Typography>
                            <TextField
                                multiline
                                rows={4}
                                fullWidth
                                variant="outlined"
                                placeholder="What did you like most about this resource? Was it helpful?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                InputProps={{ sx: { borderRadius: 3, bgcolor: '#F9FAFB' } }}
                            />
                            <Box sx={{ textAlign: 'right', mt: 1 }}>
                                <Typography variant="caption" color={comment.length > 500 ? "error" : "text.secondary"}>
                                    {comment.length}/500
                                </Typography>
                            </Box>
                        </Box>
                    </Fade>
                ) : (
                    // Success State
                    <Fade in={true}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Avatar sx={{ bgcolor: '#DCFCE7', color: '#16A34A', width: 64, height: 64, mx: 'auto', mb: 2 }}>
                                <ThumbUpAltOutlinedIcon fontSize="large" />
                            </Avatar>
                            <Typography variant="h5" fontWeight={800} gutterBottom>Thank You!</Typography>
                            <Typography color="text.secondary">
                                Your review has been submitted successfully.
                            </Typography>
                        </Box>
                    </Fade>
                )}

            </DialogContent>

            {step === 'form' && (
                <DialogActions sx={{ px: 4, pb: 4 }}>
                    <Button 
                        onClick={handleClose} 
                        disabled={loading} 
                        sx={{ fontWeight: 600, color: '#6B7280', textTransform: 'none', mr: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmit} 
                        variant="contained" 
                        disabled={loading}
                        disableElevation
                        sx={{ 
                            borderRadius: 2, 
                            px: 4, 
                            py: 1.2,
                            fontWeight: 700, 
                            textTransform: 'none',
                            bgcolor: '#111827',
                            '&:hover': { bgcolor: '#374151' }
                        }}
                    >
                        {loading ? "Submitting..." : "Submit Review"}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default ReviewModal;