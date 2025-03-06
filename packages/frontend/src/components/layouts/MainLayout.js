import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaBoxOpen, FaShoppingCart, FaUsers, FaChartLine, FaCog, FaUsersCog, FaClipboardList, FaLanguage } from 'react-icons/fa';
import { ROLES } from '../../constants/roles';
import { logout } from '../../features/auth/authSlice';
import { LanguageSwitcher } from '../../features/languages/components';
import { useTranslation } from '../../features/languages/hooks';
import '../../styles/layouts/_main.scss';

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, role } = useSelector((state) => state.auth);
  const isAdmin = role === ROLES.ADMIN;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    dispatch(logout())
      .unwrap()
      .then(() => {
        navigate('/dang-nhap');
      })
      .catch((error) => {
        console.error('Đăng xuất thất bại:', error);
      });
  };

  const navItems = [
    {
      label: t('dashboard.title'),
      path: '/dashboard',
      icon: <FaChartLine />
    },
    {
      label: t('products.title'),
      path: '/san-pham',
      icon: <FaBoxOpen />
    },
    {
      label: t('orders.title', 'Đơn hàng'),
      path: '/don-hang',
      icon: <FaShoppingCart />
    },
    {
      label: t('customers.title', 'Khách hàng'),
      path: '/khach-hang',
      icon: <FaUsers />
    }
  ];

  // Các menu chỉ dành cho admin
  const adminNavItems = [
    {
      label: t('admin.userManagement', 'Quản lý người dùng'),
      path: '/admin/nguoi-dung',
      icon: <FaUsersCog />
    },
    {
      label: t('admin.translationManagement', 'Quản lý bản dịch'),
      path: '/admin/ngon-ngu',
      icon: <FaLanguage />
    },
    {
      label: t('admin.systemConfig', 'Cấu hình hệ thống'),
      path: '/admin/cau-hinh',
      icon: <FaCog />
    },
    {
      label: t('admin.reports', 'Báo cáo & thống kê'),
      path: '/admin/bao-cao',
      icon: <FaClipboardList />
    }
  ];

  return (
    <div className="main-layout">
      <div className={`main-layout__sidebar ${sidebarOpen ? 'main-layout__sidebar--open' : ''}`}>
        <div className="main-layout__logo">
          <Link to="/dashboard">B2B Manager</Link>
        </div>
        
        <nav className="main-nav">
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path} 
              className="main-nav__item"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="main-nav__icon">{item.icon}</span>
              <span className="main-nav__label">{item.label}</span>
            </Link>
          ))}

          {/* Hiển thị menu admin nếu người dùng có quyền admin */}
          {isAdmin && (
            <>
              <div className="main-nav__divider">
                <span>Admin</span>
              </div>
              {adminNavItems.map((item, index) => (
                <Link 
                  key={`admin-${index}`} 
                  to={item.path} 
                  className="main-nav__item main-nav__item--admin"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="main-nav__icon">{item.icon}</span>
                  <span className="main-nav__label">{item.label}</span>
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
      
      <div className="main-layout__main">
        <header className="main-layout__header">
          <div className="main-layout__toggle" onClick={toggleSidebar}>
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </div>
          
          <div className="header-search">
            <input type="text" placeholder={t('common.search')} />
          </div>
          
          <div className="header-right">
            <LanguageSwitcher />
            
            <div className="user-dropdown">
              <div className="user-dropdown__toggle">
                <div className="user-avatar">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={t('profile.avatar')} />
                  ) : (
                    <FaUser />
                  )}
                </div>
                <span className="user-name">
                  {user?.displayName || t('common.user', 'Người dùng')}
                  {isAdmin && <span className="user-badge">{t('dashboard.admin')}</span>}
                </span>
              </div>
              
              <div className="user-dropdown__menu">
                <Link to="/ho-so" className="user-dropdown__item">{t('profile.title')}</Link>
                <Link to="/settings" className="user-dropdown__item">{t('settings.title', 'Cài đặt')}</Link>
                <div className="user-dropdown__divider"></div>
                <div className="user-dropdown__item" onClick={handleLogout}>
                  <FaSignOutAlt /> {t('common.logout')}
                </div>
              </div>
            </div>
          </div>
        </header>
        
        <main className="main-layout__content">
          <Outlet />
        </main>
        
        <footer className="main-layout__footer">
          &copy; {new Date().getFullYear()} B2B Manager. {t('common.allRightsReserved', 'Tất cả quyền được bảo lưu.')}
        </footer>
      </div>
    </div>
  );
};

export default MainLayout; 