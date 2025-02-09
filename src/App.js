import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// Import pages
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';
import Results from './pages/Results';

// Create theme with responsive breakpoints
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            minHeight: '100vh',
            backgroundColor: '#f5f5f5',
            padding: { xs: 1, sm: 2 },
            paddingBottom: { xs: '60px', sm: '70px' },
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Container 
            maxWidth="lg" 
            sx={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/results" element={<Results />} />
            </Routes>
          </Container>
          <Box
            component="footer"
            sx={{
              py: 1,
              px: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              textAlign: 'center',
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <Typography variant="body2">
              Website created by CYBER SQUAD
            </Typography>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 