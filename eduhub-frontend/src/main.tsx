import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { BrowserRouter } from 'react-router-dom' 
import { theme } from './theme'
import './index.css'
import App from './App.tsx'

// Import the Loading Provider
import { LoadingProvider } from './context/LoadingContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* Wrap App with LoadingProvider so you can use useLoading() anywhere */}
        <LoadingProvider>
           <App />
        </LoadingProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)