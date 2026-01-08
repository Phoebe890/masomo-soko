import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Button, Card, CardContent, CardMedia,
  Grid, CircularProgress, Avatar, Divider, Chip, Stack, Rating, 
  InputAdornment, TextField
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { api } from '@/api/axios';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'; 

// Assets
import heroImage1 from '../assets/pexels-kampus-5940828.jpg'; 
import heroImage2 from '../assets/pexels-kampus-5940829.jpg'; 

// --- CONSTANTS ---
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
  const [isPaused, setIsPaused] = useState(false);
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
      if (!isPaused) {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, 8000); 
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  useEffect(() => {
    setLoading(true);
    api.get('/api/teacher/resources')
      .then(res => {
        setResources(res.data.resources ? res.data.resources.slice(0, 8) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.get('/api/teacher/top-contributors')
      .then(res => setContributors(res.data))
      .catch(() => {});
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/browse?search=${encodeURIComponent(heroSearch)}`);
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      
     {/* --- HERO SECTION --- */}
      <Box 
        component="section" 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: { xs: '90vh', md: '80vh' }, 
          minHeight: '650px',
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
              backgroundPosition: 'center',
              transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
              opacity: currentSlide === index ? 1 : 0, 
              transition: 'opacity 1.5s ease-in-out, transform 8s linear', 
              zIndex: 0,
            }}
          />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.75) 100%)', zIndex: 1 }} />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center', color: 'white' }}>
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
                            <Box component="form" onSubmit={handleHeroSearch} sx={{ position: 'relative', width: '100%', maxWidth: '600px' }}>
                                <TextField
                                    fullWidth
                                    placeholder="Search for notes, exams... (e.g. Form 4 Math)"
                                    value={heroSearch}
                                    onChange={(e) => setHeroSearch(e.target.value)}
                                    onFocus={() => setIsPaused(true)}
                                    onBlur={() => setIsPaused(false)}
                                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white', borderRadius: '50px', pl: 2, pr: 1, height: '64px', fontSize: '1.1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.3)', '& fieldset': { border: 'none' }, '&:hover': { bgcolor: '#fff' } } }}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><SearchIcon sx={{ color: '#64748b', fontSize: 28 }} /></InputAdornment>),
                                    }}
                                />
                            </Box>
                        ) : (
                            <Button 
                              component={RouterLink} 
                              to="/register?role=teacher" 
                              variant="contained" 
                              size="large" 
                              endIcon={<ArrowForwardIcon />} 
                              sx={{ borderRadius: '50px', height: '64px', px: 6, fontSize: '1.2rem', fontWeight: 700, textTransform: 'none', bgcolor: 'primary.main', color: 'white', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.02)' } }}
                            >
                                Start Selling Now
                            </Button>
                        )}
                    </Box>
                </Box>
             )
          ))}
          {/* UPDATED: Changed bottom from 40 to 15, added zIndex 3 */}
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ position: 'absolute', bottom: 1, left: 0, right: 0, zIndex: 3 }}>
             {slides.map((_, idx) => (
                 <Box key={idx} onClick={() => setCurrentSlide(idx)} sx={{ width: 12, height: 12, borderRadius: '50%', cursor: 'pointer', bgcolor: currentSlide === idx ? 'white' : 'rgba(255,255,255,0.3)', transition: 'all 0.3s' }} />
             ))}
          </Stack>
        </Container>
      </Box>

      {/* --- TRUST BAR --- */}
      <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', py: 4 }}>
        <Container maxWidth="xl">
          <Grid container justifyContent="center" alignItems="center" spacing={{ xs: 4, md: 8 }} sx={{ opacity: 0.8 }}>
             <Grid item><Typography variant="h6" fontWeight={600} color={TEXT_MUTED}>50K+ Resources</Typography></Grid>
             <Grid item>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" alt="M-PESA Verified" style={{ height: 40, marginRight: 12 }} loading="lazy" />
                 <Typography variant="h6" fontWeight={600} color={TEXT_MUTED}>Secured Payments</Typography>
               </Box>
             </Grid>
             <Grid item><Typography variant="h6" fontWeight={600} color={TEXT_MUTED}>Expert Content</Typography></Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- CATEGORIES SECTION --- */}
      <Container maxWidth="xl" sx={{ mt: 8, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 3 }}>
           <Box>
              <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5, fontSize: '0.8rem' }}>BROWSE BY TOPIC</Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color: TEXT_DARK, mt: 0.5 }}>Top Categories</Typography>
           </Box>
           <Button component={RouterLink} to="/browse" endIcon={<KeyboardArrowRightIcon />} sx={{ display: { xs: 'none', sm: 'flex' }, fontWeight: 700, textTransform: 'none' }}>View All</Button>
        </Box>
        <Grid container spacing={2}>
          {CATEGORIES.map((cat) => (
            <Grid item xs={6} sm={4} md={3} key={cat.id}>
              <Chip
                component={RouterLink}
                to={`/browse?category=${cat.id}`}
                label={cat.label}
                clickable
                icon={cat.icon}
                variant="outlined"
                sx={{ 
                  width: '100%', justifyContent: 'flex-start', py: 3.5, px: 2, fontWeight: 600, fontSize: '1rem', color: TEXT_DARK, borderColor: '#E2E8F0', borderRadius: 2, transition: 'all 0.2s',
                  '& .MuiChip-icon': { color: PRIMARY_BLUE, fontSize: 24 },
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: PRIMARY_BLUE, transform: 'translateY(-2px)' }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- FEATURED RESOURCES SECTION --- */}
      <Box sx={{ bgcolor: '#f8fafc', py: 8 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4 }}>
             <Box>
                <Typography variant="overline" color="secondary" fontWeight={800} sx={{ letterSpacing: 1.5, fontSize: '0.8rem', color: ACCENT_ORANGE }}>FRESH UPLOADS</Typography>
                <Typography variant="h3" fontWeight={800} sx={{ color: TEXT_DARK, mt: 0.5 }}>Featured Resources</Typography>
                <Typography variant="body1" color={TEXT_MUTED} sx={{ mt: 1, maxWidth: 600 }}>High-quality materials vetted by our team to ensure you get the best grades.</Typography>
             </Box>
             <Button component={RouterLink} to="/browse" variant="outlined" endIcon={<KeyboardArrowRightIcon />} sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: 50, fontWeight: 700, textTransform: 'none' }}>Explore All</Button>
          </Box>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
          ) : (
            <Grid container spacing={3}>
              {resources.length === 0 ? (
                 <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
                    <SchoolIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography color="text.secondary">No resources found right now. Check back later.</Typography>
                 </Box>
              ) : (
                resources.map((res: any, index: number) => {
                  const ratingValue = res.averageRating || 0;
                  const reviewCount = res.reviews ? res.reviews.length : 0;
                  const displayImage = res.coverImageUrl || res.previewImageUrl;

                  return (
                    <Grid item xs={12} sm={6} md={3} key={res.id}>
                      <Card 
                        sx={{ 
                          height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0', bgcolor: 'white', cursor: 'pointer', transition: 'all 0.3s ease',
                          '&:hover': { transform: 'translateY(-5px)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', '& .title': { color: PRIMARY_BLUE } } 
                        }}
                        component={RouterLink}
                        to={`/resource/${res.id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        <Box sx={{ position: 'relative', pt: '60%', borderBottom: '1px solid #f1f5f9', overflow: 'hidden' }}>
                           {displayImage ? (
                               <CardMedia component="img" image={displayImage} alt={res.title} loading="lazy" sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                           ) : (
                               <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: getRandomColor(index), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}><SchoolIcon sx={{ fontSize: 40, opacity: 0.5 }} /></Box>
                           )}
                           <Chip label={res.price > 0 ? `KES ${res.price}` : "Free"} size="small" sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'white', color: TEXT_DARK, fontWeight: 800, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                        </Box>
                        <CardContent sx={{ p: 2, flexGrow: 1 }}>
                          <Typography className="title" variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.4, mb: 1, color: TEXT_DARK, height: '2.8rem', overflow: 'hidden', transition: 'color 0.2s' }}>{res.title}</Typography>
                          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem' }}>{res.teacherName?.[0] || 'T'}</Avatar>
                              <Typography variant="body2" sx={{ color: TEXT_MUTED, fontSize: '0.85rem' }}>{res.teacherName || 'Instructor'}</Typography>
                          </Stack>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating value={ratingValue} precision={0.5} size="small" readOnly sx={{ color: '#fbbf24', fontSize: '1rem' }} />
                            <Typography variant="caption" sx={{ color: TEXT_MUTED, ml: 0.5, fontWeight: 600 }}>{ratingValue > 0 ? ratingValue.toFixed(1) : "New"} <span style={{ fontWeight: 400 }}>({reviewCount})</span></Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          )}
        </Container>
      </Box>

      {/* --- HOW IT WORKS --- */}
      <Box id="how-it-works" sx={{ bgcolor: 'white', py: 10 }}>
        <Container maxWidth="xl">
           <Box sx={{ textAlign: 'center', mb: 8 }}>
             <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>EASY STEPS</Typography>
             <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: TEXT_DARK }}>Start learning in 3 minutes</Typography>
             <Typography variant="h6" sx={{ color: TEXT_MUTED }} fontWeight={400}>Everything you need to excel in your exams is just a click away.</Typography>
           </Box>

           <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, mb: 3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                    <Typography variant="h5" fontWeight={700} gutterBottom>1. Search</Typography>
                    <Typography color={TEXT_MUTED}>Browse our huge library of notes, exams, and revision materials.</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, mb: 3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                    <Typography variant="h5" fontWeight={700} gutterBottom>2. Pay Securely</Typography>
                    <Typography color={TEXT_MUTED}>Pay instantly via M-Pesa. Your funds are secure.</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                    <Box component="img" src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" sx={{ width: '100%', height: 200, objectFit: 'cover', borderRadius: 4, mb: 3, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} />
                    <Typography variant="h5" fontWeight={700} gutterBottom>3. Download</Typography>
                    <Typography color={TEXT_MUTED}>Get your file immediately and start learning.</Typography>
                </Box>
              </Grid>
           </Grid>

           <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Button component={RouterLink} to="/browse" variant="contained" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 50, px: 6, py: 2, fontSize: '1.1rem', fontWeight: 700, textTransform: 'none', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.3)' }}>
                Start Learning Today
              </Button>
           </Box>
        </Container>
      </Box>

      {/* --- VALUE PROPOSITION BANNER --- */}
      <Box sx={{ bgcolor: '#1e293b', color: 'white', py: 8 }}>
         <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="overline" sx={{ color: ACCENT_ORANGE, fontWeight: 700, letterSpacing: 2 }}>FOR TEACHERS</Typography>
                    <Typography variant="h3" fontWeight={800} gutterBottom>Sell Your Resources</Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3, opacity: 0.9 }}>Teachers from around the country upload their notes, exams, and guides for thousands of students to buy on Masomo Soko. Turn your hard work into income.</Typography>
                    <Button variant="contained" size="large" component={RouterLink} to="/register?role=teacher" sx={{ bgcolor: 'white', color: '#1e293b', borderRadius: 50, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#f1f5f9' } }}>Start selling today</Button>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                     <Box sx={{ width: '100%', height: 300, bgcolor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}><TeacherIllustration /></Box>
                </Grid>
            </Grid>
         </Container>
      </Box>

     {/* --- TOP CONTRIBUTORS --- */}
      <Container maxWidth="xl" sx={{ py: 6, mb: 6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', mb: 4 }}>
           <Box>
              <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>COMMUNITY</Typography>
              <Typography variant="h3" fontWeight={800} sx={{ color: TEXT_DARK }}>Popular Teachers</Typography>
           </Box>
        </Box>
        <Grid container spacing={3}>
          {contributors.slice(0, 4).map((contributor: any, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card sx={{ height: '100%', boxShadow: 'none', border: '1px solid #E2E8F0', p: 2, borderRadius: 3, transition: 'all 0.2s', '&:hover': { borderColor: PRIMARY_BLUE, transform: 'translateY(-2px)' } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={contributor.profilePicPath} sx={{ width: 64, height: 64, mr: 2 }}>{contributor.name?.charAt(0)}</Avatar>
                      <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', color: TEXT_DARK }}>{contributor.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Instructor</Typography>
                      </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, color: TEXT_MUTED }}>Specializes in {Array.isArray(contributor.subjects) ? contributor.subjects.join(', ') : 'Education'}.</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ fontSize: 18, color: PRIMARY_BLUE, mr: 1 }} />
                      <Typography variant="body2" fontWeight={700} color="primary.main">{contributor.resourceCount} Resources Uploaded</Typography>
                  </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}

export default Home;