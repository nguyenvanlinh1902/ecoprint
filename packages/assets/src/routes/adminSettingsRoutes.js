import React from 'react';
import { Route } from 'react-router-dom';

// Placeholder component
const AdminSettings = () => <div>Admin Settings Component</div>;

const adminSettingsRoutes = [
  {
    path: "/admin/settings",
    element: <AdminSettings />,
    exact: true,
  },
];

export default adminSettingsRoutes; 