import { useState, useEffect, useCallback } from 'react';
import { signInWithGoogle } from '../firebase';
import useApi from './useApi';

/**
 * Custom hook để xử lý các vấn đề xác thực người dùng
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { post, get } = useApi();

  // Kiểm tra người dùng đã đăng nhập chưa khi component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  /**
   * Đăng ký người dùng mới
   * @param {Object} userData - Thông tin người dùng
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      // Loại bỏ trường confirmPassword trước khi gửi lên server
      const { confirmPassword, ...registrationData } = userData;
      
      const response = await post('/users/register', registrationData);
      return response;
    } catch (error) {
      setError(error.message || 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [post]);

  /**
   * Đăng nhập bằng email và password
   * @param {string} email - Email
   * @param {string} password - Password
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // Giả lập đăng nhập thành công - trong thực tế sẽ gọi API
      const mockUser = {
        id: '123456',
        email,
        fullName: 'Test User',
        role: email === 'linhnguyenvan1902@gmail.com' ? 'admin' : 'user',
        isVerified: true,
      };

      // Lưu thông tin người dùng vào local storage
      localStorage.setItem('auth_token', 'mock_token_' + Date.now());
      localStorage.setItem('user_data', JSON.stringify(mockUser));
      
      setUser(mockUser);
      return mockUser;
    } catch (error) {
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Đăng nhập bằng Google
   */
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        const { user: googleUser } = result;
        
        // Trong thực tế sẽ gọi API để xác thực với backend
        // Giả lập phần xác thực
        const userData = {
          id: googleUser.uid,
          email: googleUser.email,
          fullName: googleUser.displayName || '',
          photoURL: googleUser.photoURL || '',
          role: googleUser.email === 'linhnguyenvan1902@gmail.com' ? 'admin' : 'user',
          isVerified: googleUser.email === 'linhnguyenvan1902@gmail.com',
        };
        
        // Lưu thông tin người dùng vào local storage
        localStorage.setItem('auth_token', 'google_token_' + Date.now());
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        setUser(userData);
        return userData;
      } else {
        throw new Error(result.error || 'Google login failed');
      }
    } catch (error) {
      setError(error.message || 'Google login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Đăng xuất
   */
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
  }, []);

  /**
   * Kiểm tra trạng thái xác thực tài khoản
   */
  const checkVerificationStatus = useCallback(async (userId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await get(`/users/${userId || user?.id}`);
      return response;
    } catch (error) {
      setError(error.message || 'Failed to check verification status');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [get, user]);

  return {
    user,
    loading,
    error,
    register,
    login,
    loginWithGoogle,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    checkVerificationStatus,
  };
};

export default useAuth; 