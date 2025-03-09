import { api } from './api';

export const orderService = {
  /**
   * Tạo đơn hàng mới
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise<Object>} - Kết quả tạo đơn hàng
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Tính giá đơn hàng
   * @param {Object} orderData - Dữ liệu đơn hàng
   * @returns {Promise<Object>} - Chi tiết giá
   */
  calculateOrderPrice: async (orderData) => {
    const response = await api.post('/orders/calculate', orderData);
    return response.data;
  },

  /**
   * Lấy thông tin đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @returns {Promise<Object>} - Thông tin đơn hàng
   */
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Lấy danh sách đơn hàng của người dùng
   * @param {string} customerId - ID người dùng
   * @param {Object} params - Các tham số tìm kiếm và phân trang
   * @returns {Promise<Object>} - Danh sách đơn hàng
   */
  getCustomerOrders: async (customerId, params) => {
    const response = await api.get(`/customers/${customerId}/orders`, { params });
    return response.data;
  },

  /**
   * Cập nhật trạng thái đơn hàng
   * @param {string} orderId - ID đơn hàng
   * @param {string} status - Trạng thái mới
   * @returns {Promise<Object>} - Kết quả cập nhật
   */
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  /**
   * Tính toán phí bổ sung cho sản phẩm
   * @param {string} productId - ID sản phẩm
   * @param {Object} customizations - Thông tin tùy chỉnh
   * @returns {Promise<Object>} - Chi tiết phí
   */
  calculateAdditionalFees: async (productId, customizations) => {
    const response = await api.post(`/products/${productId}/calculate-fees`, { customizations });
    return response.data;
  }
}; 