import React from 'react';
import { Snackbar, Alert, Typography, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
  onClose: () => void;
}

const AppNotification: React.FC<NotificationProps> = ({ open, message, severity, onClose }) => {
  const isSuccess = severity === 'success';

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000} // This fixes the "doesn't clear on its own" issue
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Fixes "appearing on the bottom"
      sx={{ mt: 2 }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        icon={<InfoIcon sx={{ color: isSuccess ? '#00A651' : '#d32f2f' }} />}
        sx={{
          width: '100%',
          minWidth: '380px',
          bgcolor: isSuccess ? '#F1FBF7' : '#FFF5F5', // Light green background
          color: '#1a1b1d',
          borderRadius: '12px', // Rounded corners
          border: `1px solid ${isSuccess ? '#00A651' : '#d32f2f'}`, // Green/Red border
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          alignItems: 'center',
          '& .MuiAlert-message': {
            width: '100%',
            pr: 2,
          },
          '& .MuiAlert-icon': {
            fontSize: '28px',
            mr: 2
          }
        }}
      >
        <Typography 
          variant="subtitle1" 
          sx={{ fontWeight: 700, color: isSuccess ? '#00A651' : '#d32f2f', lineHeight: 1.2 }}
        >
          {isSuccess ? 'Success!' : 'Error!'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 500, color: '#4a4a4a' }}>
          {message}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default AppNotification;