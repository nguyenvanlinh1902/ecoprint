import React from 'react';
import { Route } from 'react-router-dom';

// Placeholder component
const AdminReports = () => <div>Admin Reports Component</div>;

const adminReportsRoutes = [
  {
    path: "/admin/reports",
    element: <AdminReports />,
    exact: true,
  },
];

export default adminReportsRoutes; 