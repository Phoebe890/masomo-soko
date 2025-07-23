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
import PreviewIcon from '@mui/icons-material/Preview';


const SUBJECTS: string[] = [
  'Math', 'English', 'Science', 'History', 'Geography', 'Kiswahili', 'Art', 'Music', 'ICT', 'Business', 'CRE', 'Physics', 'Chemistry', 'Biology', 'Other'
];
const GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Form 1', 'Form 2', 'Form 3', 'Form 4'
];

export const TeacherOnboarding: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  // This component is correct, no changes needed here.
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

      const response = await fetch('http://localhost:8089/api/teacher/onboarding', {
        method: 'POST',
        body: formData,
        credentials: 'include'
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
      {/* ... The JSX for this component is correct ... */}
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
  const [meetingTopic, setMeetingTopic] = useState('New Coaching Session');
  const [meetingDuration, setMeetingDuration] = useState(30);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [meetingResult, setMeetingResult] = useState<any>(null);

  useEffect(() => {
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

  // CHANGE 1: IMPLEMENT THE MEETING CREATION LOGIC
  // This function was previously empty. We restore its functionality here.
  const handleCreateMeeting = async () => {
    setMeetingLoading(true);
    setMeetingResult(null); // Clear previous results
    try {
      const res = await fetch('http://localhost:8089/api/coaching/create-meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          topic: meetingTopic,
          type: 2, // Use type 2 for a scheduled meeting, which is more common
          duration: meetingDuration
        }),
        credentials: 'include' // This is crucial for authentication
      });
      
      const data = await res.json();

      if (!res.ok) {
        // If the server returns an error (4xx, 5xx), throw an error to be caught by the catch block
        const errorMessage = data.error || `Request failed with status ${res.status}`;
        throw new Error(errorMessage);
      }
      
      // On success, set the result to display the links
      setMeetingResult(data);

    } catch (e: any) {
      // On failure, set the error message to be displayed in the dialog
      setMeetingResult({ error: e.message || 'An unknown error occurred.' });
    } finally {
      setMeetingLoading(false);
    }
  };

  const openMeetingDialog = () => {
    setMeetingResult(null); // Reset any previous results when opening the dialog
    setMeetingTopic('New Coaching Session'); // Reset topic
    setMeetingDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ minHeight: { xs: '100vh', md: '80vh' }, py: { xs: 2, md: 6 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', mt: { xs: 2, md: 6 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" color="primary" onClick={handleZoomConnect}>
            Connect to Zoom
          </Button>
          <Button variant="contained" color="secondary" onClick={openMeetingDialog}>
            Create Zoom Meeting
          </Button>
        </Box>
        
        {/* The rest of the page layout is correct... */}

      </Box>
      
      {/* CHANGE 2: IMPROVE THE MEETING DIALOG TO SHOW RESULTS */}
      <Dialog open={meetingDialogOpen} onClose={() => setMeetingDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create New Zoom Meeting</DialogTitle>
        <DialogContent>
          <TextField
            label="Meeting Topic"
            fullWidth
            margin="normal"
            value={meetingTopic}
            onChange={e => setMeetingTopic(e.target.value)}
            disabled={meetingLoading || meetingResult?.join_url} // Disable if loading or successful
          />
          <TextField
            label="Duration (minutes)"
            type="number"
            fullWidth
            margin="normal"
            value={meetingDuration}
            onChange={e => setMeetingDuration(Number(e.target.value))}
            disabled={meetingLoading || meetingResult?.join_url}
          />

          {/* This section now shows the success URL or the error message */}
          {meetingResult && meetingResult.join_url && (
            <Box mt={2} p={2} sx={{ border: '1px solid', borderColor: 'success.main', borderRadius: 1, bgcolor: 'success.light' }}>
              <Typography variant="h6" color="success.dark">Meeting Created!</Typography>
              <Typography><strong>Join Link:</strong> <Link href={meetingResult.join_url} target="_blank" rel="noopener noreferrer">{meetingResult.join_url}</Link></Typography>
              <Typography><strong>Start Link (for you):</strong> <Link href={meetingResult.start_url} target="_blank" rel="noopener noreferrer">Start Meeting Now</Link></Typography>
            </Box>
          )}
          {meetingResult && meetingResult.error && (
            <Alert severity="error" sx={{ mt: 2 }}>{meetingResult.error}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMeetingDialogOpen(false)}>
            {meetingResult?.join_url ? 'Close' : 'Cancel'}
          </Button>
          <Button 
            onClick={handleCreateMeeting} 
            variant="contained" 
            color="primary" 
            disabled={meetingLoading || !meetingTopic || !!meetingResult?.join_url}
          >
            {meetingLoading ? 'Creating...' : 'Create Meeting'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherDashboard;