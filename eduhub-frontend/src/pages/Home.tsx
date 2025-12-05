import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Button, Card, CardContent, 
  useTheme, Grid, CircularProgress, Avatar, Divider, Chip, Stack, Rating 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchIcon from '@mui/icons-material/Search';
import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite';

// Assets (Keep your local imports if they exist, otherwise these are just types)
import heroImage1 from '../assets/pexels-kampus-5940828.jpg';
import heroImage2 from '../assets/pexels-kampus-5940829.jpg';

// Helper for random gradient placeholders
const getRandomColor = (id: number) => {
  const colors = ['#2D2F31', '#1C1D1F', '#5022c3', '#0056D2', '#1aa0db'];
  return colors[id % colors.length];
};

const Home: React.FC = () => {
  const theme = useTheme();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Data Definitions
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

  const categories = [
    { label: 'KCSE Revision', id: 'kcse' },
    { label: 'KCPE Mocks', id: 'kcpe' },
    { label: 'Junior Secondary', id: 'junior' },
    { label: 'Form 1-4 Notes', id: 'highschool' },
    { label: 'Mathematics', id: 'math' },
    { label: 'Sciences', id: 'science' },
    { label: 'Languages', id: 'languages' },
    { label: 'Humanities', id: 'humanities' },
  ];

  // Fetch Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    setLoading(true);
    // Simulating fetch for display purposes if API fails
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

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh' }}>
      
      {/* --- HERO SECTION --- */}
      <Box component="section" sx={{ position: 'relative', width: '100%', height: { xs: '60vh', md: '500px' }, overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
        {heroSlides.map((slide, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute', inset: 0,
              backgroundImage: `url(${slide.image})`, backgroundSize: 'cover', backgroundPosition: 'center',
              opacity: currentSlide === index ? 1 : 0, transition: 'opacity 1s ease-in-out', zIndex: 0,
            }}
          />
        ))}
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2, color: 'white' }}>
          {heroSlides.map((slide, index) => (
            <Box key={index} sx={{ display: currentSlide === index ? 'block' : 'none', animation: 'fadeIn 0.5s' }}>
              <Typography variant="h2" fontWeight={800} sx={{ fontSize: { xs: '2rem', md: '3.5rem' }, mb: 2, textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                {slide.title}
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, maxWidth: '600px', fontWeight: 400 }}>{slide.subtitle}</Typography>
              <Button variant="contained" size="large" component={RouterLink} to="/browse" sx={{ bgcolor: 'white', color: 'black', fontWeight: 'bold', px: 4, py: 1.5, '&:hover': { bgcolor: '#f5f5f5' } }}>
                Get Started
              </Button>
            </Box>
          ))}
        </Container>
      </Box>

      {/* --- TRUST BAR (Updated with Real M-Pesa Logo) --- */}
      <Box sx={{ bgcolor: '#F7F9FA', borderBottom: '1px solid #d1d7dc', py: 4 }}>
        <Container maxWidth="xl">
          <Grid container justifyContent="center" alignItems="center" spacing={{ xs: 4, md: 8 }} sx={{ opacity: 0.8 }}>
             <Grid item>
               <Typography variant="h6" fontWeight={700} color="grey.700">50K+ Resources</Typography>
             </Grid>
             <Grid item>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 {/* OFFICIAL COLORED M-PESA LOGO */}
                 <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                    alt="M-PESA Verified" 
                    style={{ height: 40, marginRight: 12 }} 
                 />
                 <Typography variant="h6" fontWeight={700} color="grey.700">Secured Payments</Typography>
               </Box>
             </Grid>
             <Grid item>
               <Typography variant="h6" fontWeight={700} color="grey.700">Expert Content</Typography>
             </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- CATEGORIES --- */}
      <Container maxWidth="xl" sx={{ mt: 6, mb: 2 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#2d2f31' }}>
          Top Categories
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {(() => {
            const iconMap: Record<string, JSX.Element> = {
              kcse: <SchoolIcon />, kcpe: <SchoolIcon />, junior: <MenuBookIcon />, highschool: <MenuBookIcon />,
              math: <FunctionsIcon />, science: <ScienceIcon />, languages: <LanguageIcon />, humanities: <HistoryEduIcon />
            };
            return categories.map((cat) => (
              <Grid item xs={6} sm={4} md={3} key={cat.id}>
                <Chip
                  component={RouterLink}
                  to={`/browse?category=${cat.id}`}
                  label={cat.label}
                  clickable
                  icon={iconMap[cat.id] ?? <MenuBookIcon />}
                  variant="outlined"
                  sx={{ width: '100%', justifyContent: 'flex-start', py: 3, px: 1, fontWeight: 700, borderRadius: 1, '& .MuiChip-icon': { color: 'primary.main' } }}
                />
              </Grid>
            ));
          })()}
        </Grid>
      </Container>

      {/* --- FEATURED RESOURCES --- */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Typography variant="h4" fontWeight={800} sx={{ color: '#2d2f31' }}>Featured Resources</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>Hand-picked resources to help you excel</Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {resources.length === 0 ? (
               <Typography sx={{ mx: 3 }}>No resources found. Check back later.</Typography>
            ) : (
              resources.map((res: any, index: number) => (
                <Grid item xs={12} sm={6} md={3} key={res.id}>
                  <Card 
                    sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: 'none', bgcolor: 'transparent', cursor: 'pointer', '&:hover .title': { textDecoration: 'underline' }, '&:hover': { '& img': { filter: 'brightness(0.9)' } } }}
                    component={RouterLink}
                    to={`/resource/${res.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: getRandomColor(index), mb: 1.5, border: '1px solid #d1d7dc' }}>
                       <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <SchoolIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                       </Box>
                    </Box>
                    <CardContent sx={{ p: 0, pb: '0 !important' }}>
                      <Typography className="title" variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.4, mb: 0.5, color: '#2d2f31', height: '2.8rem', overflow: 'hidden' }}>{res.title}</Typography>
                      <Typography variant="body2" sx={{ color: '#6a6f73', fontSize: '0.8rem', mb: 0.5 }}>{res.teacherName || 'Unknown Teacher'}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#b4690e', mr: 0.5 }}>4.5</Typography>
                        <Rating value={4.5} precision={0.5} size="small" readOnly sx={{ color: '#e59819', fontSize: '1rem' }} />
                        <Typography variant="caption" sx={{ color: '#6a6f73', ml: 0.5 }}>({Math.floor(Math.random() * 500) + 10})</Typography>
                      </Box>
                      <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem', color: '#2d2f31' }}>KES {res.price}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>

      {/* --- NEW: HOW IT WORKS (Modern Visual Cards) --- */}
      <Box sx={{ bgcolor: '#F7F9FA', py: 10 }}>
        <Container maxWidth="xl">
           <Box sx={{ textAlign: 'center', mb: 8 }}>
             <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#2d2f31' }}>
               Start learning in 3 easy steps
             </Typography>
             <Typography variant="h6" color="text.secondary" fontWeight={400}>
               Everything you need to excel in your exams is just a click away.
             </Typography>
           </Box>

           <Grid container spacing={4}>
              {/* Step 1 */}
              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: '#fff', p: 0, height: '100%', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                  <Box 
                    component="img"
                    src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Search Library"
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                       <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>1</Box>
                       <Typography variant="h5" fontWeight={700}>Search</Typography>
                    </Stack>
                    <Typography color="text.secondary">
                       Browse our huge library of notes, exams, and revision materials using the search bar or categories.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Step 2 */}
              {/* Step 2 */}
              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: '#fff', p: 0, height: '100%', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                  <Box 
                    component="img"
                    // NEW LINK: Person holding a smartphone (Mobile Money context)
                    src="https://images.unsplash.com/photo-1512314889357-e157c22f938d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="M-Pesa Payment"
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                       <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>2</Box>
                       <Typography variant="h5" fontWeight={700}>Pay Securely</Typography>
                    </Stack>
                    <Typography color="text.secondary">
                       Pay instantly via M-Pesa. Your funds are secure, and verification is automatic and instant.
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              {/* Step 3 */}
              <Grid item xs={12} md={4}>
                <Box sx={{ bgcolor: '#fff', p: 0, height: '100%', border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-5px)' } }}>
                  <Box 
                    component="img"
                    src="https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    alt="Start Learning"
                    sx={{ width: '100%', height: 200, objectFit: 'cover' }}
                  />
                  <Box sx={{ p: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                       <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>3</Box>
                       <Typography variant="h5" fontWeight={700}>Download & Learn</Typography>
                    </Stack>
                    <Typography color="text.secondary">
                       Get your file immediately after payment. View it on any device or print it out for revision.
                    </Typography>
                  </Box>
                </Box>
              </Grid>
           </Grid>

           <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button variant="outlined" size="large" component={RouterLink} to="/browse" sx={{ color: 'black', borderColor: 'black', fontWeight: 700, borderRadius: 0, px: 4 }}>
                Find Resources Now
              </Button>
           </Box>
        </Container>
      </Box>

      {/* --- VALUE PROPOSITION BANNER --- */}
      <Box sx={{ bgcolor: '#2d2f31', color: 'white', py: 8 }}>
         <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        Become an Instructor
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3, opacity: 0.9 }}>
                        Instructors from around the country teach thousands of students on EduHub. We provide the tools and skills to teach what you love.
                    </Typography>
                    <Button variant="contained" size="large" component={RouterLink} to="/seller" sx={{ bgcolor: 'white', color: '#2d2f31', borderRadius: 0, fontWeight: 700, px: 4, py: 1.5, '&:hover': { bgcolor: '#f0f0f0' } }}>
                        Start teaching today
                    </Button>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                     <Box sx={{ width: '100%', height: 300, bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2 }}>
                        <VideoCallIcon sx={{ fontSize: 100, opacity: 0.5 }} />
                     </Box>
                </Grid>
            </Grid>
         </Container>
      </Box>

      {/* --- TOP CONTRIBUTORS --- */}
      <Container maxWidth="xl" sx={{ py: 6, mb: 6 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#2d2f31' }}>Popular Teachers</Typography>
        <Grid container spacing={3}>
          {contributors.slice(0, 4).map((contributor: any, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card sx={{ height: '100%', boxShadow: 'none', border: '1px solid #d1d7dc', p: 2, '&:hover': { boxShadow: 2 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={contributor.profilePicPath} sx={{ width: 64, height: 64, mr: 2 }}>{contributor.name?.charAt(0)}</Avatar>
                      <Box>
                          <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem' }}>{contributor.name}</Typography>
                          <Typography variant="caption" color="text.secondary">Instructor</Typography>
                      </Box>
                  </Box>
                  <Typography variant="body2" sx={{ mb: 2, color: '#6a6f73' }}>
                      Specializes in {Array.isArray(contributor.subjects) ? contributor.subjects.join(', ') : 'Education'}.
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={700}>{contributor.resourceCount} Resources</Typography>
                      <RouterLink to={`/teacher/${contributor.id}`} style={{ textDecoration: 'none' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontWeight: 700 }}>Profile <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5 }} /></Box>
                      </RouterLink>
                  </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* --- FOOTER --- */}
      <Box sx={{ bgcolor: '#1c1d1f', color: '#fff', py: 6 }} component="footer">
        <Container maxWidth="xl">
          <Grid container spacing={4} sx={{ borderBottom: '1px solid #3e4143', pb: 4, mb: 4 }}>
             <Grid item xs={12} md={3}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'white' }}>EduHub</Typography>
             </Grid>
             <Grid item xs={6} md={3}>
                <Stack spacing={1}>
                    <Typography variant="body2" component={RouterLink} to="/seller" sx={{ color: '#d1d7dc', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Teach on EduHub</Typography>
                    <Typography variant="body2" component={RouterLink} to="/about" sx={{ color: '#d1d7dc', textDecoration: 'none', '&:hover': { color: '#fff' } }}>About us</Typography>
                </Stack>
             </Grid>
             <Grid item xs={6} md={3}>
                <Stack spacing={1}>
                    <Typography variant="body2" component={RouterLink} to="/contact" sx={{ color: '#d1d7dc', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Contact us</Typography>
                    <Typography variant="body2" component={RouterLink} to="/terms" sx={{ color: '#d1d7dc', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Terms</Typography>
                </Stack>
             </Grid>
          </Grid>
          <Typography variant="body2" color="grey.500">© {new Date().getFullYear()} EduHub, Inc.</Typography>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;