import { useState, useEffect, useCallback } from 'react';
import { signInWithGoogle } from '../../firebase';
import useApi from './useApi';

/**
 * Custom hook để xử lý các vấn đề xác thực người dùng
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { post, get } = useApi();

  // Function to check authentication status
  const checkAuthStatus = useCallback(async () => {
    console.log('Checking auth status...'); // Debug log
    try {
      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');
      
      console.log('Auth check - Token exists:', !!token); // Debug log
      console.log('Auth check - User data exists:', !!userData); // Debug log
      
      if (token && userData) {
        // Kiểm tra token có hợp lệ không
        const isValid = await validateToken(token);
        console.log('Token validation result:', isValid); // Debug log
        
        if (isValid) {
          const parsedUserData = JSON.parse(userData);
          console.log('Setting user data:', parsedUserData); // Debug log
          setUser(parsedUserData);
        } else {
          // Token không hợp lệ, xóa dữ liệu đăng nhập
          console.log('Invalid token, clearing auth data'); // Debug log
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_data');
          setUser(null);
        }
      } else {
        // No token or user data
        console.log('No auth data found'); // Debug log
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Xóa dữ liệu đăng nhập nếu có lỗi
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Kiểm tra người dùng đã đăng nhập chưa khi component mount
  useEffect(() => {
    checkAuthStatus();
    
    // Create a storage event listener to handle auth state changes
    // This helps when multiple tabs/windows are open
    const handleStorageChange = (e) => {
      console.log('Storage change detected', e.key); // Debug log
      if (e.key === 'auth_token' || e.key === 'user_data') {
        checkAuthStatus();
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Add custom event for in-app changes
    window.addEventListener('auth-state-change', checkAuthStatus);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-state-change', checkAuthStatus);
    };
  }, [checkAuthStatus]);

  /**
   * Kiểm tra token có hợp lệ không
   * @param {string} token - JWT token
   * @returns {Promise<boolean>} Kết quả kiểm tra
   */
  const validateToken = useCallback(async (token) => {
    try {
      // DEVELOPMENT MODE: Accept all tokens for testing
      if (process.env.NODE_ENV !== 'production') {
        console.log('Development mode: accepting all tokens'); // Debug log
        return true;
      }
      
      // Gọi API để kiểm tra token
      // Trong trường hợp không có API, kiểm tra token có đúng định dạng không
      if (!token) return false;
      
      // TEMPORARY FIX: Accept temporary tokens
      if (token.startsWith('temp_token_')) {
        // Check if token was created within the last 24 hours
        const parts = token.split('_');
        if (parts.length >= 3) {
          const timestamp = parseInt(parts[2]);
          const now = Date.now();
          return now - timestamp < 24 * 60 * 60 * 1000;
        }
        return true; // If we can't parse the timestamp, just accept it for now
      }
      
      // Original logic for other token types
      
      // Kiểm tra token có đúng định dạng JWT không
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Nếu token bắt đầu bằng "google_token_", đây là token giả lập
      if (token.startsWith('google_token_')) {
        // Kiểm tra thời gian tạo token (giả lập)
        const timestamp = parseInt(token.replace('google_token_', ''));
        const now = Date.now();
        // Token hết hạn sau 24 giờ
        return now - timestamp < 24 * 60 * 60 * 1000;
      }
      
      // Thực tế nên gọi API để validate token
      // const response = await get('/auth/validate-token');
      // return response.valid;
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
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
   * @param {string} password - Password (không dùng trong phiên bản tạm thời)
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // TEMPORARY FIX: Bypass actual API call and password verification
      // Generate a temporary token based on email
      const token = `temp_token_${Date.now()}_${btoa(email)}`;
      
      // Determine role based on email (đơn giản hóa cho tạm thời)
      const isAdmin = email.includes('admin') || email === 'linhnguyenvan1902@gmail.com';

      // Create user data object
      const userData = {
        id: btoa(email),
        email,
        fullName: email.split('@')[0] || 'User',
        role: isAdmin ? 'admin' : 'user',
        isVerified: true, // Auto-verify for testing
      };
      
      // Log login info for debugging
      console.log('Temporary login with:', { email, userData });
      
      // Save auth data to local storage
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      // Dispatch a custom event to notify about auth state change
      window.dispatchEvent(new Event('auth-state-change'));
      
      return userData;

      // ORIGINAL CODE (COMMENTED OUT FOR NOW)
      /*
      // Call the actual authentication API
      const response = await post('/auth/login', { email, password });
      
      if (!response || !response.token) {
        throw new Error('Invalid login response');
      }
      
      const userData = response.user || {
        id: response.userId,
        email,
        fullName: response.fullName || 'User',
        role: response.role || 'user',
        isVerified: response.isVerified || false,
      };
      
      // Save auth data to local storage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
      */
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
    console.log('Logging out...'); // Debug log
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    setUser(null);
    
    // Dispatch a custom event to notify about auth state change
    window.dispatchEvent(new Event('auth-state-change'));
    
    console.log('Logged out successfully'); // Debug log
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
    validateToken,
  };
};

export default useAuth; 