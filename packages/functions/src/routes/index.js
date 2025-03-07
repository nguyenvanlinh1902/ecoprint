const Router = require('koa-router');
const posRoutes = require('./pos');
const webhookRoutes = require('./webhook');

const router = new Router();

// Mount all routes
router.use(posRoutes.routes());
router.use(webhookRoutes.routes());

// Health check endpoint
router.get('/health', async (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'B2B Manager API is operational',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  };
});

module.exports = router; 