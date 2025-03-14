import Router from 'koa-router';
import orderController from '../controllers/orderController.js';
import { validateCreateOrder } from '../validators/orderValidator.js';

const router = new Router();

// Tạo đơn hàng mới
router.post('/orders', validateCreateOrder, orderController.createOrder);

// Tính toán giá đơn hàng trước khi tạo
router.post('/orders/calculate', orderController.calculateOrderPrice);

// Lấy thông tin đơn hàng
router.get('/orders/:orderId', orderController.getOrder);

// Lấy danh sách đơn hàng của người dùng
router.get('/customers/:customerId/orders', orderController.getCustomerOrders);

// Cập nhật trạng thái đơn hàng
router.put('/orders/:orderId/status', orderController.updateOrderStatus);

// Lấy tất cả đơn hàng (admin)
router.get('/orders', orderController.getAllOrders);

// Tính toán phí bổ sung cho sản phẩm
router.post('/products/:productId/calculate-fees', orderController.calculateAdditionalFees);

export default router; 