import React, { useState } from 'react';
import { 
  Box, Typography, Button, TextField, Container, 
  LinearProgress, Grid, Avatar, Chip, Stack, 
  InputAdornment, CardActionArea, 
  useTheme, alpha, IconButton, Paper, Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

const categories = [
  { id: 'math', label: 'Maths & Logic', icon: <SchoolIcon fontSize="inherit" /> },
  { id: 'coding', label: 'Development', icon: <CodeIcon fontSize="inherit" /> },
  { id: 'business', label: 'Business', icon: <BusinessCenterIcon fontSize="inherit" /> },
  { id: 'languages', label: 'Languages', icon: <LanguageIcon fontSize="inherit" /> },
  { id: 'design', label: 'Art & Design', icon: <BrushIcon fontSize="inherit" /> },
  { id: 'science', label: 'Science', icon: <ScienceIcon fontSize="inherit" /> },
];

const TeacherOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  // --- STATE ---
  const [formData, setFormData] = useState({
    displayName: '',
    headline: '',
    bio: '',
    photoPreview: '',
    category: '',
    skills: [] as string[],
    payoutMethod: 'mpesa',
    mpesaNumber: '',
    bankName: '',
    accountNumber: ''
  });
  const [skillInput, setSkillInput] = useState('');

  // --- HANDLERS ---
  const handleNext = () => {
    if (step === totalSteps) {
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
        photoPreview: URL.createObjectURL(file)
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

  // --- ANIMATION CONFIG ---
  const slideVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
  };

  // --- RENDER STEPS ---

  const renderIdentity = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d', fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
        Build your instructor profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5, maxWidth: 600, lineHeight: 1.6 }}>
        Your bio is your brand. Students trust instructors who look professional and approachable.
      </Typography>

      <Grid container spacing={{ xs: 4, md: 8 }}>
        {/* Photo Section: Center on mobile, Left on desktop */}
        <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <Box sx={{ position: 'relative', mb: 2 }}>
            <Avatar 
              src={formData.photoPreview} 
              sx={{ 
                width: { xs: 120, md: 180 }, 
                height: { xs: 120, md: 180 }, 
                bgcolor: '#f5f7fa', 
                border: '4px solid white',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            />
            <input accept="image/*" style={{ display: 'none' }} id="photo-upload" type="file" onChange={handlePhotoChange} />
            <label htmlFor="photo-upload">
              <IconButton 
                component="span" 
                sx={{ 
                  position: 'absolute', bottom: 5, right: 5, 
                  bgcolor: 'primary.main', color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' } 
                }}
              >
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>
          <Typography variant="caption" color="text.secondary">Accepted: JPG, PNG</Typography>
        </Grid>

        {/* Form Inputs */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            <TextField 
              label="Display Name" 
              fullWidth variant="outlined"
              placeholder="e.g. Mr. James Mwangi"
              value={formData.displayName}
              onChange={e => setFormData({...formData, displayName: e.target.value})}
              sx={{ bgcolor: 'white' }}
            />
            <TextField 
              label="Headline" 
              fullWidth 
              placeholder="e.g. Math Tutor | 10+ Years Experience"
              value={formData.headline}
              onChange={e => setFormData({...formData, headline: e.target.value})}
              sx={{ bgcolor: 'white' }}
            />
            <TextField 
              label="Bio" 
              fullWidth multiline rows={5}
              placeholder="Tell students about your background..."
              value={formData.bio}
              onChange={e => setFormData({...formData, bio: e.target.value})}
              sx={{ bgcolor: 'white' }}
            />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );

  const renderExpertise = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d', fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
        What are you teaching?
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 5 }}>
        Choose a domain so we can recommend you to the right students.
      </Typography>

      {/* Grid: 2 columns on mobile, 3 on desktop */}
      <Grid container spacing={2} sx={{ mb: 5 }}>
        {categories.map((cat) => (
          <Grid item xs={6} sm={4} md={4} key={cat.id}>
            <Paper
              elevation={0}
              sx={{ 
                border: formData.category === cat.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
                borderRadius: 3,
                bgcolor: formData.category === cat.id ? alpha(theme.palette.primary.main, 0.04) : 'white',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': { borderColor: theme.palette.primary.main, transform: 'translateY(-4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }
              }}
            >
              <CardActionArea 
                onClick={() => setFormData({...formData, category: cat.id})}
                sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}
              >
                <Box sx={{ fontSize: 40, color: formData.category === cat.id ? 'primary.main' : 'text.secondary', mb: 1 }}>
                  {cat.icon}
                </Box>
                <Typography fontWeight={600} align="center" color={formData.category === cat.id ? 'primary.main' : 'text.primary'}>
                  {cat.label}
                </Typography>
              </CardActionArea>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6" fontWeight={700} gutterBottom>Specific Skills (Tags)</Typography>
      <TextField
        fullWidth
        placeholder="Type a skill and press Enter (e.g. Calculus, Algebra)"
        value={skillInput}
        onChange={e => setSkillInput(e.target.value)}
        onKeyDown={handleAddSkill}
        sx={{ mb: 2, bgcolor: 'white' }}
      />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {formData.skills.map((skill, index) => (
          <Chip key={index} label={skill} onDelete={() => setFormData({...formData, skills: formData.skills.filter(s => s !== skill)})} />
        ))}
      </Box>
    </Box>
  );

  const renderPayout = () => (
    <Box>
      <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#1a1b1d', fontSize: { xs: '1.75rem', md: '2.4rem' } }}>
        Financial Details
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Secure payouts processed every Friday. <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', color: 'success.main', fontWeight: 600, gap: 0.5 }}><LockIcon fontSize="small" /> Encrypted</Box>
      </Typography>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {[ 
          { id: 'mpesa', title: 'M-Pesa Mobile Money', desc: 'Instant transfer to your mobile wallet.' }, 
          { id: 'bank', title: 'Bank Transfer', desc: 'Direct deposit for larger amounts.' } 
        ].map((method) => (
          <Paper
            key={method.id}
            variant="outlined"
            onClick={() => setFormData({...formData, payoutMethod: method.id})}
            sx={{
              p: 3, cursor: 'pointer', borderRadius: 3,
              border: formData.payoutMethod === method.id ? `2px solid ${theme.palette.primary.main}` : '1px solid #e0e0e0',
              bgcolor: formData.payoutMethod === method.id ? alpha(theme.palette.primary.main, 0.04) : 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.2s',
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>{method.title}</Typography>
              <Typography variant="body2" color="text.secondary">{method.desc}</Typography>
            </Box>
            {formData.payoutMethod === method.id && <CheckCircleIcon color="primary" fontSize="large" />}
          </Paper>
        ))}
      </Stack>

      <Box sx={{ p: 4, bgcolor: '#f8f9fa', borderRadius: 3 }}>
        {formData.payoutMethod === 'mpesa' ? (
             <TextField
             fullWidth label="M-Pesa Number" placeholder="712 345 678"
             value={formData.mpesaNumber}
             onChange={e => setFormData({...formData, mpesaNumber: e.target.value})}
             InputProps={{ startAdornment: <InputAdornment position="start">+254</InputAdornment>, sx: { bgcolor: 'white' } }}
           />
        ) : (
            <Stack spacing={3}>
                <TextField fullWidth label="Bank Name" value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})} sx={{ bgcolor: 'white' }} />
                <TextField fullWidth label="Account Number" value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})} sx={{ bgcolor: 'white' }} />
            </Stack>
        )}
      </Box>
    </Box>
  );

  const renderSuccess = () => (
    <Box sx={{ textAlign: 'center', py: { xs: 4, md: 8 } }}>
      <Box 
        component="img" 
        src="https://ouch-cdn2.icons8.com/rN-8Y6VnLhFq5E-2Tqg0sVwX_gK8h2b_1.png"
        sx={{ width: { xs: 200, md: 300 }, mb: 4, borderRadius: 4, display: 'block', mx: 'auto' }}
      />
      <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
        You're Ready to Teach!
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', fontWeight: 400 }}>
        Your profile is live. You can now access your dashboard to create your first resource.
      </Typography>
    </Box>
  );

  return (
    // OUTER WRAPPER: Ensures Footer is at bottom
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#fff' }}>
      
      {/* 1. TOP HEADER */}
      <Box sx={{ height: 70, borderBottom: '1px solid #f0f0f0', px: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', zIndex: 10 }}>
        <Typography variant="h6" fontWeight={800} color="primary" sx={{ letterSpacing: -0.5 }}>
            EduHub<Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}> | Instructor</Box>
        </Typography>
        <Button onClick={() => navigate('/')} color="inherit" sx={{ fontWeight: 600 }}>Save & Exit</Button>
      </Box>

      {/* 2. PROGRESS BAR */}
      <LinearProgress variant="determinate" value={progress} sx={{ height: 4, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { borderRadius: 0 } }} />

      {/* 3. MAIN CONTENT (Flex 1 pushes footer down) */}
      <Container maxWidth="md" sx={{ flex: 1, py: { xs: 4, md: 8 }, display: 'flex', flexDirection: 'column' }}>
        
        {/* Animated Step Content */}
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {step === 1 && renderIdentity()}
              {step === 2 && renderExpertise()}
              {step === 3 && renderPayout()}
              {step === 4 && renderSuccess()}
            </motion.div>
          </AnimatePresence>
        </Box>

        {/* 4. NAVIGATION BUTTONS */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 8, pt: 4, borderTop: '1px solid #f0f0f0' }}>
            {step > 1 && step < 4 ? (
                <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ color: 'text.secondary', fontWeight: 600, px: 3 }}>Back</Button>
            ) : <Box />}

            <Button 
                variant="contained" 
                size="large"
                onClick={handleNext}
                endIcon={step === 4 ? null : <ArrowForwardIcon />}
                sx={{ 
                    px: 6, py: 1.5, borderRadius: 10,
                    fontSize: '1rem', fontWeight: 700, 
                    textTransform: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' 
                }}
            >
                {step === 4 ? "Go to Dashboard" : "Continue"}
            </Button>
        </Box>
      </Container>

      {/* 5. FOOTER */}
      <Box component="footer" sx={{ py: 3, borderTop: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
         <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              © 2024 EduHub Inc. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
               <Link href="#" underline="hover" color="text.secondary" variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <HelpOutlineIcon fontSize="inherit" /> Need Help?
               </Link>
               <Link href="#" underline="hover" color="text.secondary" variant="caption">Terms</Link>
               <Link href="#" underline="hover" color="text.secondary" variant="caption">Privacy</Link>
            </Stack>
         </Container>
      </Box>

    </Box>
  );
};

export default TeacherOnboarding;