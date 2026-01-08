import React from 'react';
import { 
  Box, Container, Typography, Grid, Button, Avatar, Card, CardContent 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../components/layout/Footer';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import HandshakeIcon from '@mui/icons-material/Handshake';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const About: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'white', minHeight: '100vh' }}>
      
      {/* --- HERO SECTION --- */}
      <Box sx={{ bgcolor: '#0f172a', color: 'white', py: 10, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
          <Typography variant="overline" sx={{ color: '#ea580c', fontWeight: 700, letterSpacing: 2 }}>
            WHO WE ARE
          </Typography>
          <Typography variant="h2" fontWeight={800} sx={{ mt: 2, mb: 3 }}>
            Empowering Kenya's Education
          </Typography>
          <Typography variant="h5" sx={{ maxWidth: '800px', mx: 'auto', opacity: 0.9, lineHeight: 1.6, fontWeight: 400 }}>
            Masomo Soko is the bridge between brilliant teachers and ambitious students. 
            We make high-quality educational resources accessible to everyone.
          </Typography>
        </Container>
        {/* Background decorative circle */}
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', bgcolor: 'rgba(37, 99, 235, 0.1)' }} />
        <Box sx={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(234, 88, 12, 0.1)' }} />
      </Box>

      {/* --- MISSION SECTION --- */}
      <Container maxWidth="xl" sx={{ py: 10 }}>
        <Grid container spacing={8} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box 
              component="img" 
              src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
              alt="Students learning"
              sx={{ width: '100%', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom>
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
                    <Typography variant="h4" fontWeight={700} color="primary">50k+</Typography>
                    <Typography variant="body2" color="text.secondary">Resources Downloaded</Typography>
                 </Box>
              </Grid>
              <Grid item xs={6}>
                 <Box sx={{ borderLeft: '4px solid #ea580c', pl: 2 }}>
                    <Typography variant="h4" fontWeight={700} color="#ea580c">2,000+</Typography>
                    <Typography variant="body2" color="text.secondary">Active Teachers</Typography>
                 </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>

      {/* --- VALUES SECTION --- */}
      <Box sx={{ bgcolor: '#f8fafc', py: 10 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="primary" fontWeight={800} sx={{ letterSpacing: 1.5 }}>WHY CHOOSE US</Typography>
            <Typography variant="h3" fontWeight={800} sx={{ color: '#0f172a', mt: 1 }}>Core Values</Typography>
          </Box>
          
          <Grid container spacing={4}>
            {[
              { title: "Quality First", desc: "Every resource is vetted to ensure it meets the current curriculum standards.", icon: <SchoolIcon fontSize="large" sx={{ color: 'white' }} /> },
              { title: "Teacher Empowerment", desc: "We provide a platform for educators to earn passive income from their expertise.", icon: <EmojiEventsIcon fontSize="large" sx={{ color: 'white' }} /> },
              { title: "Trust & Security", desc: "Payments are processed securely via M-Pesa. Satisfaction guaranteed.", icon: <HandshakeIcon fontSize="large" sx={{ color: 'white' }} /> },
            ].map((value, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card sx={{ height: '100%', borderRadius: 4, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', p: 2 }}>
                  <CardContent>
                    <Box sx={{ 
                      width: 80, height: 80, borderRadius: '50%', bgcolor: '#2563eb', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3,
                      boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)' 
                    }}>
                      {value.icon}
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
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ color: '#0f172a' }}>
          Ready to get started?
        </Typography>
        <Typography variant="h6" sx={{ color: '#475569', mb: 4, fontWeight: 400 }}>
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