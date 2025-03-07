const Router = require('koa-router');
const orderController = require('../controllers/order.controller');
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth');

const router = new Router({
  prefix: '/pos'
});

// Order routes
router.get('/orders', orderController.getOrders);
router.get('/orders/:id', orderController.getOrderById);
router.post('/orders', authMiddleware.authenticate, orderController.createOrder);
router.put('/orders/:id', authMiddleware.authenticate, orderController.updateOrder);
router.patch('/orders/:id/status', authMiddleware.authenticate, orderController.updateOrderStatus);
router.delete('/orders/:id', authMiddleware.authenticate, orderController.deleteOrder);

// Product routes
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', authMiddleware.authenticate, productController.createProduct);
router.put('/products/:id', authMiddleware.authenticate, productController.updateProduct);
router.delete('/products/:id', authMiddleware.authenticate, productController.deleteProduct);

// Bulk operations
router.post('/products/bulk', authMiddleware.authenticate, productController.bulkProductOperations);
router.post('/orders/bulk', authMiddleware.authenticate, orderController.bulkOrderOperations);

module.exports = router; 