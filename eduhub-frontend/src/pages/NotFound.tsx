 import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

const NotFound = () => {
    return (
        <Box 
            sx={{ 
                minHeight: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: '#F9FAFB',
                p: 2
            }}
        >
            <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
                
                {/* 404 Illustration / Icon */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 4 }}>
                    <Typography 
                        variant="h1" 
                        sx={{ 
                            fontSize: { xs: '8rem', sm: '12rem' }, 
                            fontWeight: 900, 
                            color: '#F3F4F6', // Very light grey background text
                            lineHeight: 1
                        }}
                    >
                        404
                    </Typography>
                    <Box 
                        sx={{ 
                            position: 'absolute', 
                            top: '50%', 
                            left: '50%', 
                            transform: 'translate(-50%, -50%)',
                            color: '#ea580c' // Your Brand Orange
                        }}
                    >
                        <SentimentVeryDissatisfiedIcon sx={{ fontSize: { xs: 60, sm: 80 } }} />
                    </Box>
                </Box>

                {/* Text Content */}
                <Typography variant="h4" fontWeight={800} gutterBottom sx={{ color: '#111827' }}>
                    Page Not Found
                </Typography>
                
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
                    Sorry, the page you are looking for doesn't exist or has been moved. 
                </Typography>

            </Container>
        </Box>
    );
};

export default NotFound;