import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Paper,
  Container,
  Avatar,
  Alert
} from '@mui/material';
import { HourglassEmpty as PendingIcon } from '@mui/icons-material';

const PendingVerification = () => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    navigate('/login');
  };

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
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ m: 1, bgcolor: 'warning.main', width: 56, height: 56 }}>
              <PendingIcon fontSize="large" />
            </Avatar>
            <Typography component="h1" variant="h5" color="warning.main" gutterBottom fontWeight="bold">
              Account Pending Verification
            </Typography>
            <Typography variant="body1" color="text.secondary" align="center">
              Your account has been registered but requires verification before you can access the system.
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>What happens next?</strong>
              <ul>
                <li>Our team will review your account details</li>
                <li>You will receive an email notification when your account is verified</li>
                <li>This typically takes 1-2 business days</li>
              </ul>
            </Typography>
          </Alert>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={handleBackToLogin}
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default PendingVerification; 