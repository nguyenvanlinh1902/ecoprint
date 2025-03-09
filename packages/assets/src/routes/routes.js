import { Navigate } from 'react-router-dom';
import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';
import dashboardRoutes from './dashboardRoutes';
import userVerificationRoutes from './userVerificationRoutes';
import userManagementRoutes from './userManagementRoutes';
import adminSettingsRoutes from './adminSettingsRoutes';
import adminReportsRoutes from './adminReportsRoutes';
import userRoutes from './userRoutes';
import { filterRoutesByRole } from './utils';
import { ProtectedRoute } from '../components/shared';
import NotFound from '../pages/NotFound';

/**
 * All application routes combined
 */
const allRoutes = [
  // Open routes (no auth required)
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  ...authRoutes,
  
  // User /dashboard/* routes
  {
    element: <ProtectedRoute />,
    children: dashboardRoutes
  },
  
  // User /user/* routes
  ...userRoutes,
  
  // Admin routes (requires admin role)
  {
    element: <ProtectedRoute requiredRole="admin" />,
    children: [
      ...adminRoutes.filter(route => route.path !== '/admin/login'),
      ...userVerificationRoutes,
      ...userManagementRoutes,
      ...adminSettingsRoutes,
      ...adminReportsRoutes,
    ]
  },
  
  // Admin login route (not protected)
  ...adminRoutes.filter(route => route.path === '/admin/login'),
  
  // Catch-all route - display NotFound page
  {
    path: '*',
    element: <NotFound />
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
  const processedRoutes = processNestedRoutes(filteredRoutes);
  
  return processedRoutes;
};

export default getRoutes; 