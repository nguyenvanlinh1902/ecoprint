import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { initializeAuth } from './features/auth/authSlice';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import ResetPassword from './features/auth/pages/ResetPassword';
import Dashboard from './features/dashboard/pages/Dashboard';
import NotFound from './features/common/pages/NotFound';
import AccessDenied from './features/common/pages/AccessDenied';
import ProfilePage from './features/profile/pages/ProfilePage';

// Products
import ProductListPage from './features/products/pages/ProductListPage';
import ProductDetailPage from './features/products/pages/ProductDetailPage';
import ProductFormPage from './features/products/pages/ProductFormPage';

// Orders
import { 
  OrdersListPage, 
  OrderDetailPage, 
  CreateOrderPage, 
  EditOrderPage 
} from './features/orders/pages';

// Protected Routes
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized, role } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="app-loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
        <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} />
        
        {/* Legacy Vietnamese paths - redirect to English versions */}
        <Route path="/dang-nhap" element={<Navigate to="/login" />} />
        <Route path="/dang-ky" element={<Navigate to="/register" />} />
        <Route path="/quen-mat-khau" element={<Navigate to="/forgot-password" />} />
      </Route>

      {/* Access Denied Page */}
      <Route path="/access-denied" element={<AccessDenied />} />
      <Route path="/khong-co-quyen-truy-cap" element={<Navigate to="/access-denied" />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Navigate to="/" />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/ho-so" element={<Navigate to="/profile" />} />
          
          {/* Product Management */}
          <Route path="/products">
            <Route index element={<Navigate to="/products/list" />} />
            <Route path="list" element={<ProductListPage />} />
            <Route path="new" element={<ProductFormPage />} />
            <Route path=":productId" element={<ProductDetailPage />} />
            <Route path=":productId/edit" element={<ProductFormPage />} />
          </Route>
          
          {/* Legacy Vietnamese product paths - redirect to English versions */}
          <Route path="/san-pham/*" element={<Navigate to="/products" />} />
          
          {/* Order Management */}
          <Route path="/orders">
            <Route index element={<Navigate to="/orders/list" />} />
            <Route path="list" element={<OrdersListPage />} />
            <Route path="new" element={<CreateOrderPage />} />
            <Route path=":orderId" element={<OrderDetailPage />} />
            <Route path=":orderId/edit" element={<EditOrderPage />} />
          </Route>
          
          {/* Legacy Vietnamese order paths - redirect to English versions */}
          <Route path="/don-hang/*" element={<Navigate to="/orders" />} />
          
          {/* Shipping Management */}
          <Route path="/shipping/*" element={<Navigate to="/shipping/list" />} />
          <Route path="/van-chuyen/*" element={<Navigate to="/shipping" />} />
          
          {/* Payment Management */}
          <Route path="/payments/*" element={<Navigate to="/payments/balance" />} />
          <Route path="/thanh-toan/*" element={<Navigate to="/payments" />} />
          
          {/* Affiliate */}
          <Route path="/affiliate/*" element={<Navigate to="/affiliate/list" />} />
          
          {/* Logistics and Suppliers */}
          <Route path="/suppliers/*" element={<Navigate to="/suppliers/list" />} />
          <Route path="/nha-cung-cap/*" element={<Navigate to="/suppliers" />} />
        </Route>
      </Route>

      {/* Admin Routes - Only admins can access */}
      <Route element={<AdminRoute isAuthenticated={isAuthenticated} userRole={role} />}>
        <Route element={<MainLayout />}>
          {/* User Management - Admin only */}
          <Route path="/admin/users" element={<div>User Management - Admin only</div>} />
          <Route path="/admin/nguoi-dung" element={<Navigate to="/admin/users" />} />
          
          {/* System Configuration - Admin only */}
          <Route path="/admin/settings" element={<div>System Settings - Admin only</div>} />
          <Route path="/admin/cau-hinh" element={<Navigate to="/admin/settings" />} />
          
          {/* Reports & Statistics - Admin only */}
          <Route path="/admin/reports" element={<div>Reports & Statistics - Admin only</div>} />
          <Route path="/admin/bao-cao" element={<Navigate to="/admin/reports" />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App; 