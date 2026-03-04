import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Grid, Button, Avatar, IconButton, Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/layout/Footer';
import { api } from '@/api/axios';
// Icons
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PublicIcon from '@mui/icons-material/Public';
import PsychologyIcon from '@mui/icons-material/Psychology';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// --- IMAGE IMPORTS ---
import founderImg from '../assets/founder.jpeg';
import cofounderImg from '../assets/cofounder.jpeg';

const CORE_VALUES = [
  { 
    title: 'Quality First', 
    desc: 'Every resource is reviewed to ensure it meets CBC and KCSE curriculum standards. We prioritize accuracy and relevance in every document shared.',
    icon: <VerifiedUserIcon sx={{ fontSize: 40, color: '#fff' }} />,
  },
  { 
    title: 'Accessibility', 
    desc: 'We believe premium education materials should be available to every student in Kenya, regardless of their location or background.',
    icon: <PublicIcon sx={{ fontSize: 40, color: '#fff' }} />,
  },
  { 
    title: 'Teacher Empowerment', 
    desc: 'We provide teachers with the tools to monetize their expertise and earn a dignified income from their intellectual property.',
    icon: <PsychologyIcon sx={{ fontSize: 40, color: '#fff' }} />,
  },
  { 
    title: 'Continuous Growth', 
    desc: 'Our platform evolves alongside the curriculum to provide the most up-to-date revision guides and learning aids available.',
    icon: <TrendingUpIcon sx={{ fontSize: 40, color: '#fff' }} />,
  }
];

const About: React.FC = () => {
  const [stats, setStats] = useState({ totalResources: 0, totalTeachers: 0, totalUsers: 0 });

  useEffect(() => {
    api.get('/api/public/stats')
      .then(res => {
        setStats({
          totalResources: res.data.totalResources || 0,
          totalTeachers: res.data.totalTeachers || 0,
          totalUsers: res.data.totalUsers || 0
        });
      })
      .catch(err => console.error("Error fetching stats", err));
  }, []);

  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh', overflowX: 'hidden', width: '100%' }}>
      
      {/* --- HERO SECTION --- */}
      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: { xs: 8, md: 12 }, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 800, letterSpacing: 2 }}>
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
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box 
              component="img" 
              src="https://images.unsplash.com/photo-1588702547919-26089e690ecc?w=600&auto=format&fit=crop&q=60"
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
              We realized that while there are excellent teachers across Kenya creating amazing materials, 
              students in remote areas often lack access to these resources.
            </Typography>
            <Typography variant="body1" sx={{ color: '#475569', fontSize: '1.1rem', mb: 4, lineHeight: 1.8 }}>
              We built this marketplace to democratize education. By allowing teachers to monetize their hard work, 
              we ensure a steady stream of high-quality exams, notes, and guides for students.
            </Typography>
            
            <Grid container spacing={2}>
        <Grid item xs={6}>
           <Box sx={{ borderLeft: '4px solid #2563eb', pl: 2 }}>
              <Typography variant="h4" fontWeight={700} color="#2563eb">
                {stats.totalResources}+
              </Typography>
              <Typography variant="body2" color="text.secondary">Resources Available</Typography>
           </Box>
        </Grid>
        <Grid item xs={6}>
           <Box sx={{ borderLeft: '4px solid #ea580c', pl: 2 }}>
              <Typography variant="h4" fontWeight={700} color="#ea580c">
                {stats.totalTeachers}+
              </Typography>
              <Typography variant="body2" color="text.secondary">Verified Teachers</Typography>
           </Box>
        </Grid>
      </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* --- BRANDED VALUES SECTION --- */}
      <Box sx={{ bgcolor: '#ffffff', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.8rem' }}>
              WHY CHOOSE US
            </Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mt: 1, mb: 2 }}>
              Our Values
            </Typography>
            <Box sx={{ width: 60, height: 4, bgcolor: '#ea580c', mx: 'auto', borderRadius: 2 }} />
          </Box>

          <Stack spacing={4}>
            {CORE_VALUES.map((value, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  bgcolor: '#f1f5f9', 
                  borderRadius: { xs: '40px', md: '100px 40px 40px 100px' },
                  p: { xs: 2, md: 2.5 },
                  pr: { md: 4 },
                  transition: 'transform 0.3s ease',
                  '&:hover': { transform: 'scale(1.02)' }
                }}
              >
                <Box sx={{ 
                  minWidth: { xs: 70, md: 100 }, 
                  height: { xs: 70, md: 100 }, 
                  bgcolor: '#ea580c', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mr: { xs: 2, md: 3 },
                  ml: { md: 1 }
                }}>
                  {value.icon}
                </Box>
                <Box sx={{ bgcolor: '#ffffff', borderRadius: { xs: '30px', md: '40px' }, p: { xs: 3, md: 4 }, flex: 1 }}>
                  <Typography variant="h5" fontWeight={800} sx={{ color: '#1e293b', mb: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                    {value.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#64748b', lineHeight: 1.6, fontSize: { xs: '0.9rem', md: '1rem' } }}>
                    {value.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* --- MEET THE TEAM SECTION --- */}
      <Box sx={{ pt: { xs: 10, md: 12 }, pb: { xs: 15, md: 20 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          {/* mb: 28 ensures the text is well away from the floating avatars (top -100px) */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: { xs: 20, md: 28 } }}>
            <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 800, letterSpacing: 1.5, fontSize: '0.8rem' }}>
              MEET THE TEAM
            </Typography>
            <Typography variant="h2" sx={{ color: '#0f172a', fontWeight: 800, fontSize: { xs: '2.5rem', md: '3.5rem' }, mt: 1 }}>
              The Minds Behind Masomo Soko
            </Typography>
          </Box>

          <Grid container spacing={15} justifyContent="center" alignItems="stretch">
            {/* POLYCARP */}
            <Grid item xs={12} md={5.5} sx={{ display: 'flex' }}>
              <Box sx={{ 
                display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', 
                bgcolor: '#f4f4f4', textAlign: 'center', pt: 15, pb: 6, px: 4, borderRadius: 4 
              }}>
                <Avatar 
                  src={founderImg} 
                  imgProps={{ style: { objectPosition: 'center 5%' } }} // Focuses on the top of the photo to avoid cutting heads
                  sx={{ width: 200, height: 200, position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
                />
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>Polycarp Muriithi</Typography>
                <Typography variant="h6" sx={{ color: '#ea580c', fontWeight: 700, mb: 3 }}>Co-Founder & Visionary</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, mb: 4, flexGrow: 1 }}>
                  The visionary educational strategist behind the Masomo Soko concept. Polycarp identified a critical gap: 
                  the need for a sustainable ecosystem where Kenyan educators are fairly rewarded for their expertise.
                </Typography>
                <Box>
                  <IconButton sx={{ color: '#0077b5', bgcolor: '#fff', '&:hover': { bgcolor: '#0077b5', color: 'white' } }} component="a" href="https://www.linkedin.com/in/polycarp-muriithi-36940026a/" target="_blank">
                    <LinkedInIcon />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

            {/* PHOEBE */}
            <Grid item xs={12} md={5.5} sx={{ display: 'flex' }}>
              <Box sx={{ 
                display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', 
                bgcolor: '#f4f4f4', textAlign: 'center', pt: 15, pb: 6, px: 4, borderRadius: 4 
              }}>
                <Avatar 
                  src={cofounderImg} 
                  imgProps={{ style: { objectPosition: 'center 5%' } }} // Focuses on the top of the photo
                  sx={{ width: 200, height: 200, position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
                />
                <Typography variant="h4" fontWeight={800} sx={{ color: '#0f172a', mb: 1 }}>Phoebe Rael</Typography>
                <Typography variant="h6" sx={{ color: '#ea580c', fontWeight: 700, mb: 3 }}>Lead Developer</Typography>
                <Typography sx={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.6, mb: 4, flexGrow: 1 }}>
                  The technical architect driving the platform's innovation. Builds secure and scalable systems that bridge the gap between brilliant teachers and eager students across the country.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <IconButton sx={{ color: '#0077b5', bgcolor: '#fff', '&:hover': { bgcolor: '#0077b5', color: 'white' } }} component="a" href="https://www.linkedin.com/in/phoebe-rael-a58a6724a/" target="_blank">
                    <LinkedInIcon />
                  </IconButton>
                  <IconButton sx={{ color: '#1e293b', bgcolor: '#fff', '&:hover': { bgcolor: '#1e293b', color: 'white' } }} component="a" href="https://github.com/Phoebe890" target="_blank">
                    <GitHubIcon />
                  </IconButton>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* --- CTA SECTION --- */}
      <Box sx={{ bgcolor: '#f8fafc', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#0f172a', fontSize: { xs: '2.2rem', md: '3rem' } }}>
            Ready to get started?
          </Typography>
          <Typography variant="h6" sx={{ color: '#475569', mb: 5, fontWeight: 400 }}>
            Join thousands of Kenyan students and teachers today.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {/* Rectangular Buttons (borderRadius: 1) */}
            <Button component={RouterLink} to="/register?role=student" variant="contained" size="large" sx={{ borderRadius: 1, px: 6, py: 2, fontWeight: 700, bgcolor: '#2563eb' }}>
              I'm a Student
            </Button>
            <Button component={RouterLink} to="/register?role=teacher" variant="outlined" size="large" endIcon={<ArrowForwardIcon />} sx={{ borderRadius: 1, px: 6, py: 2, fontWeight: 700, borderWidth: 2 }}>
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