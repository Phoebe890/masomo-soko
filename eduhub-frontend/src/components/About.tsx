import React from 'react';
import { 
  Box, Container, Typography, Grid, Button, Avatar, IconButton, Stack, Chip
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/layout/Footer';

// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import TerminalIcon from '@mui/icons-material/Terminal';

// --- IMAGE IMPORTS ---
import founderImg from '../assets/founder.jpeg';
import cofounderImg from '../assets/cofounder.jpeg';

const CORE_VALUES = [
  { 
    title: "Quality First", 
    desc: "Every resource is vetted to ensure it meets the current curriculum standards.", 
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
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
      
      {/* --- HERO SECTION --- */}
      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: { xs: 8, md: 10 }, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 700, letterSpacing: 2 }}>
            WHO WE ARE
          </Typography>
          <Typography variant="h2" fontWeight={800} sx={{ mt: 2, mb: 3, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
            Empowering Kenya's Education
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.9, lineHeight: 1.6, fontWeight: 400, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
            Masomo Soko is the bridge between brilliant teachers and ambitious students. 
            We make high-quality educational resources accessible to everyone.
          </Typography>
        </Container>
      </Box>

      {/* --- MISSION SECTION --- */}
      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 10 } }}>
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
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
            <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 800, letterSpacing: 1.5 }}>
              WHY CHOOSE US
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mt: 1, fontSize: { xs: '2rem', md: '3rem' } }}>
              Core Values
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {CORE_VALUES.map((value, index) => {
              const iconColors = ['#2563eb', '#ea580c', '#49aa47'];
              return (
                <Grid item xs={12} md={4} key={index}>
                  <Box sx={{ 
                    bgcolor: 'white', height: '100%', borderRadius: 4, textAlign: 'center', p: 4,
                    transition: '0.3s', '&:hover': { transform: 'translateY(-10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)' }
                  }}>
                    <Box sx={{ 
                      width: 80, height: 80, borderRadius: '24px', bgcolor: iconColors[index], 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
                      boxShadow: `0 10px 20px ${iconColors[index]}44`
                    }}>
                      {value.svg}
                    </Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: '#0f172a' }}>{value.title}</Typography>
                    <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.7 }}>{value.desc}</Typography>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>

      {/* --- MEET THE TEAM SECTION (UNIQUE FLOATING DESIGN) --- */}
      <Box sx={{ py: { xs: 10, md: 15 }, position: 'relative' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 12 }}>
            <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 900, letterSpacing: 3 }}>
              MEET THE TEAM
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mt: 1 }}>
              The Minds Behind Masomo Soko
            </Typography>
          </Box>

          <Grid container spacing={10} justifyContent="center">
            {/* POLYCARP - THE VISIONARY */}
            <Grid item xs={12} md={5}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
                  {/* Decorative Blob */}
                  <Box sx={{ 
                    position: 'absolute', top: 10, left: 10, width: '100%', height: '100%', 
                    bgcolor: '#eff6ff', borderRadius: '40% 60% 70% 30% / 40% 50% 60% 70%', zIndex: -1 
                  }} />
                  <Avatar 
                    src={founderImg} 
                    imgProps={{ style: { objectPosition: 'top' } }}
                    sx={{ width: 220, height: 220, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }} 
                  />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>Polycarp Muriithi</Typography>
                <Typography variant="h6" sx={{ color: '#ea580c', fontWeight: 700, mb: 2 }}>Co-Founder & Visionary</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 400, mx: 'auto', mb: 3 }}>
                  The visionary educational strategist behind the Masomo Soko concept. Polycarp identified a critical gap in the market: 
                  the need for a sustainable ecosystem where Kenyan educators are fairly rewarded for their expertise. 
                  He is dedicated to transforming teaching into a digital career by empowering teachers to monetize high-quality revision resources.
                </Typography>
                <IconButton sx={{ color: '#0077b5', bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#0077b5', color: 'white' } }} component="a" href="https://www.linkedin.com/in/polycarp-muriithi-36940026a/" target="_blank">
                  <LinkedInIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* PHOEBE - THE DEVELOPER */}
            <Grid item xs={12} md={5}>
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
                  {/* Decorative Blob */}
                  <Box sx={{ 
                    position: 'absolute', top: 10, right: 10, width: '100%', height: '100%', 
                    bgcolor: 'rgba(234, 88, 12, 0.05)', borderRadius: '70% 30% 30% 70% / 60% 40% 60% 40%', zIndex: -1 
                  }} />
                  <Avatar 
                    src={cofounderImg} 
                    imgProps={{ style: { objectPosition: 'top' } }}
                    sx={{ width: 220, height: 220, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }} 
                  />
                </Box>
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a' }}>Phoebe Rael</Typography>
                <Typography variant="h6" sx={{ color: '#ea580c', fontWeight: 700, mb: 1 }}>Lead Developer</Typography>
                
                

                <Typography sx={{ color: '#64748b', fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 400, mx: 'auto', mb: 3 }}>
                  The technical architect driving the platform's innovation.Builds secure and scalable systems that bridge the gap between brilliant teachers and eager students.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <IconButton sx={{ color: '#0077b5', bgcolor: '#f0f9ff', '&:hover': { bgcolor: '#0077b5', color: 'white' } }} component="a" href="https://www.linkedin.com/in/phoebe-rael-a58a6724a/" target="_blank">
                    <LinkedInIcon />
                  </IconButton>
                  <IconButton sx={{ color: '#1e293b', bgcolor: '#f1f5f9', '&:hover': { bgcolor: '#1e293b', color: 'white' } }} component="a" href="https://github.com/Phoebe890" target="_blank">
                    <GitHubIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- CTA SECTION --- */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 10, md: 15 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#0f172a', fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
            Ready to get started?
          </Typography>
          <Typography variant="h6" sx={{ color: '#475569', mb: 5, fontWeight: 400 }}>
            Join thousands of Kenyan students and teachers today.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            <Button component={RouterLink} to="/register?role=student" variant="contained" size="large" sx={{ borderRadius: 50, px: 6, py: 2, fontWeight: 700 }}>
              I'm a Student
            </Button>
            <Button component={RouterLink} to="/register?role=teacher" variant="outlined" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 50, px: 6, py: 2, fontWeight: 700, borderWidth: 2 }}>
              I'm a Teacher
            </Button>
          </Stack>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default About;