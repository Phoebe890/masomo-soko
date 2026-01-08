import React from 'react';
import { 
  Box, Container, Typography, Grid, Button, Card, CardContent 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/layout/Footer';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// --- DATA WITH CUSTOM SVGS ---
const CORE_VALUES = [
  { 
    title: "Quality First", 
    desc: "Every resource is vetted to ensure it meets the current curriculum standards.", 
    // SVG: Badge/Check
    svg: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 11L12 14L22 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) 
  },
  { 
    title: "Teacher Empowerment", 
    desc: "We provide a platform for educators to earn passive income from their expertise.", 
    // SVG: Trending Up Graph
    svg: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M23 6L13.5 15.5L8.5 10.5L1 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 6H23V12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) 
  },
  { 
    title: "Trust & Security", 
    desc: "Payments are processed securely via M-Pesa. Satisfaction guaranteed.", 
    // SVG: Shield/Lock
    svg: (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 22S5 18 5 12V6L12 3L19 6V12C19 18 12 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) 
  },
];

const About: React.FC = () => {
  return (
    // Added overflowX: hidden to prevent horizontal scrollbar on mobile
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
      
      {/* --- HERO SECTION --- */}
      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: { xs: 8, md: 10 }, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 700, letterSpacing: 2 }}>
            WHO WE ARE
          </Typography>
          {/* Responsive Font Size */}
          <Typography variant="h2" fontWeight={800} sx={{ mt: 2, mb: 3, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
            Empowering Kenya's Education
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.9, lineHeight: 1.6, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
            Masomo Soko is the bridge between brilliant teachers and ambitious students. 
            We make high-quality educational resources accessible to everyone.
          </Typography>
        </Container>
        {/* Background decorative circles */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: { xs: 200, md: 400 }, height: { xs: 200, md: 400 }, borderRadius: '50%', bgcolor: 'rgba(37, 99, 235, 0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: { xs: 150, md: 200 }, height: { xs: 150, md: 200 }, borderRadius: '50%', bgcolor: 'rgba(234, 88, 12, 0.1)' }} />
      </Box>

      {/* --- MISSION SECTION --- */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
        {/* Changed spacing to object syntax to reduce negative margin on mobile */}
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box 
              component="img" 
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              alt="Students learning"
              sx={{ width: '100%', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
              Our Mission
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', mb: 3, lineHeight: 1.8 }}>
              At Masomo Soko, we believe that geography shouldn't dictate the quality of education a student receives. 
              We realized that while there are excellent teachers in Nairobi, Mombasa, and Kisumu creating amazing revision materials, 
              students in other parts of the country often lack access to these resources.
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', mb: 4, lineHeight: 1.8 }}>
              We built this marketplace to democratize education. By allowing teachers to monetize their hard work, 
              we ensure a steady stream of high-quality exams, notes, and guides for students who are eager to excel.
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                 <Box sx={{ borderLeft: '4px solid #2563eb', pl: 2 }}>
                    <Typography variant="h4" fontWeight={700} color="primary" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>50k+</Typography>
                    <Typography variant="body2" color="text.secondary">Resources Downloaded</Typography>
                 </Box>
              </Grid>
              <Grid item xs={6}>
                 <Box sx={{ borderLeft: '4px solid #ea580c', pl: 2 }}>
                    <Typography variant="h4" fontWeight={700} color="#ea580c" sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>2,000+</Typography>
                    <Typography variant="body2" color="text.secondary">Active Teachers</Typography>
                 </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* --- VALUES SECTION --- */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>WHY CHOOSE US</Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mt: 1, fontSize: { xs: '2rem', md: '3rem' } }}>Core Values</Typography>
          </Box>
          
          <Grid container spacing={{ xs: 4, md: 4 }}>
            {CORE_VALUES.map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Box sx={{ 
                      width: 80, height: 80, borderRadius: '50%', bgcolor: '#2563eb', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
                      boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)' 
                    }}>
                      {/* Render the SVG here */}
                      {value.svg}
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom sx={{ color: '#0f172a' }}>{value.title}</Typography>
                    <Typography color="text.secondary">{value.desc}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* --- CTA SECTION --- */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 }, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#0f172a', fontSize: { xs: '2rem', md: '3rem' } }}>
          Ready to get started?
        </Typography>
        <Typography variant="h6" sx={{ color: '#475569', mb: 4, fontWeight: 400, fontSize: { xs: '1rem', md: '1.25rem' } }}>
          Join thousands of Kenyan students and teachers today.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            component={RouterLink} 
            to="/register?role=student" 
            variant="contained" 
            size="large" 
            sx={{ borderRadius: 50, px: 5, py: 1.5, fontSize: '1.1rem', fontWeight: 700, textTransform: 'none' }}
          >
            I'm a Student
          </Button>
          <Button 
            component={RouterLink} 
            to="/register?role=teacher" 
            variant="outlined" 
            size="large" 
            endIcon={<ArrowForwardIcon />}
            sx={{ borderRadius: 50, px: 5, py: 1.5, fontSize: '1.1rem', fontWeight: 700, textTransform: 'none', borderWidth: 2 }}
          >
            I'm a Teacher
          </Button>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default About;