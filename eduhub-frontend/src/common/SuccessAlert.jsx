import React from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const SuccessAlert = ({ message, onClose }) => (
  <Alert
    severity="success"
    variant="outlined"
    sx={{
      borderRadius: 2,
      alignItems: 'center',
      fontSize: '1.1rem',
      px: 2,
      py: 1.5,
      bgcolor: 'success.lighter',
      borderColor: 'success.light',
      color: 'success.dark',
      boxShadow: 0,
      maxWidth: 480,
      mx: 'auto',
    }}
    action={
      <IconButton
        aria-label="close"
        color="inherit"
        size="small"
        onClick={onClose}
        sx={{ ml: 1 }}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    }
  >
    <strong>Success!</strong>
    <br />
    {message}
  </Alert>
);

export default SuccessAlert; 