/**
 * Creates a route configuration object
 * @param {string} path - Route path
 * @param {React.Component} element - Component to render
 * @param {string[]} roles - Roles allowed to access this route
 * @param {boolean} exact - Whether path should match exactly
 * @returns {Object} Route configuration
 */
export const createRoute = (path, element, roles = ['user', 'admin'], exact = true) => ({
  path,
  element,
  roles,
  exact,
});

/**
 * Filters routes based on user role
 * @param {Array} routes - Route objects
 * @param {string} role - User role
 * @returns {Array} Filtered routes
 */
export const filterRoutesByRole = (routes, role) => {
  return routes.filter(route => {
    // Allow routes with no roles specified or routes that include current role
    return !route.roles || route.roles.includes(role);
  });
}; 