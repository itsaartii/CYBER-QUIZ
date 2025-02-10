import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real application, you would want to hash the password and use environment variables
    if (username === 'admin' && password === 'cybersquad2024') {
      localStorage.setItem('adminAuthenticated', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 400,
          width: '100%',
          backgroundColor: 'var(--card-bg)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Admin Login
        </Typography>
        <form onSubmit={handleLogin}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Username"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
          >
            Login
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin; 