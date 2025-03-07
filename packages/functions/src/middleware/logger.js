/**
 * Logger middleware
 * Logs incoming requests and their processing time
 */
module.exports = () => {
  return async (ctx, next) => {
    const start = Date.now();
    
    // Log request method and URL
    console.log(`→ ${ctx.method} ${ctx.url}`);
    
    try {
      await next();
      
      const ms = Date.now() - start;
      const statusColor = getStatusColor(ctx.status);
      
      // Log response status and time
      console.log(`← ${statusColor}${ctx.status}${resetColor} ${ctx.method} ${ctx.url} - ${ms}ms`);
    } catch (error) {
      const ms = Date.now() - start;
      console.error(`← ${errorColor}ERROR${resetColor} ${ctx.method} ${ctx.url} - ${ms}ms`);
      console.error(error);
      
      throw error; // Re-throw to be handled by error handler
    }
  };
};

// ANSI color codes
const resetColor = '\x1b[0m';
const successColor = '\x1b[32m'; // Green
const warningColor = '\x1b[33m'; // Yellow
const errorColor = '\x1b[31m';   // Red
const infoColor = '\x1b[36m';    // Cyan

/**
 * Get appropriate color based on HTTP status code
 */
function getStatusColor(status) {
  if (status < 300) return successColor;
  if (status < 400) return infoColor;
  if (status < 500) return warningColor;
  return errorColor;
} 