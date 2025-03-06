import React from 'react';
import { Link } from 'react-router-dom';
import '../../auth/styles/auth.scss';

/**
 * Trang hiển thị khi người dùng không có quyền truy cập
 */
const AccessDenied = () => {
  return (
    <div className="access-denied-page">
      <div className="access-denied-container">
        <div className="access-denied-icon">
          <i className="fas fa-lock"></i>
        </div>
        <h1>Không có quyền truy cập</h1>
        <p>
          Bạn không có quyền truy cập vào trang này. Chỉ tài khoản Admin mới có thể truy cập.
        </p>
        <p>
          Vui lòng liên hệ người quản trị hệ thống nếu bạn tin rằng đây là sự cố.
        </p>
        <div className="access-denied-actions">
          <Link to="/" className="btn btn-primary">
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied; 