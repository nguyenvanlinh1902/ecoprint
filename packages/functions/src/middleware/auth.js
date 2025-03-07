const admin = require('firebase-admin');

/**
 * Authentication middleware
 * Verifies the user's Firebase token and adds user information to the context
 */
exports.authenticate = async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Unauthorized - Missing or invalid token'
      };
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Add user information to context state
      ctx.state.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
        authTime: decodedToken.auth_time
      };
      
      // Fetch additional user data from Firestore
      const userSnapshot = await admin.firestore()
        .collection('users')
        .doc(decodedToken.uid)
        .get();
      
      if (userSnapshot.exists) {
        ctx.state.user.profile = userSnapshot.data();
      }
      
      await next();
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Unauthorized - Invalid token',
        error: error.message
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Server error during authentication',
      error: error.message
    };
  }
};

/**
 * Admin authorization middleware
 * Verifies the user has admin role
 */
exports.requireAdmin = async (ctx, next) => {
  try {
    // authenticate middleware should have already set ctx.state.user
    if (!ctx.state.user) {
      ctx.status = 401;
      ctx.body = {
        status: 'error',
        message: 'Unauthorized - Authentication required'
      };
      return;
    }

    const { profile } = ctx.state.user;
    
    if (!profile || !profile.roles || !profile.roles.includes('admin')) {
      ctx.status = 403;
      ctx.body = {
        status: 'error',
        message: 'Forbidden - Admin access required'
      };
      return;
    }
    
    await next();
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      status: 'error',
      message: 'Server error during authorization',
      error: error.message
    };
  }
}; 