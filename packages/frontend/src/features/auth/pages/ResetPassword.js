import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { confirmPasswordReset } from '../authSlice';

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  
  useEffect(() => {
    // Validate token (optional)
    if (!token) {
      // Handle invalid token case
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }
    
    dispatch(confirmPasswordReset({ token, newPassword: formData.password }));
  };

  return (
    <div className="auth-form">
      <h2>Đặt lại mật khẩu</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      {success ? (
        <div className="auth-success">
          <p>
            Mật khẩu của bạn đã được đặt lại thành công.
          </p>
          <Link to="/dang-nhap" className="btn btn-primary">
            Đăng nhập ngay
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Mật khẩu mới</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
            />
            <small>Mật khẩu cần có ít nhất 6 ký tự</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu mới</label>
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
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword; 