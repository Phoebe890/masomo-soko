import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Container, 
  LinearProgress, Grid, Avatar, Chip, Stack, 
  InputAdornment, CardActionArea, 
  useTheme, alpha, IconButton, Paper, Link, CircularProgress,
  Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Icons
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LockIcon from '@mui/icons-material/Lock';

// Categories Icons
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BrushIcon from '@mui/icons-material/Brush';
import ScienceIcon from '@mui/icons-material/Science';

const BACKEND_URL = "http://localhost:8081";
const MPESA_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png";

const categories = [
  { id: 'Mathematics', label: 'Maths & Logic', icon: <SchoolIcon fontSize="inherit" /> },
  { id: 'Computer Science', label: 'Development', icon: <CodeIcon fontSize="inherit" /> },
  { id: 'Business', label: 'Business', icon: <BusinessCenterIcon fontSize="inherit" /> },
  { id: 'Languages', label: 'Languages', icon: <LanguageIcon fontSize="inherit" /> },
  { id: 'Art', label: 'Art & Design', icon: <BrushIcon fontSize="inherit" /> },
  { id: 'Science', label: 'Science', icon: <ScienceIcon fontSize="inherit" /> },
];

const TeacherOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progress = ((step - 1) / (totalSteps - 1)) * 100;
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string; severity: 'error' | 'warning' | 'success' }>({
    open: false, msg: '', severity: 'error'
  });

  const [formData, setFormData] = useState({
    displayName: '',
    headline: '',
    bio: '',
    photoPreview: '',
    photoFile: null as File | null,
    category: '',
    skills: [] as string[],
    payoutMethod: 'mpesa',
    mpesaNumber: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const submitProfileToBackend = async () => {
    setLoading(true);
    try {
        const uploadData = new FormData();
        uploadData.append('bio', formData.bio);
        const subjectsList = formData.category ? [formData.category] : [];
        uploadData.append('subjects', JSON.stringify(subjectsList));
        uploadData.append('grades', JSON.stringify(formData.skills));
        uploadData.append('paymentNumber', formData.mpesaNumber);

        if (formData.photoFile) {
            uploadData.append('profilePic', formData.photoFile);
        }

        await axios.post(`${BACKEND_URL}/api/teacher/onboarding`, uploadData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        setStep(4);
    } catch (error: any) {
        console.error("Onboarding Error:", error);
        const msg = error.response?.data || "Failed to save profile. Please try logging in again.";
        setToast({ open: true, msg: typeof msg === 'string' ? msg : "Connection Failed", severity: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 3) {
        if (!formData.mpesaNumber) {
            setToast({ open: true, msg: "Please enter your M-Pesa number", severity: 'warning' });
            return;
        }
        submitProfileToBackend();
    } else if (step === 4) {
      localStorage.setItem('setupComplete', 'true');
      navigate('/dashboard/teacher');
    } else {
      setStep(s => s + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => setStep(s => s - 1);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        photoPreview: URL.createObjectURL(file),
        photoFile: file
      });
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  const renderIdentity = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d' }}>Build your instructor profile</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>Your bio is your brand.</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar src={formData.photoPreview} sx={{ width: 120, height: 120, border: '4px solid white', boxShadow: 3 }} />
            <input accept="image/*" style={{ display: 'none' }} id="photo-upload" type="file" onChange={handlePhotoChange} />
            <label htmlFor="photo-upload">
              <IconButton component="span" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
          <Typography variant="caption" color="text.secondary">Accepted: JPG, PNG</Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <TextField label="Display Name" fullWidth value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
            <TextField label="Headline" fullWidth placeholder="e.g. Math Tutor" value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} />
            <TextField label="Bio" fullWidth multiline rows={5} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderExpertise = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>What are you teaching?</Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {categories.map((cat) => (
          <Grid item xs={6} sm={4} md={4} key={cat.id}>
            <Paper elevation={0} sx={{ border: formData.category === cat.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0', borderRadius: 3, bgcolor: formData.category === cat.id ? alpha(theme.palette.primary.main, 0.04) : 'white' }}>
              <CardActionArea onClick={() => setFormData({...formData, category: cat.id})} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ fontSize: 40, color: formData.category === cat.id ? 'primary.main' : 'text.secondary', mb: 1 }}>{cat.icon}</Box>
                <Typography fontWeight={600} align="center" color={formData.category === cat.id ? 'primary.main' : 'text.primary'}>{cat.label}</Typography>
              </CardActionArea>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Typography variant="h6" fontWeight={700} gutterBottom>Specific Skills (Tags)</Typography>
      <TextField fullWidth placeholder="Type a skill and press Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {formData.skills.map((skill, index) => (
          <Chip key={index} label={skill} onDelete={() => setFormData({...formData, skills: formData.skills.filter(s => s !== skill)})} />
        ))}
      </Box>
    </Box>
  );

  const renderPayout = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Financial Details</Typography>
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, border: `2px solid ${theme.palette.primary.main}`, bgcolor: alpha(theme.palette.primary.main, 0.04), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
             <Box component="img" src={MPESA_LOGO} alt="M-Pesa" sx={{ height: 45, objectFit: 'contain' }} />
             <Box><Typography variant="h6" fontWeight={700}>M-Pesa</Typography><Typography variant="body2" color="text.secondary">Instant transfer.</Typography></Box>
          </Box>
          <CheckCircleIcon color="primary" fontSize="large" />
        </Paper>
      </Stack>
      <Box sx={{ p: 4, bgcolor: '#f8f9fa', borderRadius: 3 }}>
         <TextField fullWidth label="M-Pesa Number" placeholder="712 345 678" value={formData.mpesaNumber} onChange={e => setFormData({...formData, mpesaNumber: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start">+254</InputAdornment>, sx: { bgcolor: 'white' } }} />
      </Box>
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Box component="img" src="https://ouch-cdn2.icons8.com/rN-8Y6VnLhFq5E-2Tqg0sVwX_gK8h2b_1.png" sx={{ width: 300, mb: 4, borderRadius: 4, display: 'block', mx: 'auto' }} />
      <Typography variant="h3" fontWeight={800} gutterBottom>You're Ready to Teach!</Typography>
      <Typography variant="h6" color="text.secondary">Your profile is live.</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff' }}>
      <Box sx={{ height: 70, borderBottom: '1px solid #f0f0f0', px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, bgcolor: 'rgba(255,255,255,0.9)', zIndex: 10 }}>
        <Typography variant="h6" fontWeight={800} color="primary">EduHub<Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> | Instructor</Box></Typography>
        <Button onClick={() => navigate('/')} color="inherit" sx={{ fontWeight: 600 }}>Save & Exit</Button>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4, bgcolor: '#f0f0f0' }} />
      <Container maxWidth="md" sx={{ flex: 1, py: 8, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div key={step} variants={slideVariants} initial="hidden" animate="visible" exit="exit">
              {step === 1 && renderIdentity()}
              {step === 2 && renderExpertise()}
              {step === 3 && renderPayout()}
              {step === 4 && renderSuccess()}
            </motion.div>
          </AnimatePresence>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8, pt: 4, borderTop: '1px solid #f0f0f0' }}>
            {step > 1 && step < 4 ? <Button startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={loading} sx={{ color: 'text.secondary', fontWeight: 600, px: 3 }}>Back</Button> : <Box />}
            <Button variant="contained" size="large" onClick={handleNext} disabled={loading} endIcon={step === 4 ? null : (loading ? null : <ArrowForwardIcon />)} sx={{ px: 6, py: 1.5, borderRadius: 10, fontWeight: 700, textTransform: 'none' }}>
                {step === 4 ? "Go to Dashboard" : (loading ? <CircularProgress size={24} color="inherit" /> : "Continue")}
            </Button>
        </Box>
      </Container>
      <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', fontWeight: 600 }} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherOnboarding;