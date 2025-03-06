const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const path = require('path');
const fs = require('fs');

// Xác định môi trường
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

// Khởi tạo Firebase Admin
let adminConfig = {};

if (isEmulator) {
  // Sử dụng cấu hình local khi chạy ở môi trường dev
  try {
    const serviceAccountPath = path.join(__dirname, '../serviceAccount.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      adminConfig = { credential: admin.credential.cert(serviceAccount) };
      console.log('Đã tải cấu hình Service Account từ file local');
    } else {
      console.warn('Không tìm thấy file serviceAccount.json, sử dụng cấu hình mặc định');
      adminConfig = { credential: admin.credential.applicationDefault() };
    }
  } catch (error) {
    console.error('Lỗi khi tải cấu hình Service Account:', error);
    adminConfig = { credential: admin.credential.applicationDefault() };
  }
} else {
  // Môi trường production sử dụng cấu hình mặc định
  adminConfig = { credential: admin.credential.applicationDefault() };
}

admin.initializeApp(adminConfig);

// Import các modules api - di chuyển xuống đây, sau khi đã khởi tạo Firebase Admin
const { ordersRouter } = require('./api/orders');
const { productsRouter } = require('./api/products');
const { billingRouter } = require('./api/billing');

// Tải cấu hình runtime
let runtimeConfig = {};
if (isEmulator) {
  try {
    const runtimeConfigPath = path.join(__dirname, '../.runtimeConfig.json');
    if (fs.existsSync(runtimeConfigPath)) {
      runtimeConfig = require(runtimeConfigPath);
      console.log('Đã tải cấu hình runtime từ file local');
    }
  } catch (error) {
    console.error('Lỗi khi tải cấu hình runtime:', error);
  }
}

// Khởi tạo Koa
const app = new Koa();
const router = new Router();

// Middleware
app.use(bodyParser());
app.use(cors({
  origin: runtimeConfig.cors?.origin || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Middleware ghi log
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// Routes
router.get('/health', (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'B2B Manager API đang hoạt động',
    version: '1.0.0',
    environment: runtimeConfig.environment || (isEmulator ? 'development' : 'production')
  };
});

// Sử dụng các router
app.use(ordersRouter.routes());
app.use(productsRouter.routes());
app.use(billingRouter.routes());

// Main router
app.use(router.routes());
app.use(router.allowedMethods());

// Khởi động server standalone nếu đang ở môi trường dev
if (isEmulator && require.main === module) {
  const port = runtimeConfig.api?.port || 5001;
  const host = runtimeConfig.api?.host || 'localhost';
  
  app.listen(port, host, () => {
    console.log(`Server đang chạy tại http://${host}:${port}`);
    console.log(`API health check: http://${host}:${port}/health`);
  });
}

// Export API làm Cloud Functions
exports.api = functions.https.onRequest(app.callback());

// Firebase Triggers
exports.processOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const orderData = snapshot.data();
    console.log(`Đơn hàng mới được tạo: ${context.params.orderId}`, orderData);
    
    // Xử lý logic khi có đơn hàng mới
    // Ví dụ: cập nhật inventory, gửi thông báo, v.v.
    
    return null;
  }); 