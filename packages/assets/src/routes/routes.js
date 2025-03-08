import { Navigate } from 'react-router-dom';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';
import dashboardRoutes from './dashboardRoutes';
import userVerificationRoutes from './userVerificationRoutes';
import userManagementRoutes from './userManagementRoutes';
import adminSettingsRoutes from './adminSettingsRoutes';
import adminReportsRoutes from './adminReportsRoutes';
import { filterRoutesByRole } from './utils';

/**
 * All application routes combined
 */
const allRoutes = [
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  ...authRoutes,
  ...dashboardRoutes,
  ...adminRoutes,
  ...userVerificationRoutes,
  ...userManagementRoutes,
  ...adminSettingsRoutes,
  ...adminReportsRoutes,
  {
    path: '*',
    element: <Navigate to="/login" replace />
  }
];

/**
 * Process nested routes to support the React Router v6 structure with Outlet
 * @param {Array} routes - Array of route objects
 * @returns {Array} Processed routes with children
 */
const processNestedRoutes = (routes) => {
  return routes.map(route => {
    // If the route has children, keep them in the structure
    if (route.children) {
      return route;
    }
    return route;
  });
};

/**
 * Get routes filtered by user role
 * @param {string} role - User role ('user' or 'admin')
 * @returns {Array} Filtered route objects
 */
const getRoutes = (role) => {
  // First filter routes by role
  const filteredRoutes = filterRoutesByRole(allRoutes, role);
  
  // Then process nested routes
  return processNestedRoutes(filteredRoutes);
};

export default getRoutes; 