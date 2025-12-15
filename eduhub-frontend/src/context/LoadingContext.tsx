import React, { createContext, useContext, useState } from 'react';
import { Backdrop, Box, CircularProgress, Typography, useTheme } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School'; // Your Logo Icon

// 1. Define the Context Type
interface LoadingContextType {
    isLoading: boolean;
    startLoading: () => void;
    stopLoading: () => void;
}

// 2. Create the Context
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// 3. Create the Provider (Wrapper)
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const theme = useTheme();

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
            
            {/* --- THE GLOBAL LOADER UI --- */}
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 9999, // Highest priority
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Modern "Frosted" white look
                    backdropFilter: 'blur(4px)', // Blur effect
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                }}
                open={isLoading}
            >
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* The Spinner */}
                    <CircularProgress 
                        size={80} 
                        thickness={2} 
                        sx={{ color: theme.palette.primary.main }} 
                    />
                    
                    {/* The Logo Inside */}
                    <Box sx={{ 
                        position: 'absolute', 
                        top: 0, left: 0, bottom: 0, right: 0, 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'pulse 1.5s infinite ease-in-out'
                    }}>
                        <SchoolIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
                    </Box>
                </Box>
                
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: theme.palette.primary.main, 
                        fontWeight: 700, 
                        letterSpacing: 1,
                        animation: 'fadeIn 0.5s'
                    }}
                >
                    Loading...
                </Typography>

                {/* Animation Styles */}
                <style>
                    {`
                    @keyframes pulse {
                        0% { transform: scale(0.95); opacity: 0.7; }
                        50% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(0.95); opacity: 0.7; }
                    }
                    `}
                </style>
            </Backdrop>
        </LoadingContext.Provider>
    );
};

// 4. Create a custom hook for easy usage
export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (!context) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};