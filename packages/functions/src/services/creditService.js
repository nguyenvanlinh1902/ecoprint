/**
 * Service xử lý credit và giao dịch
 */
import { db, storage } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';
import transactionModel from '../models/transactionModel.js';

const creditService = {
  /**
   * Tạo tài khoản credit mới cho người dùng
   * @param {string} customerId - ID của khách hàng
   * @returns {Promise<Object>} Thông tin tài khoản credit
   */
  createCreditAccount: async (customerId) => {
    try {
      const creditAccountRef = db.collection('creditAccounts').doc(customerId);
      const creditAccountExists = (await creditAccountRef.get()).exists;

      if (creditAccountExists) {
        throw new Error('Tài khoản credit đã tồn tại cho người dùng này');
      }

      const timestamp = new Date();
      const newCreditAccount = {
        customerId,
        balance: 0,
        totalDeposited: 0,
        totalSpent: 0,
        lastActivityDate: timestamp,
        createdAt: timestamp
      };

      await creditAccountRef.set(newCreditAccount);
      return newCreditAccount;
    } catch (error) {
      console.error('Error creating credit account:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin tài khoản credit của người dùng
   * @param {string} customerId - ID của khách hàng
   * @returns {Promise<Object>} Thông tin tài khoản credit
   */
  getCreditAccount: async (customerId) => {
    try {
      const creditAccountRef = db.collection('creditAccounts').doc(customerId);
      const creditAccountDoc = await creditAccountRef.get();

      if (!creditAccountDoc.exists) {
        // Tạo tài khoản mới nếu chưa tồn tại
        return await creditService.createCreditAccount(customerId);
      }

      const creditAccount = creditAccountDoc.data();

      // Lấy các giao dịch gần đây
      const recentTransactionsSnapshot = await db.collection('transactions')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();

      const recentTransactions = [];
      recentTransactionsSnapshot.forEach((doc) => {
        recentTransactions.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return {
        ...creditAccount,
        recentTransactions
      };
    } catch (error) {
      console.error('Error getting credit account:', error);
      throw error;
    }
  },

  /**
   * Tạo giao dịch mới
   * @param {Object} transactionData - Dữ liệu giao dịch
   * @param {File} [receiptFile] - File biên lai (nếu có)
   * @returns {Promise<Object>} Thông tin giao dịch đã tạo
   */
  createTransaction: async (transactionData, receiptFile = null) => {
    try {
      // Validate dữ liệu giao dịch
      const { isValid, errors } = transactionModel.validateTransaction(transactionData);
      if (!isValid) {
        throw new Error(`Dữ liệu giao dịch không hợp lệ: ${errors.join(', ')}`);
      }

      const transactionId = uuidv4();
      const timestamp = new Date();
      
      let receiptUrl = null;
      
      // Upload biên lai nếu có
      if (receiptFile) {
        const fileExtension = receiptFile.originalname.split('.').pop();
        const filePath = `receipts/${transactionId}.${fileExtension}`;
        
        const fileBuffer = receiptFile.buffer;
        const fileRef = storage.file(filePath);
        
        await fileRef.save(fileBuffer, {
          metadata: {
            contentType: receiptFile.mimetype
          }
        });
        
        // Lấy URL công khai
        const [url] = await fileRef.getSignedUrl({
          action: 'read',
          expires: '03-01-2500' // Ngày xa trong tương lai
        });
        
        receiptUrl = url;
      }
      
      // Tạo document giao dịch
      const newTransaction = {
        ...transactionData,
        id: transactionId,
        status: transactionData.status || transactionModel.TRANSACTION_STATUS.PENDING,
        receiptUrl: receiptUrl || transactionData.receiptUrl,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Lưu giao dịch
      await db.collection('transactions').doc(transactionId).set(newTransaction);
      
      // Nếu giao dịch được phê duyệt ngay, cập nhật tài khoản credit
      if (newTransaction.status === transactionModel.TRANSACTION_STATUS.APPROVED) {
        await creditService.updateCreditBalance(newTransaction);
      }
      
      return newTransaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  /**
   * Cập nhật trạng thái giao dịch
   * @param {string} transactionId - ID giao dịch
   * @param {string} status - Trạng thái mới
   * @param {string} [comment] - Ghi chú về cập nhật
   * @param {string} [processedBy] - ID người xử lý
   * @returns {Promise<Object>} Thông tin giao dịch đã cập nhật
   */
  updateTransactionStatus: async (transactionId, status, comment = null, processedBy = null) => {
    try {
      const transactionRef = db.collection('transactions').doc(transactionId);
      const transactionDoc = await transactionRef.get();
      
      if (!transactionDoc.exists) {
        throw new Error('Giao dịch không tồn tại');
      }
      
      const transaction = transactionDoc.data();
      
      // Kiểm tra xem trạng thái mới có hợp lệ không
      if (!Object.values(transactionModel.TRANSACTION_STATUS).includes(status)) {
        throw new Error('Trạng thái giao dịch không hợp lệ');
      }
      
      // Không cho phép cập nhật nếu giao dịch đã hoàn thành hoặc đã hủy
      if (
        transaction.status === transactionModel.TRANSACTION_STATUS.COMPLETED ||
        transaction.status === transactionModel.TRANSACTION_STATUS.CANCELLED
      ) {
        throw new Error('Không thể cập nhật giao dịch đã hoàn thành hoặc đã hủy');
      }
      
      const updateData = {
        status,
        updatedAt: new Date()
      };
      
      if (comment) {
        updateData.comment = comment;
      }
      
      if (processedBy) {
        updateData.processedBy = processedBy;
      }
      
      await transactionRef.update(updateData);
      
      // Nếu trạng thái là phê duyệt hoặc từ chối, cập nhật tài khoản credit
      if (
        status === transactionModel.TRANSACTION_STATUS.APPROVED ||
        status === transactionModel.TRANSACTION_STATUS.REJECTED
      ) {
        const updatedTransaction = {
          ...transaction,
          ...updateData
        };
        
        if (status === transactionModel.TRANSACTION_STATUS.APPROVED) {
          await creditService.updateCreditBalance(updatedTransaction);
        }
      }
      
      return {
        ...transaction,
        ...updateData
      };
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },

  /**
   * Cập nhật số dư tài khoản credit theo giao dịch
   * @param {Object} transaction - Thông tin giao dịch
   * @returns {Promise<Object>} Thông tin tài khoản credit đã cập nhật
   */
  updateCreditBalance: async (transaction) => {
    try {
      const creditAccountRef = db.collection('creditAccounts').doc(transaction.customerId);
      const creditAccountDoc = await creditAccountRef.get();
      
      // Nếu tài khoản không tồn tại, tạo mới
      if (!creditAccountDoc.exists) {
        await creditService.createCreditAccount(transaction.customerId);
      }
      
      // Lấy thông tin tài khoản hiện tại
      const creditAccount = creditAccountDoc.exists ? creditAccountDoc.data() : {
        balance: 0,
        totalDeposited: 0,
        totalSpent: 0
      };
      
      let balanceChange = 0;
      let depositChange = 0;
      let spentChange = 0;
      
      // Tính toán thay đổi số dư theo loại giao dịch
      switch (transaction.type) {
        case transactionModel.TRANSACTION_TYPES.DEPOSIT:
          balanceChange = transaction.amount;
          depositChange = transaction.amount;
          break;
        case transactionModel.TRANSACTION_TYPES.PURCHASE:
          balanceChange = -transaction.amount;
          spentChange = transaction.amount;
          break;
        case transactionModel.TRANSACTION_TYPES.REFUND:
          balanceChange = transaction.amount;
          spentChange = -transaction.amount;
          break;
        case transactionModel.TRANSACTION_TYPES.ADJUSTMENT:
          balanceChange = transaction.amount; // Có thể dương hoặc âm
          break;
        default:
          throw new Error('Loại giao dịch không hợp lệ');
      }
      
      // Cập nhật số dư
      const updatedCreditAccount = {
        balance: creditAccount.balance + balanceChange,
        totalDeposited: creditAccount.totalDeposited + depositChange,
        totalSpent: creditAccount.totalSpent + spentChange,
        lastActivityDate: new Date()
      };
      
      // Kiểm tra số dư không âm
      if (updatedCreditAccount.balance < 0) {
        throw new Error('Số dư tài khoản không đủ để thực hiện giao dịch');
      }
      
      await creditAccountRef.update(updatedCreditAccount);
      
      return {
        ...creditAccount,
        ...updatedCreditAccount
      };
    } catch (error) {
      console.error('Error updating credit balance:', error);
      throw error;
    }
  },

  /**
   * Kiểm tra số dư tài khoản
   * @param {string} customerId - ID của khách hàng
   * @param {number} amount - Số tiền cần kiểm tra
   * @returns {Promise<boolean>} True nếu có đủ số dư, False nếu không đủ
   */
  checkBalance: async (customerId, amount) => {
    try {
      const creditAccount = await creditService.getCreditAccount(customerId);
      return creditAccount.balance >= amount;
    } catch (error) {
      console.error('Error checking balance:', error);
      throw error;
    }
  },

  /**
   * Lấy lịch sử giao dịch của người dùng
   * @param {string} customerId - ID của khách hàng
   * @param {number} [limit=20] - Số lượng giao dịch tối đa
   * @param {number} [offset=0] - Vị trí bắt đầu
   * @returns {Promise<Array>} Danh sách giao dịch
   */
  getTransactionHistory: async (customerId, limit = 20, offset = 0) => {
    try {
      const transactionsSnapshot = await db.collection('transactions')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .offset(offset)
        .get();
      
      const transactions = [];
      transactionsSnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  },

  /**
   * Lấy tất cả giao dịch (dành cho admin)
   * @param {Object} query - Tham số truy vấn
   * @param {number} limit - Số lượng giao dịch tối đa
   * @param {number} offset - Vị trí bắt đầu
   * @returns {Promise<Object>} Kết quả tìm kiếm giao dịch
   */
  getAllTransactions: async (query = {}, limit = 20, offset = 0) => {
    try {
      let dbQuery = db.collection('transactions');
      
      // Áp dụng các bộ lọc
      if (query.status) {
        dbQuery = dbQuery.where('status', '==', query.status);
      }
      
      if (query.type) {
        dbQuery = dbQuery.where('type', '==', query.type);
      }
      
      // Lọc theo ngày
      if (query.dateRange) {
        if (query.dateRange.fromDate) {
          dbQuery = dbQuery.where('createdAt', '>=', query.dateRange.fromDate);
        }
        
        if (query.dateRange.toDate) {
          dbQuery = dbQuery.where('createdAt', '<=', query.dateRange.toDate);
        }
      }
      
      // Sắp xếp theo thời gian tạo
      dbQuery = dbQuery.orderBy('createdAt', 'desc');
      
      // Lấy tổng số giao dịch (cho phân trang)
      const countSnapshot = await dbQuery.get();
      const totalTransactions = countSnapshot.size;
      
      // Áp dụng phân trang
      dbQuery = dbQuery.limit(limit).offset(offset);
      
      // Thực hiện truy vấn
      const transactionsSnapshot = await dbQuery.get();
      
      const transactions = [];
      transactionsSnapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        transactions,
        total: totalTransactions,
        limit,
        offset
      };
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách phương thức thanh toán
   * @returns {Promise<Array>} Danh sách phương thức thanh toán
   */
  getPaymentMethods: async () => {
    try {
      const paymentMethodsSnapshot = await db.collection('paymentMethods')
        .where('active', '==', true)
        .get();
      
      const paymentMethods = [];
      paymentMethodsSnapshot.forEach((doc) => {
        paymentMethods.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return paymentMethods;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  }
};

export default creditService; 