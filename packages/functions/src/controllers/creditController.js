/**
 * Controller xử lý các yêu cầu liên quan đến credit và giao dịch
 */
import creditService from '../services/creditService.js';
import transactionModel from '../models/transactionModel.js';
import multer from 'multer';

// Cấu hình multer cho upload file
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // Giới hạn file 5MB
  }
}).single('file');

/**
 * Middleware xử lý upload file
 */
const handleUpload = (ctx, next) => {
  return new Promise((resolve, reject) => {
    upload(ctx.req, ctx.res, (err) => {
      if (err) {
        ctx.status = 400;
        ctx.body = { success: false, message: `Lỗi khi tải lên file: ${err.message}` };
        return reject(err);
      }
      resolve(next());
    });
  });
};

const creditController = {
  /**
   * Lấy thông tin tài khoản credit
   */
  getCreditAccount: async (ctx) => {
    try {
      const { customerId } = ctx.params;
      
      // Kiểm tra quyền truy cập
      const { user } = ctx.state;
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      // Nếu không phải admin, chỉ có thể xem tài khoản của chính mình
      if (user.role !== 'admin' && user.uid !== customerId) {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền truy cập' };
        return;
      }
      
      const creditAccount = await creditService.getCreditAccount(customerId);
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: creditAccount
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Kiểm tra số dư credit
   */
  checkBalance: async (ctx) => {
    try {
      const { amount } = ctx.query;
      const { user } = ctx.state;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      if (!amount || isNaN(parseFloat(amount))) {
        ctx.status = 400;
        ctx.body = { success: false, message: 'Số tiền không hợp lệ' };
        return;
      }
      
      const hasEnoughBalance = await creditService.checkBalance(
        user.uid,
        parseFloat(amount)
      );
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: {
          hasEnoughBalance,
          amount: parseFloat(amount)
        }
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Lấy lịch sử giao dịch
   */
  getTransactionHistory: async (ctx) => {
    try {
      const { customerId } = ctx.params;
      const { limit = 20, offset = 0 } = ctx.query;
      
      // Kiểm tra quyền truy cập
      const { user } = ctx.state;
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      // Nếu không phải admin, chỉ có thể xem giao dịch của chính mình
      if (user.role !== 'admin' && user.uid !== customerId) {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền truy cập' };
        return;
      }
      
      const transactions = await creditService.getTransactionHistory(
        customerId,
        parseInt(limit, 10),
        parseInt(offset, 10)
      );
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: transactions
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Tạo giao dịch mới (nạp tiền)
   */
  createTransaction: async (ctx) => {
    try {
      // Lấy dữ liệu từ request
      const { amount, reference, paymentMethodId } = ctx.request.body;
      const { user } = ctx.state;
      const receiptFile = ctx.req.file;
      
      if (!user) {
        ctx.status = 401;
        ctx.body = { success: false, message: 'Yêu cầu đăng nhập' };
        return;
      }
      
      if (!amount || !reference || !paymentMethodId) {
        ctx.status = 400;
        ctx.body = { success: false, message: 'Thiếu thông tin bắt buộc' };
        return;
      }
      
      // Nếu không có file receipt, yêu cầu người dùng upload
      if (!receiptFile) {
        ctx.status = 400;
        ctx.body = { success: false, message: 'Vui lòng tải lên ảnh chụp màn hình giao dịch' };
        return;
      }
      
      // Tạo dữ liệu giao dịch
      const transactionData = {
        customerId: user.uid,
        customer: {
          name: user.fullName || user.displayName,
          email: user.email,
          phone: user.phone
        },
        type: transactionModel.TRANSACTION_TYPES.DEPOSIT,
        amount: parseFloat(amount),
        reference,
        paymentMethodId,
        status: transactionModel.TRANSACTION_STATUS.PENDING
      };
      
      // Tạo giao dịch mới
      const transaction = await creditService.createTransaction(transactionData, receiptFile);
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Giao dịch đã được tạo và đang chờ xác nhận',
        data: transaction
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Cập nhật trạng thái giao dịch (admin)
   */
  updateTransactionStatus: async (ctx) => {
    try {
      const { transactionId } = ctx.params;
      const { status, comment } = ctx.request.body;
      const { user } = ctx.state;
      
      // Kiểm tra quyền truy cập
      if (!user || user.role !== 'admin') {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền thực hiện thao tác này' };
        return;
      }
      
      if (!status || !Object.values(transactionModel.TRANSACTION_STATUS).includes(status)) {
        ctx.status = 400;
        ctx.body = { success: false, message: 'Trạng thái giao dịch không hợp lệ' };
        return;
      }
      
      // Cập nhật trạng thái giao dịch
      const updatedTransaction = await creditService.updateTransactionStatus(
        transactionId,
        status,
        comment,
        user.uid
      );
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Cập nhật trạng thái giao dịch thành công',
        data: updatedTransaction
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Lấy danh sách tất cả giao dịch (admin)
   */
  getAllTransactions: async (ctx) => {
    try {
      const { user } = ctx.state;
      
      // Kiểm tra quyền truy cập
      if (!user || user.role !== 'admin') {
        ctx.status = 403;
        ctx.body = { success: false, message: 'Không có quyền thực hiện thao tác này' };
        return;
      }
      
      const {
        status,
        type,
        fromDate,
        toDate,
        limit = 20,
        offset = 0
      } = ctx.query;
      
      // Tạo query
      let query = {};
      
      if (status) {
        query.status = status;
      }
      
      if (type) {
        query.type = type;
      }
      
      if (fromDate || toDate) {
        query.dateRange = {
          fromDate: fromDate ? new Date(fromDate) : null,
          toDate: toDate ? new Date(toDate) : null
        };
      }
      
      // Lấy danh sách giao dịch
      const transactions = await creditService.getAllTransactions(
        query,
        parseInt(limit, 10),
        parseInt(offset, 10)
      );
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: transactions
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  },

  /**
   * Lấy danh sách phương thức thanh toán
   */
  getPaymentMethods: async (ctx) => {
    try {
      const paymentMethods = await creditService.getPaymentMethods();
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        data: paymentMethods
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { success: false, message: error.message };
    }
  }
};

export { creditController, handleUpload }; 