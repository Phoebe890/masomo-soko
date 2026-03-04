import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, TextField, Container, 
  LinearProgress, Grid, Avatar, Chip, Stack, 
  InputAdornment, CardActionArea, 
  useTheme, IconButton, Paper, CircularProgress,
  Snackbar, Alert, useMediaQuery
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/axios';
import AppNotification from '@/components/AppNotification';
// Logos
import logo from '@/assets/logo.svg';
import logoIcon from '@/assets/logo-icon.svg';

// Icons
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScienceIcon from '@mui/icons-material/Science'; 
import Diversity3Icon from '@mui/icons-material/Diversity3'; 
import PaletteIcon from '@mui/icons-material/Palette'; 
import MenuBookIcon from '@mui/icons-material/MenuBook'; 
import AddIcon from '@mui/icons-material/Add';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import PsychologyIcon from '@mui/icons-material/Psychology';
import LanguageIcon from '@mui/icons-material/Language';

const MPESA_LOGO = "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/M-PESA_LOGO-01.svg/1200px-M-PESA_LOGO-01.svg.png";

// Comprehensive Categories
const categories = [
  { id: 'Primary School', label: 'Primary (Gr 1-6)', icon: <SchoolIcon fontSize="inherit" /> },
  { id: 'Junior School', label: 'Junior (Gr 7-9)', icon: <MenuBookIcon fontSize="inherit" /> },
  { id: 'Senior School', label: 'Senior (Gr 10-12)', icon: <ScienceIcon fontSize="inherit" /> },
  { id: 'Authorship', label: 'Author / Books', icon: <AutoStoriesIcon fontSize="inherit" /> },
  { id: 'KCSE Legacy', label: '8-4-4 / KCSE', icon: <MenuBookIcon fontSize="inherit" /> },
  { id: 'Special Needs', label: 'SNE / Inclusive', icon: <PsychologyIcon fontSize="inherit" /> },
  { id: 'International', label: 'IGCSE / IB', icon: <LanguageIcon fontSize="inherit" /> },
  { id: 'Arts & Sports', label: 'Creative & Extra', icon: <PaletteIcon fontSize="inherit" /> },
];

const skillSuggestions: Record<string, string[]> = {
  'Primary School': ['Literacy', 'Numeracy', 'Environmental Act.', 'Hygiene & Nutrition', 'CRE/IRE/HRE'],
  'Junior School': ['Integrated Science', 'Pre-Technical', 'Social Studies', 'Agriculture', 'Mathematics'],
  'Senior School': ['Biology', 'Physics', 'Chemistry', 'Computer Science', 'History & Citizenship'],
  'Authorship': ['Novels', 'Set Book Analysis', 'Poetry', 'Fiction', 'Non-Fiction', 'Revision Guides'],
  'KCSE Legacy': ['Math', 'English', 'Kiswahili', 'Business Studies', 'Geography', 'History'],
  'Special Needs': ['Braille', 'Sign Language', 'Autism Support', 'Learning Disability', 'Speech Therapy'],
  'International': ['Checkpoint', 'A-Level Math', 'IB Physics', 'Global Perspectives', 'English ESL'],
  'Arts & Sports': ['Visual Arts', 'Music', 'Performing Arts', 'Physical Education', 'Life Skills']
};

const TeacherOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobileLogo = useMediaQuery(theme.breakpoints.down('sm'));
  
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
// 1. Load draft from localStorage when they open the page
useEffect(() => {
  const savedDraft = localStorage.getItem('onboarding_draft');
  if (savedDraft) {
    setFormData(prev => ({ ...prev, ...JSON.parse(savedDraft) }));
  }
}, []);

// 2. Save draft to localStorage automatically every time they type
useEffect(() => {
  
  const { photoFile, photoPreview, ...textData } = formData;
  localStorage.setItem('onboarding_draft', JSON.stringify(textData));
}, [formData]);
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
                    headline: data.profile.headline || '',
                    mpesaNumber: data.profile.paymentNumber || ''
                }));
            }
        } catch (error) { console.error("Failed to fetch existing profile data", error); }
    };
    fetchProfile();
  }, []);

 const handleCloseToast = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setToast({ ...toast, open: false });
  };
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
      // SAFARICOM SPECIFIC REGEX
      const safaricomRegex = /^(?:254|0)?(7(?:[0129][0-9]|4[0123568]|5[789]|6[89])|11[0-5])[0-9]{6}$/;
      if (!formData.mpesaNumber) { 
          newErrors.mpesaNumber = "M-Pesa number is required."; 
          isValid = false; 
      } else if (!safaricomRegex.test(formData.mpesaNumber)) { 
          newErrors.mpesaNumber = "Only Safaricom M-Pesa numbers are supported."; 
          isValid = false; 
      } else newErrors.mpesaNumber = "";
    }
    setErrors(newErrors);
    return isValid;
  };

  const submitProfileToBackend = async () => {
    setLoading(true);
    try {
        const uploadData = new FormData();
        uploadData.append('name', formData.displayName); 
        uploadData.append('headline', formData.headline);
        uploadData.append('bio', formData.bio);
        uploadData.append('subjects', JSON.stringify(formData.category ? [formData.category] : []));
        uploadData.append('grades', JSON.stringify(formData.skills));
        uploadData.append('paymentNumber', formData.mpesaNumber);
        
        if (formData.photoFile) uploadData.append('profilePic', formData.photoFile);

        await api.post('/api/teacher/onboarding', uploadData);
localStorage.removeItem('onboarding_draft'); // Clear the draft
        localStorage.setItem('role', 'TEACHER');      // Upgrade the role
       
        
        
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
      <Typography variant="h4" fontWeight={800} gutterBottom>Build your  profile</Typography>
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
            <TextField label="Display Name" placeholder="Your full name" fullWidth required value={formData.displayName} error={!!errors.displayName} helperText={errors.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})} />
            <TextField 
                label="Headline" 
                fullWidth 
                required 
                value={formData.headline} 
                error={!!errors.headline} 
                helperText={errors.headline || "e.g. Grade 4 CBC Teacher, Physics Author, or Special Needs Educator"} 
                onChange={e => setFormData({...formData, headline: e.target.value})} 
                placeholder="e.g. Senior Math Teacher & Author" 
            />
            <TextField label="Bio" fullWidth multiline rows={5} required value={formData.bio} error={!!errors.bio} helperText={errors.bio || "Tell students about your experience (min 50 chars)"} onChange={e => setFormData({...formData, bio: e.target.value})} />
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
      <TextField 
        fullWidth 
        label="Safaricom M-Pesa Number" 
        placeholder="712345678" 
        value={formData.mpesaNumber} 
        error={!!errors.mpesaNumber} 
        helperText={errors.mpesaNumber || "Note: Airtel and Telkom numbers are not supported."} 
        onChange={e => setFormData({...formData, mpesaNumber: e.target.value.replace(/[^0-9]/g, '').slice(0, 10)})} 
        InputProps={{ startAdornment: <InputAdornment position="start">+254</InputAdornment> }} 
      />
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
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ mt: 3, color: '#1a1b1d' }}>Profile Complete!</Typography>
        <Typography variant="h6" color="text.secondary">You are now part of our educator community. Let's start uploading your first resource!</Typography>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff' }}>
      
      <Box sx={{ height: 70, borderBottom: '1px solid #f0f0f0', px: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, bgcolor: 'white', zIndex: 10 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Box 
                component="img"
                src={isMobileLogo ? logoIcon : logo}
                alt="Masomo Soko"
                sx={{ 
                    height: isMobileLogo ? 32 : 45, 
                    width: 'auto',
                    objectFit: 'contain'
                }}
            />
        </Box>
</Box>
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4, '& .MuiLinearProgress-bar': { bgcolor: step === 4 ? '#43B02A' : 'primary.main' } }} />
      
      <Container maxWidth="md" sx={{ flex: 1, py: 8 }}>
        <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {step === 1 && renderIdentity()}
                {step === 2 && renderExpertise()}
                {step === 3 && renderPayout()}
                {step === 4 && renderSuccess()}
            </motion.div>
        </AnimatePresence>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8, pt: 4, borderTop: '1px solid #f0f0f0' }}>
            {step > 1 && step < 4 ? (
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} disabled={loading}>Back</Button>
            ) : <Box />}
            
            <Button 
                variant="contained" 
                size="large" 
                onClick={handleNext} 
                disabled={loading} 
                endIcon={loading ? null : <ArrowForwardIcon />}
                sx={{ bgcolor: step === 4 ? '#43B02A' : 'primary.main', '&:hover': { bgcolor: step === 4 ? '#388E3C' : 'primary.dark' } }}
            >
                {step === 4 ? "Go to Dashboard" : (loading ? <CircularProgress size={24} color="inherit" /> : "Continue")}
            </Button>
        </Box>
      </Container>
      
     
      <AppNotification 
          open={toast.open}
          message={toast.msg} 
          severity={toast.severity === 'warning' ? 'error' : toast.severity} 
          onClose={handleCloseToast}
      />
    </Box>
  );
};

export default TeacherOnboarding;