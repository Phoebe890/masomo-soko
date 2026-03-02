import React from 'react';
import { Snackbar, Alert, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
}

const AppNotification: React.FC<NotificationProps> = ({ open, message, severity, onClose }) => {
  const theme = useTheme();
  // Check if the screen is mobile (less than 600px)
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isSuccess = severity === 'success';

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      onClose={onClose}
      // On mobile, show in top-center. On desktop, show in top-right.
      anchorOrigin={{ 
        vertical: 'top', 
        horizontal: isMobile ? 'center' : 'right' 
      }}
      // Adds a little space from the top on mobile so it doesn't touch the status bar
      sx={{ mt: isMobile ? 1 : 2 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={<InfoIcon sx={{ color: isSuccess ? '#00A651' : '#d32f2f', fontSize: isMobile ? 22 : 28 }} />}
        sx={{
          // RESPONSIVE WIDTH LOGIC:
          // On mobile: Use 92% of the screen width so it has small gaps on the sides.
          // On desktop: Use the fixed 380px width.
          width: isMobile ? '92vw' : '380px', 
          maxWidth: '450px',
          bgcolor: isSuccess ? '#F1FBF7' : '#FFF5F5',
          color: '#1a1b1d',
          borderRadius: '12px',
          border: `1px solid ${isSuccess ? '#00A651' : '#d32f2f'}`,
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          alignItems: 'center',
          '& .MuiAlert-message': {
            width: '100%',
            pr: 1,
            // Tighten padding for mobile
            py: isMobile ? 0.5 : 1, 
          },
          '& .MuiAlert-icon': {
            mr: isMobile ? 1.5 : 2,
          }
        }}
      >
        <Typography 
          variant="subtitle2" 
          sx={{ 
            fontWeight: 800, 
            color: isSuccess ? '#00A651' : '#d32f2f', 
            lineHeight: 1.2,
            fontSize: isMobile ? '0.85rem' : '0.95rem'
          }}
        >
          {isSuccess ? 'Success!' : 'Error!'}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mt: 0.3, 
            fontWeight: 500, 
            color: '#4a4a4a',
            fontSize: isMobile ? '0.75rem' : '0.85rem',
            // Prevent text from overflowing if it's very long
            wordBreak: 'break-word' 
          }}
        >
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default AppNotification;