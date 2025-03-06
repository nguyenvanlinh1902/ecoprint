import axios from 'axios';

// Khởi tạo axios client
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const cmsClient = axios.create({
  baseURL: `${API_URL}/api/cms`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Thêm interceptor để xử lý token
cmsClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Service để tương tác với CMS
 */
const cmsService = {
  /**
   * Lấy dữ liệu dịch từ CMS
   * @param {string} language Ngôn ngữ cần lấy dữ liệu
   * @param {string} namespace Namespace của dữ liệu dịch
   * @returns {Promise<Object>} Dữ liệu dịch
   */
  async getTranslations(language, namespace = 'common') {
    try {
      const response = await cmsClient.get(`/translations`, {
        params: { language, namespace }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch translations for ${language}/${namespace}`, error);
      throw error;
    }
  },
  
  /**
   * Lấy tất cả dữ liệu dịch từ CMS
   * @param {string} language Ngôn ngữ cần lấy dữ liệu
   * @returns {Promise<Object>} Tất cả dữ liệu dịch theo ngôn ngữ
   */
  async getAllTranslations(language) {
    try {
      const response = await cmsClient.get(`/translations/all`, {
        params: { language }
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch all translations for ${language}`, error);
      throw error;
    }
  },
  
  /**
   * Cập nhật dữ liệu dịch trong CMS
   * @param {string} language Ngôn ngữ cần cập nhật
   * @param {string} namespace Namespace của khóa dịch
   * @param {string} key Khóa dịch
   * @param {string} value Giá trị dịch
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async updateTranslation(language, namespace, key, value) {
    try {
      const response = await cmsClient.put(`/translations`, {
        language,
        namespace,
        key,
        value
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update translation`, error);
      throw error;
    }
  }
};

export default cmsService; 