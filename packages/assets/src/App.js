import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import getRoutes from './routes';

const App = () => {
  // For testing purposes, always set role to admin
  const userRole = 'admin';
  
  // Get allowed routes based on user role
  const allowedRoutes = getRoutes(userRole);
  
  return (
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />
      
      {/* Map all allowed routes */}
      {allowedRoutes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={route.element}
          exact={route.exact}
        />
      ))}
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
