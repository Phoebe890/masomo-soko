import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Button, Card, CardContent, CardMedia,
  Grid, CircularProgress, Avatar, Chip, Stack, Rating, 
  InputAdornment, TextField
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { api } from '@/api/axios';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import SportsCricketIcon from '@mui/icons-material/SportsCricket';
import ComputerIcon from '@mui/icons-material/Computer';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'; 
import PersonIcon from '@mui/icons-material/Person';
import VerifiedIcon from '@mui/icons-material/Verified';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import EngineeringIcon from '@mui/icons-material/Engineering';

// --- RESTORED ORIGINAL ASSETS ---
import heroImage1 from '../assets/pexels-kampus-5940828.jpg'; 
import heroImage2 from '../assets/pexels-kampus-5940829.jpg'; 
import { Helmet } from 'react-helmet-async'; 

const SafeHelmet = Helmet as any; // FIX FOR REACT 19 TYPES
// --- CONSTANTS ---
const TEXT_DARK = '#0f172a'; 
const TEXT_MUTED = '#475569';
const PRIMARY_BLUE = '#2F6BFF'; 
const SAFARICOM_GREEN = '#43B02A'; 
const ACCENT_ORANGE = '#ea580c'; 

const getRandomColor = (id: number) => {
  const colors = ['#0f172a', '#334155', '#475569', '#1e293b'];
  return colors[id % colors.length];
};

// --- DATA: CATEGORIES ---
const CATEGORIES = [
  { 
    label: 'Junior School', sub: 'Grades 7, 8 & 9', id: 'junior-school', 
    image: 'https://plus.unsplash.com/premium_vector-1720798482894-5cd1965d73fc?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' // 3D Book Illustration
  }, 
  { 
    label: 'STEM Pathway', sub: 'Science & Mathematics', id: 'stem', 
    image: 'https://plus.unsplash.com/premium_vector-1723244066302-bc088c3549e7?q=80&w=2360&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' // Abstract Tech/Science Geometry
  },
  { 
    label: 'Social Sciences', sub: 'Humanities & Languages', id: 'social-sciences', 
    image: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=80' // Minimalist Map/Globe art
  },
  { 
    label: 'Arts & Sports', sub: 'Creative & Athletics', id: 'arts-sports', 
    image: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&w=600&q=80' // Abstract Paint/Art strokes
  },
  { 
    label: 'Agriculture', sub: 'Farming & Bio-Tech', id: 'agriculture', 
    image: 'https://images.unsplash.com/vector-1769320709000-bf5132293619?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' // Abstract green leaf/Plant veins
  },
  { 
    label: 'Pre-Technical', sub: 'Engineering & Skills', id: 'pre-tech', 
     image: 'https://plus.unsplash.com/premium_vector-1734528979745-eaa10d557eed?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
  },
  { 
    label: 'Digital Literacy', sub: 'ICT & Coding', id: 'ict', 
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80' // Abstract Circuit Board
  },
  { 
    label: 'KCSE Revision', sub: 'Exam Preparation', id: 'kcse', 
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80' // Minimalist Stack of Papers
  },
];

// --- COMPONENT: ABSTRACT BACKGROUND SVG ---
const CardBackground = () => (
    <Box sx={{ position: 'absolute', right: -20, bottom: -40, opacity: 0.2, transform: 'rotate(-15deg)' }}>
        <svg width="150" height="150" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-4.9C93.5,9.3,82.1,22.9,71.1,34.3C60,45.7,49.3,54.9,37.6,63.5C25.9,72.1,13.2,80.1,0.6,79.1C-12,78.1,-23.9,68.1,-35.3,59.3C-46.7,50.5,-57.6,42.9,-66.4,32.6C-75.2,22.3,-81.9,9.3,-81.7,-3.5C-81.5,-16.3,-74.4,-28.9,-64.8,-39.3C-55.2,-49.7,-43.1,-57.9,-30.9,-66.1C-18.7,-74.3,-6.4,-82.5,7.1,-94.8L44.7,-76.4Z" transform="translate(100 100)" />
        </svg>
    </Box>
);

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
    </svg>
  </Box>
);

const Home: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [heroSearch, setHeroSearch] = useState('');
  const navigate = useNavigate();

  const slides = [
    {
      type: 'student',
      image: heroImage1,
      title: <>Master the <br/><span style={{ color: '#60a5fa' }}>CBC Curriculum</span></>,
      subtitle: "Junior School (Grades 7–9) & Senior School (Grades 10–12). Download Notes, Projects, and KJSEA/KCSE Exams instantly.",
    },
    {
      type: 'teacher',
      image: heroImage2,
      title: <>Turn Your Knowledge <br/><span style={{ color: ACCENT_ORANGE }}>Into Income</span></>,
      subtitle: "Upload resources for STEM, Social Sciences, and Arts Pathways. Earn money every time a student downloads.",
    }
  ];

  useEffect(() => {
    document.title = "Masomo Soko - Kenya's Best Education Marketplace";
    const interval = setInterval(() => {
      if (!isPaused) setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  useEffect(() => {
    setLoading(true);
    // Mimic API calls - ensure your axios interceptor handles base URL
    api.get('/api/teacher/resources')
      .then(res => {
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.resources)) data = res.data.resources;
        else if (res.data && Array.isArray(res.data.data)) data = res.data.data;
        setResources(data.slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.get('/api/teacher/top-contributors')
      .then(res => {
        let data = [];
        if (Array.isArray(res.data)) data = res.data;
        else if (res.data && Array.isArray(res.data.contributors)) data = res.data.contributors;
        setContributors(data);
      })
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) navigate(`/browse?search=${encodeURIComponent(heroSearch)}`);
  };

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
       {/* --- SEO METADATA --- */}
    <SafeHelmet>
      <title>Masomo Soko | Best CBC & KCSE Revision Resources Kenya</title>
      <meta name="description" content="Access high-quality Kenyan teaching resources. Buy and sell Grade 7, 8, 9 CBC notes, KCSE past papers, and lesson plans on Kenya's top education marketplace." />
      <meta name="keywords" content="CBC resources Kenya, Junior School revision notes, KCSE past papers, Kenyan teachers marketplace, Masomo Soko, Grade 9 exams" />
      
      {/* Social Media Sharing Tags */}
      <meta property="og:title" content="Masomo Soko - Kenya's Education Marketplace" />
      <meta property="og:description" content="Empowering Kenyan teachers and students with verified learning materials." />
      <meta property="og:type" content="website" />
    </SafeHelmet>
     {/* --- HERO SECTION --- */}
      <Box 
        component="section" 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: { xs: '85vh', md: '80vh' }, 
          minHeight: '600px',
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <style>
            {`@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }`}
        </style>
        {slides.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${slide.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center', // Reverted to center for local images
              transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
              opacity: currentSlide === index ? 1 : 0, 
              transition: 'opacity 1.5s ease-in-out, transform 8s linear', 
              zIndex: 0,
            }}
          />
        ))}
        {/* Dark overlay for readability */}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.75) 100%)', zIndex: 1 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white', mt: 4 }}>
          {slides.map((slide, index) => (
             currentSlide === index && (
                <Box key={index} sx={{ maxWidth: '900px', mx: 'auto', animation: 'fadeIn 0.8s ease-out' }}>
                    <Typography variant="h1" fontWeight={800} sx={{ fontSize: { xs: '2.5rem', md: '4rem' }, lineHeight: 1.1, mb: 2, letterSpacing: '-1px', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                      {slide.title}
                    </Typography>
                    <Typography variant="h5" sx={{ mb: 5, fontWeight: 400, color: 'rgba(255,255,255,0.9)', lineHeight: 1.6, fontSize: { xs: '1.1rem', md: '1.4rem' } }}>
                      {slide.subtitle}
                    </Typography>
                    
                    <Box sx={{ minHeight: '80px', display: 'flex', justifyContent: 'center' }}>
                        {slide.type === 'student' ? (
                            <Box component="form" onSubmit={handleHeroSearch} sx={{ position: 'relative', width: '100%', maxWidth: '600px', px: 2 }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search resources (e.g. Grade 9 Agriculture)"
                                    value={heroSearch}
                                    onChange={(e) => setHeroSearch(e.target.value)}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '50px', pl: 2, pr: 1, height: '60px', fontSize: '1.1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', '& fieldset': { border: 'none' }, '&:hover': { bgcolor: '#fff' } } }}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#64748b', fontSize: 28 }} /></InputAdornment>),
                                    }}
                                />
                            </Box>
                        ) : (
                           <Button 
  component={RouterLink} 
  to="/seller" 
  variant="outlined" // Changed from contained
  size="large" 
  sx={{ 
    borderRadius: '100px', // Ensures a perfect pill shape
    height: '60px', 
    px: 6, 
    fontSize: '1.2rem', 
    fontWeight: 600, // Medium-bold weight matches the image better
    textTransform: 'none', 
    color: '#fff', // White text
    border: '2px solid #fff', // Thicker white border
    boxShadow: 'none', // Remove the shadow
    '&:hover': { 
      border: '2px solid #fff', // Keep border thick on hover
      backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle background on hover
      transform: 'scale(1.02)' 
    } 
  }}
>
  Get Started
</Button>
                        )}
                    </Box>
                </Box>
             )
          ))}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ position: 'absolute', bottom: -60, left: 0, right: 0, zIndex: 3 }}>
             {slides.map((_, idx) => (
                 <Box key={idx} onClick={() => setCurrentSlide(idx)} sx={{ width: 12, height: 12, borderRadius: '50%', cursor: 'pointer', bgcolor: currentSlide === idx ? 'white' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
             ))}
          </Stack>
        </Container>
      </Box>

      {/* --- TRUST BAR --- */}
      <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', py: 3, position: 'relative', zIndex: 2 }}>
        <Container maxWidth="xl">
          <Grid container justifyContent="center" alignItems="center" spacing={{ xs: 2, md: 8 }} sx={{ opacity: 0.9 }}>
             <Grid item xs={12} md="auto" sx={{ textAlign: 'center' }}><Typography variant="h6" fontWeight={600} color={TEXT_MUTED} sx={{ fontSize: '1rem' }}>CBC Aligned Curriculum</Typography></Grid>
             <Grid item xs={6} md="auto" sx={{ display: 'flex', justifyContent: 'center' }}>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <VerifiedIcon sx={{ mr: 1, color: SAFARICOM_GREEN, fontSize: 20 }} />
                 <Typography variant="h6" fontWeight={600} color={TEXT_MUTED} sx={{ fontSize: '1rem' }}>Verified Resources</Typography>
               </Box>
             </Grid>
             <Grid item xs={6} md="auto" sx={{ display: 'flex', justifyContent: 'center' }}>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" alt="M-PESA" style={{ height: 30, marginRight: 10 }} loading="lazy" />
                 <Typography variant="h6" fontWeight={600} color={TEXT_MUTED} sx={{ fontSize: '1rem' }}>Secure Payments</Typography>
               </Box>
             </Grid>
          </Grid>
        </Container>
      </Box>

     {/* --- BROWSE CURRICULUM SECTION (CLEAN SPLIT DESIGN) --- */}
      <Container maxWidth="xl" sx={{ mt: { xs: 8, md: 10 }, mb: { xs: 8, md: 10 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 5 }}>
           <Box>
              <Typography variant="overline" sx={{ color: PRIMARY_BLUE, letterSpacing: 2, fontSize: '0.85rem', fontWeight: 800 }}>EXPLORE PATHWAYS</Typography>
              <Typography variant="h2" fontWeight={800} sx={{ color: TEXT_DARK, mt: 1, fontSize: { xs: '2.2rem', md: '3rem' } }}>Browse Curriculum</Typography>
           </Box>
           <Button 
            component={RouterLink} 
            to="/browse" 
            endIcon={<KeyboardArrowRightIcon />} 
            sx={{ 
              display: { xs: 'none', sm: 'flex' }, 
              fontWeight: 700, 
              textTransform: 'none',
              borderRadius: '50px',
              px: 3,
              border: `2px solid #e2e8f0`,
              color: TEXT_MUTED,
              '&:hover': { borderColor: PRIMARY_BLUE, color: PRIMARY_BLUE, bgcolor: 'transparent' }
            }}
           >
            View All Categories
           </Button>
        </Box>
        
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {CATEGORIES.map((cat) => (
            <Grid item xs={6} sm={4} md={3} key={cat.id}>
              <Card 
                component={RouterLink}
                to={`/browse?category=${cat.id}`}
                sx={{ 
                    textDecoration: 'none',
                    borderRadius: 5, 
                    bgcolor: 'white',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease-in-out',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': { 
                        transform: 'translateY(-10px)',
                        borderColor: PRIMARY_BLUE,
                        boxShadow: `0 20px 40px rgba(47, 107, 255, 0.1)`,
                        '& .cat-img': { transform: 'scale(1.05)' }
                    }
                }}
              >
                  {/* Top Image Section */}
                  <Box sx={{ position: 'relative', height: { xs: 130, md: 180 }, overflow: 'hidden', borderRadius: '20px 20px 0 0' }}>
                    <Box 
                        component="img"
                        className="cat-img"
                        src={cat.image} 
                         alt={`${cat.label} resources for Kenyan schools`}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    />
                  </Box>

                  {/* Bottom Text Section (Increased padding since icon is gone) */}
                  <Box sx={{ p: { xs: 2.5, md: 3 }, flexGrow: 1 }}>
                    <Typography 
                        fontWeight={800} 
                        sx={{ color: TEXT_DARK, fontSize: { xs: '1rem', md: '1.25rem' }, mb: 0.5, lineHeight: 1.2 }}
                    >
                        {cat.label}
                    </Typography>
                    <Typography 
                        variant="body2" 
                        sx={{ color: TEXT_MUTED, fontWeight: 500, fontSize: { xs: '0.8rem', md: '0.9rem' } }}
                    >
                        {cat.sub}
                    </Typography>
                  </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

  {/* --- FEATURED RESOURCES (Background Flow + Udemy Style) --- */}
<Box sx={{ bgcolor: '#f8fafc', py: { xs: 6, md: 10 } }}>
  <Container maxWidth="xl">
    {/* RESTORED HEADINGS */}
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4 }}>
       <Box>
          <Typography variant="overline" sx={{ color: ACCENT_ORANGE, letterSpacing: 1.5, fontSize: '0.8rem', fontWeight: 800 }}>
            FRESH UPLOADS
          </Typography>
          <Typography variant="h3" fontWeight={800} sx={{ color: TEXT_DARK, mt: 0.5, fontSize: { xs: '1.8rem', md: '3rem' } }}>
            Featured Resources
          </Typography>
          <Typography variant="body1" color={TEXT_MUTED} sx={{ mt: 1, maxWidth: 600 }}>
            Curriculum-approved materials for Junior and Senior School.
          </Typography>
       </Box>
       <Button 
         component={RouterLink} 
         to="/browse" 
         variant="outlined" 
         endIcon={<KeyboardArrowRightIcon />} 
         sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: 50, fontWeight: 700, textTransform: 'none' }}
       >
         Explore All
       </Button>
    </Box>
    
    {loading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
    ) : (
      <Grid container spacing={3}>
        {resources.length === 0 ? (
           <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
              <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
              <Typography color="text.secondary">No resources found right now. Check back later.</Typography>
              <Button component={RouterLink} to="/browse" sx={{ mt: 2 }}>Browse All</Button>
           </Box>
        ) : (
          resources.map((res: any, index: number) => {
            const ratingValue = res.averageRating || 0;
            const reviewCount = res.reviews ? res.reviews.length : 0;
            const displayImage = res.coverImageUrl || res.previewImageUrl;
            
            const teacherName = res.teacherName || 'Instructor';
            const teacherPic = res.teacherProfilePic;

            return (
              <Grid item xs={12} sm={6} md={3} key={res.id || index}>
                <Box 
                  component={RouterLink}
                  to={`/resource/${res.id}`}
                  sx={{ 
                    textDecoration: 'none',
                    display: 'flex', 
                    flexDirection: 'column',
                    height: '100%',
                    bgcolor: '#fff',             // Added white background
                    border: '1px solid #d1d7dc', // Thin border matching the image
                    borderRadius: 3,             // Rounded corners
                    p: 2,                        // Padding inside the border
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': { 
                      borderColor: '#6a6f73',    // Subtle hover effect
                      '& .resource-title': { color: PRIMARY_BLUE },
                      '& .resource-img': { opacity: 0.8 }
                    }
                  }}
                >
                  {/* IMAGE CONTAINER */}
                  <Box sx={{ 
                    width: '100%', 
                    aspectRatio: '16/9', 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    mb: 1.5,
                    bgcolor: '#f1f5f9'
                  }}>
                    {displayImage ? (
                        <CardMedia 
                          className="resource-img"
                          component="img" 
                          image={displayImage} 
                          alt={`${res.title} revision material by ${teacherName}`}  
                          sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.2s' }} 
                        />
                    ) : (
                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <SchoolIcon sx={{ color: '#cbd5e1', fontSize: 40 }} />
                        </Box>
                    )}
                  </Box>

                  {/* CONTENT */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography 
                      className="resource-title"
                      variant="subtitle1" 
                      fontWeight={700} 
                      sx={{ 
                        color: TEXT_DARK, 
                        lineHeight: 1.2, 
                        mb: 0.5, 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical', 
                        overflow: 'hidden',
                        height: '2.5rem',
                        fontSize: '1rem'
                      }}
                    >
                      {res.title}
                    </Typography>

                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Avatar 
                          src={teacherPic} 
                          sx={{ width: 22, height: 22, fontSize: '0.7rem', border: '1px solid #f1f5f9' }}
                        >
                          {teacherName[0]}
                        </Avatar>
                        <Typography 
                          variant="caption" 
                          sx={{ color: TEXT_MUTED, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        >
                          {teacherName}
                        </Typography>
                    </Stack>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Typography variant="body2" fontWeight={800} sx={{ color: '#b4690e', fontSize: '0.85rem' }}>
                        {ratingValue > 0 ? ratingValue.toFixed(1) : "New"}
                      </Typography>
                      <Rating value={ratingValue} precision={0.5} size="small" readOnly sx={{ color: '#e59819', fontSize: '0.9rem' }} />
                      <Typography variant="caption" sx={{ color: TEXT_MUTED }}>
                        ({reviewCount})
                      </Typography>
                    </Box>

                    <Typography variant="body1" fontWeight={800} sx={{ color: TEXT_DARK }}>
                      {res.price > 0 ? (
                        <span>KES {res.price.toLocaleString()}</span>
                      ) : (
                        <span style={{ color: SAFARICOM_GREEN }}>Free</span>
                      )}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })
        )}
      </Grid>
    )}
  </Container>
</Box>
      {/* --- HOW IT WORKS (Consistent Spacing) --- */}
<Box id="how-it-works" sx={{ bgcolor: 'white', py: { xs: 8, md: 10 } }}>
  <Container maxWidth="xl">
    <Box sx={{ textAlign: 'center', mb: 8 }}>
      <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>EASY STEPS</Typography>
      <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#000000', fontSize: { xs: '1.8rem', md: '3rem' } }}>Start learning in 3 minutes</Typography>
      <Typography variant="h6" sx={{ color: TEXT_MUTED, fontSize: { xs: '1rem', md: '1.25rem' } }} fontWeight={400}>Everything you need to excel in your CBC assessment is just a click away.</Typography>
    </Box>

    <Grid container spacing={4}>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 3, height: '100%', textAlign: 'center' }}>
          <Box component="img" src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, mb: 3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#000000' }}>1. Search</Typography>
          <Typography color={TEXT_MUTED}>Find notes and exams for Grade 7, 8, 9 or Senior School pathways.</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 3, height: '100%', textAlign: 'center' }}>
          <Box component="img" src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, mb: 3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#000000' }}>2. Pay Securely</Typography>
          <Typography color={TEXT_MUTED}>Pay instantly via M-Pesa. Your funds are secure.</Typography>
        </Box>
      </Grid>
      <Grid item xs={12} md={4}>
        <Box sx={{ p: 3, height: '100%', textAlign: 'center' }}>
          <Box component="img" src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, mb: 3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#000000' }}>3. Download</Typography>
          <Typography color={TEXT_MUTED}>Get your file immediately and start learning.</Typography>
        </Box>
      </Grid>
    </Grid>

    {/* --- FIND RESOURCES NOW BUTTON --- */}
    <Box sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
      <Button 
        component={RouterLink} 
        to="/browse" 
        sx={{ 
          borderRadius: 0,              // Sharp corners
          border: '1px solid #000000',  // Pure black thin border
          bgcolor: '#ffffff',           // Pure white background
          color: '#000000',             // Pure black text
          px: { xs: 4, md: 6 }, 
          py: 1.5, 
          fontSize: '1.1rem', 
          fontWeight: 700,              // Thicker font for better "black" visibility
          textTransform: 'none',        // "Find Resources Now" casing
          transition: 'all 0.2s ease',
          '&:hover': {
            bgcolor: '#000000',         // Invert on hover
            color: '#ffffff',
            borderColor: '#000000'
          }
        }}
      >
        Find Resources Now
      </Button>
    </Box>
  </Container>
</Box>

    {/* --- VALUE PROPOSITION BANNER --- */}
<Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
  <Box 
    sx={{ 
      bgcolor: '#1e293b', 
      color: 'white', 
      py: { xs: 8, md: 10 },
      px: { xs: 4, md: 8 },
      borderRadius: 8, // Large rounded corners like in the image
      overflow: 'hidden'
    }}
  >
    <Grid container spacing={6} alignItems="center">
      <Grid item xs={12} md={6}>
        <Typography variant="overline" color="secondary" sx={{ fontWeight: 700, letterSpacing: 2 }}>
          FOR TEACHERS
        </Typography>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '1.8rem', md: '3rem' } }}>
          Sell Your Resources
        </Typography>
        <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3, opacity: 0.9 }}>
          Teachers from around Kenya upload their CBC notes, projects, and guides. Help students excel in the new curriculum and earn extra income.
        </Typography>
        
        <Button 
          component={RouterLink} 
          to="/seller" 
          sx={{ 
            borderRadius: 0,              // Sharp corners preserved
            border: '1px solid #000000',  // Pure black thin border preserved
            bgcolor: '#ffffff',           // Pure white background preserved
            color: '#000000',             // Pure black text preserved
            px: 5, 
            py: 1.5, 
            fontSize: '1.1rem', 
            fontWeight: 700, 
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': { 
              bgcolor: '#000000', 
              color: '#ffffff', 
              borderColor: '#000000' 
            } 
          }}
        >
          Start Selling Today
        </Button>
      </Grid>
      
      <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Box 
          sx={{ 
            width: '100%', 
            height: 300, 
            bgcolor: 'rgba(255,255,255,0.03)', 
            border: '1px dashed rgba(255,255,255,0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            borderRadius: 4 
          }}
        >
          <TeacherIllustration />
        </Box>
      </Grid>
    </Grid>
  </Box>
</Container>
{/* --- TOP CONTRIBUTORS (Professional Clean Style with Intro Text) --- */}
<Box 
  sx={{ 
    bgcolor: '#f8fafc', 
    pt: { xs: 10, md: 12 }, 
    pb: { xs: 12, md: 15 },
    borderTop: '1px solid #e2e8f0'
  }}
>
  <Container maxWidth="lg">
    
    {/* Header Section */}
    <Box sx={{ mb: { xs: 8, md: 10 }, textAlign: { xs: 'center', md: 'left' } }}>
      <Typography 
        variant="overline" 
        sx={{ color: ACCENT_ORANGE, fontWeight: 800, letterSpacing: 1.5, fontSize: '0.8rem' }}
      >
        COMMUNITY EXPERTS
      </Typography>
      <Typography 
        variant="h2" 
        sx={{ color: TEXT_DARK, fontWeight: 800, fontSize: { xs: '2.2rem', md: '3rem' }, mt: 1, mb: 2 }}
      >
        Top Contributors
      </Typography>
      <Typography 
        variant="body1" 
        sx={{ 
          color: TEXT_MUTED, 
          maxWidth: '700px', 
          fontSize: '1.1rem', 
          lineHeight: 1.6,
          mx: { xs: 'auto', md: '0' } 
        }}
      >
        Meet the educators driving the digital transformation of Kenya's classrooms. 
        Our top contributors are subject matter experts who provide high-quality, 
        CBC-aligned resources to help every student reach their full potential.
      </Typography>
    </Box>

    {/* Contributors Grid */}
    <Grid container spacing={3} justifyContent="flex-start" alignItems="stretch">
      {contributors
        // 1. Logic: Only teachers with resources
        .filter((teacher: any) => (teacher.resourceCount || 0) > 0)
        // 2. Logic: Highest count first
        .sort((a: any, b: any) => (b.resourceCount || 0) - (a.resourceCount || 0))
        // 3. Logic: Top 4
        .slice(0, 4)
        .map((contributor: any, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx} sx={{ display: 'flex' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              width: '100%', 
              bgcolor: '#ffffff', 
              textAlign: 'center', 
              pt: 4, 
              pb: 5, 
              px: 3, 
              borderRadius: 8, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              transition: 'all 0.3s ease',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: '0 15px 35px rgba(0,0,0,0.08)',
                borderColor: PRIMARY_BLUE
              }
            }}>
              
              {/* Profile Image - Referrer Fix Included */}
              <Avatar 
                src={contributor.profilePicPath || ""} 
                imgProps={{ 
                  referrerPolicy: "no-referrer",
                  style: { objectPosition: 'center 5%' } 
                }}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto',
                  mb: 3,
                  bgcolor: '#f1f5f9',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)' 
                }} 
              >
                {contributor.name ? contributor.name.charAt(0) : "T"}
              </Avatar>

              <Box sx={{ flexGrow: 1 }}>
                {/* Real Name */}
                <Typography 
                  variant="h6" 
                  fontWeight={800} 
                  sx={{ 
                    color: TEXT_DARK, 
                    textTransform: 'uppercase', 
                    fontSize: '1rem',
                    mb: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 0.5
                  }}
                >
                  {contributor.name || "Teacher"}
                  <VerifiedIcon sx={{ fontSize: 16, color: SAFARICOM_GREEN }} />
                </Typography>

                {/* Real Headline (with subject fallback) */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: ACCENT_ORANGE, 
                    fontWeight: 700, 
                    textTransform: 'lowercase',
                    mb: 2
                  }}
                >
                  {contributor.headline || (Array.isArray(contributor.subjects) && contributor.subjects[0]) || 'expert educator'}
                </Typography>

                {/* Real Bio (clamped to 3 lines) */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: TEXT_MUTED, 
                    lineHeight: 1.5, 
                    fontSize: '0.85rem', 
                    mb: 3,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {contributor.bio || "Dedicated educator contributing high-quality curriculum focused revision materials."}
                </Typography>
              </Box>

              {/* Resources Badge */}
              <Box sx={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                bgcolor: '#eff6ff', 
                px: 2, 
                py: 0.8, 
                borderRadius: 10,
                mx: 'auto'
              }}>
                <Typography variant="caption" fontWeight={900} sx={{ color: PRIMARY_BLUE }}>
                  {contributor.resourceCount || 0} RESOURCES
                </Typography>
              </Box>
            </Box>
          </Grid>
      ))}

      {/* Fallback if no contributors found */}
      {contributors.filter((t: any) => (t.resourceCount || 0) > 0).length === 0 && (
         <Grid item xs={12}>
            <Box sx={{ p: 6, textAlign: 'center', bgcolor: '#fff', borderRadius: 4, border: '1px dashed #cbd5e1' }}>
                <Typography sx={{ color: TEXT_MUTED, fontWeight: 600 }}>
                  Be the first to shape the future. Join our community of contributors today!
                </Typography>
            </Box>
         </Grid>
      )}
    </Grid>
  </Container>
</Box>
      <Footer />
    </Box>
  );
}

export default Home;