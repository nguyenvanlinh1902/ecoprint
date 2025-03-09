import React from 'react';
import UserProfile from '../components/dashboard/UserProfile';
import UserLayout from '../layouts/UserLayout';
import { ProtectedRoute } from '../components/shared';
import CustomerTransactions from '../components/dashboard/CustomerTransactions';
import ProductCatalog from '../components/dashboard/ProductCatalog';
import UserOrders from '../components/dashboard/UserOrders';
import UserSettings from '../pages/dashboard/UserSettings';
import Dashboard from '../pages/dashboard/Dashboard';

/**
 * User specific routes configuration
 */
const userRoutes = [
  {
    path: "/user",
    element: <ProtectedRoute />,
    children: [
      {
        element: <UserLayout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "profile", element: <UserProfile /> },
          { path: "transactions", element: <CustomerTransactions /> },
          { path: "orders", element: <UserOrders /> },
          { path: "products", element: <ProductCatalog /> },
          { path: "settings", element: <UserSettings /> }
        ]
      }
    ]
  }
];

export default userRoutes; 