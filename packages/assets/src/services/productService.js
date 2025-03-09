import { api } from './api';

export const productService = {
  /**
   * Import sản phẩm từ file CSV
   * @param {FormData} formData - Form data chứa file CSV và các tùy chọn
   * @returns {Promise<Object>} - Kết quả import
   */
  importProducts: async (formData) => {
    const response = await api.post('/admin/products/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  /**
   * Lấy đường dẫn đến template import
   * @returns {Promise<Object>} - URL template
   */
  getImportTemplate: async () => {
    const response = await api.get('/admin/products/import-templates');
    return response.data;
  },

  /**
   * Kiểm tra trạng thái import
   * @param {string} importId - ID của bản ghi import
   * @returns {Promise<Object>} - Trạng thái import
   */
  getImportStatus: async (importId) => {
    const response = await api.get(`/admin/products/import-status/${importId}`);
    return response.data;
  },

  /**
   * Lấy danh sách sản phẩm
   * @param {Object} params - Các tham số tìm kiếm và phân trang
   * @returns {Promise<Object>} - Danh sách sản phẩm
   */
  getProducts: async (params) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  /**
   * Lấy thông tin sản phẩm
   * @param {string} productId - ID sản phẩm
   * @returns {Promise<Object>} - Thông tin sản phẩm
   */
  getProduct: async (productId) => {
    const response = await api.get(`/products/${productId}`);
    return response.data;
  },

  /**
   * Lấy danh sách variants của sản phẩm
   * @param {string} productId - ID sản phẩm
   * @returns {Promise<Object>} - Danh sách variants
   */
  getProductVariants: async (productId) => {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  }
}; 