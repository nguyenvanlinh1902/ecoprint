import {useEffect, useState} from 'react';
import queryString from 'query-string';

/**
 * useFetchApi hook for fetch data from api with url
 *
 * @param {string} url
 * @param defaultData
 * @param {boolean} initLoad
 * @param presentData
 * @param initQueries
 * @param successCallback
 * @param {string} apiPrefix - Prefix cho API endpoint (mặc định là VITE_API_PREFIX hoặc '/api')
 *
 * @returns {{pageInfo: {}, data, setData, count, setCount, fetchApi, loading, fetched}}
 */
export default function useFetchApi({
  url,
  defaultData = [],
  initLoad = true,
  presentData = null,
  initQueries = {},
  successCallback = () => {},
  apiPrefix
}) {
  const [loading, setLoading] = useState(initLoad);
  const [fetched, setFetched] = useState(false);
  const [data, setData] = useState(defaultData);
  const [pageInfo, setPageInfo] = useState({});
  const [count, setCount] = useState(0);

  // Xây dựng hàm API call bên trong hook để tránh phụ thuộc vào imports
  const apiCall = async (apiUrl, options = {}) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const API_PREFIX = apiPrefix || import.meta.env.VITE_API_PREFIX || '/api';
    
    console.log('API call details:', { 
      API_BASE_URL, 
      API_PREFIX, 
      apiUrl,
      fullUrl: apiUrl.startsWith('http')
        ? apiUrl 
        : `${API_BASE_URL}${API_PREFIX}${apiUrl.startsWith('/') ? apiUrl : `/${apiUrl}`}`
    });
    
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

  async function fetchApi(apiUrl, params = null, keepPreviousData = false) {
    try {
      setLoading(true);
      const path = apiUrl || url;
      const separateChar = path.includes('?') ? '&' : '?';
      const query = params ? separateChar + queryString.stringify(params) : '';
      
      console.log('fetchApi details:', { 
        path, 
        params, 
        query,
        fullPath: path + query,
        apiPrefix: apiPrefix || import.meta.env.VITE_API_PREFIX || '/api'
      });
      
      const resp = await apiCall(path + query);
      
      if (resp && resp.hasOwnProperty('pageInfo')) setPageInfo(resp.pageInfo);
      if (resp && resp.hasOwnProperty('count')) setCount(resp.count);
      if (resp && resp.hasOwnProperty('data')) {
        let newData = presentData ? presentData(resp.data) : resp.data;
        if (!Array.isArray(newData)) {
          newData = {...defaultData, ...newData};
        }
        setData(prev => {
          if (!keepPreviousData) {
            return newData;
          }
          return Array.isArray(newData) ? [...prev, ...newData] : {...prev, ...newData};
        });
        successCallback(newData);
      } else {
        // Nếu không có data, coi response là data
        let newData = presentData ? presentData(resp) : resp;
        if (!Array.isArray(newData) && typeof newData === 'object') {
          newData = {...defaultData, ...newData};
        }
        setData(newData);
        successCallback(newData);
      }
    } catch (e) {
      console.error('Error in fetchApi:', e);
      setData(Array.isArray(defaultData) ? [] : {});
    } finally {
      setLoading(false);
      setFetched(true);
    }
  }

  useEffect(() => {
    if (initLoad && !fetched) {
      fetchApi(url, initQueries).then(() => {});
    }
  }, []);

  const handleChangeInput = (key, value) => {
    setData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return {
    fetchApi,
    data,
    setData,
    pageInfo,
    count,
    setCount,
    loading,
    fetched,
    setFetched,
    handleChangeInput
  };
}
