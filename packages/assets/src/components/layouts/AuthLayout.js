import React from 'react';
import { Outlet } from 'react-router-dom';
import './AuthLayout.scss';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-logo">
          <img src="/logo.png" alt="EcoPrint" />
        </div>
        <div className="auth-content">
          <Outlet />
        </div>
        <div className="auth-footer">
          <p>&copy; {new Date().getFullYear()} EcoPrint. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 