import React from 'react';
import { Box, Typography, Button, Grid, List, ListItem, ListItemIcon, ListItemText, Container, Paper, Divider } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { Link as RouterLink } from 'react-router-dom';

const SellerLanding: React.FC = () => (
  <Container maxWidth="md" sx={{ minHeight: { xs: '100vh', md: '80vh' }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: { xs: 4, md: 8 } }}>
    {/* Top CTA */}
    <Box sx={{ width: '100%', textAlign: 'center', mt: { xs: 2, md: 6 }, mb: 3 }}>
      <Typography variant="h3" fontWeight={800} gutterBottom align="center" sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}>
        Earn Money from Your Expertise. Join Hundreds of Kenyan Teachers.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        component={RouterLink}
        to="/register"
        sx={{ mt: 2, mb: 2, minWidth: 240, fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.2rem' } }}
        aria-label="Register now and start selling"
      >
        REGISTER NOW AND START SELLING
      </Button>
    </Box>
    {/* How It Works */}
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 2, mb: 5, width: '100%' }}>
      <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 3 }}>
        How It Works
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PersonAddIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography fontWeight={600}>Sign Up</Typography>
            <Typography variant="body2" color="text.secondary" align="center">Create your free seller account in minutes.</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <CloudUploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography fontWeight={600}>Upload</Typography>
            <Typography variant="body2" color="text.secondary" align="center">Easily upload your exams, notes, and lesson plans.</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <MonetizationOnIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography fontWeight={600}>Set Your Price</Typography>
            <Typography variant="body2" color="text.secondary" align="center">You control the pricing of your resources.</Typography>
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PaymentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography fontWeight={600}>Get Paid</Typography>
            <Typography variant="body2" color="text.secondary" align="center">Receive your earnings securely via M-Pesa.</Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
    {/* Value Proposition */}
    <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: 2, mb: 5, width: '100%' }}>
      <Typography variant="h5" fontWeight={700} align="center" sx={{ mb: 3 }}>
        Why Sell on EduHub?
      </Typography>
      <List sx={{ width: '100%', maxWidth: 700, mx: 'auto' }}>
        <ListItem>
          <ListItemIcon><TrendingUpIcon color="success" /></ListItemIcon>
          <ListItemText primary="Reach Thousands of Students: We market your resources across the country." />
        </ListItem>
        <ListItem>
          <ListItemIcon><MonetizationOnIcon color="primary" /></ListItemIcon>
          <ListItemText primary="Keep Most of Your Earnings: You keep 85% of every sale! (Lowest commission rates in Kenya)" />
        </ListItem>
        <ListItem>
          <ListItemIcon><SecurityIcon color="info" /></ListItemIcon>
          <ListItemText primary="Secure & Automatic: We handle the payments and file delivery. You just upload." />
        </ListItem>
        <ListItem>
          <ListItemIcon><DashboardIcon color="secondary" /></ListItemIcon>
          <ListItemText primary="Track Your Success: A powerful dashboard to monitor your sales and earnings in real-time." />
        </ListItem>
      </List>
    </Paper>
    {/* Bottom CTA */}
    <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        component={RouterLink}
        to="/register"
        sx={{ mt: 2, mb: 2, minWidth: 240, fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.2rem' } }}
        aria-label="Register now and start selling"
      >
        REGISTER NOW AND START SELLING
      </Button>
    </Box>
  </Container>
);

export default SellerLanding; 