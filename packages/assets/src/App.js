import React from 'react';
import { useRoutes } from 'react-router-dom';
import getRoutes from './routes';

/**
 * Main application component
 */
const App = () => {
  const userRole = 'admin'; // Default role for development
  const routes = getRoutes(userRole);
  
  return useRoutes(routes);
};

export default App;
