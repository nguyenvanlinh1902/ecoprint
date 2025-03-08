import { useState, useCallback } from 'react';

// Lấy thông tin từ biến môi trường
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';

// Tạo API URL từ các thành phần
const API_URL = `${API_BASE_URL}${API_PREFIX}`;

/**
 * Custom hook để thực hiện các thao tác API
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Thực hiện request API
   * @param {string} endpoint - Đường dẫn API endpoint
   * @param {Object} options - Các tùy chọn fetch API
   * @returns {Promise<Object>} Kết quả từ API
   */
  const fetchApi = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
      };

      // Thêm authorization header nếu có token
      const token = localStorage.getItem('auth_token');
      if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      console.log(`Calling API: ${url}`, options);
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });
      
      // Kiểm tra Content-Type để xác định loại dữ liệu trả về
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        // Parse JSON response
        data = await response.json();
      } else {
        // Nếu không phải JSON, lấy text và tạo một object lỗi
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 100) + '...');
        throw new Error(`Server did not return JSON (received ${contentType || 'unknown content type'})`);
      }
      
      // Kiểm tra response status
      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      setError(error.message || 'Something went wrong');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Tùy chọn fetch
   * @returns {Promise<Object>} Kết quả
   */
  const get = useCallback((endpoint, options = {}) => {
    return fetchApi(endpoint, { ...options, method: 'GET' });
  }, [fetchApi]);

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Dữ liệu gửi lên
   * @param {Object} options - Tùy chọn fetch
   * @returns {Promise<Object>} Kết quả
   */
  const post = useCallback((endpoint, data, options = {}) => {
    return fetchApi(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }, [fetchApi]);

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Dữ liệu gửi lên
   * @param {Object} options - Tùy chọn fetch
   * @returns {Promise<Object>} Kết quả
   */
  const put = useCallback((endpoint, data, options = {}) => {
    return fetchApi(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }, [fetchApi]);

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Tùy chọn fetch
   * @returns {Promise<Object>} Kết quả
   */
  const del = useCallback((endpoint, options = {}) => {
    return fetchApi(endpoint, { ...options, method: 'DELETE' });
  }, [fetchApi]);

  return {
    loading,
    error,
    get,
    post,
    put,
    del,
  };
};

export default useApi; 