const admin = require('firebase-admin');
const db = admin.firestore();

const usersCollection = db.collection('users');
const transactionsCollection = db.collection('transactions');

/**
 * Repository cho thanh toán
 */
const billingRepository = {
  /**
   * Lấy thông tin số dư tài khoản của người dùng
   * @param {string} userId ID của người dùng
   */
  getBalance: async (userId) => {
    const doc = await usersCollection.doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const userData = doc.data();
    
    return {
      balance: userData.balance || 0,
      currency: userData.currency || 'USD',
      creditScore: userData.creditScore || 0,
      creditLimit: userData.creditLimit || 0,
      paymentTerms: userData.paymentTerms || '30'
    };
  },
  
  /**
   * Lấy lịch sử giao dịch của người dùng
   * @param {string} userId ID của người dùng
   * @param {string} type Loại giao dịch (tùy chọn)
   * @param {number} limit Số lượng giao dịch tối đa
   */
  getTransactions: async (userId, type = null, limit = 10) => {
    let query = transactionsCollection.where('userId', '==', userId);
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const snapshot = await query.orderBy('createdAt', 'desc').limit(parseInt(limit)).get();
    const transactions = [];
    
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return transactions;
  },
  
  /**
   * Nạp tiền vào tài khoản
   * @param {string} userId ID của người dùng
   * @param {number} amount Số tiền
   * @param {string} paymentMethod Phương thức thanh toán
   * @param {string} reference Mã tham chiếu
   */
  topUp: async (userId, amount, paymentMethod, reference) => {
    const userRef = usersCollection.doc(userId);
    
    // Thực hiện trong transaction để đảm bảo tính nhất quán
    await db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      
      if (!userSnapshot.exists) {
        throw new Error('Người dùng không tồn tại');
      }
      
      const userData = userSnapshot.data();
      const currentBalance = userData.balance || 0;
      
      // Cập nhật số dư
      transaction.update(userRef, {
        balance: currentBalance + parseFloat(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Tạo bản ghi giao dịch
      const transactionRef = transactionsCollection.doc();
      transaction.set(transactionRef, {
        userId,
        type: 'topup',
        amount: parseFloat(amount),
        paymentMethod,
        reference,
        status: 'completed',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    return true;
  },
  
  /**
   * Rút tiền từ tài khoản
   * @param {string} userId ID của người dùng
   * @param {number} amount Số tiền
   * @param {string} withdrawMethod Phương thức rút tiền
   * @param {Object} accountInfo Thông tin tài khoản
   */
  withdraw: async (userId, amount, withdrawMethod, accountInfo) => {
    const userRef = usersCollection.doc(userId);
    
    // Thực hiện trong transaction
    await db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      
      if (!userSnapshot.exists) {
        throw new Error('Người dùng không tồn tại');
      }
      
      const userData = userSnapshot.data();
      const currentBalance = userData.balance || 0;
      
      if (currentBalance < parseFloat(amount)) {
        throw new Error('Số dư không đủ');
      }
      
      // Cập nhật số dư
      transaction.update(userRef, {
        balance: currentBalance - parseFloat(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Tạo bản ghi giao dịch
      const transactionRef = transactionsCollection.doc();
      transaction.set(transactionRef, {
        userId,
        type: 'withdraw',
        amount: parseFloat(amount),
        withdrawMethod,
        accountInfo,
        status: 'pending', // Pending vì cần xác nhận thủ công
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    
    return true;
  }
};

module.exports = billingRepository; 