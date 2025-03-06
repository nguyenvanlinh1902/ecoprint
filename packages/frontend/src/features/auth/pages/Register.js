import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, loginWithGoogle } from '../authSlice';
import { FaGoogle } from 'react-icons/fa';
import { useTranslation } from '../../languages/hooks';
import '../styles/login.scss';

const Register = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert(t('auth.passwordMismatch'));
      return;
    }
    dispatch(register(formData));
  };

  const handleGoogleLogin = () => {
    dispatch(loginWithGoogle());
  };

  return (
    <div className="auth-form">
      <h2>{t('auth.register')}</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">{t('common.fullName')}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
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
            minLength="6"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? t('common.processing') : t('auth.register')}
        </button>
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
          <FaGoogle /> {t('auth.registerWithGoogle')}
        </button>
      </div>
      
      <div className="auth-footer">
        <p>
          {t('auth.alreadyHaveAccount')}{' '}
          <Link to="/dang-nhap">{t('auth.login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 