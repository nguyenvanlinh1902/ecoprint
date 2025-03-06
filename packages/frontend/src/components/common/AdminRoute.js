import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ROLES } from '../../constants/roles';

/**
 * Component bảo vệ các route chỉ dành cho admin
 * Nếu người dùng không phải admin, chuyển hướng đến trang không có quyền truy cập
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isAuthenticated - Trạng thái đã đăng nhập
 * @param {string} props.userRole - Vai trò của người dùng hiện tại
 * @returns {JSX.Element} - Route được bảo vệ
 */
const AdminRoute = ({ isAuthenticated, userRole }) => {
  // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" replace />;
  }
  
  // Nếu đã đăng nhập nhưng không phải admin, chuyển hướng đến trang từ chối truy cập
  if (userRole !== ROLES.ADMIN) {
    return <Navigate to="/khong-co-quyen-truy-cap" replace />;
  }

  // Nếu là admin, hiển thị nội dung của route
  return <Outlet />;
};

AdminRoute.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  userRole: PropTypes.string,
};

AdminRoute.defaultProps = {
  userRole: null,
};

export default AdminRoute; 