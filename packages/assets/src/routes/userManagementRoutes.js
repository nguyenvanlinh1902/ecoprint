import React from 'react';
import { Route } from 'react-router-dom';

// We'll need to create a UserManagement component later
const UserManagement = () => <div>User Management Component</div>;

const userManagementRoutes = [
  {
    path: "/admin/user-management",
    element: <UserManagement />,
    exact: true,
  },
];

export default userManagementRoutes; 