import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';
import { useAuth } from '../../hooks/api';

/**
 * Protected Route component to check authentication before rendering children
 * @returns {JSX.Element} Protected content or redirect
 */
const ProtectedRoute = ({ requiredRole }) => {
  const location = useLocation();
  const { isAuthenticated, user, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        // Artificial delay to prevent flickering
        await new Promise(resolve => setTimeout(resolve, 100));
        setIsChecking(false);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsChecking(false);
      }
    };

    checkAuth();
  }, [location.pathname, isAuthenticated, user, requiredRole]);

  // Show loading while checking authentication
  if (loading || isChecking) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Store the location they were trying to go to for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role (if specified)
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on role
    const dashboardPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    
    // Redirect user to their dashboard
    return <Navigate to={dashboardPath} replace />;
  }

  // If authenticated and has required role, show the protected content
  return <Outlet />;
};

export default ProtectedRoute; 