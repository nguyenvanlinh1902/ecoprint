import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { initializeAuth } from './features/auth/authSlice';
import { LanguageProvider } from './features/languages/contexts/LanguageProvider';

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

// Translations
import TranslationsAdminPage from './features/languages/pages/TranslationsAdminPage';

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
    <LanguageProvider>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/dang-nhap" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/dang-ky" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          <Route path="/quen-mat-khau" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />
          <Route path="/reset-password/:token" element={!isAuthenticated ? <ResetPassword /> : <Navigate to="/" />} />
        </Route>

        {/* Trang từ chối truy cập */}
        <Route path="/khong-co-quyen-truy-cap" element={<AccessDenied />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Navigate to="/" />} />
            <Route path="/ho-so" element={<ProfilePage />} />
            
            {/* Quản lý sản phẩm */}
            <Route path="/san-pham">
              <Route index element={<Navigate to="/san-pham/danh-sach" />} />
              <Route path="danh-sach" element={<ProductListPage />} />
              <Route path="them-moi" element={<ProductFormPage />} />
              <Route path="chi-tiet/:productId" element={<ProductDetailPage />} />
              <Route path="chinh-sua/:productId" element={<ProductFormPage />} />
            </Route>
            
            {/* Quản lý đơn hàng */}
            <Route path="/don-hang">
              <Route index element={<Navigate to="/don-hang/danh-sach" />} />
              <Route path="danh-sach" element={<OrdersListPage />} />
              <Route path="them-moi" element={<CreateOrderPage />} />
              <Route path=":orderId" element={<OrderDetailPage />} />
              <Route path=":orderId/edit" element={<EditOrderPage />} />
            </Route>
            
            {/* English Order Routes */}
            <Route path="/orders">
              <Route index element={<OrdersListPage />} />
              <Route path="new" element={<CreateOrderPage />} />
              <Route path=":orderId" element={<OrderDetailPage />} />
              <Route path=":orderId/edit" element={<EditOrderPage />} />
            </Route>
            
            {/* Quản lý vận chuyển */}
            <Route path="/van-chuyen/*" element={<Navigate to="/van-chuyen/danh-sach" />} />
            
            {/* Quản lý thanh toán */}
            <Route path="/thanh-toan/*" element={<Navigate to="/thanh-toan/so-du" />} />
            
            {/* Affiliate */}
            <Route path="/affiliate/*" element={<Navigate to="/affiliate/danh-sach" />} />
            
            {/* Logistics và nhà cung cấp */}
            <Route path="/nha-cung-cap/*" element={<Navigate to="/nha-cung-cap/danh-sach" />} />
          </Route>
        </Route>

        {/* Admin Routes - Chỉ admin mới có quyền truy cập */}
        <Route element={<AdminRoute isAuthenticated={isAuthenticated} userRole={role} />}>
          <Route element={<MainLayout />}>
            {/* Quản lý người dùng - Chỉ admin mới có quyền */}
            <Route path="/admin/nguoi-dung" element={<div>Quản lý người dùng - Chỉ Admin mới thấy</div>} />
            
            {/* Quản lý bản dịch - Chỉ admin mới có quyền */}
            <Route path="/admin/ngon-ngu" element={<TranslationsAdminPage />} />
            
            {/* Quản lý cấu hình hệ thống - Chỉ admin mới có quyền */}
            <Route path="/admin/cau-hinh" element={<div>Quản lý cấu hình - Chỉ Admin mới thấy</div>} />
            
            {/* Báo cáo & thống kê - Chỉ admin mới có quyền */}
            <Route path="/admin/bao-cao" element={<div>Báo cáo & thống kê - Chỉ Admin mới thấy</div>} />
          </Route>
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </LanguageProvider>
  );
};

export default App; 