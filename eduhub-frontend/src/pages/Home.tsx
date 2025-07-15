import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, useTheme, Grid, CircularProgress, Avatar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Link as RouterLink } from 'react-router-dom';

const Home: React.FC = () => {
  const theme = useTheme();
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/teacher/resources')
      .then(res => res.json())
      .then(data => {
        setResources(data.resources ? data.resources.slice(0, 6) : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
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
          bgcolor: 'white',
          color: 'text.primary',
          py: { xs: 8, md: 12 },
          minHeight: { xs: '60vh', md: '70vh' },
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '2.2rem', md: '3.2rem' },
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  mb: 2
                }}
              >
                Quality Revision Materials from Kenya's Top Teachers.
              </Typography>
              <Typography 
                variant="h5" 
                component="p"
                paragraph
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontSize: { xs: '1.1rem', md: '1.3rem' },
                  fontStyle: 'italic',
                  fontWeight: 400
                }}
              >
                Download thousands of exams, notes, and schemes of work. Prepare for KCPE and KCSE with resources you can trust.
              </Typography>
              <Box sx={{ width: '100%', maxWidth: 480, mb: 2 }}>
                <Box
                  component="form"
                  role="search"
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    alignItems: 'center',
                    mb: 2,
                  }}
                  onSubmit={e => { e.preventDefault(); window.location.href = `/browse?search=${encodeURIComponent((e.target as any).search.value)}`; }}
                >
                  <input
                    name="search"
                    type="text"
                    placeholder="Search for an exam, subject, or topic..."
                    aria-label="Search for an exam, subject, or topic"
                    style={{
                      flex: 1,
                      padding: '14px 16px',
                      fontSize: '1.1rem',
                      borderRadius: 8,
                      border: '1px solid #ccc',
                      outline: 'none',
                      marginBottom: 0,
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      borderRadius: 2,
                      fontWeight: 700,
                      minHeight: 48,
                      textTransform: 'none',
                      outline: 'none',
                      mt: { xs: 2, sm: 0 },
                    }}
                  >
                    Search
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, width: '100%' }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                      boxShadow: 3,
                      fontWeight: 700,
                      minHeight: 48,
                      textTransform: 'none',
                      outline: 'none',
                      width: { xs: '100%', sm: 'auto' },
                    }}
                    component={RouterLink}
                    to="/browse"
                    aria-label="Find resources as a student"
                  >
                    FIND RESOURCES
                </Button>
                <Button 
                  variant="outlined" 
                    color="primary"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    borderWidth: 2,
                      fontWeight: 700,
                      minHeight: 48,
                      textTransform: 'none',
                      outline: 'none',
                      width: { xs: '100%', sm: 'auto' },
                    '&:hover': {
                      borderWidth: 2
                    }
                  }}
                    component={RouterLink}
                    to="/seller"
                    aria-label="Become a seller or teacher"
                >
                    BECOME A SELLER
                </Button>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/images/hero-education.png"
                alt="Teachers and students learning together at EduHub"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  borderRadius: 4,
                  boxShadow: 6,
                  mx: 'auto',
                  my: { xs: 4, md: 0 },
                  objectFit: 'contain',
                  display: 'block'
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
          bgcolor: 'grey.100',
          color: 'text.primary',
          py: { xs: 4, md: 6 },
          mb: { xs: 4, md: 6 },
          borderBottom: '2px solid',
          borderColor: 'grey.200',
        }}
      >
        <Container maxWidth="lg">
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
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} component="section" aria-label="How EduHub works">
        <Typography 
          variant="h2"
          component="h2" 
          gutterBottom
          sx={{ fontWeight: 700, mb: 4, textAlign: 'center', letterSpacing: 1, fontSize: { xs: '2rem', md: '2.5rem' } }}
        >
          How It Works
        </Typography>
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, fontSize: 36 }}>
                <span role="img" aria-label="search">🔍</span>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>1. Search</Typography>
              <Typography variant="body1" color="text.secondary">Find the exact resource you need.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box sx={{ bgcolor: 'success.main', color: 'primary.contrastText', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, fontSize: 36 }}>
                <span role="img" aria-label="pay">💳</span>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>2. Pay</Typography>
              <Typography variant="body1" color="text.secondary">Securely pay with M-Pesa or Card.</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box sx={{ bgcolor: 'info.main', color: 'primary.contrastText', borderRadius: '50%', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, fontSize: 36 }}>
                <span role="img" aria-label="download">⬇️</span>
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>3. Download</Typography>
              <Typography variant="body1" color="text.secondary">Instantly access your file from your dashboard.</Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
      {/* Features Section */}
      {/* Featured / Popular Resources Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} component="section" aria-label="Featured or Popular Resources">
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
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 3, boxShadow: 3 }}>
                    <CardContent>
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
                    <Box sx={{ flexGrow: 1 }} />
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
      {/* Browse by Category Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }} component="section" aria-label="Browse by Category">
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
                  py: 4,
                  borderRadius: 3,
            fontWeight: 700,
                  fontSize: { xs: '1.1rem', md: '1.2rem' },
                  gap: 1,
                  boxShadow: 1,
                  minHeight: 120,
                  textTransform: 'none',
                  mb: 2,
                }}
                aria-label={`Browse ${cat.label}`}
              >
                <span style={{ fontSize: 36, marginBottom: 8 }}>{cat.icon}</span>
                {cat.label}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Container>
      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 10 } }} component="section" aria-label="EduHub features">
        <Container maxWidth="lg">
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
        <Container maxWidth="lg">
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
    </Box>
  );
}
export default Home; 
