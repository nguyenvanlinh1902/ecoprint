import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaGoogle } from 'react-icons/fa';
import { login, loginWithGoogle } from '../authSlice';
import { useTranslation } from '../../languages/hooks';
import '../styles/login.scss';

const Login = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  const handleGoogleLogin = () => {
    dispatch(loginWithGoogle());
  };

  return (
    <div className="auth-form">
      <h2>{t('auth.login')}</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{t('common.email')}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{t('common.password')}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-actions">
          <Link to="/quen-mat-khau" className="forgot-password">
            {t('auth.forgotPassword')}
          </Link>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.processing') : t('auth.login')}
          </button>
        </div>
      </form>
      
      <div className="social-login">
        <div className="divider">
          <span>{t('auth.orContinueWith')}</span>
        </div>
        
        <button 
          type="button" 
          className="btn btn-google" 
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <FaGoogle /> {t('auth.loginWithGoogle')}
        </button>
      </div>
      
      <div className="auth-footer">
        <p>
          {t('auth.noAccount')}{' '}
          <Link to="/dang-ky">{t('auth.register')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login; 