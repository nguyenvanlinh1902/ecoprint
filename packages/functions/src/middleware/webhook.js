const crypto = require('crypto');
const config = require('../config');

/**
 * Verify Stripe webhook signature
 */
exports.verifyStripeSignature = async (ctx, next) => {
  try {
    const signature = ctx.headers['stripe-signature'];
    
    if (!signature) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Missing Stripe signature'
      };
      return;
    }
    
    // Get raw body for signature verification
    const rawBody = ctx.request.rawBody;
    
    try {
      // This would normally use the stripe library
      // const event = stripe.webhooks.constructEvent(rawBody, signature, config.stripe.webhookSecret);
      
      // Simple signature verification for example purposes
      const hmac = crypto.createHmac('sha256', config.stripe.webhookSecret);
      const expectedSignature = hmac.update(rawBody).digest('hex');
      
      if (signature === expectedSignature) {
        // Add parsed event to context if needed
        // ctx.state.stripeEvent = event;
        await next();
      } else {
        ctx.status = 401;
        ctx.body = {
          status: 'error',
          message: 'Invalid Stripe signature'
        };
      }
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Invalid Stripe webhook',
        error: error.message
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Server error verifying Stripe webhook',
      error: error.message
    };
  }
};

/**
 * Verify PayPal webhook signature
 */
exports.verifyPayPalSignature = async (ctx, next) => {
  try {
    const webhookId = ctx.headers['paypal-webhook-id'];
    
    if (!webhookId) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Missing PayPal webhook ID'
      };
      return;
    }
    
    // Simplified validation (would use PayPal SDK in production)
    if (webhookId === config.paypal.webhookId) {
      await next();
    } else {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Invalid PayPal webhook ID'
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Server error verifying PayPal webhook',
      error: error.message
    };
  }
};

/**
 * Verify shipping webhook
 */
exports.verifyShippingWebhook = async (ctx, next) => {
  try {
    const apiKey = ctx.headers['x-shipping-api-key'];
    
    if (!apiKey || apiKey !== config.shipping.apiKey) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Invalid shipping API key'
      };
      return;
    }
    
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Server error verifying shipping webhook',
      error: error.message
    };
  }
};

/**
 * Verify inventory webhook
 */
exports.verifyInventoryWebhook = async (ctx, next) => {
  try {
    const apiKey = ctx.headers['x-inventory-api-key'];
    
    if (!apiKey || apiKey !== config.inventory.apiKey) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Invalid inventory API key'
      };
      return;
    }
    
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Server error verifying inventory webhook',
      error: error.message
    };
  }
}; 