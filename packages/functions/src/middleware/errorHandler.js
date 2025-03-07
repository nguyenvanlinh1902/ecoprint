/**
 * Error handling middleware
 * Catches errors and formats them as JSON responses
 */
module.exports = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      // Set appropriate status code
      ctx.status = err.status || err.statusCode || 500;
      
      // Format error response
      ctx.body = {
        status: 'error',
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV !== 'production' && { 
          stack: err.stack,
          details: err.details || err.errors || null
        })
      };
      
      // Emit error for logging
      ctx.app.emit('error', err, ctx);
    }
  };
}; 