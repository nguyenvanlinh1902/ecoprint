/**
 * API Helper function - Dùng để gọi API từ client
 * 
 * @param {string} url - URL path (không bao gồm domain và prefix)
 * @param {object} options - Tùy chọn fetch API
 * @returns {Promise<any>} - Response từ API
 */
export const api = async (url, options = {}) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';
  
  const fullUrl = url.startsWith('http')
    ? url 
    : `${API_BASE_URL}${API_PREFIX}${url.startsWith('/') ? url : `/${url}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const fetchOptions = {
    ...options,
    headers,
    method: options.method || 'GET'
  };
  
  if (options.body && fetchOptions.method !== 'GET') {
    fetchOptions.body = typeof options.body === 'string' 
      ? options.body 
      : JSON.stringify(options.body);
  }
  
  try {
    console.log(`API Call: ${fetchOptions.method} ${fullUrl}`);
    const response = await fetch(fullUrl, fetchOptions);
    const contentType = response.headers.get('content-type');
    let responseData;
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      const text = await response.text();
      console.warn('Response is not JSON:', text.substring(0, 100));
      
      // Nếu không phải JSON, wrap text vào object để xử lý đồng nhất
      responseData = { 
        success: response.ok,
        message: text,
        statusCode: response.status
      };
    }
    
    // Nếu response không OK, throw error
    if (!response.ok) {
      throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    // Nếu response không có thuộc tính success, thêm vào
    if (responseData.success === undefined) {
      responseData.success = true;
    }
    
    return responseData;
  } catch (error) {
    console.error('API Error:', error);
    
    // Trả về object có cùng format với API response để dễ xử lý
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
      message: error.message || 'Unknown error occurred'
    };
  }
};

/**
 * Tạo URL API đầy đủ từ path
 * 
 * @param {string} path - Path của API
 * @returns {string} - URL đầy đủ
 */
export const getApiUrl = (path) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';
  
  return `${API_BASE_URL}${API_PREFIX}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Lấy token xác thực từ localStorage
 * 
 * @returns {string|null} - Token xác thực hoặc null nếu không có
 */
export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

/**
 * Lưu token xác thực vào localStorage
 * 
 * @param {string} token - Token xác thực
 */
export const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

/**
 * Xóa token xác thực từ localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export default {
  api,
  getApiUrl,
  getAuthToken,
  setAuthToken,
  removeAuthToken
}; 