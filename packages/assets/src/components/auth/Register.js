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
  Grid,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Google as GoogleIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks';

const Register = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading, error: authError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);

  const validateField = (name, value) => {
    let errorMessage = '';
    
    switch (name) {
      case 'email':
        if (!value) {
          errorMessage = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errorMessage = 'Email is invalid';
        }
        break;
      case 'password':
        if (!value) {
          errorMessage = 'Password is required';
        } else if (value.length < 6) {
          errorMessage = 'Password must be at least 6 characters';
        }
        break;
      case 'confirmPassword':
        if (value !== formData.password) {
          errorMessage = 'Passwords do not match';
        }
        break;
      case 'fullName':
        if (!value) {
          errorMessage = 'Full name is required';
        }
        break;
      case 'phone':
        if (value && !/^[0-9]{10,11}$/.test(value)) {
          errorMessage = 'Phone number must be 10-11 digits';
        }
        break;
      default:
        break;
    }

    return errorMessage;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate the field as the user types
    const errorMessage = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: errorMessage
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    Object.keys(formData).forEach(key => {
      const errorMessage = validateField(key, formData[key]);
      if (errorMessage) {
        errors[key] = errorMessage;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    try {
      // Register with API
      const result = await register(formData);
      
      if (result.success) {
        setPendingVerification(true);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed: ' + error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    
    try {
      const userData = await loginWithGoogle();
      
      // After Google sign-in, user is pending verification
      setPendingVerification(true);
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Error signing in with Google');
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  if (pendingVerification) {
    return (
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography component="h1" variant="h5" color="primary" gutterBottom>
                Account Verification Pending
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your account has been registered but requires verification.
                You will receive an email with further instructions.
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              Please check your email for verification instructions.
            </Alert>
            
            <Button
              fullWidth
              variant="outlined"
              onClick={handleBackToLogin}
            >
              Back to Login
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <PersonAddIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Create an Account
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
              Sign up with Google
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="fullName"
                  label="Full Name"
                  name="fullName"
                  autoComplete="name"
                  value={formData.fullName}
                  onChange={handleChange}
                  error={!!formErrors.fullName}
                  helperText={formErrors.fullName}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!formErrors.phone}
                  helperText={formErrors.phone}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!formErrors.password}
                  helperText={formErrors.password}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!formErrors.confirmPassword}
                  helperText={formErrors.confirmPassword}
                  disabled={loading}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography variant="body2" color="primary">
                    Already have an account? Sign in
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register; 