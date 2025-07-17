import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Button, Avatar, TextField, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Chip, Grid, Alert, Link, Container } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LabelIcon from '@mui/icons-material/Label';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import SuccessAlert from '../../common/SuccessAlert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableSortLabel from '@mui/material/TableSortLabel';
import Rating from '@mui/material/Rating';

const SUBJECTS: string[] = [
  'Math', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Art', 'Music', 'ICT', 'Business', 'CRE', 'Physics', 'Chemistry', 'Biology', 'Other'
];
const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
];

const TeacherOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const email = localStorage.getItem('email') || '';
  const navigate = useNavigate();

  const validatePhone = (phone: string) => {
    // Accepts 07XXXXXXXX or 2547XXXXXXXX
    return /^07\d{8}$/.test(phone) || /^2547\d{8}$/.test(phone);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePic(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!bio.trim() || subjects.length === 0 || grades.length === 0 || !paymentNumber.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!validatePhone(paymentNumber)) {
      setError('Please enter a valid Kenyan phone number (07XXXXXXXX or 2547XXXXXXXX).');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      if (profilePic) formData.append('profilePic', profilePic);
      formData.append('bio', bio);
      formData.append('subjects', JSON.stringify(subjects));
      formData.append('grades', JSON.stringify(grades));
      formData.append('paymentNumber', paymentNumber);
      formData.append('email', email);
      const response = await fetch('/api/teacher/onboarding', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error(await response.text());
      }
      setSuccess(true);
      localStorage.setItem('isFirstLogin', 'false');
    } catch (err: any) {
      setError(err.message || 'Failed to save onboarding info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ minHeight: { xs: '100vh', md: '80vh' }, display: 'flex', alignItems: 'center', justifyContent: 'center', py: { xs: 2, md: 6 } }}>
      <Box sx={{ width: '100%', mt: { xs: 2, md: 8 } }}>
        <Typography variant="h4" fontWeight={700} mb={3} align="center">
          Complete Your Teacher Profile
        </Typography>
        {success && (
          <Box sx={{ mb: 3 }}>
            <SuccessAlert message="Your profile has been saved successfully!" onClose={() => { setSuccess(false); navigate('/dashboard/teacher/payout-setup'); }} />
          </Box>
        )}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" fontWeight={600} gutterBottom>Profile Photo</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar src={preview || undefined} sx={{ width: 72, height: 72 }} />
            <Button variant="outlined" component="label">
              Upload Photo
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>
          </Box>
          <Typography variant="h6" fontWeight={600} gutterBottom>Bio / Experience</Typography>
          <TextField
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            value={bio}
            onChange={e => {
              if (e.target.value.length <= 500) setBio(e.target.value);
            }}
            placeholder="Describe your background, teaching experience, or philosophy (max 500 characters)"
            inputProps={{ maxLength: 500 }}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" fontWeight={600} gutterBottom>Subjects Taught</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Subjects</InputLabel>
            <Select
              multiple
              value={subjects}
              onChange={e => setSubjects(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
              input={<OutlinedInput label="Subjects" />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map(value => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {SUBJECTS.map(subject => (
                <MenuItem key={subject} value={subject}>{subject}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="h6" fontWeight={600} gutterBottom>Grades Taught</Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Grades</InputLabel>
            <Select
              multiple
              value={grades}
              onChange={e => setGrades(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
              input={<OutlinedInput label="Grades" />}
              renderValue={selected => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {(selected as string[]).map(value => (
                    <Chip key={value} label={value} />
                  ))}
                </Box>
              )}
            >
              {GRADES.map(grade => (
                <MenuItem key={grade} value={grade}>{grade}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography variant="h6" fontWeight={600} gutterBottom>Payment Method</Typography>
          <TextField
            fullWidth
            label="M-Pesa Phone Number"
            value={paymentNumber}
            onChange={e => setPaymentNumber(e.target.value)}
            required
            sx={{ mb: 2 }}
            helperText="Enter your M-Pesa phone number. This will be used to receive your payouts. Format: 07XXXXXXXX or 2547XXXXXXXX."
            error={!!error && (!validatePhone(paymentNumber) && paymentNumber.length > 0)}
          />
          {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Saving...' : 'Save & Continue'}
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export { TeacherOnboarding };

const handleZoomConnect = () => {
  // const email = localStorage.getItem('email') || '';
  const clientID = '8YDG3EW2S0aVSE9PrveiNQ';
  // Add email as a query param to the redirect_uri
  const redirectUri = `http://localhost:8089/api/auth/zoom/callback`;
  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = zoomAuthUrl;
};

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [resources, setResources] = useState<any[]>([]);
  const [showPayoutBanner, setShowPayoutBanner] = useState(false);
  const [showResourceReminder, setShowResourceReminder] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const email = localStorage.getItem('email') || '';
  const [totalSales, setTotalSales] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({ title: '', description: '', price: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [topResources, setTopResources] = useState<any[]>([]);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewResource, setReviewResource] = useState<any>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingResult, setMeetingResult] = useState<any>(null);

  useEffect(() => {
    // Simulate isFirstLogin flag from localStorage or API
    const isFirstLogin = localStorage.getItem('isFirstLogin') === 'true';
    if (isFirstLogin) {
      setShowOnboarding(true);
    }
    // Simulate fetching resources from localStorage
    const stored = localStorage.getItem('teacherResources');
    setResources(stored ? JSON.parse(stored) : []);
    // Simulate payout setup status
    const payoutSet = localStorage.getItem('payoutSet') === 'true';
    setShowPayoutBanner(!payoutSet);
    // Simulate resource upload skip status
    const resourceSkipped = localStorage.getItem('resourceSkipped') === 'true';
    setShowResourceReminder(resourceSkipped);

    // Fetch dashboard data from backend
    fetch(`/api/teacher/dashboard?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setResources(data.resources || []);
        setProfile(data.profile || null);
        setTotalSales(data.totalSales || 0);
        setCurrentBalance(data.currentBalance || 0);
        // Optionally set recent payouts if available
      })
      .catch(() => {});

    fetch(`/api/teacher/analytics?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        setTopResources(data.topResources || []);
      })
      .catch(() => {});
  }, [email]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('isFirstLogin', 'false');
    navigate('/dashboard/teacher/upload-first-resource');
  };

  // Edit resource handler
  const handleEditResource = async () => {
    if (!selectedResource) return;
    setEditLoading(true);
    try {
      await fetch(`/api/teacher/resources/${selectedResource.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
        })
      });
      setResources(resources.map((r: any) => r.id === selectedResource.id ? { ...r, ...editForm } : r));
      setEditDialogOpen(false);
      setSelectedResource(null);
      window.dispatchEvent(new Event('resourceListChanged'));
    } catch {
      // Optionally show error
    } finally {
      setEditLoading(false);
    }
  };

  // Delete resource handler
  const handleDeleteResource = async () => {
    if (!selectedResource) return;
    setDeleteLoading(true);
    try {
      await fetch(`/api/teacher/resources/${selectedResource.id}`, { method: 'DELETE' });
      setResources(resources.filter((r: any) => r.id !== selectedResource.id));
      setDeleteDialogOpen(false);
      setSelectedResource(null);
      window.dispatchEvent(new Event('resourceListChanged'));
    } catch {
      // Optionally show error
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateMeeting = async () => {
    setMeetingLoading(true);
    setMeetingResult(null);
    try {
      const res = await fetch('/api/coaching/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          topic: meetingTopic,
          type: 1, // Instant meeting
          duration: meetingDuration
        })
      });
      const data = await res.json();
      setMeetingResult(data);
      if (data && data.join_url) {
        alert(`Join URL: ${data.join_url}`);
      }
    } catch (e) {
      setMeetingResult({ error: 'Failed to create meeting.' });
    } finally {
      setMeetingLoading(false);
    }
  };

  // Always show Zoom button at the top
  return (
    <Container maxWidth="lg" sx={{ minHeight: { xs: '100vh', md: '80vh' }, py: { xs: 2, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: { xs: 2, md: 6 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleZoomConnect}>
            Connect to Zoom
          </Button>
          <Button variant="contained" color="secondary" onClick={() => setMeetingDialogOpen(true)}>
            Create Zoom Meeting
          </Button>
        </Box>
        {/* Personalized Welcome Section */}
        {profile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, bgcolor: 'white', borderRadius: 3, boxShadow: 2, p: 3 }}>
            <Avatar src={profile.profilePicPath ? `/api/${profile.profilePicPath}` : undefined} sx={{ width: 72, height: 72, mr: 3 }} />
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Welcome back, {profile.user?.name || 'Teacher'}!
              </Typography>
              {profile.bio && (
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
                  {profile.bio.length > 120 ? profile.bio.slice(0, 120) + '…' : profile.bio}
                </Typography>
              )}
            </Box>
          </Box>
        )}
        <Typography variant="h4" fontWeight={700} gutterBottom align="center" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Teacher Dashboard
        </Typography>
        {/* Empty State for New Teachers */}
        {resources.length === 0 ? (
          <Box textAlign="center" py={6}>
            <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
              Welcome to your Seller Dashboard, {localStorage.getItem('teacherName') || 'Teacher'}! Let's get you started.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/dashboard/teacher/upload-first-resource')}
              sx={{
                mt: 4,
                mb: 3,
                px: 6,
                py: 2.5,
                fontSize: '1.3rem',
                fontWeight: 700,
                animation: 'blinker 1.2s linear infinite',
                '@keyframes blinker': {
                  '50%': { opacity: 0.4 }
                },
                boxShadow: 4
              }}
              aria-label="Upload your first resource"
            >
              UPLOAD YOUR FIRST RESOURCE
            </Button>
            <Box mt={5} maxWidth={400} mx="auto">
              <Typography variant="h6" fontWeight={600} gutterBottom align="center">
                Getting Started Checklist
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>{localStorage.getItem('isFirstLogin') !== 'true' ? <PersonIcon color="disabled" /> : <PersonIcon color="success" />}</ListItemIcon>
                  <ListItemText primary="Create Your Profile" secondary={localStorage.getItem('isFirstLogin') !== 'true' ? '✗' : '✔'} secondaryTypographyProps={{ color: localStorage.getItem('isFirstLogin') !== 'true' ? 'error.main' : 'success.main' }} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>{resources.length > 0 ? <CloudUploadIcon color="success" /> : <CloudUploadIcon color="disabled" />}</ListItemIcon>
                  <ListItemText primary="Upload Your First Resource" secondary={resources.length > 0 ? '✔' : '✗'} secondaryTypographyProps={{ color: resources.length > 0 ? 'success.main' : 'error.main' }} />
                </ListItem>
                <ListItem>
                  <ListItemIcon>{localStorage.getItem('payoutSet') === 'true' ? <MonetizationOnIcon color="success" /> : <MonetizationOnIcon color="disabled" />}</ListItemIcon>
                  <ListItemText primary="Set up Payout Details" secondary={localStorage.getItem('payoutSet') === 'true' ? '✔' : '✗'} secondaryTypographyProps={{ color: localStorage.getItem('payoutSet') === 'true' ? 'success.main' : 'error.main' }} />
                </ListItem>
              </List>
            </Box>
          </Box>
        ) : (
          <>
            {/* Dashboard Stats */}
            <Grid container spacing={3} sx={{ mb: { xs: 2, md: 4 } }}>
              <Grid item xs={12} md={3}>
                <Box sx={{ bgcolor: 'white', color: 'text.primary', borderRadius: 3, boxShadow: 2, border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 4 }, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: { xs: 2, md: 0 } }}>
                  <Typography variant="h6">My Resources</Typography>
                  <Typography variant="h4" color="primary" fontWeight={700}>{resources.length}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ bgcolor: 'white', color: 'text.primary', borderRadius: 3, boxShadow: 2, border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 4 }, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: { xs: 2, md: 0 } }}>
                  <Typography variant="h6">Total Sales</Typography>
                  <Typography variant="h4" color="primary" fontWeight={700}>{totalSales}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ bgcolor: 'white', color: 'text.primary', borderRadius: 3, boxShadow: 2, border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 4 }, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6">Current Balance</Typography>
                  <Typography variant="h4" color="primary" fontWeight={700}>KES {currentBalance.toFixed(2)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={3}>
                <Box sx={{ bgcolor: 'white', color: 'text.primary', borderRadius: 3, boxShadow: 2, border: '1px solid', borderColor: 'divider', p: { xs: 2, md: 4 }, minHeight: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="h6">Recent Payouts</Typography>
                  <Typography variant="h4" color="primary" fontWeight={700}>--</Typography>
                  <Typography variant="caption" color="text.secondary">Coming soon</Typography>
                </Box>
              </Grid>
            </Grid>
            {/* Resource List */}
            <Box sx={{ mt: { xs: 2, md: 4 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>My Uploaded Resources</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudUploadIcon />}
                  onClick={() => navigate('/dashboard/teacher/upload-first-resource')}
                >
                  Upload New Resource
                </Button>
              </Box>
              {resources.length === 0 ? (
                <Typography color="text.secondary">You haven't uploaded any resources yet.</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Subject</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {resources.map((res: any, idx: number) => (
                        <TableRow key={res.id || idx}>
                          <TableCell>{res.title}</TableCell>
                          <TableCell>{Array.isArray(res.subject) ? res.subject.join(', ') : (res.subject || '')}</TableCell>
                          <TableCell>{res.grade}</TableCell>
                          <TableCell>{res.pricing === 'paid' ? `KES ${res.price}` : 'Free'}</TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" aria-label="View" onClick={() => navigate(`/resource/${res.id}`)}><VisibilityIcon /></IconButton>
                            <IconButton color="secondary" aria-label="Edit" onClick={() => {
                              setSelectedResource(res);
                              setEditForm({ title: res.title, description: res.description, price: res.price });
                              setEditDialogOpen(true);
                            }}><EditIcon /></IconButton>
                            <IconButton
                              color="success"
                              aria-label="Download"
                              component="a"
                              href={res.filePath ? `/api/${res.filePath}` : "#"}
                              target="_blank"
                              rel="noopener"
                              disabled={!res.filePath}
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton color="info" aria-label="View Reviews" onClick={() => { setReviewResource(res); setReviewDialogOpen(true); }}>
                              <VisibilityIcon />
                            </IconButton>
                            <IconButton color="error" aria-label="Delete" onClick={() => {
                              setSelectedResource(res);
                              setDeleteDialogOpen(true);
                            }}><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
            {/* Top-Selling Resources Table */}
            <Box sx={{ mt: 6 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>Top-Selling Resources</Typography>
              {topResources.length === 0 ? (
                <Typography color="text.secondary">No sales data yet.</Typography>
              ) : (
                <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, maxWidth: 700 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell align="right">Sales</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topResources.map((res: any) => (
                        <TableRow key={res.id}>
                          <TableCell>{res.title}</TableCell>
                          <TableCell align="right">{res.sales}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          </>
        )}
      </Box>
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Resource</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={editForm.title}
            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            minRows={2}
            value={editForm.description}
            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
          />
          <TextField
            label="Price"
            fullWidth
            margin="normal"
            type="number"
            value={editForm.price}
            onChange={e => setEditForm({ ...editForm, price: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} disabled={editLoading}>Cancel</Button>
          <Button onClick={handleEditResource} variant="contained" color="primary" disabled={editLoading}>{editLoading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Resource</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete "{selectedResource?.title}"? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
          <Button onClick={handleDeleteResource} variant="contained" color="error" disabled={deleteLoading}>{deleteLoading ? 'Deleting...' : 'Delete'}</Button>
        </DialogActions>
      </Dialog>
      {/* Reviews Modal */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Reviews for {reviewResource?.title}</DialogTitle>
        <DialogContent>
          {reviewResource && reviewResource.averageRating != null && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={reviewResource.averageRating} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>{reviewResource.averageRating.toFixed(1)} / 5</Typography>
              <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>({reviewResource.reviews?.length || 0} reviews)</Typography>
            </Box>
          )}
          {reviewResource && reviewResource.reviews && reviewResource.reviews.length > 0 ? (
            <Box>
              {reviewResource.reviews.map((rev: any) => (
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={meetingDialogOpen} onClose={() => setMeetingDialogOpen(false)}>
        <DialogTitle>Create Zoom Meeting</DialogTitle>
        <DialogContent>
          <TextField
            label="Meeting Topic"
            fullWidth
            margin="normal"
            value={meetingTopic}
            onChange={e => setMeetingTopic(e.target.value)}
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            fullWidth
            margin="normal"
            value={meetingDuration}
            onChange={e => setMeetingDuration(Number(e.target.value))}
          />
          {meetingResult && meetingResult.join_url && (
            <Box mt={2}>
              <strong>Meeting Created!</strong><br />
              <a href={meetingResult.join_url} target="_blank" rel="noopener noreferrer">Join URL</a>
            </Box>
          )}
          {meetingResult && meetingResult.error && (
            <Box mt={2} color="error.main">{meetingResult.error}</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeetingDialogOpen(false)} disabled={meetingLoading}>Cancel</Button>
          <Button onClick={handleCreateMeeting} variant="contained" color="primary" disabled={meetingLoading || !meetingTopic}>
            {meetingLoading ? 'Creating...' : 'Create Meeting'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherDashboard; 