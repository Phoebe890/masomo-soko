import React, { useEffect, useState } from 'react';
import { 
  Box, Container, Typography, Button, Card, CardContent, CardMedia, 
  useTheme, Grid, CircularProgress, Avatar, Divider, Chip, Stack, Rating 
} from '@mui/material';
// Icons
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import FunctionsIcon from '@mui/icons-material/Functions';
import ScienceIcon from '@mui/icons-material/Science';
import LanguageIcon from '@mui/icons-material/Language';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import VerifiedIcon from '@mui/icons-material/Verified';
// Router & Assets
import { Link as RouterLink } from 'react-router-dom';
import heroImage1 from '../assets/pexels-kampus-5940828.jpg';
import heroImage2 from '../assets/pexels-kampus-5940829.jpg';

// Helper for random gradient placeholders if no image exists
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

  // Hero slides data (Kept exactly as is)
  const heroSlides = [
    {
      image: heroImage1,
      title: 'Share Knowledge, Empower Learning',
      subtitle: 'Join thousands of teachers sharing quality educational resources',
      stats: [{ value: '50K+', label: 'Resources' }, { value: '10K+', label: 'Teachers' }, { value: '100K+', label: 'Students' }]
    },
    {
      image: heroImage2,
      title: 'Transform Education, One Resource at a Time',
      subtitle: 'Discover premium learning materials created by expert educators',
      stats: [{ value: '500+', label: 'Verified Teachers' }, { value: '5K+', label: 'Resources Available' }, { value: '95%', label: 'Satisfaction Rate' }]
    }
  ];

  // Logic (Kept exactly as is)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/teacher/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data.resources ? data.resources.slice(0, 8) : []); // Increased to 8 for better grid
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/teacher/top-contributors')
      .then(res => res.json())
      .then(data => setContributors(data));
  }, []);

  // Updated Categories to be cleaner
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

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', paddingBottom: 0 }}>
      
      {/* --- HERO SECTION (Kept mostly same, just slight z-index fixes) --- */}
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
              <Stack direction="row" spacing={2}>
                 <Button variant="contained" size="large" component={RouterLink} to="/browse" sx={{ bgcolor: 'white', color: 'black', fontWeight: 'bold', '&:hover': { bgcolor: '#f5f5f5' } }}>
                   Get Started
                 </Button>
              </Stack>
            </Box>
          ))}
        </Container>
      </Box>

      {/* --- TRUST BAR (Modernized) --- */}
      <Box sx={{ bgcolor: '#F7F9FA', borderBottom: '1px solid #d1d7dc', py: 4 }}>
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
            Trusted by students and teachers across Kenya
          </Typography>
          <Grid container justifyContent="center" alignItems="center" spacing={6} sx={{ opacity: 0.7 }}>
             <Grid item>
               <Typography variant="h6" fontWeight={700} color="grey.700">50K+ Resources</Typography>
             </Grid>
             <Grid item>
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                 <img src="/images/mpesa-logo.svg" alt="M-PESA" style={{ height: 28, marginRight: 8 }} />
                 <Typography variant="h6" fontWeight={700} color="grey.700">M-PESA Verified</Typography>
               </Box>
             </Grid>
             <Grid item>
               <Typography variant="h6" fontWeight={700} color="grey.700">Expert Content</Typography>
             </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- TOP CATEGORIES (Chip-style, compact & tappable) --- */}
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
                  sx={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    py: 1.2,
                    px: 1.5,
                    fontWeight: 700,
                    borderRadius: 1,
                    textTransform: 'none',
                    '& .MuiChip-icon': { color: 'primary.main' }
                  }}
                  aria-label={`Browse ${cat.label} resources`}
                />
              </Grid>
            ));
          })()}
        </Grid>
      </Container>

      {/* --- FEATURED RESOURCES (The "Udemy" Card Look) --- */}
      <Container maxWidth="xl" sx={{ py: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" component="h2" fontWeight={800} sx={{ color: '#2d2f31' }}>
            Featured Resources
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hand-picked resources to help you excel
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>
        ) : (
          <Grid container spacing={3}>
            {resources.length === 0 ? (
               <Typography sx={{ mx: 3 }}>No resources found.</Typography>
            ) : (
              resources.map((res: any, index: number) => (
                <Grid item xs={12} sm={6} md={3} key={res.id}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRadius: 0, // Udemy uses sharp or very slightly rounded corners
                      boxShadow: 'none',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      '&:hover .title': { textDecoration: 'underline' },
                      '&:hover': { '& img': { filter: 'brightness(0.9)' } }
                    }}
                    component={RouterLink}
                    to={`/resource/${res.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    {/* Placeholder Logic for Thumbnail */}
                    <Box sx={{ position: 'relative', pt: '56.25%', bgcolor: getRandomColor(index), mb: 1.5, border: '1px solid #d1d7dc' }}>
                       {/* If you have a real image, use <img src={res.thumbnail} /> styled absolutely here */}
                       <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                          <SchoolIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                       </Box>
                    </Box>

                    <CardContent sx={{ p: 0, pb: '0 !important' }}>
                      <Typography className="title" variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.4, mb: 0.5, color: '#2d2f31', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.8rem' }}>
                        {res.title}
                      </Typography>
                      
                      <Typography variant="body2" sx={{ color: '#6a6f73', fontSize: '0.8rem', mb: 0.5, display: 'block' }}>
                        {res.teacherName || 'Unknown Teacher'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#b4690e', mr: 0.5, fontSize: '0.9rem' }}>
                          {res.rating ? res.rating.toFixed(1) : '4.5'}
                        </Typography>
                        <Rating value={res.rating || 4.5} precision={0.5} size="small" readOnly sx={{ color: '#e59819', fontSize: '1rem' }} />
                        <Typography variant="caption" sx={{ color: '#6a6f73', ml: 0.5 }}>
                          ({Math.floor(Math.random() * 500) + 10})
                        </Typography>
                      </Box>

                      <Typography variant="h6" fontWeight={800} sx={{ fontSize: '1.1rem', color: '#2d2f31' }}>
                        KES {res.price}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" color="primary" size="large" component={RouterLink} to="/browse" sx={{ fontWeight: 'bold', borderRadius: 0, textTransform: 'none', borderColor: 'black', color: 'black' }}>
                View all resources
            </Button>
        </Box>
      </Container>

      {/* --- VALUE PROPOSITION BANNER (Gray Background) --- */}
      <Box sx={{ bgcolor: '#F7F9FA', py: 8, mt: 4 }}>
         <Container maxWidth="xl">
            <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#2d2f31' }}>
                        Teaching on EduHub
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', mb: 3, color: '#2d2f31' }}>
                        Instructors from around the country teach thousands of students on EduHub. We provide the tools and skills to teach what you love.
                    </Typography>
                    <Button variant="contained" size="large" component={RouterLink} to="/seller" sx={{ bgcolor: '#2d2f31', borderRadius: 0, fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, '&:hover': { bgcolor: '#000' } }}>
                        Start teaching today
                    </Button>
                </Grid>
                <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                     {/* Abstract Illustration Placeholder */}
                     <Box sx={{ width: '80%', pt: '60%', bgcolor: 'white', border: '1px solid #d1d7dc', position: 'relative', boxShadow: 3 }}>
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'primary.main' }}>
                            <VideoCallIcon sx={{ fontSize: 80, mb: 2 }} />
                            <Typography variant="h6" color="text.secondary">Instructor Dashboard Preview</Typography>
                        </Box>
                     </Box>
                </Grid>
            </Grid>
         </Container>
      </Box>

      {/* --- HOW IT WORKS (Simplified) --- */}
      <Container maxWidth="xl" sx={{ py: 8 }}>
         <Typography variant="h4" fontWeight={800} align="center" gutterBottom>How to get started</Typography>
         <Grid container spacing={4} sx={{ mt: 2 }}>
            {[
                { icon: <SearchIcon />, title: "1. Search", desc: "Browse our huge library of resources" },
                { icon: <PaymentIcon />, title: "2. Pay Securely", desc: "Easy payment via M-PESA or Card" },
                { icon: <DownloadIcon />, title: "3. Learn", desc: "Download instantly and start learning" }
            ].map((step, i) => (
                <Grid item xs={12} md={4} key={i}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3 }}>
                         <Avatar sx={{ width: 60, height: 60, bgcolor: 'primary.light', color: 'primary.main', mb: 2 }}>
                             {step.icon}
                         </Avatar>
                         <Typography variant="h6" fontWeight={700}>{step.title}</Typography>
                         <Typography variant="body1" color="text.secondary">{step.desc}</Typography>
                    </Box>
                </Grid>
            ))}
         </Grid>
      </Container>

      {/* --- TOP CONTRIBUTORS (Instructor Profiles) --- */}
      <Container maxWidth="xl" sx={{ py: 6, mb: 6 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#2d2f31' }}>
            Popular Teachers
        </Typography>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {contributors.length === 0 ? (
             <Typography sx={{ mx: 3 }}>Loading contributors...</Typography>
          ) : (
            contributors.slice(0, 4).map((contributor: any, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ height: '100%', boxShadow: 'none', border: '1px solid #d1d7dc', display: 'flex', flexDirection: 'column', p: 2, '&:hover': { boxShadow: 2 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar 
                            src={contributor.profilePicPath} 
                            sx={{ width: 64, height: 64, mr: 2, border: '1px solid #eee' }}
                        >
                            {contributor.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', lineHeight: 1.2 }}>{contributor.name}</Typography>
                            <Typography variant="caption" color="text.secondary">Senior Instructor</Typography>
                        </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: '#6a6f73', flexGrow: 1 }}>
                        Specializes in {Array.isArray(contributor.subjects) ? contributor.subjects.join(', ') : 'Various Subjects'}.
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" fontWeight={700}>{contributor.resourceCount} Resources</Typography>
                        <RouterLink to={`/teacher/${contributor.id}`} style={{ textDecoration: 'none' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main', fontWeight: 700, fontSize: '0.9rem' }}>
                                Profile <ArrowForwardIcon sx={{ fontSize: 16, ml: 0.5 }} />
                            </Box>
                        </RouterLink>
                    </Box>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Container>

      {/* --- FOOTER (Dark Theme) --- */}
      <Box sx={{ bgcolor: '#1c1d1f', color: '#fff', py: 6, mt: 'auto' }} component="footer">
        <Container maxWidth="xl">
          <Grid container spacing={4} sx={{ borderBottom: '1px solid #3e4143', pb: 4, mb: 4 }}>
             <Grid item xs={12} md={3}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'white' }}>EduHub</Typography>
             </Grid>
             <Grid item xs={6} md={3}>
                <Stack spacing={1}>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Teach on EduHub</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Get the app</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>About us</Typography>
                </Stack>
             </Grid>
             <Grid item xs={6} md={3}>
                <Stack spacing={1}>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Contact us</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Terms</Typography>
                    <Typography variant="body2" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Privacy policy</Typography>
                </Stack>
             </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
             <Typography variant="body2" color="grey.500">© {new Date().getFullYear()} EduHub, Inc.</Typography>
          </Box>
        </Container>
      </Box>
      
      {/* Import Icons needed for the new map loops */}
      <Box sx={{ display: 'none' }}>
        <SearchIcon /> <PaymentIcon /> <DownloadIcon />
      </Box>
    </Box>
  );
}

// Quick icon imports for the "How it works" section loop above
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import DownloadIcon from '@mui/icons-material/Download';

export default Home;