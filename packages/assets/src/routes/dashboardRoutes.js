import React from 'react';
import UserLayout from '../layouts/UserLayout';
import Dashboard from '../pages/dashboard/Dashboard';
import UserSettings from '../pages/dashboard/UserSettings';
import UserProfile from '../components/dashboard/UserProfile';
import CustomerTransactions from '../components/dashboard/CustomerTransactions';
import ProductCatalog from '../components/dashboard/ProductCatalog';
import UserOrders from '../components/dashboard/UserOrders';

/**
 * User dashboard routes configuration
 */
const dashboardRoutes = [
  {
    path: "/dashboard/*",
    element: <UserLayout />,
    roles: ['user', 'admin'],
    children: [
      { path: "", element: <Dashboard /> },
      { path: "products", element: <ProductCatalog /> },
      { path: "profile", element: <UserProfile /> },
      { path: "transactions", element: <CustomerTransactions /> },
      { path: "orders", element: <UserOrders /> },
      { path: "settings", element: <UserSettings /> }
    ]
  }
];

export default dashboardRoutes; 