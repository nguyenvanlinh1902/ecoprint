import React from 'react';
import { Box, Paper, Typography, Divider, Alert, Button } from '@mui/material';
import { useAuth } from '../../hooks/api';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Component hiển thị thông tin debug về trạng thái xác thực
 * Sử dụng component này để xác định vấn đề với quá trình xác thực
 */
const AuthDebugInfo = () => {
  const { user, isAuthenticated, isAdmin, error, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Lấy thông tin token từ localStorage
  const token = localStorage.getItem('auth_token');
  const storedUserData = localStorage.getItem('user_data');
  
  // Handle force logout for debugging
  const handleForceLogout = () => {
    logout();
    navigate('/login');
  };
  
  // Handle force refresh token for debugging
  const handleForceRefresh = () => {
    // Dispatch auth state change event to force re-check
    window.dispatchEvent(new Event('auth-state-change'));
  };
  
  return (
    <Paper sx={{ p: 2, m: 2, maxWidth: '100%', overflowX: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Authentication Debug Information
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Current Location:</Typography>
        <Alert severity="info">
          Path: {location.pathname}
        </Alert>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Authentication Status:</Typography>
        <Alert severity={isAuthenticated ? "success" : "error"}>
          {isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </Alert>
      </Box>
      
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1">Auth Error:</Typography>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">User Object from Hook:</Typography>
        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
          <pre style={{ margin: 0, overflowX: 'auto' }}>
            {JSON.stringify(user, null, 2) || "null"}
          </pre>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Role:</Typography>
        <Alert severity={isAdmin ? "warning" : "info"}>
          {isAdmin ? "Admin" : user?.role || "No Role"}
        </Alert>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Token in localStorage:</Typography>
        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
          <Typography variant="body2" 
            sx={{ 
              wordBreak: 'break-all',
              whiteSpace: 'normal',
              fontFamily: 'monospace'
            }}>
            {token || "No token found"}
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">User Data in localStorage:</Typography>
        <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
          <pre style={{ margin: 0, overflowX: 'auto' }}>
            {storedUserData ? JSON.stringify(JSON.parse(storedUserData), null, 2) : "No user data found"}
          </pre>
        </Paper>
      </Box>
      
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <Button variant="contained" color="error" onClick={handleForceLogout}>
          Force Logout
        </Button>
        <Button variant="contained" color="warning" onClick={handleForceRefresh}>
          Force Refresh Auth
        </Button>
      </Box>
    </Paper>
  );
};

export default AuthDebugInfo; 