import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Container, 
  LinearProgress, Grid, Avatar, Chip, Stack, 
  InputAdornment, CardActionArea, 
  useTheme, alpha, IconButton, Paper, CircularProgress,
  Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/axios'; // FIXED: Axios instance

// Icons
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SchoolIcon from '@mui/icons-material/School';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import BrushIcon from '@mui/icons-material/Brush';
import ScienceIcon from '@mui/icons-material/Science';

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
    displayName: '', headline: '', bio: '', photoPreview: '', photoFile: null as File | null,
    category: '', skills: [] as string[], payoutMethod: 'mpesa', mpesaNumber: '',
  });
  const [skillInput, setSkillInput] = useState('');

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const submitProfileToBackend = async () => {
    setLoading(true);
    try {
        const uploadData = new FormData();
        uploadData.append('bio', formData.bio);
        uploadData.append('subjects', JSON.stringify(formData.category ? [formData.category] : []));
        uploadData.append('grades', JSON.stringify(formData.skills));
        uploadData.append('paymentNumber', formData.mpesaNumber);

        if (formData.photoFile) uploadData.append('profilePic', formData.photoFile);

        // FIXED: Using axios instance and relative path
        await api.post('/api/teacher/onboarding', uploadData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        setStep(4);
    } catch (error: any) {
        const msg = error.response?.data || "Failed to save profile. Please try again.";
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
      setFormData({ ...formData, photoPreview: URL.createObjectURL(file), photoFile: file });
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const renderIdentity = () => (
    <Box><Typography variant="h4" fontWeight={800} gutterBottom>Build your instructor profile</Typography>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar src={formData.photoPreview} sx={{ width: 120, height: 120, boxShadow: 3 }} />
            <input accept="image/*" style={{ display: 'none' }} id="photo-upload" type="file" onChange={handlePhotoChange} />
            <label htmlFor="photo-upload"><IconButton component="span" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'primary.main', color: 'white' }}><PhotoCamera /></IconButton></label>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}><Stack spacing={3}><TextField label="Display Name" fullWidth value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} /><TextField label="Headline" fullWidth value={formData.headline} onChange={e => setFormData({...formData, headline: e.target.value})} /><TextField label="Bio" fullWidth multiline rows={5} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} /></Stack></Grid>
      </Grid>
    </Box>
  );

  const renderExpertise = () => (
    <Box><Typography variant="h4" fontWeight={800} gutterBottom>What are you teaching?</Typography>
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {categories.map((cat) => (
          <Grid item xs={6} sm={4} key={cat.id}>
            <Paper variant="outlined" sx={{ border: formData.category === cat.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0', borderRadius: 3 }}>
              <CardActionArea onClick={() => setFormData({...formData, category: cat.id})} sx={{ p: 3, textAlign: 'center' }}>
                <Box sx={{ fontSize: 40, mb: 1 }}>{cat.icon}</Box><Typography fontWeight={600}>{cat.label}</Typography>
              </CardActionArea>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <TextField fullWidth placeholder="Type a skill and press Enter" value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {formData.skills.map(skill => (<Chip key={skill} label={skill} onDelete={() => setFormData({...formData, skills: formData.skills.filter(s => s !== skill)})} />))}
      </Box>
    </Box>
  );

  const renderPayout = () => (
    <Box><Typography variant="h4" fontWeight={800} gutterBottom>Financial Details</Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, border: `2px solid ${theme.palette.primary.main}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}><Box component="img" src={MPESA_LOGO} sx={{ height: 45 }} /><Typography variant="h6" fontWeight={700}>M-Pesa</Typography></Box><CheckCircleIcon color="primary" fontSize="large" />
      </Paper>
      <TextField fullWidth label="M-Pesa Number" placeholder="712 345 678" value={formData.mpesaNumber} onChange={e => setFormData({...formData, mpesaNumber: e.target.value})} InputProps={{ startAdornment: <InputAdornment position="start">+254</InputAdornment> }} />
    </Box>
  );

  const renderSuccess = () => (<Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h3" fontWeight={800} gutterBottom>You're Ready to Teach!</Typography><Typography variant="h6" color="text.secondary">Your profile is live.</Typography></Box>);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff' }}>
      <Box sx={{ height: 70, borderBottom: '1px solid #f0f0f0', px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10 }}>
        <Typography variant="h6" fontWeight={800} color="primary">EduHub</Typography><Button onClick={() => navigate('/')} color="inherit">Save & Exit</Button>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4 }} />
      <Container maxWidth="md" sx={{ flex: 1, py: 8 }}>
        <AnimatePresence mode="wait"><motion.div key={step}>{step === 1 && renderIdentity()}{step === 2 && renderExpertise()}{step === 3 && renderPayout()}{step === 4 && renderSuccess()}</motion.div></AnimatePresence>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8, pt: 4, borderTop: '1px solid #f0f0f0' }}>
            {step > 1 && step < 4 ? <Button startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={loading}>Back</Button> : <Box />}
            <Button variant="contained" size="large" onClick={handleNext} disabled={loading} endIcon={loading ? null : <ArrowForwardIcon />}>
                {step === 4 ? "Go to Dashboard" : (loading ? <CircularProgress size={24} color="inherit" /> : "Continue")}
            </Button>
        </Box>
      </Container>
      <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">{toast.msg}</Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherOnboarding;