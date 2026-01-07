import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Button, Card, CardContent, CardMedia,
  Grid, CircularProgress, Avatar, Divider, Chip, Stack, Rating
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/layout/Footer';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';

// Assets
import heroImage1 from '../assets/pexels-kampus-5940828.jpg';
import heroImage2 from '../assets/pexels-kampus-5940829.jpg';

// --- CONSTANTS ---
// UPDATED: Using a "Rich Slate" color instead of flat black for a modern UI feel
const TEXT_DARK = '#0f172a'; 
const TEXT_MUTED = '#475569';

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

// Custom SVG Illustration
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

  const heroSlides = [
    {
      image: heroImage1,
      title: 'Share Knowledge, Empower Learning',
      subtitle: 'Join thousands of teachers sharing quality educational resources',
    },
    {
      image: heroImage2,
      title: 'Transform Education',
      subtitle: 'Discover premium learning materials created by expert educators',
    }
  ];

  // Fetch Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/teacher/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data.resources ? data.resources.slice(0, 8) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/teacher/top-contributors')
      .then(res => res.json())
      .then(data => setContributors(data));
  }, []);

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      
     {/* --- MODERN HERO SECTION --- */}
      <Box 
        component="section" 
        sx={{ 
          position: 'relative', 
          width: '100%', 
          height: { xs: '85vh', md: '75vh' },
          minHeight: '600px',
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        <style>
          {`
            @keyframes slideUpFade {
              0% { opacity: 0; transform: translateY(30px); }
              100% { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>

        {heroSlides.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${slide.image})`, 
              backgroundSize: 'cover', 
              backgroundPosition: 'center',
              transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)',
              opacity: currentSlide === index ? 1 : 0, 
              transition: 'opacity 1.5s ease-in-out, transform 6s linear', 
              zIndex: 0,
            }}
          />
        ))}

        <Box 
          sx={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(90deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.2) 100%)', 
            zIndex: 1 
          }} 
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
          {heroSlides.map((slide, index) => (
            currentSlide === index && (
              <Box 
                key={index} 
                sx={{ 
                  maxWidth: '800px',
                  animation: 'slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
                }}
              >
               
                <Typography 
                  variant="h1" 
                  fontWeight={800} // Kept bold here for main hero
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '4.5rem' }, 
                    lineHeight: 1.1,
                    mb: 3, 
                    letterSpacing: '-1px',
                    textShadow: '0 4px 20px rgba(0,0,0,0.5)'
                  }}
                >
                  {slide.title}
                </Typography>

                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 5, 
                    maxWidth: '650px', 
                    fontWeight: 400, 
                    color: 'rgba(255,255,255,0.9)', 
                    lineHeight: 1.6,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                  }}
                >
                  {slide.subtitle}
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button 
                    variant="contained" 
                    size="large" 
                    component={RouterLink} 
                    to="/browse" 
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      bgcolor: 'primary.main',
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '1.1rem',
                      px: 5, 
                      py: 1.8, 
                      borderRadius: '50px',
                      textTransform: 'none',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 25px rgba(0,0,0,0.4)' },
                      transition: 'all 0.3s'
                    }}
                  >
                    Get Started
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    size="large" 
                    onClick={scrollToHowItWorks}
                    startIcon={<PlayCircleFilledWhiteIcon />}
                    sx={{ 
                      color: 'white', 
                      borderColor: 'rgba(255,255,255,0.5)',
                      fontWeight: 600, 
                      fontSize: '1.1rem',
                      px: 4, 
                      py: 1.8, 
                      borderRadius: '50px',
                      textTransform: 'none',
                      backdropFilter: 'blur(5px)',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    How it works
                  </Button>
                </Stack>
              </Box>
            )
          ))}
        </Container>
      </Box>

      {/* --- TRUST BAR --- */}
      <Box sx={{ bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', py: 4 }}>
        <Container maxWidth="xl">
          <Grid container justifyContent="center" alignItems="center" spacing={{ xs: 4, md: 8 }} sx={{ opacity: 0.8 }}>
             <Grid item>
               <Typography variant="h6" fontWeight={600} color={TEXT_MUTED}>50K+ Resources</Typography>
             </Grid>
             <Grid item>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                    alt="M-PESA Verified" 
                    style={{ height: 40, marginRight: 12 }} 
                    loading="lazy"
                 />
                 <Typography variant="h6" fontWeight={600} color={TEXT_MUTED}>Secured Payments</Typography>
               </Box>
             </Grid>
             <Grid item>
               <Typography variant="h6" fontWeight={600} color={TEXT_MUTED}>Expert Content</Typography>
             </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- CATEGORIES --- */}
      <Container maxWidth="xl" sx={{ mt: 6, mb: 2 }}>
        {/* CHANGED: Softened color, reduced weight to 700 */}
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: TEXT_DARK }}>
          Top Categories
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
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
                  width: '100%', 
                  justifyContent: 'flex-start', 
                  py: 3, 
                  px: 1, 
                  fontWeight: 600, 
                  color: TEXT_DARK,
                  borderColor: '#E2E8F0',
                  borderRadius: 1, 
                  transition: 'all 0.2s',
                  '& .MuiChip-icon': { color: 'primary.main' },
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: 'primary.main' }
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- FEATURED RESOURCES --- */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        {/* CHANGED: Softened color, reduced weight */}
        <Typography variant="h4" fontWeight={700} sx={{ color: TEXT_DARK }}>Featured Resources</Typography>
        <Typography variant="body1" sx={{ mb: 3, color: TEXT_MUTED }}>Hand-picked resources to help you excel</Typography>
        
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
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        borderRadius: 2, // Slightly more rounded for modern look
                        boxShadow: 'none', 
                        bgcolor: 'transparent', 
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                        '&:hover': { 
                          transform: 'translateY(-4px)',
                          '& .title': { color: 'primary.main' }, 
                          '& img': { filter: 'brightness(0.95)' } 
                        } 
                      }}
                      component={RouterLink}
                      to={`/resource/${res.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <Box sx={{ position: 'relative', pt: '56.25%', mb: 1.5, borderRadius: 2, overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                         {displayImage ? (
                             <CardMedia 
                                component="img"
                                image={displayImage}
                                alt={res.title}
                                loading="lazy"
                                sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                             />
                         ) : (
                             <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', bgcolor: getRandomColor(index), display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <SchoolIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                             </Box>
                         )}
                      </Box>

                      <CardContent sx={{ p: 0, pb: '0 !important' }}>
                        <Typography className="title" variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.4, mb: 0.5, color: TEXT_DARK, height: '2.8rem', overflow: 'hidden', transition: 'color 0.2s' }}>{res.title}</Typography>
                        <Typography variant="body2" sx={{ color: TEXT_MUTED, fontSize: '0.8rem', mb: 0.5 }}>{res.teacherName || 'Unknown Teacher'}</Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight={700} sx={{ color: '#b4690e', mr: 0.5 }}>
                              {ratingValue > 0 ? ratingValue.toFixed(1) : "New"}
                          </Typography>
                          <Rating value={ratingValue} precision={0.5} size="small" readOnly sx={{ color: '#e59819', fontSize: '1rem' }} />
                          <Typography variant="caption" sx={{ color: TEXT_MUTED, ml: 0.5 }}>
                              ({reviewCount})
                          </Typography>
                        </Box>

                        <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem', color: TEXT_DARK }}>
                            {res.pricing === "Free" ? "Free" : `KES ${res.price}`}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        )}
      </Container>

      {/* --- HOW IT WORKS (TARGET SECTION) --- */}
      <Box id="how-it-works" sx={{ bgcolor: '#F8FAFC', py: 10 }}>
        <Container maxWidth="xl">
           <Box sx={{ textAlign: 'center', mb: 8 }}>
             {/* CHANGED: Softened color, reduced weight */}
             <Typography variant="h3" fontWeight={700} gutterBottom sx={{ color: TEXT_DARK }}>
               Start learning in 3 easy steps
             </Typography>
             <Typography variant="h6" sx={{ color: TEXT_MUTED }} fontWeight={400}>
               Everything you need to excel in your exams is just a click away.
             </Typography>
           </Box>

           <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: '#fff', p: 0, height: '100%', border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } }}>
                  <Box 
                    component="img"
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Search Library"
                    loading="lazy"
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                       <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>1</Box>
                       <Typography variant="h5" fontWeight={700} color={TEXT_DARK}>Search</Typography>
                    </Stack>
                    <Typography color={TEXT_MUTED}>
                       Browse our huge library of notes, exams, and revision materials using the search bar or categories.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: '#fff', p: 0, height: '100%', border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } }}>
                  <Box 
                    component="img"
                    src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="M-Pesa Payment"
                    loading="lazy"
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                       <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>2</Box>
                       <Typography variant="h5" fontWeight={700} color={TEXT_DARK}>Pay Securely</Typography>
                    </Stack>
                    <Typography color={TEXT_MUTED}>
                       Pay instantly via M-Pesa. Your funds are secure, and verification is automatic and instant.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: '#fff', p: 0, height: '100%', border: '1px solid #E2E8F0', borderRadius: 2, overflow: 'hidden', transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } }}>
                  <Box 
                    component="img"
                    src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Start Learning"
                    loading="lazy"
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                       <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>3</Box>
                       <Typography variant="h5" fontWeight={700} color={TEXT_DARK}>Download & Learn</Typography>
                    </Stack>
                    <Typography color={TEXT_MUTED}>
                       Get your file immediately after payment. View it on any device or print it out for revision.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
           </Grid>
        </Container>
      </Box>

      {/* --- VALUE PROPOSITION BANNER --- */}
      <Box sx={{ bgcolor: '#1e293b', color: 'white', py: 8 }}>
         <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        Sell Your Resources
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3, opacity: 0.9 }}>
                        Teachers from around the country upload their notes, exams, and guides for thousands of students to buy on Mwalimu Soko. Turn your hard work into income.
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="large" 
                      component={RouterLink} 
                      to="/seller" 
                      sx={{ 
                        bgcolor: 'white', 
                        color: '#1e293b', 
                        borderRadius: 0, 
                        fontWeight: 700, 
                        px: 4, 
                        py: 1.5, 
                        '&:hover': { bgcolor: '#f1f5f9', transform: 'scale(1.02)' },
                        transition: 'all 0.2s'
                      }}
                    >
                        Start selling today
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
                         borderRadius: 2 
                       }}
                     >
                        <TeacherIllustration />
                     </Box>
                </Grid>
            </Grid>
         </Container>
      </Box>

     {/* --- TOP CONTRIBUTORS --- */}
      <Container maxWidth="xl" sx={{ py: 6, mb: 6 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: TEXT_DARK }}>Popular Teachers</Typography>
        <Grid container spacing={3}>
          {contributors.slice(0, 4).map((contributor: any, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card 
                sx={{ 
                  height: '100%', 
                  boxShadow: 'none', 
                  border: '1px solid #E2E8F0', 
                  p: 2, 
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' } 
                }}
              >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={contributor.profilePicPath} sx={{ width: 64, height: 64, mr: 2 }}>{contributor.name?.charAt(0)}</Avatar>
                      <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', color: TEXT_DARK }}>{contributor.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Instructor</Typography>
                      </Box>
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 2, color: TEXT_MUTED }}>
                      Specializes in {Array.isArray(contributor.subjects) ? contributor.subjects.join(', ') : 'Education'}.
                  </Typography>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                          {contributor.resourceCount} Resources Uploaded
                      </Typography>
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