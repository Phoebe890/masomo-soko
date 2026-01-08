import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Button, Card, CardContent, CardMedia,
  Grid, CircularProgress, Avatar, Divider, Chip, Stack, Rating, 
  InputAdornment, TextField
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
// FIXED: Import Axios instance
import { api } from '@/api/axios';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'; 

// Assets
import heroImage1 from '../assets/pexels-kampus-5940828.jpg'; 
import heroImage2 from '../assets/pexels-kampus-5940829.jpg'; 

const TEXT_DARK = '#0f172a'; 
const TEXT_MUTED = '#475569';
const PRIMARY_BLUE = '#2563eb'; 
const ACCENT_ORANGE = '#ea580c'; 

const getRandomColor = (id: number) => {
  const colors = ['#0f172a', '#334155', '#475569', '#1e293b'];
  return colors[id % colors.length];
};

const CATEGORIES = [
  { label: 'KCSE Revision', id: 'kcse', icon: <SchoolIcon /> },
  { label: 'KCPE Mocks', id: 'kcpe', icon: <SchoolIcon /> },
  { label: 'Junior Secondary', id: 'junior', icon: <MenuBookIcon /> },
  { label: 'Form 1-4 Notes', id: 'highschool', icon: <MenuBookIcon /> },
  { label: 'Mathematics', id: 'math', icon: <FunctionsIcon /> },
  { label: 'Sciences', id: 'science', icon: <ScienceIcon /> },
  { label: 'Languages', id: 'languages', icon: <LanguageIcon /> },
  { label: 'Humanities', id: 'humanities', icon: <HistoryEduIcon /> },
];

const TeacherIllustration = () => (
  <Box sx={{ position: 'relative', width: 280, height: 200 }}>
    <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="240" height="150" rx="8" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
      <path d="M140 170 L140 190 M100 190 L180 190" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round"/>
      <rect x="40" y="50" width="80" height="60" rx="4" fill="rgba(255,255,255,0.05)" />
      <path d="M50 90 L65 75 L80 85 L100 65" stroke="#4dabf5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="140" y="50" width="100" height="8" rx="2" fill="rgba(255,255,255,0.4)" />
      <rect x="140" y="70" width="80" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
      <rect x="140" y="90" width="90" height="8" rx="2" fill="rgba(255,255,255,0.2)" />
      <circle cx="240" cy="40" r="16" fill="#1976d2" />
      <path d="M234 40 L238 44 L246 36" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="220" cy="140" r="25" fill="#90caf9" />
      <path d="M195 190 C195 165 245 165 245 190" fill="#1565c0" />
    </svg>
  </Box>
);

const Home: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  const slides = [
    {
      type: 'student',
      image: heroImage1,
      title: <>Access Kenya's Best <br/><span style={{ color: '#60a5fa' }}>Education Resources</span></>,
      subtitle: "Download high-quality Notes, Exams, and Revision Guides instantly. Pay securely via M-Pesa.",
    },
    {
      type: 'teacher',
      image: heroImage2,
      title: <>Turn Your Knowledge <br/><span style={{ color: '#60a5fa' }}>Into Income</span></>,
      subtitle: "Are you a teacher? Upload your notes and exams to Masomo Soko and earn money every time a student downloads them.",
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    setLoading(true);
    // FIXED: Using Axios instance for data fetching
    api.get('/api/teacher/resources')
      .then(res => {
        setResources(res.data.resources ? res.data.resources.slice(0, 8) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.get('/api/teacher/top-contributors')
      .then(res => setContributors(res.data));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/browse?search=${encodeURIComponent(heroSearch)}`);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      
      <Box component="section" sx={{ position: 'relative', width: '100%', height: { xs: '90vh', md: '80vh' }, minHeight: '650px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}</style>
        {slides.map((slide, index) => (
          <Box key={index} sx={{ position: 'absolute', inset: 0, backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center', transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)', opacity: currentSlide === index ? 1 : 0, transition: 'opacity 1.5s ease-in-out, transform 8s linear', zIndex: 0 }} />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.75) 100%)', zIndex: 1 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
          {slides.map((slide, index) => (
             currentSlide === index && (
                <Box key={index} sx={{ maxWidth: '900px', mx: 'auto', animation: 'fadeIn 0.8s ease-out' }}>
                    <Typography variant="h1" fontWeight={800} sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.1, mb: 2, letterSpacing: '-1px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{slide.title}</Typography>
                    <Typography variant="h5" sx={{ mb: 5, fontWeight: 400, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: { xs: '1.1rem', md: '1.4rem' } }}>{slide.subtitle}</Typography>
                    <Box sx={{ minHeight: '80px', display: 'flex', justifyContent: 'center' }}>
                        {slide.type === 'student' ? (
                            <Box component="form" onSubmit={handleHeroSearch} sx={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                                <TextField fullWidth placeholder="Search for notes, exams..." value={heroSearch} onChange={(e) => setHeroSearch(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '50px', pl: 2, pr: 1, height: '64px', fontSize: '1.1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', '& fieldset': { border: 'none' } } }} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#64748b', fontSize: 28 }} /></InputAdornment>), endAdornment: (<Button type="submit" variant="contained" size="large" sx={{ borderRadius: '50px', height: '48px', px: 4, fontWeight: 700 }}>Search</Button>) }} />
                            </Box>
                        ) : (
                            <Button component={RouterLink} to="/seller" variant="contained" size="large" startIcon={<MonetizationOnIcon />} sx={{ borderRadius: '50px', height: '64px', px: 6, fontSize: '1.2rem', fontWeight: 700 }}>Start Selling Now</Button>
                        )}
                    </Box>
                </Box>
             )
          ))}
        </Container>
      </Box>

      {/* Trust Bar, Categories, Featured Sections... */}
      {/* (All other UI sections remain exactly as provided in your snippet) */}
      {/* ... */}
      <Footer />
    </Box>
  );
}

export default Home;