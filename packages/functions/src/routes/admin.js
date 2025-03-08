import Router from 'koa-router';
import admin from 'firebase-admin';
import Joi from 'joi';

const router = new Router();

// Validation schemas
const verifyUserSchema = Joi.object({
  approve: Joi.boolean().required(),
  rejectionReason: Joi.when('approve', {
    is: false,
    then: Joi.string().required(),
    otherwise: Joi.optional()
  })
});

/**
 * @route GET /admin/users
 * @desc Get all users
 * @access Admin only
 */
router.get('/users', async (ctx) => {
  try {
    const { status, limit = 50, page = 1 } = ctx.query;
    
    // Build query
    let query = admin.firestore().collection('users');
    
    // Filter by verification status if provided
    if (status === 'pending') {
      query = query.where('isVerified', '==', false);
    } else if (status === 'verified') {
      query = query.where('isVerified', '==', true);
    }
    
    // Order by creation date
    query = query.orderBy('createdAt', 'desc');
    
    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    query = query.limit(parseInt(limit));
    
    // Execute query
    const snapshot = await query.get();
    const totalQuery = admin.firestore().collection('users');
    
    if (status === 'pending') {
      totalQuery.where('isVerified', '==', false);
    } else if (status === 'verified') {
      totalQuery.where('isVerified', '==', true);
    }
    
    // Map to response format
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        fullName: data.fullName,
        photoURL: data.photoURL || null,
        phone: data.phone || null,
        isVerified: data.isVerified,
        role: data.role,
        authProvider: data.authProvider,
        createdAt: data.createdAt?.toDate(),
      };
    });

    ctx.body = {
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: snapshot.size // This is not accurate for large collections
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to fetch users' };
  }
});

/**
 * @route GET /admin/users/pending
 * @desc Get users pending verification
 * @access Admin only
 */
router.get('/users/pending', async (ctx) => {
  try {
    // Query for unverified users
    const snapshot = await admin.firestore()
      .collection('users')
      .where('isVerified', '==', false)
      .orderBy('createdAt', 'desc')
      .get();
    
    // Map to response format
    const pendingUsers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        fullName: data.fullName,
        photoURL: data.photoURL || null,
        phone: data.phone || null,
        registrationMethod: data.authProvider,
        registeredAt: data.createdAt?.toDate(),
        status: 'pending'
      };
    });

    ctx.body = {
      success: true,
      pendingUsers,
      count: pendingUsers.length
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to fetch pending users' };
  }
});

/**
 * @route GET /admin/users/:userId
 * @desc Get a specific user
 * @access Admin only
 */
router.get('/users/:userId', async (ctx) => {
  try {
    const { userId } = ctx.params;
    
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
      user: {
        id: userDoc.id,
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone || null,
        photoURL: userData.photoURL || null,
        isVerified: userData.isVerified,
        role: userData.role,
        authProvider: userData.authProvider,
        createdAt: userData.createdAt?.toDate(),
        ...(userData.rejectionReason && { rejectionReason: userData.rejectionReason })
      }
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to fetch user' };
  }
});

/**
 * @route POST /admin/users/:userId/verify
 * @desc Approve or reject a user verification
 * @access Admin only
 */
router.post('/users/:userId/verify', async (ctx) => {
  try {
    const { userId } = ctx.params;
    
    // Validate request
    const { error, value } = verifyUserSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { success: false, message: error.details[0].message };
      return;
    }

    const { approve, rejectionReason } = value;
    
    // Get user from Firestore
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'User not found' };
      return;
    }

    const userData = userDoc.data();

    // Skip if already verified/rejected
    if (approve && userData.isVerified) {
      ctx.body = { success: true, message: 'User is already verified' };
      return;
    }

    if (!approve && userData.rejectionReason) {
      ctx.body = { success: true, message: 'User verification was already rejected' };
      return;
    }

    // Update user verification status
    if (approve) {
      await userRef.update({
        isVerified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: ctx.state.user.email
      });

      // You could send email notification here
      
      ctx.body = {
        success: true,
        message: 'User verification approved'
      };
    } else {
      await userRef.update({
        rejectionReason,
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectedBy: ctx.state.user.email
      });

      // You could send email notification here
      
      ctx.body = {
        success: true,
        message: 'User verification rejected'
      };
    }
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to update verification status' };
  }
});

/**
 * @route DELETE /admin/users/:userId
 * @desc Delete a user (admin only)
 * @access Admin only
 */
router.delete('/users/:userId', async (ctx) => {
  try {
    const { userId } = ctx.params;
    
    // Get user from Firestore first to check if exists
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = { success: false, message: 'User not found' };
      return;
    }

    // Delete user from Firebase Auth
    await admin.auth().deleteUser(userId);
    
    // Delete user from Firestore
    // Note: This will also trigger the onDelete function we set up
    await admin.firestore().collection('users').doc(userId).delete();

    ctx.body = {
      success: true,
      message: 'User deleted successfully'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: 'Failed to delete user' };
  }
});

export default router; 