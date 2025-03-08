import React from 'react';
import AdminLogin from '../components/auth/AdminLogin';
import AdminDashboard from '../components/admin/AdminDashboard';
import { createRoute } from './routeUtils';

// Define routes with the utility function
const adminRoutes = [
  createRoute("/admin/login", <AdminLogin />, true, ['admin', 'user']), // Login page accessible to all
  createRoute("/admin/dashboard", <AdminDashboard />, true, ['admin']), // Dashboard only for admins
];

export default adminRoutes; 