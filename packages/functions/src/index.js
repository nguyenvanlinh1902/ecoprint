// Import module-alias để đăng ký các alias path
import './module-alias.js';

import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import logger from 'koa-logger';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/adminRoutes.js';
import creditRoutes from './routes/creditRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account file
const serviceAccountPath = resolve(__dirname, '../serviceAccount.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize dotenv
dotenv.config();

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// App constants
const PORT = process.env.PORT || 5001;
const API_PREFIX = '/api';

// Initialize Koa app
const app = new Koa();
const router = new Router({
  prefix: API_PREFIX
});

// Middleware
app.use(logger());
app.use(cors({
  origin: '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type', 'Accept'],
  exposeHeaders: ['Content-Length', 'Date', 'X-Request-Id']
}));
app.use(helmet());
app.use(bodyParser({
  enableTypes: ['json', 'form', 'text'],
  onerror: (err, ctx) => {
    ctx.throw(422, 'body parse error');
  }
}));

// Ensure JSON content type for all API responses
app.use(async (ctx, next) => {
  ctx.set('Content-Type', 'application/json');
  await next();
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.error('Server error:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };
    ctx.app.emit('error', err, ctx);
  }
});

// Auth middleware
app.use(async (ctx, next) => {
  try {
    // Get token from header
    const authHeader = ctx.request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Verify token
      const decodedToken = await admin.auth().verifyIdToken(token);
      ctx.state.user = decodedToken;
    }
    
    await next();
  } catch (error) {
    // Allow the request to proceed even without valid auth
    // Protected routes will check ctx.state.user
    await next();
  }
});

// Authentication middleware
const requireAuth = async (ctx, next) => {
  // Để dễ dàng phát triển và test, cho phép access khi trong môi trường development
  if (process.env.NODE_ENV === 'development') {
    // Mô phỏng người dùng có role admin trong development
    if (!ctx.state.user) {
      ctx.state.user = { 
        uid: 'dev-user-id',
        email: 'dev@example.com',
        role: 'admin',
        name: 'Development User'
      };
    }
    await next();
    return;
  }

  // Kiểm tra xác thực trong môi trường production
  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = { success: false, message: 'Unauthorized access' };
    return;
  }
  await next();
};

// Admin authentication middleware
const requireAdmin = async (ctx, next) => {
  // Cho phép access admin trong môi trường development
  if (process.env.NODE_ENV === 'development') {
    // Đảm bảo user có role admin
    if (ctx.state.user && !ctx.state.user.role) {
      ctx.state.user.role = 'admin';
    }
    await next();
    return;
  }

  // Kiểm tra quyền admin trong môi trường production
  if (!ctx.state.user || ctx.state.user.role !== 'admin') {
    ctx.status = 403;
    ctx.body = { success: false, message: 'Admin access required' };
    return;
  }
  await next();
};

// Root route
router.get('/', (ctx) => {
  ctx.body = {
    message: 'EcoPrint API Server',
    version: '1.0.0',
    status: 'running'
  };
});

// Register routes
router.use('/auth', authRoutes.routes(), authRoutes.allowedMethods());
router.use('/user', requireAuth, userRoutes.routes(), userRoutes.allowedMethods());
router.use('/admin', requireAuth, requireAdmin, adminRoutes.routes(), adminRoutes.allowedMethods());
router.use('/credit', requireAuth, creditRoutes.routes(), creditRoutes.allowedMethods());
router.use('/order', requireAuth, orderRoutes.routes(), orderRoutes.allowedMethods());

// Add a basic health check route
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok', timestamp: new Date().toISOString() };
});

// Use router middleware
app.use(router.routes());
app.use(router.allowedMethods());

// Debugging log for routes
console.log('Registered Routes:');
router.stack.forEach(route => {
  console.log(`${route.methods.join(',')} ${route.path}`);
});

// Export the API as a Firebase Function with appropriate configuration
export const api = functions.https.onRequest((req, res) => {
  // Set default headers for CORS and content type
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
  
  // Handle OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
    return;
  }
  
  // Handle actual request with Koa
  return app.callback()(req, res);
});

// Export user management functions
export const createUser = functions.auth.user().onCreate(async (user) => {
  try {
    // Set default custom claims for new users
    await admin.auth().setCustomUserClaims(user.uid, { role: 'user' });
    
    // Create user document in Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      phoneNumber: user.phoneNumber || '',
      role: 'user',
      isVerified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log(`User ${user.uid} created successfully with default role`);
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

// Start server if not in Firebase Functions environment
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}${API_PREFIX}`);
  });
} 