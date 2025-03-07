const path = require('path');
const fs = require('fs');

// Environment variables
const environment = process.env.NODE_ENV || 'development';
const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

// Load runtime config if in emulator mode
let runtimeConfig = {};
if (isEmulator) {
  try {
    const runtimeConfigPath = path.join(__dirname, '../../.runtimeConfig.json');
    if (fs.existsSync(runtimeConfigPath)) {
      runtimeConfig = require(runtimeConfigPath);
    }
  } catch (error) {
    console.error('Error loading runtime configuration:', error);
  }
}

// Base configuration
const config = {
  environment,
  isEmulator,
  
  // Firebase
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || runtimeConfig.firebase?.projectId || 'ecoprint-28dd2',
    databaseURL: process.env.FIREBASE_DATABASE_URL || runtimeConfig.firebase?.databaseURL,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || runtimeConfig.firebase?.storageBucket
  },
  
  // API
  api: {
    port: process.env.PORT || runtimeConfig.api?.port || 5001,
    host: process.env.HOST || runtimeConfig.api?.host || 'localhost',
    baseUrl: process.env.API_BASE_URL || runtimeConfig.api?.baseUrl || ''
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || runtimeConfig.cors?.origin || '*'
  },
  
  // Authentication
  auth: {
    jwtExpiration: 60 * 60, // 1 hour (in seconds)
    refreshTokenExpiration: 60 * 60 * 24 * 7 // 7 days (in seconds)
  },
  
  // Payment gateways
  stripe: {
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || runtimeConfig.stripe?.webhookSecret || 'whsec_test',
    apiKey: process.env.STRIPE_API_KEY || runtimeConfig.stripe?.apiKey || 'sk_test'
  },
  
  paypal: {
    webhookId: process.env.PAYPAL_WEBHOOK_ID || runtimeConfig.paypal?.webhookId || 'webhook_id',
    clientId: process.env.PAYPAL_CLIENT_ID || runtimeConfig.paypal?.clientId || 'client_id',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || runtimeConfig.paypal?.clientSecret || 'client_secret'
  },
  
  // Shipping
  shipping: {
    apiKey: process.env.SHIPPING_API_KEY || runtimeConfig.shipping?.apiKey || 'shipping_api_key'
  },
  
  // Inventory
  inventory: {
    apiKey: process.env.INVENTORY_API_KEY || runtimeConfig.inventory?.apiKey || 'inventory_api_key'
  }
};

module.exports = config; 