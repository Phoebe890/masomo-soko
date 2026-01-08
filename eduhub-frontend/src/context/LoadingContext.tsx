import React, { createContext, useContext, useState } from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

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

    const startLoading = () => setIsLoading(true);
    const stopLoading = () => setIsLoading(false);

    return (
        <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
            {children}
            
            {/* --- SIMPLE GLOBAL LOADER --- */}
            <Backdrop
                sx={{
                    // High z-index to sit on top of everything
                    zIndex: (theme) => theme.zIndex.drawer + 9999,
                    // Simple transparent black background (standard dimming)
                    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
                    color: '#fff',
                }}
                open={isLoading}
            >
                <CircularProgress color="primary" size={60} thickness={4} />
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