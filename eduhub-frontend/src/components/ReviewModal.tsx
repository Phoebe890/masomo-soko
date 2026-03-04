import React, { useState } from 'react';
import { 
    Dialog, DialogContent, Button, TextField, Rating, 
    Typography, Box, Alert, Fade, IconButton, Avatar, alpha 
} from '@mui/material';
import { api } from '@/api/axios';
// High-End Icons
import { X, Star, CheckCircle, MessageSquare } from 'lucide-react';

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

    const BRAND_BLUE = '#2563EB';

    const handleClose = () => {
        setStep('form');
        setRating(0);
        setComment('');
        setError('');
        onClose();
    };

  const handleSubmit = async () => {
    if (!rating) {
        setError("Please select a star rating.");
        return;
    }
    if (!resourceId) return;

    setLoading(true);
    setError('');

    try {
        // BACKEND REQUIREMENT: Use FormData for @RequestParam
        const formData = new FormData();
        formData.append('resourceId', resourceId.toString());
        formData.append('rating', rating.toString());
        formData.append('comment', comment);

        // Axios handles multipart headers automatically for FormData
        await api.post('/api/student/review', formData);

        setStep('success');
        setTimeout(() => {
            onSuccess(); 
            handleClose();
        }, 2000);

    } catch (err: any) {
        
        const msg = err.response?.data || "Submission failed. Ensure you are logged in as a student.";
        setError(typeof msg === 'string' ? msg : "Access Denied (403).");
    } finally {
        setLoading(false);
    }
};
    return (
        <Dialog 
            open={open} 
            onClose={handleClose} 
            fullWidth 
            maxWidth="xs" 
            PaperProps={{ 
                sx: { borderRadius: '2px', p: 1 } 
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <IconButton onClick={handleClose} size="small">
                    <X size={18} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 3, pt: 0 }}>
                {step === 'form' ? (
                    <Fade in={true}>
                        <Box>
                            <Box sx={{ mb: 3, textAlign: 'center' }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                                    Rate Resource
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                                    How was your experience with <br/> 
                                    <strong style={{ color: '#0F172A' }}>{resourceTitle}</strong>?
                                </Typography>
                            </Box>

                            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '2px' }}>{error}</Alert>}

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
                                <Rating
                                    value={rating}
                                    onChange={(_, val) => setRating(val)}
                                    size="large"
                                    sx={{ fontSize: '3rem', color: '#F59E0B' }}
                                />
                                <Typography variant="caption" sx={{ mt: 1, fontWeight: 700, color: BRAND_BLUE, textTransform: 'uppercase', letterSpacing: 1 }}>
                                    {['Rate It', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating || 0]}
                                </Typography>
                            </Box>

                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block' }}>
                                SHARE YOUR THOUGHTS
                            </Typography>
                            <TextField
                                multiline
                                rows={3}
                                fullWidth
                                placeholder="Write your review here..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                sx={{ 
                                    '& .MuiOutlinedInput-root': { borderRadius: '2px', bgcolor: '#F8FAFC' } 
                                }}
                            />

                            <Button 
                                fullWidth
                                onClick={handleSubmit} 
                                variant="contained" 
                                disabled={loading}
                                sx={{ 
                                    mt: 4, py: 1.5, borderRadius: '2px', bgcolor: '#0F172A', fontWeight: 700,
                                    '&:hover': { bgcolor: '#1E293B' }, boxShadow: 'none'
                                }}
                            >
                                {loading ? "Submitting..." : "Submit Review"}
                            </Button>
                        </Box>
                    </Fade>
                ) : (
                    <Fade in={true}>
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Avatar sx={{ bgcolor: alpha('#10B981', 0.1), color: '#10B981', width: 64, height: 64, mx: 'auto', mb: 2, borderRadius: '2px' }}>
                                <CheckCircle size={32} />
                            </Avatar>
                            <Typography variant="h5" sx={{ fontWeight: 800 }}>Thank You!</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Your feedback helps the community grow.
                            </Typography>
                        </Box>
                    </Fade>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ReviewModal;