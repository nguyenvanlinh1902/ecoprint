import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { LanguageSwitcher } from '../../features/languages/components';
import { useTranslation } from '../../features/languages/hooks';
import '../../styles/layouts/_auth.scss';

const AuthLayout = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="auth-layout">
      <div className="auth-layout__sidebar">
        <div className="auth-layout__logo">
          <Link to="/">
            B2B Manager
          </Link>
        </div>
        <div className="auth-layout__welcome">
          <h1>{t('common.welcome')}</h1>
          <p>
            {t('auth.loginSubtitle')}
          </p>
        </div>
        <div className="auth-layout__footer">
          &copy; {currentYear} B2B Manager. Bản quyền thuộc về công ty.
        </div>
      </div>
      <div className="auth-layout__content">
        <LanguageSwitcher />
        <div className="auth-layout__card">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 