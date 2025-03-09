import Router from 'koa-router';
import { creditController, handleUpload } from '../controllers/creditController.js';

const router = new Router();

// Lấy thông tin tài khoản credit
router.get('/accounts/:customerId', creditController.getCreditAccount);

// Lấy lịch sử giao dịch
router.get('/transactions/:customerId', creditController.getTransactionHistory);

// Tạo giao dịch mới (nạp tiền)
router.post('/transactions', handleUpload, creditController.createTransaction);

// Cập nhật trạng thái giao dịch (admin)
router.put('/transactions/:transactionId/status', creditController.updateTransactionStatus);

// Lấy danh sách tất cả giao dịch (admin)
router.get('/transactions', creditController.getAllTransactions);

// Lấy danh sách phương thức thanh toán
router.get('/payment-methods', creditController.getPaymentMethods);

export default router; 