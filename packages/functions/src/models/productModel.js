/**
 * Mô hình dữ liệu cho sản phẩm và dịch vụ
 */

/**
 * Kiểu sản phẩm/dịch vụ
 * @readonly
 * @enum {string}
 */
const PRODUCT_TYPES = {
  READY_MADE: 'ready_made',     // Sản phẩm có sẵn
  CUSTOM: 'custom',             // Dịch vụ tùy chỉnh
  DTF_PRINTING: 'dtf_printing', // Dịch vụ in DTF
  DTG_PRINTING: 'dtg_printing'  // Dịch vụ in DTG
};

/**
 * Cấu trúc dữ liệu sản phẩm
 * @typedef {Object} Product
 * @property {string} id - ID sản phẩm
 * @property {string} name - Tên sản phẩm
 * @property {string} description - Mô tả sản phẩm
 * @property {string} category - Danh mục sản phẩm
 * @property {number} price - Giá cơ bản của sản phẩm
 * @property {string} type - Loại sản phẩm (từ enum PRODUCT_TYPES)
 * @property {boolean} inStock - Tình trạng còn hàng
 * @property {number} stockQuantity - Số lượng tồn kho
 * @property {boolean} eco - Sản phẩm thân thiện môi trường
 * @property {string} [image] - URL hình ảnh sản phẩm
 * @property {number} [rating] - Đánh giá sản phẩm (1-5)
 * @property {AdditionalFee[]} [additionalFees] - Danh sách phí bổ sung tùy chọn cho sản phẩm
 */

/**
 * Cấu trúc dữ liệu phí bổ sung
 * @typedef {Object} AdditionalFee
 * @property {string} id - ID của phí
 * @property {string} name - Tên phí bổ sung
 * @property {string} description - Mô tả về phí bổ sung
 * @property {number} amount - Số tiền phí bổ sung
 * @property {boolean} isPercentage - True nếu là tỷ lệ phần trăm, false nếu là số tiền cố định
 * @property {boolean} isRequired - True nếu phí bắt buộc, false nếu phí tùy chọn
 * @property {string} applicableProductType - Loại sản phẩm có thể áp dụng phí (từ enum PRODUCT_TYPES)
 */

/**
 * Validate sản phẩm
 * @param {Product} product - Sản phẩm cần kiểm tra
 * @returns {Object} Kết quả kiểm tra hợp lệ
 */
const validateProduct = (product) => {
  const errors = [];

  if (!product.name) errors.push('Tên sản phẩm là bắt buộc');
  if (!product.description) errors.push('Mô tả sản phẩm là bắt buộc');
  if (!product.category) errors.push('Danh mục sản phẩm là bắt buộc');
  if (product.price === undefined || product.price < 0) errors.push('Giá sản phẩm không hợp lệ');
  if (!Object.values(PRODUCT_TYPES).includes(product.type)) errors.push('Loại sản phẩm không hợp lệ');

  // Kiểm tra thêm cho sản phẩm có sẵn
  if (product.type === PRODUCT_TYPES.READY_MADE) {
    if (product.inStock === undefined) errors.push('Trạng thái tồn kho là bắt buộc');
    if (product.stockQuantity === undefined || product.stockQuantity < 0) errors.push('Số lượng tồn kho không hợp lệ');
  }

  // Kiểm tra phí bổ sung nếu có
  if (product.additionalFees && Array.isArray(product.additionalFees)) {
    product.additionalFees.forEach((fee, index) => {
      if (!fee.name) errors.push(`Tên phí bổ sung #${index + 1} là bắt buộc`);
      if (fee.amount === undefined || fee.amount < 0) errors.push(`Số tiền phí bổ sung #${index + 1} không hợp lệ`);
      if (fee.isPercentage === undefined) errors.push(`Loại phí bổ sung #${index + 1} không được xác định`);
      if (fee.isRequired === undefined) errors.push(`Trạng thái bắt buộc của phí bổ sung #${index + 1} không được xác định`);
      if (!Object.values(PRODUCT_TYPES).includes(fee.applicableProductType)) errors.push(`Loại sản phẩm áp dụng cho phí bổ sung #${index + 1} không hợp lệ`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  PRODUCT_TYPES,
  validateProduct
}; 