import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  InputBase,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SchoolIcon from '@mui/icons-material/School'; // Changed to School Icon

const Footer: React.FC = () => {
  // Styles based on the image
  const brandColor = '#0E243C'; // Dark Navy
  const accentColor = '#2F6BFF'; // Bright Blue
  const textColor = '#FFFFFF';
  const textLightColor = '#94A3B8'; // Slate/Grey

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: brandColor,
        color: textColor,
        pt: 6, // Reduced from 8
        pb: 3, // Reduced from 4
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          
          {/* --- Column 1: Brand & Bio --- */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box sx={{ 
                    bgcolor: accentColor, 
                    borderRadius: '50%', 
                    p: 1, 
                    mr: 1.5, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                }}>
                   <SchoolIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Typography variant="h5" fontWeight="bold">
                  EduHub
                </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: textLightColor, mb: 3, maxWidth: '300px', lineHeight: 1.6 }}>
              Empowering students and teachers with world-class resources. Learn anywhere, anytime.
            </Typography>
            
            {/* Social Icons moved here to save vertical space */}
            <Stack direction="row" spacing={1}>
              <IconButton size="small" sx={{ color: textLightColor, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: accentColor, color: 'white' } }}>
                <FacebookIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: textLightColor, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: accentColor, color: 'white' } }}>
                <TwitterIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ color: textLightColor, bgcolor: 'rgba(255,255,255,0.05)', '&:hover': { bgcolor: accentColor, color: 'white' } }}>
                <InstagramIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Grid>

          {/* --- Column 2: Quick Links --- */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
              Company
            </Typography>
            <Stack spacing={1}>
              {['About Us', 'Become a Tutor', 'Plans & Pricing', 'Careers'].map((item) => (
                <Link key={item} href="#" underline="none" sx={{ color: textLightColor, fontSize: '0.9rem', '&:hover': { color: accentColor } }}>
                  {item}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* --- Column 3: Contact Info --- */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
              Contact
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>Phone:</Typography>
                <Typography variant="body2" sx={{ color: textLightColor }}>+(254) 712 345 678</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>Email:</Typography>
                <Typography variant="body2" sx={{ color: textLightColor }}>support@eduhub.com</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 600 }}>Address:</Typography>
                <Typography variant="body2" sx={{ color: textLightColor }}>Westlands, Nairobi, Kenya</Typography>
              </Box>
            </Stack>
          </Grid>

          {/* --- Column 4: Newsletter (Integrated to save height) --- */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ color: 'white' }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: textLightColor, mb: 2 }}>
              Subscribe to get the latest resources and updates.
            </Typography>
            <Box sx={{ display: 'flex', bgcolor: 'white', borderRadius: 1, overflow: 'hidden' }}>
              <InputBase
                placeholder="Email..."
                sx={{ pl: 1.5, py: 0.5, flex: 1, fontSize: '0.9rem' }}
              />
              <Button sx={{ bgcolor: accentColor, color: 'white', borderRadius: 0, minWidth: '50px', '&:hover': { bgcolor: '#1e54d6' } }}>
                Go
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 5, mb: 2 }} />

        {/* --- Bottom Bar --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: textLightColor }}>
                © 2025 EduHub Inc. All rights reserved.
            </Typography>

            <IconButton 
                size="small"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.05)', 
                    color: 'white', 
                    '&:hover': { bgcolor: accentColor } 
                }}
            >
                <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>
        </Box>

      </Container>
    </Box>
  );
};

export default Footer;