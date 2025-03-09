/**
 * Mô hình dữ liệu cho đơn hàng
 */
import productModel from './productModel.js';

/**
 * Phương thức thanh toán
 * @readonly
 * @enum {string}
 */
const PAYMENT_METHODS = {
  CREDIT: 'credit',              // Chỉ thanh toán bằng credit trong tài khoản
};

/**
 * Trạng thái đơn hàng
 * @readonly
 * @enum {string}
 */
const ORDER_STATUS = {
  PENDING: 'pending',       // Chờ xử lý
  PROCESSING: 'processing', // Đang xử lý
  SHIPPED: 'shipped',       // Đã giao hàng
  COMPLETED: 'completed',   // Hoàn thành
  CANCELLED: 'cancelled'    // Đã hủy
};

/**
 * Cấu trúc đơn hàng
 * @typedef {Object} Order
 * @property {string} id - ID đơn hàng
 * @property {string} customerId - ID của khách hàng
 * @property {string} customerName - Tên khách hàng
 * @property {string} customerEmail - Email khách hàng
 * @property {string} [customerPhone] - Số điện thoại khách hàng
 * @property {string} date - Ngày tạo đơn hàng
 * @property {number} subtotal - Tổng tiền hàng (chưa bao gồm phí)
 * @property {number} total - Tổng tiền thanh toán (đã bao gồm phí)
 * @property {string} paymentMethod - Phương thức thanh toán (luôn là 'credit')
 * @property {string} status - Trạng thái đơn hàng (từ enum ORDER_STATUS)
 * @property {OrderItem[]} items - Danh sách các mặt hàng trong đơn hàng
 * @property {AdditionalCharge[]} [additionalCharges] - Các khoản phí bổ sung
 * @property {Address} [shippingAddress] - Địa chỉ giao hàng (bắt buộc cho sản phẩm vật lý)
 * @property {string} [trackingNumber] - Mã vận đơn
 * @property {string} [note] - Ghi chú cho đơn hàng
 */

/**
 * Cấu trúc mặt hàng trong đơn hàng
 * @typedef {Object} OrderItem
 * @property {string} id - ID của sản phẩm
 * @property {string} name - Tên sản phẩm
 * @property {number} price - Giá cơ bản sản phẩm
 * @property {number} quantity - Số lượng
 * @property {string} type - Loại sản phẩm (từ enum PRODUCT_TYPES)
 * @property {AppliedFee[]} [appliedFees] - Các khoản phí bổ sung đã áp dụng
 * @property {Object} [customOptions] - Tùy chọn tùy chỉnh cho sản phẩm (bắt buộc cho CUSTOM, DTF_PRINTING, DTG_PRINTING)
 */

/**
 * Cấu trúc phí đã áp dụng cho một mặt hàng
 * @typedef {Object} AppliedFee
 * @property {string} id - ID của phí
 * @property {string} name - Tên phí
 * @property {number} amount - Số tiền phí
 * @property {boolean} isPercentage - Phí tính theo phần trăm hay số tiền cố định
 * @property {number} calculatedAmount - Số tiền phí đã tính
 */

/**
 * Cấu trúc phí bổ sung cho đơn hàng
 * @typedef {Object} AdditionalCharge
 * @property {string} name - Tên khoản phí
 * @property {number} amount - Số tiền phí
 * @property {string} [description] - Mô tả phí
 */

/**
 * Cấu trúc địa chỉ giao hàng
 * @typedef {Object} Address
 * @property {string} fullName - Tên người nhận
 * @property {string} phone - Số điện thoại
 * @property {string} street - Địa chỉ đường phố
 * @property {string} city - Thành phố
 * @property {string} state - Tỉnh/Thành
 * @property {string} zipCode - Mã bưu điện
 * @property {string} [country] - Quốc gia (mặc định là Việt Nam)
 */

/**
 * Tính tổng phí bổ sung cho một mặt hàng
 * @param {OrderItem} item - Mặt hàng cần tính phí
 * @returns {number} Tổng phí bổ sung
 */
const calculateItemAdditionalFees = (item) => {
  if (!item.appliedFees || !Array.isArray(item.appliedFees)) {
    return 0;
  }

  return item.appliedFees.reduce((total, fee) => {
    return total + (fee.calculatedAmount || 0);
  }, 0);
};

/**
 * Tính tổng tiền cho một mặt hàng (bao gồm phí bổ sung)
 * @param {OrderItem} item - Mặt hàng cần tính tổng
 * @returns {number} Tổng tiền mặt hàng
 */
const calculateItemTotal = (item) => {
  const basePrice = item.price * item.quantity;
  const additionalFees = calculateItemAdditionalFees(item);
  return basePrice + additionalFees;
};

/**
 * Validate đơn hàng
 * @param {Order} order - Đơn hàng cần kiểm tra
 * @returns {Object} Kết quả kiểm tra hợp lệ
 */
const validateOrder = (order) => {
  const errors = [];

  if (!order.customerId) errors.push('ID khách hàng là bắt buộc');
  if (!order.customerName) errors.push('Tên khách hàng là bắt buộc');
  if (!order.customerEmail) errors.push('Email khách hàng là bắt buộc');
  if (!Object.values(PAYMENT_METHODS).includes(order.paymentMethod)) errors.push('Phương thức thanh toán không hợp lệ');
  
  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.push('Đơn hàng phải có ít nhất một mặt hàng');
  } else {
    // Kiểm tra các mặt hàng
    order.items.forEach((item, index) => {
      if (!item.id) errors.push(`ID sản phẩm cho mặt hàng #${index + 1} là bắt buộc`);
      if (!item.name) errors.push(`Tên sản phẩm cho mặt hàng #${index + 1} là bắt buộc`);
      if (item.price === undefined || item.price < 0) errors.push(`Giá sản phẩm cho mặt hàng #${index + 1} không hợp lệ`);
      if (item.quantity === undefined || item.quantity <= 0) errors.push(`Số lượng cho mặt hàng #${index + 1} không hợp lệ`);
      if (!Object.values(productModel.PRODUCT_TYPES).includes(item.type)) errors.push(`Loại sản phẩm cho mặt hàng #${index + 1} không hợp lệ`);
    });
  }

  // Kiểm tra địa chỉ giao hàng nếu không phải sản phẩm số
  if (order.items.some(item => 
      item.type === productModel.PRODUCT_TYPES.READY_MADE || 
      item.type === productModel.PRODUCT_TYPES.CUSTOM)) {
    if (!order.shippingAddress) {
      errors.push('Địa chỉ giao hàng là bắt buộc cho đơn hàng có sản phẩm vật lý');
    } else {
      if (!order.shippingAddress.fullName) errors.push('Tên người nhận là bắt buộc');
      if (!order.shippingAddress.phone) errors.push('Số điện thoại người nhận là bắt buộc');
      if (!order.shippingAddress.street) errors.push('Địa chỉ đường phố là bắt buộc');
      if (!order.shippingAddress.city) errors.push('Thành phố là bắt buộc');
      if (!order.shippingAddress.state) errors.push('Tỉnh/Thành là bắt buộc');
      if (!order.shippingAddress.zipCode) errors.push('Mã bưu điện là bắt buộc');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  PAYMENT_METHODS,
  ORDER_STATUS,
  validateOrder,
  calculateItemTotal,
  calculateItemAdditionalFees
}; 