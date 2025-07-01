import React from 'react';
import { Box, Container, Typography, Button, Card, CardContent, useTheme, Grid } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const Home: React.FC = () => {
  const theme = useTheme();

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
        sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Transform Your Learning Journey
              </Typography>
              <Typography 
                variant="h5" 
                paragraph
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}
              >
                Join EduHub to access premium educational content and personalized coaching sessions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary" 
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/hero-image.png"
                alt="Education"
                sx={{
                  width: '100%',
                  maxWidth: 500,
                  height: 'auto',
                  display: { xs: 'none', md: 'block' },
                  animation: 'float 6s ease-in-out infinite',
                  '@keyframes float': {
                    '0%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                    '100%': { transform: 'translateY(0px)' }
                  }
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography 
          variant="h3" 
          component="h2" 
          align="center" 
          gutterBottom
          sx={{
            fontWeight: 700,
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' }
          }}
        >
          Why Choose EduHub?
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)'
                  },
                  borderRadius: 2,
                  boxShadow: 3
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box sx={{ color: feature.color, mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

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
};

export default Home; 