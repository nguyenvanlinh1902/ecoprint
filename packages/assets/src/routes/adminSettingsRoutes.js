import React from 'react';
import Settings from '../pages/admin/Settings';

/**
 * Admin settings routes configuration
 */
const adminSettingsRoutes = [
  {
    path: "/admin/settings",
    element: <Settings />,
    roles: ['admin', 'user'],
    exact: true,
  },
];

export default adminSettingsRoutes; 