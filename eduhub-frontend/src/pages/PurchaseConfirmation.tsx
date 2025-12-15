import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PurchaseConfirmation = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', py: { xs: 4, md: 8 } }}>
      <Paper sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, boxShadow: 3, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          Thank you for your purchase!
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          You can access and download your file from your dashboard at any time.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ minWidth: 200, fontWeight: 700 }}
          onClick={() => navigate('/dashboard/student')}
          aria-label="Go to my dashboard"
        >
          GO TO MY DASHBOARD
        </Button>
      </Paper>
    </Box>
  );
};

export default PurchaseConfirmation; 
 
 