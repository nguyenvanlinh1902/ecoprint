import React, { useState, useEffect } from 'react';
import { useRoutes } from 'react-router-dom';
import getRoutes from './routes';

/**
 * Main application component
 */
const App = () => {
  const [userRole, setUserRole] = useState('user'); // Default to 'user' role

  const updateRole = () => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user && user.role) {
          setUserRole(user.role);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setUserRole('user');
    }
  };

  useEffect(() => {
    // Initial role update
    updateRole();
    
    // Listen for auth state changes
    const handleAuthChange = () => {
      updateRole();
    };
    
    // Add event listener for auth state changes
    window.addEventListener('auth-state-change', handleAuthChange);
    
    // Clean up
    return () => {
      window.removeEventListener('auth-state-change', handleAuthChange);
    };
  }, []);

  const routes = getRoutes(userRole);
  
  return useRoutes(routes);
};

export default App;
