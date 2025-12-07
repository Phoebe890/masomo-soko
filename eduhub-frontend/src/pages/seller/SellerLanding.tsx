import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Container, 
  Paper, 
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../../components/layout/Footer';
// Icons
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// --- Types & Data ---
interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const stepsData: FeatureItem[] = [
  { 
    icon: <PersonAddIcon fontSize="inherit" />, 
    title: "1. Sign Up", 
    description: "Create your free seller account in minutes using your email or phone number." 
  },
  { 
    icon: <CloudUploadIcon fontSize="inherit" />, 
    title: "2. Upload Resources", 
    description: "Easily upload exams, notes, and schemes. We support PDF, Word, and PPT formats." 
  },
  { 
    icon: <SecurityIcon fontSize="inherit" />, 
    title: "3. Verification", 
    description: "Our quality team verifies your content to build trust with buyers." 
  },
  { 
    icon: <MonetizationOnIcon fontSize="inherit" />, 
    title: "4. Earn Instantly", 
    description: "Receive payments directly to your M-Pesa immediately after every sale." 
  }
];

const SellerLanding: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      
      {/* =========================================
          SECTION 1: HERO (Mobile-First)
      ========================================= */}
      <Box 
        component="section"
        sx={{ 
          bgcolor: '#fff', 
          pt: { xs: 4, md: 8 }, 
          pb: { xs: 6, md: 10 },
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }}>
            
            {/* Left: Text Content */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' }, // Responsive scaling
                    lineHeight: { xs: 1.2, md: 1.1 },
                    mb: 2,
                    color: '#2d2f31',
                    letterSpacing: '-0.02em'
                  }}
                >
                  Turn your teaching resources into income.
                </Typography>
                
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontSize: { xs: '1.1rem', md: '1.25rem' }, 
                    fontWeight: 400,
                    color: 'text.secondary', 
                    mb: 4, 
                    lineHeight: 1.6 
                  }}
                >
                  Join hundreds of Kenyan teachers earning passive income by sharing exams, notes, and lesson plans on EduHub.
                </Typography>
                
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    component={RouterLink}
                    to="/register"
                    endIcon={<ArrowForwardIcon />}
                    aria-label="Register as a seller"
                    sx={{ 
                      py: 1.8, 
                      px: 4, 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  >
                    Start Selling Now
                  </Button>
                </Stack>
              </Box>
            </Grid>

            {/* Right: Hero Image */}
            <Grid item xs={12} md={6}>
              <Box 
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 'auto',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  transform: { xs: 'none', md: 'perspective(1000px) rotateY(-5deg)' },
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: { xs: 'none', md: 'perspective(1000px) rotateY(0deg)' }
                  }
                }}
              >
                <Box 
                  component="img"
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                  alt="Teacher holding tablet and smiling"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block', // Removes bottom whitespace
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================
          SECTION 2: TRUST SIGNALS (Stats)
      ========================================= */}
     {/* =========================================
          SECTION 2: TRUST SIGNALS (Stats)
      ========================================= */}
      <Box sx={{ bgcolor: '#f7f9fa', py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center" textAlign="center" alignItems="end">
            
            {/* Stat 1: Commission */}
            <Grid item xs={12} sm={4}>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                sx={{ 
                  color: 'success.main', 
                  fontSize: { xs: '3rem', md: '4rem' },
                  lineHeight: 1
                }}
              >
                85%
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ mt: 2 }}>
                Commission to You
              </Typography>
            </Grid>

            {/* Stat 2: M-Pesa Logo */}
            <Grid item xs={12} sm={4}>
              {/* Container to align logo height with the text numbers */}
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: '3rem', md: '4rem' } }}>
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                  alt="M-Pesa" 
                  style={{ height: '100%', maxHeight: '50px', objectFit: 'contain' }} 
                />
              </Box>
              <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ mt: 2 }}>
                Instant Payouts
              </Typography>
            </Grid>

            {/* Stat 3: Teachers */}
            <Grid item xs={12} sm={4}>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                sx={{ 
                  color: '#2d2f31', 
                  fontSize: { xs: '3rem', md: '4rem' },
                  lineHeight: 1
                }}
              >
                500+
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ mt: 2 }}>
                Active Teachers
              </Typography>
            </Grid>

          </Grid>
        </Container>
      </Box>

      {/* =========================================
          SECTION 3: VALUE PROPOSITION (Grid)
      ========================================= */}
{/* =========================================
          SECTION 3: WHY SELL HERE (Alternating Feature Blocks)
      ========================================= */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontWeight: 800, 
              mb: { xs: 8, md: 12 },
              fontSize: { xs: '2rem', md: '3rem' },
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Everything you need to grow your teaching business
          </Typography>
          
          {/* Feature 1: Reach (Text Left, Image Right) */}
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" sx={{ mb: { xs: 8, md: 12 } }}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 2 }}>
                  GROWTH
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 2, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                  Reach students beyond your classroom
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  Your notes are valuable. Don't let them sit in a drawer. EduHub markets your resources to thousands of students and parents across Kenya. We handle the SEO and advertising so you can focus on creating.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                // Placeholder: A classroom or students studying
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Students studying"
                sx={{ 
                  width: '100%', 
                  borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)' 
                }}
              />
            </Grid>
          </Grid>

          {/* Feature 2: Money (Image Left, Text Right) */}
          {/* Note: 'direction' prop handles the zig-zag on desktop, but stacks normally on mobile */}
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" direction={{ xs: 'column-reverse', md: 'row' }} sx={{ mb: { xs: 8, md: 12 } }}>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                // Placeholder: Someone looking at phone/money
                src="https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Payment success on phone"
                sx={{ 
                  width: '100%', 
                  borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)' 
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="overline" color="secondary" fontWeight={700} sx={{ letterSpacing: 2 }}>
                  REVENUE
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 2, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                  Keep 85% of your earnings
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  We believe content creators should be rewarded. That is why we offer the lowest commission rates in the region. When a student buys your exam paper, the money is sent instantly to your M-Pesa.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Feature 3: Analytics (Text Left, Image Right) */}
          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="overline" sx={{ color: '#2d2f31', fontWeight: 700, letterSpacing: 2 }}>
                  INSIGHTS
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 2, fontSize: { xs: '1.75rem', md: '2.25rem' } }}>
                  Track your success in real-time
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                  No more guessing. Our seller dashboard shows you exactly which notes are selling, how much you have earned today, and what students are searching for—so you can create more of what they need.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                // Placeholder: Laptop or charts
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Analytics dashboard"
                sx={{ 
                  width: '100%', 
                  borderRadius: 4,
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)' 
                }}
              />
            </Grid>
          </Grid>

        </Container>
      </Box>
      {/* =========================================
          SECTION 4: HOW IT WORKS (List/Cards)
      ========================================= */}
{/* =========================================
          SECTION 4: HOW IT WORKS (Modern Typography Style)
      ========================================= */}
      <Box component="section" sx={{ bgcolor: '#f7f9fa', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 2 }}>
              SIMPLE PROCESS
            </Typography>
            <Typography 
              variant="h2" 
              sx={{ 
                fontWeight: 800, 
                mt: 1, 
                fontSize: { xs: '1.75rem', md: '2.5rem' }
              }}
            >
              Start earning in 4 steps
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[
              { 
                step: "01", 
                title: "Create Account", 
                desc: "Register in 30 seconds. We just need your email and M-Pesa number for payments." 
              },
              { 
                step: "02", 
                title: "Upload Files", 
                desc: "Upload your PDFs or Word docs. Add a price and a description for your students." 
              },
              { 
                step: "03", 
                title: "We Verify", 
                desc: "Our quality team reviews your content. Once approved, it goes live immediately." 
              },
              { 
                step: "04", 
                title: "Get Paid", 
                desc: "When a student buys, funds are sent directly to your wallet. Cash out anytime." 
              }
            ].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Box 
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    bgcolor: '#fff',
                    borderRadius: 2,
                    border: '1px solid #e0e0e0',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-5px)', borderColor: 'primary.main' }
                  }}
                >
                  {/* The Big Number Hook */}
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontSize: '3.5rem', 
                      fontWeight: 900, 
                      color: 'rgba(0, 0, 0, 0.08)', // Very subtle grey
                      lineHeight: 1,
                      mb: 2,
                      fontFamily: 'monospace' // Optional: gives a technical feel
                    }}
                  >
                    {item.step}
                  </Typography>
                  
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* =========================================
          SECTION 5: HIGH CONTRAST FEATURE
      ========================================= */}
      <Box sx={{ position: 'relative', bgcolor: '#2d2f31', color: '#fff', py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
             <Grid item xs={12} md={6}>
                <Box 
                  component="img"
                  src="https://images.unsplash.com/photo-1553877607-498c84344d34?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Dashboard interface preview"
                  sx={{ 
                    width: '100%', 
                    borderRadius: 2, 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                />
             </Grid>
             <Grid item xs={12} md={6}>
                <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
                  You are in control
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.7 }}>
                   EduHub gives you full autonomy over your content. Manage your pricing, edit your files, and interact with students directly.
                </Typography>
                <Stack spacing={2}>
                  {[
                    "Set your own prices",
                    "Edit or remove content anytime",
                    "Secure file protection"
                  ].map((text, i) => (
                    <Box display="flex" alignItems="center" key={i}>
                      <CheckCircleIcon color="success" sx={{ mr: 2 }} />
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 500 }}>
                        {text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
             </Grid>
          </Grid>
        </Container>
      </Box>

      {/* =========================================
          SECTION 6: BOTTOM CTA
      ========================================= */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography 
            variant="h3" 
            fontWeight={800} 
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3rem' } }}
          >
            Ready to start earning?
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ mb: 5, fontWeight: 400 }}
          >
            Join the community of modern teachers today.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/register"
            aria-label="Register now"
            sx={{ 
              py: 2, 
              px: 6, 
              fontWeight: 700, 
              fontSize: '1.1rem',
              borderRadius: 2,
              width: { xs: '100%', sm: 'auto' } // Full width on mobile
            }}
          >
            Become a Seller
          </Button>
        </Container>
      </Box>
{/* =========================================
          SECTION 7: FOOTER
      ========================================= */}
     {/* <Box component="footer" sx={{ bgcolor: '#1a1b1d', color: '#fff', py: 8, borderTop: '1px solid #333' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            
            
            <Grid item xs={12} md={4}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                EduHub
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.500', lineHeight: 1.7, mb: 3 }}>
                Empowering Kenyan teachers to share their knowledge and earn what they deserve. Join the largest digital marketplace for education resources.
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                © {new Date().getFullYear()} EduHub Kenya. All rights reserved.
              </Typography>
            </Grid>

           
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                For Teachers
              </Typography>
              <Stack spacing={1}>
                <Typography component={RouterLink} to="/register" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Start Selling</Typography>
                <Typography component={RouterLink} to="/seller-guide" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Seller Guide</Typography>
                <Typography component={RouterLink} to="/login" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Seller Login</Typography>
                <Typography component={RouterLink} to="/success-stories" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Success Stories</Typography>
              </Stack>
            </Grid>


            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Support
              </Typography>
              <Stack spacing={1}>
                <Typography component={RouterLink} to="/help" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Help Center</Typography>
                <Typography component={RouterLink} to="/contact" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Contact Us</Typography>
                <Typography component={RouterLink} to="/terms" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Terms of Service</Typography>
                <Typography component={RouterLink} to="/privacy" sx={{ color: 'grey.400', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Privacy Policy</Typography>
              </Stack>
            </Grid>


            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
                Email: support@eduhub.co.ke
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.400', mb: 1 }}>
                Whatsapp: +254 700 000 000
              </Typography>
            </Grid>

          </Grid>
        </Container>
      </Box>  */}
      <Footer />
    </Box>
  );
};

export default SellerLanding;