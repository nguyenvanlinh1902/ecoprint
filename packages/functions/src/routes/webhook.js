const Router = require('koa-router');
const webhookController = require('../controllers/webhook.controller');
const webhookMiddleware = require('../middleware/webhook');

const router = new Router({
  prefix: '/webhook'
});

// Payment gateway webhooks
router.post('/stripe', webhookMiddleware.verifyStripeSignature, webhookController.handleStripeWebhook);
router.post('/paypal', webhookMiddleware.verifyPayPalSignature, webhookController.handlePayPalWebhook);

// Shipping provider webhooks
router.post('/shipping/status', webhookMiddleware.verifyShippingWebhook, webhookController.handleShippingStatusUpdate);
router.post('/shipping/tracking', webhookMiddleware.verifyShippingWebhook, webhookController.handleTrackingUpdate);

// Inventory webhooks
router.post('/inventory/update', webhookMiddleware.verifyInventoryWebhook, webhookController.handleInventoryUpdate);

module.exports = router; 