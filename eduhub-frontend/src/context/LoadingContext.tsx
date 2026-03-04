import React, { createContext, useContext, useState } from 'react';
import { Backdrop, Box, keyframes } from '@mui/material';

// Faster rotation for the oval effect
const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);

  
  const SleekTaperedArc = () => (
    <path
      d="M 50 10 
         A 40 40 0 0 1 85 75 
         A 35 40 0 0 0 50 10 Z" 
      fill="#032966"
    />
  );

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}

      <Backdrop
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 9999,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
        }}
        open={isLoading}
      >
        <Box
          sx={{
            width: 70,
            height: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Spun up to 0.5s for a high-performance feel
            animation: `${rotate} 0.55s linear infinite`, 
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            {/* Top Arc */}
            <g>
              <SleekTaperedArc />
            </g>
            
            {/* Bottom Arc - Rotated 180deg. 
                */}
            <g transform="rotate(180 50 50)">
              <SleekTaperedArc />
            </g>
          </svg>
        </Box>
      </Backdrop>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};