import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Container, 
  LinearProgress, Grid, Avatar, Chip, Stack, 
  InputAdornment, CardActionArea, 
  useTheme, IconButton, Paper, CircularProgress,
  Snackbar, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/axios';

// Icons
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science'; // STEM
import Diversity3Icon from '@mui/icons-material/Diversity3'; // Social Sciences
import SportsCricketIcon from '@mui/icons-material/SportsCricket'; // Sports
import PaletteIcon from '@mui/icons-material/Palette'; // Arts
import MenuBookIcon from '@mui/icons-material/MenuBook'; // Junior School
import AddIcon from '@mui/icons-material/Add';

const MPESA_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png";

// UPDATED: Categories based on CBC Pathways
const categories = [
  { id: 'Junior School', label: 'Junior School (Gr 7-9)', icon: <MenuBookIcon fontSize="inherit" /> },
  { id: 'STEM Pathway', label: 'STEM Pathway', icon: <ScienceIcon fontSize="inherit" /> },
  { id: 'Social Sciences', label: 'Social Sciences', icon: <Diversity3Icon fontSize="inherit" /> },
  { id: 'Arts & Sports', label: 'Arts & Sports', icon: <PaletteIcon fontSize="inherit" /> },
  { id: 'KCSE / Legacy', label: 'KCSE / 8-4-4', icon: <MenuBookIcon fontSize="inherit" /> },
];

// UPDATED: Skill suggestions based on CBC subjects
const skillSuggestions: Record<string, string[]> = {
  'Junior School': ['Integrated Science', 'Pre-Technical Studies', 'Social Studies', 'Agriculture', 'Mathematics'],
  'STEM Pathway': ['Physics', 'Chemistry', 'Biology', 'Computer Studies', 'Mathematics'],
  'Social Sciences': ['History', 'Geography', 'Business Studies', 'Citizenship', 'Religious Education'],
  'Arts & Sports': ['Visual Arts', 'Music', 'Performing Arts', 'Sports Science', 'Physical Education'],
  'KCSE / Legacy': ['Math', 'English', 'Kiswahili', 'Business', 'History']
};

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
  const [errors, setErrors] = useState({ displayName: '', headline: '', bio: '', category: '', skills: '', mpesaNumber: '' });

  useEffect(() => {
    const fetchProfile = async () => {
        try {
            const res = await api.get('/api/teacher/settings');
            const data = res.data;
            if (data && data.profile) {
                setFormData(prev => ({
                    ...prev,
                    displayName: data.profile.user?.name || '',
                    photoPreview: data.profile.profilePicPath || '',
                    bio: data.profile.bio || '',
                    mpesaNumber: data.profile.paymentNumber || ''
                }));
            }
        } catch (error) { console.error("Failed to fetch existing profile data", error); }
    };
    fetchProfile();
  }, []);

  const handleCloseToast = () => setToast({ ...toast, open: false });

  const validateStep = (currentStep: number) => {
    let isValid = true;
    const newErrors = { ...errors };
    if (currentStep === 1) {
      if (!formData.displayName.trim()) { newErrors.displayName = "Display Name is required."; isValid = false; } else newErrors.displayName = "";
      if (!formData.headline.trim()) { newErrors.headline = "Headline is required."; isValid = false; } else newErrors.headline = "";
      if (!formData.bio.trim() || formData.bio.length < 50) { newErrors.bio = "Bio must be at least 50 characters."; isValid = false; } else newErrors.bio = "";
    }
    if (currentStep === 2) {
      if (!formData.category) { newErrors.category = "Select a specialization."; isValid = false; } else newErrors.category = "";
      if (formData.skills.length === 0) { newErrors.skills = "Add at least one subject/skill."; isValid = false; } else newErrors.skills = "";
    }
    if (currentStep === 3) {
      const phoneRegex = /^(7|1)[0-9]{8}$/;
      if (!formData.mpesaNumber) { newErrors.mpesaNumber = "M-Pesa number is required."; isValid = false; } 
      else if (!phoneRegex.test(formData.mpesaNumber)) { newErrors.mpesaNumber = "Invalid format. Use 712345678."; isValid = false; } 
      else newErrors.mpesaNumber = "";
    }
    setErrors(newErrors);
    return isValid;
  };

  const submitProfileToBackend = async () => {
    setLoading(true);
    try {
        const uploadData = new FormData();
        uploadData.append('bio', formData.bio);
        uploadData.append('subjects', JSON.stringify(formData.category ? [formData.category] : []));
        uploadData.append('grades', JSON.stringify(formData.skills));
        uploadData.append('paymentNumber', formData.mpesaNumber);
        if (formData.photoFile) uploadData.append('profilePic', formData.photoFile);

        await api.post('/api/teacher/onboarding', uploadData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setStep(4);
    } catch (error: any) {
        setToast({ open: true, msg: "Failed to save profile.", severity: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3 && !validateStep(step)) {
      setToast({ open: true, msg: "Please fill in all required fields.", severity: 'warning' });
      return;
    }
    if (step === 3) {
        if (!validateStep(3)) return;
        submitProfileToBackend();
    } else if (step === 4) {
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

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !formData.skills.includes(skill.trim())) {
      setFormData({ ...formData, skills: [...formData.skills, skill.trim()] });
    }
    setSkillInput('');
  };

  const renderIdentity = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Build your instructor profile</Typography>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar src={formData.photoPreview} sx={{ width: 120, height: 120, boxShadow: 3 }} />
            <input accept="image/*" style={{ display: 'none' }} id="photo-upload" type="file" onChange={handlePhotoChange} />
            <label htmlFor="photo-upload">
              <IconButton component="span" sx={{ position: 'absolute', bottom: 5, right: 5, bgcolor: 'primary.main', color: 'white' }}><PhotoCamera /></IconButton>
            </label>
          </Box>
        </Grid>
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <TextField label="Display Name" fullWidth required value={formData.displayName} error={!!errors.displayName} helperText={errors.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
            <TextField label="Headline" fullWidth required value={formData.headline} error={!!errors.headline} helperText={errors.headline} onChange={e => setFormData({...formData, headline: e.target.value})} placeholder="e.g. Senior School Biology Teacher" />
            <TextField label="Bio" fullWidth multiline rows={5} required value={formData.bio} error={!!errors.bio} helperText={errors.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderExpertise = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>What is your Specialization?</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Choose your main pathway or level.</Typography>
      {errors.category && <Alert severity="error" sx={{ mb: 2 }}>{errors.category}</Alert>}
      <Grid container spacing={2} sx={{ mb: 4 }}>
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
      
      <Typography fontWeight={700} sx={{ mb: 1 }}>Specific Subjects</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {formData.category && skillSuggestions[formData.category]?.map(s => (
              <Chip key={s} label={s} onClick={() => handleAddSkill(s)} variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#f0f9ff' } }} />
          ))}
      </Box>

      <TextField fullWidth placeholder="Type a subject..." value={skillInput} onChange={e => setSkillInput(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => handleAddSkill(skillInput)}><AddIcon /></IconButton></InputAdornment> }} />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>{formData.skills.map(s => <Chip key={s} label={s} onDelete={() => setFormData({...formData, skills: formData.skills.filter(i => i !== s)})} />)}</Box>
    </Box>
  );

  const renderPayout = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom>Financial Details</Typography>
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3, border: `2px solid ${theme.palette.primary.main}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f0fdf4' }}>
          <Box display="flex" alignItems="center" gap={2}><Box component="img" src={MPESA_LOGO} sx={{ height: 45 }} /><Typography variant="h6" fontWeight={700}>M-Pesa</Typography></Box><CheckCircleIcon color="primary" fontSize="large" />
      </Paper>
      <TextField fullWidth label="M-Pesa Number" placeholder="712 345 678" value={formData.mpesaNumber} error={!!errors.mpesaNumber} helperText={errors.mpesaNumber} onChange={e => setFormData({...formData, mpesaNumber: e.target.value.replace(/[^0-9]/g, '')})} InputProps={{ startAdornment: <InputAdornment position="start">+254</InputAdornment> }} />
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 10 }}>
            <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="50" r="45" fill="#43B02A"/>
                <path d="M30 50L45 65L70 35" stroke="white" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </motion.div>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 3, color: '#1a1b1d' }}>You're Ready to Teach!</Typography>
        <Typography variant="h6" color="text.secondary">Your profile is now live. Welcome to Masomo Soko.</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff' }}>
      <Box sx={{ height: 70, borderBottom: '1px solid #f0f0f0', px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10 }}>
        <Typography variant="h6" fontWeight={800} sx={{ color: '#ea580c' }}>Masomo Soko</Typography>
        <Button onClick={() => navigate('/')} color="inherit">Save & Exit</Button>
      </Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4, '& .MuiLinearProgress-bar': { bgcolor: step === 4 ? '#43B02A' : 'primary.main' } }} />
      <Container maxWidth="md" sx={{ flex: 1, py: 8 }}>
        <AnimatePresence mode="wait"><motion.div key={step}>{step === 1 && renderIdentity()}{step === 2 && renderExpertise()}{step === 3 && renderPayout()}{step === 4 && renderSuccess()}</motion.div></AnimatePresence>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8, pt: 4, borderTop: '1px solid #f0f0f0' }}>
            {step > 1 && step < 4 ? <Button startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={loading}>Back</Button> : <Box />}
            <Button 
                variant="contained" 
                size="large" 
                onClick={handleNext} 
                disabled={loading} 
                endIcon={loading ? null : (step === 4 ? <ArrowForwardIcon /> : <ArrowForwardIcon />)}
                sx={{ bgcolor: step === 4 ? '#43B02A' : 'primary.main', '&:hover': { bgcolor: step === 4 ? '#388E3C' : 'primary.dark' } }}
            >
                {step === 4 ? "Go to Dashboard" : (loading ? <CircularProgress size={24} color="inherit" /> : "Continue")}
            </Button>
        </Box>
      </Container>
      <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleCloseToast}><Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }} variant="filled">{toast.msg}</Alert></Snackbar>
    </Box>
  );
};

export default TeacherOnboarding;