import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Avatar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  AdminPanelSettings as AdminIcon,
  Google as GoogleIcon 
} from '@mui/icons-material';
import { useAuth } from '../../hooks/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { loginWithGoogle, isAdmin, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    setError('');
    
    try {
      const userData = await loginWithGoogle();
      
      if (userData.role === 'admin') {
        // Admin đăng nhập thành công
        console.log('Admin login successful:', userData.email);
        navigate('/admin/dashboard');
      } else {
        // Không phải admin
        setError('You are not authorized as an admin. Only approved admin emails can access this area.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An error occurred during authentication. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2, bgcolor: '#f9f9f9' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'error.main', width: 56, height: 56 }}>
              <AdminIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h5" color="error.main" fontWeight="bold">
              Admin Login
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
              Restricted access. Only authorized admin emails can sign in.
              <br />
              Currently authorized: linhnguyenvan1902@gmail.com
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mt: 3 }}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? 'Authenticating...' : 'Sign in with Google'}
            </Button>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  Back to Customer Login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin;
