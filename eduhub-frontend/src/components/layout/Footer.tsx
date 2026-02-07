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
import { Link as RouterLink } from 'react-router-dom'; 
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// --- IMPORT LOGO ---
import logo from '../../assets/logo.svg'; 

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
        pt: 8, 
        pb: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={5} justifyContent="space-between">
          
          {/* --- Column 1: Brand & Logo --- */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'left' }}>
            {/* Logo Container */}
            <Box 
                component={RouterLink} 
                to="/"
                sx={{ 
                    display: 'inline-flex', 
                    bgcolor: 'white', 
                    borderRadius: '8px', 
                    px: 2.5, 
                    py: 1.2, 
                    mb: 3,
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                     transition: 'transform 0.2s',
      '&:hover': { transform: 'scale(1.02)' }
                }}
            >
                <Box 
                    component="img" 
                    src={logo} 
                    alt="Masomo Soko"
                    sx={{ 
                        height: { xs: 45, md: 52 }, 
                        width: 'auto', 
                        objectFit: 'contain',
                        display: 'block' 
                    }} 
                />
            </Box>

            <Typography variant="body1" sx={{ color: textLightColor, mb: 3, maxWidth: '350px', lineHeight: 1.7, fontSize: '1rem' }}>
              The #1 marketplace for educational resources. Buy high-quality notes or upload your own to earn extra income instantly via M-Pesa.
            </Typography>
            
            {/* Social Icons */}
            <Stack direction="row" spacing={1.5}>
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
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Company
            </Typography>
            <Stack spacing={1.5}>
              <Link component={RouterLink} to="/about" underline="none" sx={{ color: textLightColor, fontSize: '0.95rem', transition: '0.2s', '&:hover': { color: accentColor, pl: 0.5 } }}>
                  About Us
              </Link>
              <Link component={RouterLink} to="/register?role=teacher" underline="none" sx={{ color: textLightColor, fontSize: '0.95rem', transition: '0.2s', '&:hover': { color: accentColor, pl: 0.5 } }}>
                  Sell Resources
              </Link>
              <Link href="#" underline="none" sx={{ color: textLightColor, fontSize: '0.95rem', transition: '0.2s', '&:hover': { color: accentColor, pl: 0.5 } }}>
                  Plans & Pricing
              </Link>
              <Link href="#" underline="none" sx={{ color: textLightColor, fontSize: '0.95rem', transition: '0.2s', '&:hover': { color: accentColor, pl: 0.5 } }}>
                  Careers
              </Link>
            </Stack>
          </Grid>

          {/* --- Column 3: Contact Info --- */}
          <Grid item xs={6} sm={4} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Contact
            </Typography>
            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>Phone</Typography>
                <Typography variant="body2" sx={{ color: textLightColor }}>+(254) 769 053 029</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>Email</Typography>
                <Typography variant="body2" sx={{ color: textLightColor }}>phoebemuriithi608@gmail.com</Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'white', fontWeight: 700, mb: 0.5 }}>Location</Typography>
                <Typography variant="body2" sx={{ color: textLightColor }}>Westlands, Nairobi, Kenya</Typography>
              </Box>
            </Stack>
          </Grid>

          {/* --- Column 4: Newsletter --- */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: 'white', mb: 2 }}>
              Newsletter
            </Typography>
            <Typography variant="body2" sx={{ color: textLightColor, mb: 2.5 }}>
              Subscribe to get the latest resources and teacher updates.
            </Typography>
            <Box sx={{ display: 'flex', bgcolor: 'white', borderRadius: 1, overflow: 'hidden' }}>
              <InputBase
                placeholder="Email address..."
                sx={{ pl: 2, py: 1, flex: 1, fontSize: '0.9rem' }}
              />
              <Button sx={{ bgcolor: accentColor, color: 'white', borderRadius: 0, px: 3, '&:hover': { bgcolor: '#1e54d6' } }}>
                Go
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mt: 6, mb: 3 }} />

        {/* --- Bottom Bar --- */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: textLightColor }}>
                © {new Date().getFullYear()} Masomo Soko Inc. All rights reserved.
            </Typography>

            <Stack direction="row" spacing={3} sx={{ display: { xs: 'none', sm: 'flex' } }}>
                <Link href="#" underline="none" sx={{ color: textLightColor, fontSize: '0.85rem', '&:hover': { color: 'white' } }}>Privacy Policy</Link>
                <Link href="#" underline="none" sx={{ color: textLightColor, fontSize: '0.85rem', '&:hover': { color: 'white' } }}>Terms of Service</Link>
            </Stack>

            <IconButton 
                size="small"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                sx={{ 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white', 
                    '&:hover': { bgcolor: accentColor } 
                }}
            >
                <KeyboardArrowUpIcon />
            </IconButton>
        </Box>

      </Container>
    </Box>
  );
};

export default Footer;