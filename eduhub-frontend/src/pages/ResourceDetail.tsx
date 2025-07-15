import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Divider,
  FormControl,
} from '@mui/material';
import Rating from '@mui/material/Rating';

const paymentMethods = [
  { label: 'M-Pesa', value: 'mpesa' },
  { label: 'Card', value: 'card' },
];

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<any>(null);
  const [buyOpen, setBuyOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [processing, setProcessing] = useState(false);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('email'));
  const [canReview, setCanReview] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [refreshReviews, setRefreshReviews] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/teacher/resources/${id}`)
      .then(async res => {
        if (!res.ok) {
          setResource(null);
          setLoading(false);
          return;
        }
        const data = await res.json();
        // Support both { resource: ... } and direct resource object
        if (data && (data.resource || data.title)) {
          setResource(data.resource || data);
        } else {
          setResource(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setResource(null);
        setLoading(false);
      });
    // Check if student can review
    const email = localStorage.getItem('email');
    if (email && id) {
      fetch(`/api/student/review/check?email=${encodeURIComponent(email)}&resourceId=${encodeURIComponent(id)}`)
        .then(res => res.json())
        .then(data => {
          setReviewed(!!data.reviewed);
        });
      fetch(`/api/student/purchases?email=${encodeURIComponent(email)}`)
        .then(res => res.json())
        .then(data => {
          setCanReview((data.resources || []).some((r: any) => String(r.id) === String(id)));
        });
    }
    // Listen for global resource changes
    const handleResourceListChanged = () => {
      setLoading(true);
      fetch(`/api/teacher/resources/${id}`)
        .then(async res => {
          if (!res.ok) {
            setResource(null);
            setLoading(false);
            // Optionally redirect if deleted
            navigate('/browse-resources');
            return;
          }
          const data = await res.json();
          if (data && (data.resource || data.title)) {
            setResource(data.resource || data);
          } else {
            setResource(null);
            navigate('/browse-resources');
          }
          setLoading(false);
        })
        .catch(() => {
          setResource(null);
          setLoading(false);
          navigate('/browse-resources');
        });
    };
    window.addEventListener('resourceListChanged', handleResourceListChanged);
    return () => {
      window.removeEventListener('resourceListChanged', handleResourceListChanged);
    };
  }, [id, navigate, refreshReviews]);

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      setLoginPrompt(true);
      return;
    }
    setBuyOpen(true);
  };

  const handlePayment = () => {
    setProcessing(true);
    const email = localStorage.getItem('email');
    fetch('/api/student/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `email=${encodeURIComponent(email || '')}&resourceId=${encodeURIComponent(id || '')}`
    })
      .then(async res => {
        setProcessing(false);
        if (res.ok) {
          setBuyOpen(false);
          navigate('/purchase-confirmation');
        } else {
          const msg = await res.text();
          alert(msg || 'Purchase failed');
        }
      })
      .catch(() => {
        setProcessing(false);
        alert('Purchase failed');
      });
  };

  // Review submit handler
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    if (!reviewRating) {
      setReviewError('Please select a rating.');
      return;
    }
    setReviewSubmitting(true);
    const email = localStorage.getItem('email');
    try {
      const res = await fetch('/api/student/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(email || '')}&resourceId=${encodeURIComponent(id || '')}&rating=${reviewRating}&comment=${encodeURIComponent(reviewComment)}`
      });
      if (!res.ok) {
        setReviewError(await res.text());
      } else {
        setReviewRating(0);
        setReviewComment('');
        setReviewed(true);
        setRefreshReviews(r => r + 1);
      }
    } catch (err: any) {
      setReviewError('Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress aria-label="Loading resource details" />
      </Box>
    );
  }
  if (!resource) {
    return <Typography color="error">Resource not found.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', py: { xs: 2, md: 6 } }}>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 3 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <Box sx={{ mb: 2 }}>
              {resource.previewUrl ? (
                resource.previewUrl.endsWith('.pdf') ? (
                  <iframe
                    src={resource.previewUrl}
                    title="Resource PDF Preview"
                    style={{ width: '100%', height: 400, borderRadius: 8, border: '1px solid #ccc' }}
                  />
                ) : resource.previewUrl.match(/\.(docx?|pptx?)$/i) ? (
                  <Button
                    variant="outlined"
                    color="primary"
                    href={`https://docs.google.com/gview?url=${encodeURIComponent(resource.previewUrl)}&embedded=true`}
                    target="_blank"
                    rel="noopener"
                    sx={{ width: '100%', mb: 2 }}
                  >
                    Preview in Google Docs
                  </Button>
                ) : resource.previewUrl.match(/\.(jpe?g|png|gif|bmp|webp)$/i) ? (
                  <img
                    src={resource.previewUrl}
                    alt="Resource preview"
                    style={{ width: '100%', borderRadius: 8, maxHeight: 400, objectFit: 'contain' }}
                  />
                ) : (
                  <a href={resource.previewUrl} target="_blank" rel="noopener noreferrer">Open Preview</a>
                )
              ) : (
                <Avatar variant="rounded" sx={{ width: 180, height: 180, bgcolor: 'grey.200', color: 'grey.700', fontSize: 64, mx: 'auto' }}>
                  📄
                </Avatar>
              )}
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Watermarked preview. Full file available after purchase.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>Reviews</Typography>
            {/* Reviews list (mock) */}
            <Box sx={{ mb: 2 }}>
              {(resource.reviews || []).length === 0 ? (
                <Typography color="text.secondary">No reviews yet.</Typography>
              ) : (
                resource.reviews.map((rev: any, idx: number) => (
                  <Box key={idx} sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>{rev.reviewer}</Typography>
                    <Typography variant="body2" color="text.secondary">{rev.comment}</Typography>
                  </Box>
                ))
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>{resource.title}</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>{resource.description}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>By <b>{resource.teacherName}</b></Typography>
            <Typography variant="h5" color="primary" fontWeight={700} sx={{ mb: 2 }}>KES {resource.price}</Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ minWidth: 180, mb: 2 }}
              onClick={handleBuyNow}
              aria-label="Buy this resource now"
            >
              BUY NOW
            </Button>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Full Description</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{resource.longDescription || resource.description}</Typography>
          </Grid>
        </Grid>
      </Paper>
      {/* Reviews Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>Reviews</Typography>
        {resource && resource.averageRating != null && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={resource.averageRating} precision={0.1} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>{resource.averageRating.toFixed(1)} / 5</Typography>
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>({resource.reviews?.length || 0} reviews)</Typography>
          </Box>
        )}
        {/* Review Form */}
        {isLoggedIn && canReview && !reviewed && (
          <Box component="form" onSubmit={handleReviewSubmit} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2, boxShadow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Leave a Review</Typography>
            <Rating
              value={reviewRating}
              onChange={(_, newValue) => setReviewRating(newValue || 0)}
              size="large"
              sx={{ mb: 1 }}
            />
            <TextField
              label="Comment (optional)"
              value={reviewComment}
              onChange={e => setReviewComment(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={{ mb: 1 }}
            />
            {reviewError && <Typography color="error" sx={{ mb: 1 }}>{reviewError}</Typography>}
            <Button type="submit" variant="contained" color="primary" disabled={reviewSubmitting}>
              {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </Box>
        )}
        {/* Review List */}
        {resource && resource.reviews && resource.reviews.length > 0 ? (
          <Box>
            {resource.reviews.map((rev: any) => (
              <Paper key={rev.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Rating value={rev.rating} readOnly size="small" />
                  <Typography variant="subtitle2" sx={{ ml: 1 }}>{rev.studentName}</Typography>
                  <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>{rev.createdAt ? new Date(rev.createdAt).toLocaleString() : ''}</Typography>
                </Box>
                <Typography variant="body2">{rev.comment}</Typography>
              </Paper>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">No reviews yet.</Typography>
        )}
      </Box>
      {/* Buy Now Dialog */}
      <Dialog open={buyOpen} onClose={() => setBuyOpen(false)} aria-labelledby="buy-dialog-title">
        <DialogTitle id="buy-dialog-title">Complete Your Purchase</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <TextField
              select
              label="Payment Method"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              aria-label="Select payment method"
            >
              {paymentMethods.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </FormControl>
          {/* Add payment details fields as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBuyOpen(false)} disabled={processing}>Cancel</Button>
          <Button onClick={handlePayment} variant="contained" color="primary" disabled={processing}>
            {processing ? <CircularProgress size={24} /> : 'Pay Now'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Login Prompt Dialog */}
      <Dialog open={loginPrompt} onClose={() => setLoginPrompt(false)} aria-labelledby="login-dialog-title">
        <DialogTitle id="login-dialog-title">Sign In Required</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>You must be logged in to purchase resources.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoginPrompt(false)}>Cancel</Button>
          <Button onClick={() => navigate('/login')} variant="contained" color="primary">Sign In</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ResourceDetail; 