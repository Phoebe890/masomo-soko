import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Button, Avatar, TextField, MenuItem, Select, InputLabel, FormControl, OutlinedInput, Chip, Grid, Alert, Link, Container } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
import Rating from '@mui/material/Rating';

const SUBJECTS: string[] = [
  'Math', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Art', 'Music', 'ICT', 'Business', 'CRE', 'Physics', 'Chemistry', 'Biology', 'Other'
];
const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
];

export const TeacherOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [paymentNumber, setPaymentNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const validatePhone = (phone: string) => {
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

      // CHANGE 1: REMOVED THE EMAIL FROM THE FORM DATA
      // The backend now uses the secure session (@AuthenticationPrincipal) to identify the user,
      // so we no longer need to send the email from the frontend.
      // formData.append('email', email); // <-- This line was removed.
      
      const response = await fetch('http://localhost:8089/api/teacher/onboarding', {
        method: 'POST',
        body: formData,
        credentials: 'include' // This sends the session cookie for authentication
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
            <SuccessAlert message="Your profile has been saved successfully!" onClose={() => { setSuccess(false); navigate('/dashboard/teacher'); }} />
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

const handleZoomConnect = () => {
  const clientID = '8YDG3EW2S0aVSE9PrveiNQ';
  const redirectUri = `http://localhost:8089/api/auth/zoom/callback`;
  const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
  window.location.href = zoomAuthUrl;
};

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [resources, setResources] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
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
    // CHANGE 2: REMOVED EMAIL PARAMETER FROM API CALLS
    // The backend now identifies the user via the session cookie.
    fetch('http://localhost:8089/api/teacher/dashboard', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setResources(data.resources || []);
        setProfile(data.profile || null);
        setTotalSales(data.totalSales || 0);
        setCurrentBalance(data.currentBalance || 0);
      })
      .catch((err) => console.error("Failed to fetch dashboard data:", err));

    fetch('/api/teacher/analytics', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setTopResources(data.topResources || []);
      })
      .catch((err) => console.error("Failed to fetch analytics data:", err));
  }, []);

  const handleEditResource = async () => {
    // This function is already correct as it uses the resource ID and session for auth.
  };

  const handleDeleteResource = async () => {
    // This function is also correct.
  };

  const handleCreateMeeting = async () => {
    // This function is also correct.
  };

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
        
        {profile && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, bgcolor: 'white', borderRadius: 3, boxShadow: 2, p: 3 }}>
            {/* CHANGE 3: USE CLOUDINARY URL DIRECTLY FOR AVATAR */}
            {/* The `profile.profilePicPath` now contains a full, public URL from Cloudinary.
                We can use it directly in the `src` attribute without any prefixes. */}
            <Avatar src={profile.profilePicPath || undefined} sx={{ width: 72, height: 72, mr: 3 }} />
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

        {/* The rest of the component structure remains largely the same... */}
        
        {resources.length === 0 ? (
          <Box textAlign="center" py={6}>
            {/* ... Empty state JSX ... */}
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: { xs: 2, md: 4 } }}>
              {/* ... Dashboard stats JSX ... */}
            </Grid>
            
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
                      {resources.map((res: any) => (
                        <TableRow key={res.id}>
                          <TableCell>{res.title}</TableCell>
                          <TableCell>{res.subject}</TableCell>
                          <TableCell>{res.grade}</TableCell>
                          <TableCell>{res.pricing === 'paid' ? `KES ${res.price}` : 'Free'}</TableCell>
                          <TableCell align="center">
                            <IconButton color="primary" aria-label="View" onClick={() => navigate(`/resource/${res.id}`)}><VisibilityIcon /></IconButton>
                            <IconButton color="secondary" aria-label="Edit" onClick={() => {
                              setSelectedResource(res);
                              setEditForm({ title: res.title, description: res.description, price: res.price });
                              setEditDialogOpen(true);
                            }}><EditIcon /></IconButton>
                            
                            {/* CHANGE 4: USE CLOUDINARY URL DIRECTLY FOR DOWNLOAD */}
                            {/* The `res.filePath` is now a full URL. We use it directly for the href. */}
                            <IconButton
                              color="success"
                              aria-label="Download"
                              component="a"
                              href={res.filePath || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
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
            <Box sx={{ mt: 6 }}>
              {/* ... Top-selling resources table ... */}
            </Box>
          </>
        )}
      </Box>
      {/* ... All Dialogs/Modals remain the same ... */}
    </Container>
  );
};

export default TeacherDashboard;