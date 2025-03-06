import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { ROLES } from '../../../constants/roles';
import '../styles/dashboard.scss';

const Dashboard = () => {
  const { user, role } = useSelector((state) => state.auth);
  const isAdmin = role === ROLES.ADMIN;

  return (
    <div className="dashboard-page">
      <h1>Tổng quan hệ thống</h1>
      
      {/* Thông tin người dùng */}
      <div className="user-info-card">
        <h2>Thông tin tài khoản</h2>
        <div className="user-info-content">
          <div className="user-avatar">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className="user-details">
            <h3>{user?.displayName || 'Người dùng'}</h3>
            <p>Email: {user?.email}</p>
            <p>Quyền hạn: <span className={`role-badge ${isAdmin ? 'role-admin' : 'role-user'}`}>
              {isAdmin ? 'Quản trị viên' : 'Người dùng'}
            </span></p>
            {isAdmin && (
              <div className="admin-actions">
                <p>Bạn có quyền truy cập vào các chức năng quản trị hệ thống.</p>
                <div className="admin-links">
                  <Link to="/admin/nguoi-dung" className="admin-link">Quản lý người dùng</Link>
                  <Link to="/admin/cau-hinh" className="admin-link">Cấu hình hệ thống</Link>
                  <Link to="/admin/bao-cao" className="admin-link">Báo cáo & thống kê</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <div className="stats-card">
          <h3>Đơn hàng</h3>
          <div className="stats-value">0</div>
        </div>
        <div className="stats-card">
          <h3>Sản phẩm</h3>
          <div className="stats-value">0</div>
        </div>
        <div className="stats-card">
          <h3>Khách hàng</h3>
          <div className="stats-value">0</div>
        </div>
        <div className="stats-card">
          <h3>Doanh thu</h3>
          <div className="stats-value">0₫</div>
        </div>
      </div>
      <div className="dashboard-recent">
        <h2>Hoạt động gần đây</h2>
        <p>Chưa có hoạt động nào.</p>
      </div>
    </div>
  );
};

export default Dashboard; 