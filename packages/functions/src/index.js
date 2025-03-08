import * as functions from 'firebase-functions';
import admin from 'firebase-admin';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from 'koa-cors';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// Import route handlers
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import userManagementRoutes from './routes/userManagement.js';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account file
const serviceAccountPath = resolve(__dirname, '../serviceAccount.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Create Koa app
const app = new Koa();
const router = new Router();

// Middleware
app.use(bodyParser());

// Cấu hình CORS chi tiết hơn
app.use(cors({
  origin: '*',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Authorization', 'Content-Type']
}));

// Force JSON Content-Type middleware
app.use(async (ctx, next) => {
  ctx.set('Content-Type', 'application/json');
  await next();
});

// Error handling middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      success: false,
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };
    ctx.app.emit('error', err, ctx);
  }
});

// Authentication middleware
const requireAuth = async (ctx, next) => {
  try {
    const authorization = ctx.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      ctx.throw(401, 'Unauthorized: No token provided');
    }

    const token = authorization.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      ctx.state.user = decodedToken;
      await next();
    } catch (error) {
      ctx.throw(401, 'Unauthorized: Invalid token');
    }
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
};

// Admin authentication middleware
const requireAdmin = async (ctx, next) => {
  try {
    // First verify they're authenticated
    await requireAuth(ctx, async () => {});

    // Get user record
    const user = ctx.state.user;
    
    // Check if user has admin custom claim
    // Or check if email is linhnguyenvan1902@gmail.com (as specified in requirements)
    if (user.admin === true || user.email === 'linhnguyenvan1902@gmail.com') {
      await next();
    } else {
      ctx.throw(403, 'Forbidden: Admin access required');
    }
  } catch (error) {
    ctx.throw(error.status || 500, error.message);
  }
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
router.use('/admin', requireAdmin, adminRoutes.routes(), adminRoutes.allowedMethods());
router.use('/api/users', userManagementRoutes.routes(), userManagementRoutes.allowedMethods());

// Apply routes to app
app.use(router.routes());
app.use(router.allowedMethods());

// Export the API as a Firebase Function
export const api = functions.https.onRequest(app.callback());

// Export user management functions
export const createUserAccount = functions.auth.user().onCreate(async (user) => {
  try {
    // Create user profile in Firestore
    await admin.firestore().collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isVerified: false, // User needs verification
      role: 'user',
      authProvider: user.providerData[0]?.providerId || 'email'
    });

    console.log(`User profile created for ${user.uid}`);
    return null;
  } catch (error) {
    console.error('Error creating user profile:', error);
    return null;
  }
});

// Clean up when user is deleted
export const deleteUserData = functions.auth.user().onDelete(async (user) => {
  try {
    // Delete user profile from Firestore
    await admin.firestore().collection('users').doc(user.uid).delete();
    console.log(`User profile deleted for ${user.uid}`);
    return null;
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return null;
  }
});

// Start the server directly when in development mode
// This allows the server to be run without Firebase emulator
if (process.env.NODE_ENV !== 'production') {
  // Get port from environment variable or use default (5001)
  const PORT = process.env.PORT || 5001;
  
  // Start server and handle potential errors
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. API server will not start.`);
      console.log('Please use Firebase Emulator to access the API or change PORT environment variable.');
    } else {
      console.error('Failed to start server:', err);
    }
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down server...');
    server.close(() => {
      console.log('Server closed.');
    });
  });
} 