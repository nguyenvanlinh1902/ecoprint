import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Avatar,
  FormControlLabel,
  Checkbox,
  Grid,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  LockOutlined as LockOutlinedIcon,
  Google as GoogleIcon 
} from '@mui/icons-material';
import { useAuth } from '../../hooks';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const user = await login(formData.email, formData.password);
      
      if (user.isVerified) {
        navigate('/dashboard');
      } else {
        navigate('/pending-verification');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    
    try {
      const userData = await loginWithGoogle();
      
      if (userData.isVerified) {
        navigate('/dashboard');
      } else {
        navigate('/pending-verification');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Error signing in with Google');
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
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Customer Login
            </Typography>
          </Box>

          {(error || authError) && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error || authError}
            </Alert>
          )}

          <Box sx={{ mt: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={loading ? <CircularProgress size={24} color="inherit" /> : <GoogleIcon />}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              Sign in with Google
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link to="#" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Forgot password?
                  </Typography>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Don't have an account? Sign up
                  </Typography>
                </Link>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Link to="/admin/login" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="secondary">
                  Admin Login
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
