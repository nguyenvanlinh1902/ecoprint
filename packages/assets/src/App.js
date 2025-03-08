import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import AdminLogin from './components/auth/AdminLogin';
import Dashboard from './components/dashboard/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';

const App = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Protected routes - in a real app, these would be protected */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default App;
