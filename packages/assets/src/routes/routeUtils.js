/**
 * Create a route configuration object
 * @param {string} path - The route path
 * @param {React.Component} component - The component to render
 * @param {boolean} exact - If the path should match exactly
 * @param {string[]} roles - Array of roles allowed to access this route
 * @returns {Object} Route configuration
 */
export const createRoute = (path, component, exact = true, roles = ['user', 'admin']) => ({
  path,
  element: component,
  exact,
  roles,
});

/**
 * Filter routes based on user role
 * @param {Array} routes - Array of route objects
 * @param {string} role - User role
 * @returns {Array} Filtered routes
 */
export const filterRoutesByRole = (routes, role) => {
  return routes.filter(route => {
    if (route.roles && !route.roles.includes(role)) {
      return false;
    }
    return true;
  });
}; 