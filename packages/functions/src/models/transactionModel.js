/**
 * Mô hình dữ liệu cho giao dịch và quản lý credit
 */

/**
 * Loại giao dịch
 * @readonly
 * @enum {string}
 */
const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',        // Nạp tiền
  PURCHASE: 'purchase',      // Thanh toán đơn hàng
  REFUND: 'refund',          // Hoàn tiền
  ADJUSTMENT: 'adjustment',  // Điều chỉnh
  EXPIRED: 'expired'         // Hết hạn
};

/**
 * Trạng thái giao dịch
 * @readonly
 * @enum {string}
 */
const TRANSACTION_STATUS = {
  PENDING: 'pending',     // Đang chờ xử lý
  APPROVED: 'approved',   // Đã được phê duyệt
  REJECTED: 'rejected',   // Đã bị từ chối
  COMPLETED: 'completed', // Đã hoàn thành
  CANCELLED: 'cancelled'  // Đã hủy
};

/**
 * Cấu trúc dữ liệu giao dịch
 * @typedef {Object} Transaction
 * @property {string} id - ID giao dịch
 * @property {string} customerId - ID của khách hàng
 * @property {Object} customer - Thông tin khách hàng
 * @property {string} type - Loại giao dịch (từ enum TRANSACTION_TYPES)
 * @property {number} amount - Số tiền giao dịch
 * @property {string} reference - Mã tham chiếu
 * @property {string} [orderId] - ID đơn hàng liên quan (nếu có)
 * @property {string} status - Trạng thái giao dịch (từ enum TRANSACTION_STATUS)
 * @property {string} [paymentMethodId] - ID phương thức thanh toán
 * @property {string} [receiptUrl] - URL hình ảnh biên lai
 * @property {string} [comment] - Ghi chú về giao dịch
 * @property {Date} createdAt - Thời gian tạo giao dịch
 * @property {Date} [updatedAt] - Thời gian cập nhật gần nhất
 * @property {string} [createdBy] - ID của người tạo giao dịch
 * @property {string} [processedBy] - ID của người xử lý giao dịch
 */

/**
 * Cấu trúc dữ liệu phương thức thanh toán
 * @typedef {Object} PaymentMethod
 * @property {string} id - ID phương thức thanh toán
 * @property {string} name - Tên phương thức thanh toán
 * @property {string} description - Mô tả phương thức thanh toán
 * @property {string} [bankName] - Tên ngân hàng
 * @property {string} [accountNumber] - Số tài khoản
 * @property {string} [accountName] - Tên chủ tài khoản
 * @property {string} [qrCodeUrl] - URL mã QR thanh toán
 * @property {boolean} active - Trạng thái kích hoạt
 */

/**
 * Cấu trúc dữ liệu tài khoản credit
 * @typedef {Object} CreditAccount
 * @property {string} customerId - ID của khách hàng
 * @property {number} balance - Số dư hiện tại
 * @property {number} totalDeposited - Tổng số tiền đã nạp
 * @property {number} totalSpent - Tổng số tiền đã chi tiêu
 * @property {Transaction[]} [recentTransactions] - Các giao dịch gần đây
 * @property {Date} lastActivityDate - Ngày có hoạt động gần nhất
 * @property {Date} createdAt - Ngày tạo tài khoản
 */

/**
 * Validate giao dịch
 * @param {Transaction} transaction - Giao dịch cần kiểm tra
 * @returns {Object} Kết quả kiểm tra hợp lệ
 */
const validateTransaction = (transaction) => {
  const errors = [];

  if (!transaction.customerId) errors.push('ID khách hàng là bắt buộc');
  if (!Object.values(TRANSACTION_TYPES).includes(transaction.type)) errors.push('Loại giao dịch không hợp lệ');
  if (transaction.amount === undefined || transaction.amount <= 0) errors.push('Số tiền giao dịch không hợp lệ');
  if (!transaction.reference) errors.push('Mã tham chiếu là bắt buộc');
  if (!Object.values(TRANSACTION_STATUS).includes(transaction.status)) errors.push('Trạng thái giao dịch không hợp lệ');

  // Kiểm tra các yêu cầu theo loại giao dịch
  if (transaction.type === TRANSACTION_TYPES.DEPOSIT) {
    if (!transaction.paymentMethodId) errors.push('ID phương thức thanh toán là bắt buộc cho giao dịch nạp tiền');
    if (!transaction.receiptUrl && transaction.status !== TRANSACTION_STATUS.PENDING) errors.push('URL biên lai là bắt buộc cho giao dịch nạp tiền đã xử lý');
  }

  if (transaction.type === TRANSACTION_TYPES.PURCHASE && !transaction.orderId) {
    errors.push('ID đơn hàng là bắt buộc cho giao dịch thanh toán');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate phương thức thanh toán
 * @param {PaymentMethod} paymentMethod - Phương thức thanh toán cần kiểm tra
 * @returns {Object} Kết quả kiểm tra hợp lệ
 */
const validatePaymentMethod = (paymentMethod) => {
  const errors = [];

  if (!paymentMethod.name) errors.push('Tên phương thức thanh toán là bắt buộc');
  if (!paymentMethod.description) errors.push('Mô tả phương thức thanh toán là bắt buộc');

  // Nếu là tài khoản ngân hàng, phải có đầy đủ thông tin
  if (paymentMethod.bankName) {
    if (!paymentMethod.accountNumber) errors.push('Số tài khoản là bắt buộc khi có tên ngân hàng');
    if (!paymentMethod.accountName) errors.push('Tên chủ tài khoản là bắt buộc khi có tên ngân hàng');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  TRANSACTION_TYPES,
  TRANSACTION_STATUS,
  validateTransaction,
  validatePaymentMethod
}; 