import {useState} from 'react';
import { useStore } from '../../reducers/storeReducer';
import { setToast } from '../../actions/storeActions';

/**
 * @param url
 * @param {string} apiPrefix - Prefix cho API endpoint (mặc định là VITE_API_PREFIX hoặc '/api')
 * @returns {{deleting: boolean, handleDelete}}
 */
export default function useDeleteApi({url, apiPrefix}) {
  const {dispatch} = useStore();
  const [deleting, setDeleting] = useState(false);

  // API call function built-in to avoid dependency issues
  const apiCall = async (apiUrl, options = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const API_PREFIX = apiPrefix || import.meta.env.VITE_API_PREFIX || '/api';
    
    const fullUrl = apiUrl.startsWith('http')
      ? apiUrl 
      : `${API_BASE_URL}${API_PREFIX}${apiUrl.startsWith('/') ? apiUrl : `/${apiUrl}`}`;
    
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
        
        responseData = { 
          success: response.ok,
          message: text,
          statusCode: response.status
        };
      }
      
      if (!response.ok) {
        throw new Error(responseData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      if (responseData.success === undefined) {
        responseData.success = true;
      }
      
      return responseData;
    } catch (error) {
      console.error('API Error:', error);
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred',
        message: error.message || 'Unknown error occurred'
      };
    }
  };

  /**
   * @param data
   * @returns {Promise<boolean>}
   */
  const handleDelete = async data => {
    try {
      setDeleting(true);
      const resp = await apiCall(url, {body: {data}, method: 'DELETE'});
      if (resp.success) {
        setToast(dispatch, resp.message || 'Deleted successfully');
        return true;
      }
      if (resp.error) {
        setToast(dispatch, resp.error, true);
      }
      return false;
    } catch (e) {
      console.error('Error deleting resource:', e);
      setToast(dispatch, 'Failed to delete', true);
      return false;
    } finally {
      setDeleting(false);
    }
  };

  return {deleting, handleDelete};
}
