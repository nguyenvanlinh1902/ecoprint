import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Koa from 'koa';
import * as Router from 'koa-router';
import * as bodyParser from 'koa-bodyparser';
import * as cors from 'koa-cors';

// Khởi tạo Firebase Admin
admin.initializeApp();

// Khởi tạo Koa
const app = new Koa();
const router = new Router();

// Middleware
app.use(bodyParser());
app.use(cors());

// Routes
router.get('/health', (ctx) => {
  ctx.body = {
    status: 'success',
    message: 'B2B Manager API đang hoạt động',
    version: '1.0.0',
  };
});

// Import các modules api
import { ordersRouter } from './api/orders';
import { productsRouter } from './api/products';
import { billingRouter } from './api/billing';

// Sử dụng các router
app.use(ordersRouter.routes());
app.use(productsRouter.routes());
app.use(billingRouter.routes());

// Main router
app.use(router.routes());
app.use(router.allowedMethods());

// Export API làm Cloud Functions
export const api = functions.https.onRequest(app.callback());

// Firebase Triggers
export const processOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const orderData = snapshot.data();
    console.log(`Đơn hàng mới được tạo: ${context.params.orderId}`, orderData);
    
    // Xử lý logic khi có đơn hàng mới
    // Ví dụ: cập nhật inventory, gửi thông báo, v.v.
    
    return null;
  }); 