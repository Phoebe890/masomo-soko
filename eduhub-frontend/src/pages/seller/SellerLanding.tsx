import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Container, 
  Stack,
  useTheme,
  useMediaQuery,
  Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../../components/layout/Footer';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import PeopleIcon from '@mui/icons-material/People';

// --- COLORS CONSTANTS ---
const TEXT_DARK = '#0f172a';      
const TEXT_MUTED = '#475569';     
const BG_LIGHT = '#F8FAFC';       
const DARK_SECTION = '#1e293b';   

// --- SVG 1: DASHBOARD ---
const DashboardIllustration = () => (
  <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', p: 2 }}>
    <svg viewBox="0 0 500 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.3))', width: '100%', height: 'auto', display: 'block' }}>
      <rect x="10" y="20" width="480" height="300" rx="16" fill="#0f172a" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <path d="M11 36C11 27.1634 18.1634 20 27 20H473C481.837 20 489 27.1634 489 36V60H11V36Z" fill="rgba(255,255,255,0.05)" />
      <circle cx="35" cy="40" r="6" fill="#ef4444" opacity="0.8" />
      <circle cx="55" cy="40" r="6" fill="#eab308" opacity="0.8" />
      <circle cx="75" cy="40" r="6" fill="#22c55e" opacity="0.8" />
      <rect x="11" y="60" width="100" height="259" rx="0" fill="rgba(255,255,255,0.02)" />
      <rect x="30" y="90" width="60" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
      <rect x="30" y="115" width="40" height="8" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="30" y="140" width="50" height="8" rx="4" fill="rgba(255,255,255,0.05)" />
      <rect x="130" y="90" width="340" height="70" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" />
      <rect x="150" y="110" width="120" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
      <rect x="150" y="130" width="80" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
      <rect x="400" y="113" width="44" height="24" rx="12" fill="#10b981" />
      <circle cx="430" cy="125" r="8" fill="white" />
      <rect x="130" y="180" width="200" height="120" rx="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.05)" />
      <path d="M155 270V230" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round"/>
      <path d="M185 270V210" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round" opacity="0.6"/>
      <path d="M215 270V250" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round" opacity="0.4"/>
      <path d="M245 270V200" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round" opacity="0.8"/>
      <path d="M275 270V240" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round" opacity="0.5"/>
      <path d="M305 270V220" stroke="#38bdf8" strokeWidth="16" strokeLinecap="round"/>
      <g transform="translate(350, 180)">
        <rect width="120" height="120" rx="8" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.05)" />
        <line x1="20" y1="35" x2="100" y2="35" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="80" cy="35" r="7" fill="#f472b6" />
        <line x1="20" y1="65" x2="100" y2="65" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="40" cy="65" r="7" fill="#f472b6" />
        <line x1="20" y1="95" x2="100" y2="95" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round"/>
        <circle cx="60" cy="95" r="7" fill="#f472b6" />
      </g>
    </svg>
  </Box>
);

// --- SVG 2: REVENUE ---
const RevenueIllustration = () => (
  <Box sx={{ width: '100%', maxWidth: 500, mx: 'auto', p: 2 }}>
    <svg 
      viewBox="0 0 400 300" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      <circle cx="200" cy="150" r="140" fill="#ecfdf5" />
      <rect x="120" y="40" width="160" height="240" rx="20" fill="white" stroke="#e2e8f0" strokeWidth="4" />
      <rect x="130" y="20" width="140" height="260" rx="16" fill="white" />
      <rect x="135" y="55" width="130" height="210" rx="12" fill="#f8fafc" />
      <path d="M145 180 L165 160 L185 170 L220 130 L255 120" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M145 180 L255 120 V200 H145 V180 Z" fill="url(#revGradientGreen)" opacity="0.2" />
      
      <g filter="url(#revShadow)">
        <rect x="80" y="100" width="180" height="60" rx="12" fill="white" />
        <circle cx="110" cy="130" r="15" fill="#10b981" />
        <path d="M104 130 L108 134 L116 126" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="135" y="115" width="80" height="8" rx="4" fill="#0f172a" />
        <rect x="135" y="135" width="50" height="6" rx="3" fill="#94a3b8" />
        <text x="220" y="135" fontSize="14" fontWeight="bold" fill="#10b981">KES 500</text>
      </g>

      <defs>
        <linearGradient id="revGradientGreen" x1="200" y1="120" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10b981" />
          <stop offset="1" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <filter id="revShadow" x="70" y="90" width="200" height="80" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity="0" result="BackgroundImageFix"/>
          <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
          <feOffset dy="4"/>
          <feGaussianBlur stdDeviation="6"/>
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow"/>
          <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape"/>
        </filter>
      </defs>
    </svg>
  </Box>
);
// --- SVG 3: GROWTH ---
const GrowthIllustration = () => (
  <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
    <svg viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', maxWidth: '450px' }}>
      {/* Soft Background Growth Circle */}
      <circle cx="200" cy="150" r="120" fill="#e8f5e9" /> 
      
      {/* Connecting Lines (Reach) - Teal Color */}
      <path d="M200 120L280 60M200 120L320 150M200 120L100 60M200 120L80 150" stroke="#81c784" strokeWidth="3" strokeDasharray="6 4" />
      
      {/* Central Teacher - Safaricom Green */}
      <circle cx="200" cy="120" r="30" fill="#43B02A" />
      <path d="M150 200C150 172.386 172.386 150 200 150C227.614 150 250 172.386 250 200" fill="#43B02A" />
      
      {/* Reached Nodes - Blue/Teal Mix */}
      <circle cx="280" cy="60" r="15" fill="#2F6BFF" />
      <circle cx="320" cy="150" r="15" fill="#00acc1" />
      <circle cx="100" cy="60" r="15" fill="#2F6BFF" />
      <circle cx="80" cy="150" r="15" fill="#00acc1" />
      
      {/* Large Growth Arrow - Vibrant Green */}
      <path d="M280 230L350 230L350 160" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M220 290L350 230" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" />
      
      {/* Tiny "Plus" symbols representing new students */}
      <path d="M120 180H130M125 175V185" stroke="#43B02A" strokeWidth="2" />
      <path d="M280 110H290M285 105V115" stroke="#43B02A" strokeWidth="2" />
    </svg>
  </Box>
);
const SellerLanding: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden', bgcolor: '#fff' }}>
      
      {/* SECTION 1: HERO */}
      <Box 
        component="section"
        sx={{ 
          bgcolor: '#fff', 
          pt: { xs: 4, md: 8 }, 
          pb: { xs: 6, md: 10 },
          borderBottom: '1px solid',
          borderColor: '#E2E8F0'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 5, md: 8 }} alignItems="center">
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontWeight: 800, 
                    fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' }, 
                    lineHeight: { xs: 1.2, md: 1.1 },
                    mb: 2,
                    color: TEXT_DARK,
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
                    color: TEXT_MUTED, 
                    mb: 4, 
                    lineHeight: 1.6 
                  }}
                >
                  Join hundreds of Kenyan teachers earning passive income by sharing exams, notes, and lesson plans on <strong>Mwalimu Soko</strong>.
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
                    to="/register?role=teacher"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ 
                      py: 1.8, 
                      px: 4, 
                      fontWeight: 700, 
                      fontSize: '1rem',
                      textTransform: 'none',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 16px rgba(15, 23, 42, 0.2)'
                      }
                    }}
                  >
                    Start Selling Now
                  </Button>
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box 
                sx={{
                  position: 'relative',
                  width: '100%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  transform: isMobile ? 'none' : 'perspective(1000px) rotateY(-5deg)',
                  transition: 'transform 0.5s ease',
                  '&:hover': {
                    transform: isMobile ? 'none' : 'perspective(1000px) rotateY(0deg)'
                  }
                }}
              >
                <Box 
                  component="img"
                  src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
      alt="Organized educational workspace"
                 
                  sx={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 2: TRUST SIGNALS */}
      <Box sx={{ bgcolor: BG_LIGHT, py: { xs: 6, md: 8 }, borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center" alignItems="flex-start">
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Stack alignItems="center" spacing={1}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h3" fontWeight={800} sx={{ color: TEXT_DARK, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1 }}>
                  85%
                </Typography>
                <Typography variant="h6" color={TEXT_MUTED} fontWeight={500}>
                  Commission to You
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
               <Stack alignItems="center" spacing={1}>
                <SecurityIcon sx={{ fontSize: 40, color: '#0056D2', mb: 1 }} /> 
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: { xs: '2.5rem', md: '3.5rem' } }}>
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" 
                    alt="M-Pesa" 
                    style={{ height: '100%', maxHeight: '40px', objectFit: 'contain' }} 
                  />
                </Box>
                <Typography variant="h6" color={TEXT_MUTED} fontWeight={500}>
                  Instant Payouts
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
              <Stack alignItems="center" spacing={1}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h3" fontWeight={800} sx={{ color: TEXT_DARK, fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1 }}>
                  500+
                </Typography>
                <Typography variant="h6" color={TEXT_MUTED} fontWeight={500}>
                  Active Teachers
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 3: WHY SELL HERE */}
      <Box component="section" sx={{ py: { xs: 8, md: 12 }, overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            align="center" 
            sx={{ 
              fontWeight: 800, 
              mb: { xs: 6, md: 10 },
              fontSize: { xs: '1.75rem', md: '3rem' },
              maxWidth: '800px',
              mx: 'auto',
              color: TEXT_DARK
            }}
          >
            Everything you need to grow your teaching business
          </Typography>
          
         <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center" sx={{ mb: { xs: 8, md: 12 } }}>
  <Grid item xs={12} md={6}>
    <Box>
      <Typography variant="overline" color="success.main" fontWeight={800} sx={{ letterSpacing: 2 }}>
        GROWTH
      </Typography>
      <Typography variant="h3" fontWeight={800} sx={{ mt: 1, mb: 2, fontSize: { xs: '1.8rem', md: '2.5rem' }, color: TEXT_DARK }}>
        Reach students beyond your classroom
      </Typography>
      <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: TEXT_MUTED }}>
        Your notes are valuable. Don't let them sit in a drawer. <strong>Masomo Soko</strong> markets your resources to thousands of students and parents across Kenya. We handle the SEO and advertising so you can focus on creating.
      </Typography>
    </Box>
  </Grid>
  
  <Grid item xs={12} md={6}>
      {/* No Box, no Card, no Shadow - Just the SVG blending into the page */}
      <GrowthIllustration />
  </Grid>
</Grid>
          <Grid 
            container 
            spacing={{ xs: 4, md: 8 }} 
            alignItems="center" 
            direction={{ xs: 'column-reverse', md: 'row' }} 
            sx={{ mb: { xs: 8, md: 12 } }}
          >
            <Grid item xs={12} md={6}>
               <RevenueIllustration />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="overline" color="secondary" fontWeight={700} sx={{ letterSpacing: 2 }}>
                  REVENUE
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 2, fontSize: { xs: '1.5rem', md: '2.25rem' }, color: TEXT_DARK }}>
                  Keep 85% of your earnings
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: TEXT_MUTED }}>
                  We believe content creators should be rewarded. That is why we offer the lowest commission rates in the region. When a student buys your exam paper, the money is sent instantly to your M-Pesa.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="overline" sx={{ color: TEXT_DARK, fontWeight: 700, letterSpacing: 2 }}>
                  INSIGHTS
                </Typography>
                <Typography variant="h3" fontWeight={700} sx={{ mt: 1, mb: 2, fontSize: { xs: '1.5rem', md: '2.25rem' }, color: TEXT_DARK }}>
                  Track your success in real-time
                </Typography>
                <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.7, color: TEXT_MUTED }}>
                  No more guessing. Our seller dashboard shows you exactly which notes are selling, how much you have earned today, and what students are searching for—so you can create more of what they need.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Analytics dashboard"
                sx={{ width: '100%', borderRadius: 3, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* SECTION 4: HOW IT WORKS */}
      <Box component="section" sx={{ bgcolor: BG_LIGHT, py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 700, mx: 'auto', textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: 2 }}>
              SIMPLE PROCESS
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 800, mt: 1, fontSize: { xs: '1.75rem', md: '2.5rem' }, color: TEXT_DARK }}>
              Start earning in 4 steps
            </Typography>
          </Box>

          <Grid container spacing={3}>
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
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    bgcolor: '#fff',
                    borderRadius: 2,
                    border: '1px solid #E2E8F0',
                    transition: 'all 0.3s ease',
                    '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }
                  }}
                >
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontSize: '3.5rem', 
                      fontWeight: 900, 
                      color: 'rgba(15, 23, 42, 0.05)', 
                      lineHeight: 1,
                      mb: 2,
                      fontFamily: 'monospace' 
                    }}
                  >
                    {item.step}
                  </Typography>
                  
                  <Typography variant="h6" fontWeight={700} gutterBottom color={TEXT_DARK}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.6, color: TEXT_MUTED }}>
                    {item.desc}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* SECTION 5: HIGH CONTRAST FEATURE */}
<Container maxWidth="xl" sx={{ py: { xs: 4, md: 6 } }}>
  <Box 
    sx={{ 
      bgcolor: DARK_SECTION, 
      color: '#fff', 
      py: { xs: 8, md: 12 }, // More vertical padding for a premium feel
      px: { xs: 4, md: 10 }, // Matches the banner above
      borderRadius: 8,
      overflow: 'hidden'
    }}
  >
    <Grid container spacing={10} alignItems="center"> {/* Wider spacing for XL layout */}
       <Grid item xs={12} md={6}>
          <DashboardIllustration />
       </Grid>
       <Grid item xs={12} md={6}>
          <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '1.75rem', md: '3rem' } }}>
            You are in control
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontSize: '1.2rem', opacity: 0.9, lineHeight: 1.7, color: '#94a3b8' }}>
             <strong>Mwalimu Soko</strong> gives you full autonomy over your content. Manage your pricing, edit your files, and interact with students directly.
          </Typography>
          <Stack spacing={3}>
            {[
              "Set your own prices",
              "Edit or remove content anytime",
              "Secure file protection"
            ].map((text, i) => (
              <Box display="flex" alignItems="center" key={i}>
                <CheckCircleIcon color="success" sx={{ mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 500 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Stack>
       </Grid>
    </Grid>
  </Box>
</Container>
      {/* SECTION 6: BOTTOM CTA */}
      <Box sx={{ bgcolor: '#fff', py: { xs: 8, md: 12 }, textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography 
            variant="h3" 
            fontWeight={800} 
            gutterBottom
            sx={{ fontSize: { xs: '2rem', md: '3rem' }, color: TEXT_DARK }}
          >
            Ready to start earning?
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ mb: 5, fontWeight: 400, color: TEXT_MUTED }}
          >
            Join the community of modern teachers today.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={RouterLink}
            to="/register?role=teacher"
            sx={{ 
              py: 2, 
              px: 6, 
              fontWeight: 700, 
              fontSize: '1.1rem',
              borderRadius: 2,
              width: { xs: '100%', sm: 'auto' },
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          >
            Become a Seller
          </Button>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default SellerLanding;