const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Determine environment
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

// Initialize Firebase Admin
let adminConfig = {};

if (isEmulator) {
  // Use local configuration when running in dev environment
  try {
    const serviceAccountPath = path.join(__dirname, '../serviceAccount.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      adminConfig = { credential: admin.credential.cert(serviceAccount) };
      console.log('Service Account configuration loaded from local file');
    } else {
      console.warn('serviceAccount.json file not found, using default configuration');
      adminConfig = { credential: admin.credential.applicationDefault() };
    }
  } catch (error) {
    console.error('Error loading Service Account configuration:', error);
    adminConfig = { credential: admin.credential.applicationDefault() };
  }
} else {
  // Production environment uses default configuration
  adminConfig = { credential: admin.credential.applicationDefault() };
}

// Initialize Firebase Admin BEFORE importing any modules that use it
admin.initializeApp(adminConfig);

// Only import routers after Firebase is initialized
const router = require('./routes');

// Load runtime configuration
let runtimeConfig = {};
if (isEmulator) {
  try {
    const runtimeConfigPath = path.join(__dirname, '../.runtimeConfig.json');
    if (fs.existsSync(runtimeConfigPath)) {
      runtimeConfig = require(runtimeConfigPath);
      console.log('Runtime configuration loaded from local file');
    }
  } catch (error) {
    console.error('Error loading runtime configuration:', error);
  }
}

// Initialize Koa
const app = new Koa();

// Middleware
app.use(bodyParser());
app.use(cors({
  origin: runtimeConfig.cors?.origin || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-API-Key']
}));
app.use(logger());
app.use(errorHandler());

// Routes
app.use(router.routes());
app.use(router.allowedMethods());

// Start standalone server if in development environment
if (isEmulator && require.main === module) {
  const port = runtimeConfig.api?.port || 5001;
  const host = runtimeConfig.api?.host || 'localhost';
  
  app.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}`);
    console.log(`API health check: http://${host}:${port}/health`);
  });
}

// Export API as Cloud Functions
exports.api = functions.https.onRequest(app.callback());

// Firebase Triggers
exports.processOrder = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snapshot, context) => {
    const orderData = snapshot.data();
    console.log(`New order created: ${context.params.orderId}`, orderData);
    
    // Process logic for new orders
    // Examples: update inventory, send notifications, etc.
    
    return null;
  }); 