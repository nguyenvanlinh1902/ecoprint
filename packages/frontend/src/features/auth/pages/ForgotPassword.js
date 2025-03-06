import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../authSlice';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(resetPassword(email));
    setSubmitted(true);
  };

  return (
    <div className="auth-form">
      <h2>Quên mật khẩu</h2>
      
      {error && <div className="auth-error">{error}</div>}
      
      {submitted && !error ? (
        <div className="auth-success">
          <p>
            Email hướng dẫn đặt lại mật khẩu đã được gửi tới {email}.
            Vui lòng kiểm tra hộp thư của bạn.
          </p>
          <Link to="/dang-nhap" className="btn btn-primary">
            Quay lại đăng nhập
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
            />
            <small>
              Nhập email đã đăng ký của bạn để nhận hướng dẫn đặt lại mật khẩu.
            </small>
          </div>
          
          <div className="form-actions">
            <Link to="/dang-nhap" className="auth-back">
              Quay lại đăng nhập
            </Link>
            
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Gửi hướng dẫn'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword; 