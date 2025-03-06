const Router = require('koa-router');
const admin = require('firebase-admin');

// Không khởi tạo db ở đây, mà dùng lazily trong mỗi route handler
const router = new Router({
  prefix: '/billing'
});

// Lấy số dư tài khoản
router.get('/balance', async (ctx) => {
  try {
    const db = admin.firestore(); // Khởi tạo db chỉ khi cần
    const { userId } = ctx.query;
    
    if (!userId) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'userId là trường bắt buộc'
      };
      return;
    }
    
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Người dùng không tồn tại'
      };
      return;
    }
    
    const userData = userDoc.data();
    
    ctx.body = {
      status: 'success',
      data: {
        balance: userData.balance || 0,
        currency: userData.currency || 'USD',
        creditScore: userData.creditScore || 0,
        creditLimit: userData.creditLimit || 0,
        paymentTerms: userData.paymentTerms || '30'
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Lấy lịch sử giao dịch
router.get('/transactions', async (ctx) => {
  try {
    const { userId, type, limit = 10 } = ctx.query;
    
    if (!userId) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'userId là trường bắt buộc'
      };
      return;
    }
    
    let query = admin.firestore().collection('transactions').where('userId', '==', userId);
    
    if (type) {
      query = query.where('type', '==', type);
    }
    
    const transactionsSnapshot = await query.orderBy('createdAt', 'desc').limit(parseInt(limit)).get();
    const transactions = [];
    
    transactionsSnapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    ctx.body = {
      status: 'success',
      data: transactions
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Thêm tiền vào tài khoản (topup)
router.post('/topup', async (ctx) => {
  try {
    const { userId, amount, paymentMethod, reference } = ctx.request.body;
    
    if (!userId || !amount || !paymentMethod) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'userId, amount và paymentMethod là các trường bắt buộc'
      };
      return;
    }
    
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Người dùng không tồn tại'
      };
      return;
    }
    
    // Thực hiện trong transaction để đảm bảo tính nhất quán
    await admin.firestore().runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
      const userData = userSnapshot.data();
      const currentBalance = userData.balance || 0;
      
      // Cập nhật số dư
      transaction.update(userRef, {
        balance: currentBalance + parseFloat(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Tạo bản ghi giao dịch
      const transactionRef = admin.firestore().collection('transactions').doc();
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
    
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      message: 'Nạp tiền thành công'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

// Rút tiền
router.post('/withdraw', async (ctx) => {
  try {
    const { userId, amount, withdrawMethod, accountInfo } = ctx.request.body;
    
    if (!userId || !amount || !withdrawMethod || !accountInfo) {
      ctx.status = 400;
      ctx.body = {
        status: 'error',
        message: 'userId, amount, withdrawMethod và accountInfo là các trường bắt buộc'
      };
      return;
    }
    
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = {
        status: 'error',
        message: 'Người dùng không tồn tại'
      };
      return;
    }
    
    // Thực hiện trong transaction
    await admin.firestore().runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);
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
      const transactionRef = admin.firestore().collection('transactions').doc();
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
    
    ctx.status = 201;
    ctx.body = {
      status: 'success',
      message: 'Yêu cầu rút tiền đã được tạo và đang chờ xử lý'
    };
  } catch (error) {
    ctx.status = error.message === 'Số dư không đủ' ? 400 : 500;
    ctx.body = {
      status: 'error',
      message: error.message
    };
  }
});

module.exports = { billingRouter: router }; 