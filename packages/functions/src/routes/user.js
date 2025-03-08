import Router from 'koa-router';
import admin from 'firebase-admin';

const router = new Router();

/**
 * @route GET /user/profile
 * @desc Get current user profile
 * @access Private
 */
router.get('/profile', async (ctx) => {
  try {
    const { uid } = ctx.state.user;
    
    // Get user data from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'User profile not found' };
      return;
    }

    const userData = userDoc.data();

    // Check if user is verified
    if (!userData.isVerified) {
      ctx.status = 403;
      ctx.body = { 
        success: false, 
        message: 'Your account is pending verification',
        verificationStatus: 'pending'
      };
      return;
    }

    ctx.body = {
      success: true,
      user: {
        uid,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone || '',
        photoURL: userData.photoURL || '',
        role: userData.role,
        createdAt: userData.createdAt?.toDate(),
        isVerified: userData.isVerified
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to fetch user profile' };
  }
});

/**
 * @route PUT /user/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile', async (ctx) => {
  try {
    const { uid } = ctx.state.user;
    const { fullName, phone, photoURL } = ctx.request.body;
    
    // Validate data
    if (!fullName) {
      ctx.status = 400;
      ctx.body = { success: false, message: 'Full name is required' };
      return;
    }

    // Get user data to check verification status
    const userRef = admin.firestore().collection('users').doc(uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'User profile not found' };
      return;
    }

    const userData = userDoc.data();

    // Check if user is verified
    if (!userData.isVerified) {
      ctx.status = 403;
      ctx.body = { 
        success: false, 
        message: 'Your account is pending verification. Profile cannot be updated.',
        verificationStatus: 'pending'
      };
      return;
    }

    // Update Firebase Auth user
    await admin.auth().updateUser(uid, {
      displayName: fullName,
      ...(photoURL && { photoURL })
    });

    // Update Firestore user
    await userRef.update({
      fullName,
      ...(phone && { phone }),
      ...(photoURL && { photoURL }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    ctx.body = {
      success: true,
      message: 'Profile updated successfully'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update profile' };
  }
});

/**
 * @route GET /user/verification-status
 * @desc Check user verification status
 * @access Private
 */
router.get('/verification-status', async (ctx) => {
  try {
    const { uid } = ctx.state.user;
    
    // Get user from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'User not found' };
      return;
    }

    const userData = userDoc.data();

    ctx.body = {
      success: true,
      status: userData.isVerified ? 'verified' : 'pending',
      isVerified: userData.isVerified
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to check verification status' };
  }
});

export default router; 