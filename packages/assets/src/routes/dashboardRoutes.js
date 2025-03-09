import React from 'react';
import UserLayout from '../layouts/UserLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import UserSettings from '../pages/dashboard/UserSettings';
import UserProfile from '../components/dashboard/UserProfile';
import CustomerTransactions from '../components/dashboard/CustomerTransactions';
import ProductCatalog from '../components/dashboard/ProductCatalog';
import UserOrders from '../components/dashboard/UserOrders';

/**
 * Dashboard routes configuration
 * Note: These routes use the /dashboard/* pattern only
 * User-specific routes (/user/*) are now defined in userRoutes.js
 */
const dashboardRoutes = [
  {
    path: "/dashboard",
    element: <UserLayout />,
    roles: ['user', 'admin'],
    children: [
      { path: "", element: <Dashboard />, roles: ['user', 'admin'] },
      { path: "products", element: <ProductCatalog />, roles: ['user', 'admin'] },
      { path: "profile", element: <UserProfile />, roles: ['user', 'admin'] },
      { path: "transactions", element: <CustomerTransactions />, roles: ['user', 'admin'] },
      { path: "orders", element: <UserOrders />, roles: ['user', 'admin'] },
      { path: "settings", element: <UserSettings />, roles: ['user', 'admin'] }
    ]
  }
];

export default dashboardRoutes; 