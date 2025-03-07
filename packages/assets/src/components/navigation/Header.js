import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBars, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../features/auth/authSlice';
import './Header.scss';

const Header = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const { user, role } = useSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <header className="header">
      <div className="header__left">
        <button className="header__toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <div className="header__logo">
          <Link to="/">EcoPrint Admin</Link>
        </div>
      </div>
      
      <div className="header__search">
        <input type="text" placeholder="Search..." />
      </div>
      
      <div className="header__right">
        <div className="user-dropdown">
          <div className="user-dropdown__toggle">
            <div className="user-avatar">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User avatar" />
              ) : (
                <FaUser />
              )}
            </div>
            <span className="user-name">
              {user?.displayName || 'User'}
              {role === 'admin' && <span className="user-badge">Admin</span>}
            </span>
          </div>
          
          <div className="user-dropdown__menu">
            <Link to="/profile" className="user-dropdown__item">Profile</Link>
            <Link to="/settings" className="user-dropdown__item">Settings</Link>
            <div className="user-dropdown__divider"></div>
            <button className="user-dropdown__item" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 