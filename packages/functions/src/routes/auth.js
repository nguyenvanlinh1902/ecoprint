import Router from 'koa-router';
import admin from 'firebase-admin';
import Joi from 'joi';

const router = new Router();

// Validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const googleAuthSchema = Joi.object({
  idToken: Joi.string().required()
});

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', async (ctx) => {
  try {
    const { error, value } = registerSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { success: false, message: error.details[0].message };
      return;
    }

    const { email, password, fullName, phone } = value;

    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName
    });

    // Add additional user data in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      fullName,
      phone: phone || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isVerified: false, // Requires verification
      role: 'user',
      authProvider: 'email'
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: 'Registration successful. Your account is pending verification.',
      userId: userRecord.uid
    };
  } catch (error) {
    ctx.status = error.code === 'auth/email-already-exists' ? 409 : 500;
    ctx.body = {
      success: false,
      message: error.code === 'auth/email-already-exists' 
        ? 'Email already registered' 
        : 'Registration failed'
    };
  }
});

/**
 * @route POST /auth/login
 * @desc Login with email and password
 * @access Public
 */
router.post('/login', async (ctx) => {
  try {
    // Validate request
    const { error, value } = loginSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { success: false, message: error.details[0].message };
      return;
    }

    // This endpoint is mostly for frontend reference
    // In a real app, authentication is done client-side with Firebase Auth SDK
    // This is just a placeholder to show the expected flow
    ctx.body = {
      success: true,
      message: 'Authentication should be handled by Firebase Auth client SDK',
      note: 'Use Firebase Auth REST API or client SDK for actual implementation'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Login failed' };
  }
});

/**
 * @route POST /auth/google
 * @desc Authenticate with Google
 * @access Public
 */
router.post('/google', async (ctx) => {
  try {
    // Validate request
    const { error, value } = googleAuthSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { success: false, message: error.details[0].message };
      return;
    }

    const { idToken } = value;

    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in Firestore
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create new user document
      await userRef.set({
        email,
        fullName: name || '',
        photoURL: picture || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isVerified: false, // Requires verification
        role: 'user',
        authProvider: 'google'
      });
    }

    // Get latest user data including verification status
    const userData = await userRef.get();
    const user = userData.data();

    // Create custom token for client authentication
    const customToken = await admin.auth().createCustomToken(uid);

    ctx.body = {
      success: true,
      user: {
        uid,
        email,
        fullName: user.fullName || name,
        isVerified: user.isVerified,
        role: user.role
      },
      token: customToken
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Google authentication failed' };
  }
});

/**
 * @route GET /auth/verification-status
 * @desc Check user verification status
 * @access Public (but requires a valid user ID)
 */
router.get('/verification-status/:userId', async (ctx) => {
  try {
    const { userId } = ctx.params;
    
    // Validate user ID
    if (!userId) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'User ID is required' };
      return;
    }

    // Get user from Firestore
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'User not found' };
      return;
    }

    const userData = userDoc.data();

    ctx.body = {
      success: true,
      isVerified: userData.isVerified
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to check verification status' };
  }
});

export default router; 