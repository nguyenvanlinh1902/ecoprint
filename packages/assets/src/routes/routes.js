import adminRoutes from './adminRoutes';
import authRoutes from './authRoutes';
import dashboardRoutes from './dashboardRoutes';
import userVerificationRoutes from './userVerificationRoutes';
import userManagementRoutes from './userManagementRoutes';
import adminSettingsRoutes from './adminSettingsRoutes';
import adminReportsRoutes from './adminReportsRoutes';
import { filterRoutesByRole } from './routeUtils';

// Combine all routes
const routes = [
  ...authRoutes,
  ...dashboardRoutes,
  ...adminRoutes,
  ...userVerificationRoutes,
  ...userManagementRoutes,
  ...adminSettingsRoutes,
  ...adminReportsRoutes,
];

/**
 * Get routes filtered by user role
 * @param {string} role - User role ('user' or 'admin')
 * @returns {Array} Filtered route objects
 */
export default function Routes(role) {
  return filterRoutesByRole(routes, role);
} 