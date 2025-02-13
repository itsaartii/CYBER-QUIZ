import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Home from './pages/Home';
import QuizPage from './pages/QuizPage';
import Results from './components/Results';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import ProtectedRoute from './components/ProtectedRoute';
import StudentProtectedRoute from './components/StudentProtectedRoute';
import ThemeManager from './components/ThemeManager';

// Create theme with responsive breakpoints
const theme = createTheme({
  palette: {
    primary: {
      main: '#0984e3',
      light: '#74b9ff',
      dark: '#0652DD',
    },
    secondary: {
      main: '#6c757d',
      light: '#a4b0be',
      dark: '#2d3436',
    },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    text: {
      primary: '#2d3436',
      secondary: '#636e72',
    },
  },
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
      fontWeight: 600,
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontSize: '1.75rem',
      fontWeight: 500,
      '@media (min-width:600px)': {
        fontSize: '2rem',
      },
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          transition: 'background-color 0.3s, color 0.3s',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
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
              {/* Student Authentication Routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/signup" element={<StudentSignup />} />

              {/* Protected Student Routes */}
              <Route path="/" element={
                <StudentProtectedRoute>
                  <Home />
                </StudentProtectedRoute>
              } />
              <Route path="/quiz" element={
                <StudentProtectedRoute>
                  <QuizPage />
                </StudentProtectedRoute>
              } />
              <Route path="/results" element={
                <StudentProtectedRoute>
                  <Results />
                </StudentProtectedRoute>
              } />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } />

              {/* Redirect unmatched routes to login */}
              <Route path="*" element={<Navigate to="/student/login" replace />} />
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
          <ThemeManager />
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 