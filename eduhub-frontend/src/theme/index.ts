import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2F6BFF',
    },
    secondary: {
      main: '#0E243C',
    },
  },
  typography: {
    // Specifying the stack clearly
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: {
      textTransform: 'none', 
      fontWeight: 600
    },
  },
  components: {
    // This locks the font inside Material UI's internal global styles
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          fontFamily: "'Inter', sans-serif !important",
        },
      },
    },
  },
});