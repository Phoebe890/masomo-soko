import React from 'react';
import { Box, Typography, Button, Paper, Container, Stack, Divider, Fade, Zoom } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

const PurchaseConfirmation = () => {
  const navigate = useNavigate();
  
  // Mock Order ID for visual realism
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <Box sx={{ minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#F8FAFC', p: 2 }}>
      
      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
        <Container maxWidth="sm">
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 4, md: 6 }, 
              borderRadius: 4, 
              textAlign: 'center', 
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* 1. Animated Success Icon */}
            <Box sx={{ mb: 3, display: 'inline-flex', position: 'relative' }}>
                <Box sx={{ 
                    position: 'absolute', inset: 0, 
                    bgcolor: '#DCFCE7', borderRadius: '50%', 
                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' 
                }} />
                <CheckCircleIcon sx={{ fontSize: 80, color: '#16A34A', position: 'relative', zIndex: 1 }} />
            </Box>

            {/* 2. Main Heading */}
            <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A', mb: 1 }}>
              Payment Successful!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.1rem' }}>
              Thank you for your purchase. You can now access your learning materials instantly.
            </Typography>

            {/* 3. Order Details Box */}
            <Box sx={{ bgcolor: '#F1F5F9', borderRadius: 3, p: 3, mb: 4, textAlign: 'left' }}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Order Number</Typography>
                    <Typography variant="body2" fontWeight={700} color="#334155">{orderId}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">Date</Typography>
                    <Typography variant="body2" fontWeight={700} color="#334155">{new Date().toLocaleDateString()}</Typography>
                </Stack>
                <Divider sx={{ borderStyle: 'dashed', mb: 2 }} />
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <DescriptionOutlinedIcon sx={{ color: '#64748B' }} />
                    <Box>
                        <Typography variant="body2" fontWeight={600} color="#0F172A">
                            Resource Download Access
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Added to your library
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            {/* 4. Action Buttons */}
            <Stack spacing={2}>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/dashboard/student')}
                    sx={{ 
                        py: 1.8, 
                        borderRadius: 50, 
                        fontWeight: 700, 
                        textTransform: 'none', 
                        fontSize: '1rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                >
                    Go to My Dashboard
                </Button>
                
                <Button
                    variant="text"
                    size="large"
                    startIcon={<ShoppingBagOutlinedIcon />}
                    onClick={() => navigate('/browse')}
                    sx={{ 
                        borderRadius: 50, 
                        fontWeight: 600, 
                        textTransform: 'none',
                        color: '#64748B'
                    }}
                >
                    Continue Browsing
                </Button>
            </Stack>

            {/* 5. Support Footer */}
            <Typography variant="caption" display="block" sx={{ mt: 4, color: '#94A3B8' }}>
                A receipt has been sent to your email address.<br />
                Need help? <Box component="span" sx={{ color: 'primary.main', cursor: 'pointer', fontWeight: 600 }}>Contact Support</Box>
            </Typography>

          </Paper>
        </Container>
      </Zoom>
      
      {/* CSS Animation for the pulse effect */}
      <style>
        {`
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default PurchaseConfirmation;