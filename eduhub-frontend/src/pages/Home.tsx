import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, useTheme, Grid, CircularProgress, Avatar, Divider } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    fetch('/api/teacher/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data.resources ? data.resources.slice(0, 6) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch top contributors
    fetch('/api/teacher/top-contributors')
      .then(res => res.json())
      .then(data => setContributors(data));
  }, []);

  const features = [
    {
      icon: <SchoolIcon sx={{ fontSize: 40 }} />,
      title: 'Quality Content',
      description: 'Access high-quality educational resources from expert teachers',
      color: theme.palette.primary.main
    },
    {
      icon: <VideoCallIcon sx={{ fontSize: 40 }} />,
      title: 'Live Coaching',
      description: 'Get personalized coaching sessions with experienced educators',
      color: theme.palette.secondary.main
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
      title: 'Flexible Learning',
      description: 'Learn at your own pace with our flexible learning platform',
      color: theme.palette.success.main
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box
        component="section"
        aria-label="Hero section"
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          bgcolor: 'transparent',
          color: 'white',
          minHeight: { xs: '60vh', md: '70vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 10, md: 16 },
          overflow: 'hidden',
        }}
      >
        {/* Animated Gradient Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(120deg, #2563eb 60%, #38b2ac 100%)',
            opacity: 0.96,
            zIndex: 1,
            animation: 'gradientMove 8s ease-in-out infinite alternate',
            '@keyframes gradientMove': {
              '0%': { backgroundPosition: '0% 50%' },
              '100%': { backgroundPosition: '100% 50%' },
            },
          }}
        />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  mb: 2,
                  color: 'white',
                  textShadow: '0 4px 24px rgba(0,0,0,0.18)',
                }}
              >
                Share Knowledge, Empower Learning
              </Typography>
              <Typography
                variant="h5"
                component="p"
                paragraph
                sx={{
                  mb: 4,
                  opacity: 0.97,
                  fontSize: { xs: '1.2rem', md: '1.4rem' },
                  fontWeight: 400,
                  color: 'white',
                  textShadow: '0 2px 8px rgba(0,0,0,0.10)',
                }}
              >
                Join thousands of teachers sharing quality educational resources
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ fontWeight: 800, px: 5, borderRadius: 2, fontSize: '1.15rem', minHeight: 52, boxShadow: 4, transition: 'all 0.2s', '&:hover': { boxShadow: 8, transform: 'scale(1.04)' } }}
                  component={RouterLink}
                  to="/browse"
                >
                  Find Resources
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="large"
                  sx={{ fontWeight: 800, px: 5, borderRadius: 2, fontSize: '1.15rem', minHeight: 52, boxShadow: 4, transition: 'all 0.2s', '&:hover': { boxShadow: 8, transform: 'scale(1.04)' } }}
                  component={RouterLink}
                  to="/seller"
                >
                  Start Teaching
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  sx={{ fontWeight: 700, px: 4, borderRadius: 2, fontSize: '1.05rem', minHeight: 44, borderWidth: 2, borderColor: 'primary.main', textTransform: 'none' }}
                  component={RouterLink}
                  to="/register?role=teacher"
                >
                  Sign Up as a Teacher
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  sx={{ fontWeight: 700, px: 4, borderRadius: 2, fontSize: '1.05rem', minHeight: 44, borderWidth: 2, borderColor: 'secondary.main', textTransform: 'none' }}
                  component={RouterLink}
                  to="/register?role=student"
                >
                  Sign Up as a Student
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 4, mt: 2 }}>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="white">50K+</Typography>
                  <Typography variant="body2" color="white">Resources</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="white">10K+</Typography>
                  <Typography variant="body2" color="white">Teachers</Typography>
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} color="white">100K+</Typography>
                  <Typography variant="body2" color="white">Students</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                component="img"
                src="/images/hero-education.png"
                alt="Teachers and students learning together at EduHub"
                sx={{
                  width: '100%',
                  maxWidth: 440,
                  height: 'auto',
                  borderRadius: 6,
                  boxShadow: 8,
                  objectFit: 'cover',
                  display: 'block',
                  zIndex: 2,
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Trust Bar */}
      <Box
        component="section"
        aria-label="Trust and Credibility"
        sx={{
          width: '100vw',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          position: 'relative',
          bgcolor: 'grey.100',
          color: 'text.primary',
          py: { xs: 4, md: 6 },
          mb: { xs: 4, md: 6 },
          borderBottom: '2px solid',
          borderColor: 'grey.200',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                Over 5,000 Resources Available
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                500+ Verified Teachers
              </Typography>
            </Grid>
            <Grid item xs={12} md={4} sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <img
                  src="/images/mpesa-logo.png"
                  alt="M-Pesa Logo"
                  style={{ height: 36, marginRight: 8 }}
                  onError={e => { (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/commons/4/4e/M-PESA_LOGO-01.png'; }}
                />
                <Typography variant="h5" fontWeight={600} component="span">
                  Secure Payments via M-PESA
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* How It Works Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }} component="section" aria-label="How EduHub works">
        <Typography 
          variant="h2"
          component="h2" 
          gutterBottom
          sx={{ fontWeight: 700, mb: 4, textAlign: 'center', letterSpacing: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          How It Works
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          {[1,2,3].map((step, idx) => (
            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }} key={step}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 4 }, mb: { xs: 2, md: 4 } }}>
                <Box sx={{ bgcolor: ['primary.main','success.main','info.main'][idx], color: 'primary.contrastText', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, fontSize: 36, boxShadow: 2, position: 'relative' }}>
                  <Box sx={{ position: 'absolute', top: -10, left: -10, bgcolor: 'white', color: ['primary.main','success.main','info.main'][idx], borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, boxShadow: 1, border: '2px solid #f0f0f0' }}>{step}</Box>
                  {['🔍','💳','⬇️'][idx]}
                </Box>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{['1. Search','2. Pay','3. Download'][idx]}</Typography>
                <Typography variant="body1" color="text.secondary">{['Find the exact resource you need.','Securely pay with M-Pesa or Card.','Instantly access your file from your dashboard.'][idx]}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Features Section */}
      {/* Featured / Popular Resources Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }} component="section" aria-label="Featured or Popular Resources">
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center', fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Featured Resources
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
            <CircularProgress aria-label="Loading featured resources" />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {resources.length === 0 ? (
              <Grid item xs={12}>
                <Typography color="text.secondary" sx={{ m: 2 }}>
                  No resources found.
                </Typography>
              </Grid>
            ) : (
              resources.map((res: any) => (
                <Grid item xs={12} sm={6} md={4} key={res.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 0, boxShadow: 0, border: '1px solid #eee', background: '#fafbfc', transition: 'all 0.18s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px) scale(1.01)' } }}>
                    <CardContent sx={{ pb: 1 }}>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>{res.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        By {res.teacherName || 'Unknown Teacher'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} style={{ color: i < Math.round(res.rating || 0) ? '#FFD700' : '#ccc', fontSize: 18 }} aria-label={i < Math.round(res.rating || 0) ? 'star' : 'star-outline'}>★</span>
                        ))}
                        <Typography variant="caption" sx={{ ml: 1 }}>{(res.rating || 0).toFixed(1)}</Typography>
                      </Box>
                      <Typography variant="body1" fontWeight={700} color="primary">
                        KES {res.price}
                      </Typography>
                    </CardContent>
                    <Divider sx={{ my: 1, opacity: 0.2 }} />
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ m: 2 }}
                      component={RouterLink}
                      to={`/resource/${res.id}`}
                      aria-label={`View details for ${res.title}`}
                    >
                      View Details
                    </Button>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Container>
      {/* Top Contributors Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 }, background: 'linear-gradient(120deg, #f8fafc 60%, #e0f7fa 100%)', borderRadius: 4, mt: 8 }}>
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center', fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Top Contributors
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {contributors.length === 0 ? (
            <Grid item xs={12}>
              <Typography color="text.secondary" sx={{ m: 2, textAlign: 'center' }}>
                No contributors found.
              </Typography>
            </Grid>
          ) : (
            contributors.map((contributor, idx) => (
              <Grid item xs={12} sm={6} md={3} key={contributor.name}>
                <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 1, border: '1px solid #e0e0e0', background: '#fff', p: { xs: 2, md: 3 }, textAlign: 'center', height: '100%', position: 'relative', transition: 'all 0.18s', '&:hover': { boxShadow: 4, transform: 'translateY(-2px) scale(1.01)' } }}>
                  <Avatar src={contributor.profilePicPath || undefined} sx={{ width: 64, height: 64, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 32, boxShadow: 2, border: '2px solid #fff' }}>
                    {contributor.name?.split(' ').map((n: string) => n[0]).join('')}
                  </Avatar>
                  <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'primary.main', color: 'white', px: 1.5, py: 0.5, borderRadius: 2, fontSize: 12, fontWeight: 700, boxShadow: 1 }}>
                    TOP
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontSize: { xs: '1.1rem', md: '1.2rem' } }}>{contributor.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{Array.isArray(contributor.subjects) ? contributor.subjects.join(', ') : contributor.subjects}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>{contributor.resourceCount} Resources</Typography>
                </Box>
              </Grid>
            ))
          )}
        </Grid>
      </Container>
      {/* Browse by Category Section */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }} component="section" aria-label="Browse by Category">
        <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center', fontSize: { xs: '2rem', md: '2.5rem' } }}>
          Browse by Category
        </Typography>
        <Grid container spacing={3} justifyContent="center">
          {[
            { label: 'KCSE Revision', icon: '📚', filter: 'kcse' },
            { label: 'KCPE Mocks', icon: '📝', filter: 'kcpe' },
            { label: 'Junior Secondary', icon: '🔬', filter: 'junior' },
            { label: 'Form 1', icon: '1️⃣', filter: 'Form 1' },
            { label: 'Form 2', icon: '2️⃣', filter: 'Form 2' },
            { label: 'Mathematics', icon: '➗', filter: 'Math' },
            { label: 'English', icon: '🔤', filter: 'English' },
            { label: 'Science', icon: '🧪', filter: 'Science' },
            { label: 'Kiswahili', icon: '🇰🇪', filter: 'Kiswahili' },
          ].map((cat) => (
            <Grid item xs={6} sm={4} md={3} key={cat.label}>
              <Button
                variant="outlined"
                color="primary"
                size="large"
                fullWidth
                component={RouterLink}
                to={`/browse?category=${encodeURIComponent(cat.filter)}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: { xs: 2, md: 4 },
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  gap: 1,
                  boxShadow: 1,
                  minHeight: { xs: 80, md: 120 },
                  textTransform: 'none',
                  mb: 2,
                }}
                aria-label={`Browse ${cat.label}`}
              >
                <span style={{ fontSize: 32, marginBottom: 8 }}>{cat.icon}</span>
                {cat.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }} component="section" aria-label="EduHub features">
        <Container maxWidth="xl">
          <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 700, mb: 4, textAlign: 'center', fontSize: { xs: '2rem', md: '2.5rem' } }}>
            Why EduHub?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
                <Box sx={{ textAlign: 'center', p: { xs: 2, md: 4 }, bgcolor: 'white', borderRadius: 3, boxShadow: 3, mb: { xs: 2, md: 0 }, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>{feature.title}</Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>{feature.description}</Typography>
                </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
      </Box>
      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="xl">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                  10K+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Active Students
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                  500+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Expert Teachers
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                  1000+
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Courses
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                  95%
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Satisfaction Rate
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      {/* Footer Section */}
      <Box sx={{ bgcolor: 'grey.900', color: 'grey.100', mt: 8, pt: 6, pb: 3 }} component="footer">
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>About Us</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Our Story</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Team</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Careers</Typography>
              <Typography variant="body2">Press</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Resources</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Browse All</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>New Releases</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Most Popular</Typography>
              <Typography variant="body2">Categories</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>For Teachers</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Upload Resources</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Teaching Tips</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Community</Typography>
              <Typography variant="body2">Support</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Support</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Help Center</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Contact Us</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>Terms of Service</Typography>
              <Typography variant="body2">Privacy Policy</Typography>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, color: 'grey.500', fontSize: '0.95rem' }}>
            © {new Date().getFullYear()} EduHub. All rights reserved.
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
export default Home; 
