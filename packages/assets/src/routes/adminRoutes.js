import React from 'react';
import AdminLogin from '../features/auth/AdminLogin';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/admin/Dashboard';
import CustomerManagement from '../components/admin/CustomerManagement';
import TransactionManagement from '../components/admin/TransactionManagement';
import ProductsManagement from '../features/admin/products/ProductsManagement';
import OrdersManagement from '../components/admin/OrdersManagement';

// Admin routes with nested structure
const adminRoutes = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
    roles: ['admin', 'user'] // Login page accessible to all
  },
  {
    path: "/admin/*",
    element: <AdminLayout />,
    roles: ['admin'],
    children: [
      { path: "dashboard", element: <Dashboard /> },
      { path: "customers", element: <CustomerManagement /> },
      { path: "transactions", element: <TransactionManagement /> },
      { path: "products", element: <ProductsManagement /> },
      { path: "orders", element: <OrdersManagement /> },
      { path: "settings", element: <div>Admin Settings</div> },
      // Redirect to dashboard if no subpath is specified
      { path: "", element: <Dashboard /> }
    ]
  }
];

export default adminRoutes; 