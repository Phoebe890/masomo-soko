import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router-dom' 
import { GoogleOAuthProvider } from '@react-oauth/google' // Import Google Provider

import { theme } from './theme'
import './index.css'
import App from './App.tsx'

// Import the Loading Provider
import { LoadingProvider } from './context/LoadingContext'


const GOOGLE_CLIENT_ID = "313137740506-6jq68bnlrbd47m324atfv8cbhhmkkso7.apps.googleusercontent.com";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 1. Wrap everything with Google Provider */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          {/* 2. Wrap App with LoadingProvider */}
          <LoadingProvider>
             <App />
          </LoadingProvider>
        </BrowserRouter>
      </ThemeProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)