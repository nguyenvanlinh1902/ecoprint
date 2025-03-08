import Router from 'koa-router';
import admin from 'firebase-admin';
import Joi from 'joi';

const router = new Router();

// Giữ lại mock data để sử dụng khi không có kết nối với Firebase
const mockPendingUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    registrationMethod: 'Email',
    registeredAt: '2023-10-15 14:30',
    status: 'pending'
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@gmail.com',
    registrationMethod: 'Google',
    registeredAt: '2023-10-16 09:45',
    status: 'pending'
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert@company.com',
    registrationMethod: 'Email',
    registeredAt: '2023-10-16 16:20',
    status: 'pending'
  },
  {
    id: 4,
    name: 'Emily Wilson',
    email: 'emily.wilson@gmail.com',
    registrationMethod: 'Google',
    registeredAt: '2023-10-17 11:10',
    status: 'pending'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david.brown@example.com',
    registrationMethod: 'Email',
    registeredAt: '2023-10-17 15:35',
    status: 'pending'
  }
];

/**
 * @route GET /api/users/pending
 * @desc Lấy danh sách người dùng đang chờ xác thực
 * @access Public (trong thực tế nên là Admin only)
 */
router.get('/pending', async (ctx) => {
  try {
    // Cố gắng lấy dữ liệu từ Firestore
    let pendingUsers = [];
    
    try {
      const snapshot = await admin.firestore()
        .collection('users')
        .where('isVerified', '==', false)
        .get();
        
      if (!snapshot.empty) {
        pendingUsers = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.displayName || 'Unnamed User',
            email: data.email,
            registrationMethod: data.authProvider || 'Email',
            registeredAt: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleString() : 'Unknown',
            status: 'pending'
          };
        });
      }
    } catch (firestoreError) {
      console.error('Error fetching from Firestore:', firestoreError);
      // Nếu có lỗi khi lấy dữ liệu từ Firestore, sử dụng mock data
      console.log('Using mock data due to Firestore error');
      pendingUsers = mockPendingUsers;
    }
    
    // Trả về dữ liệu
    ctx.body = {
      success: true,
      pendingUsers,
      count: pendingUsers.length
    };
  } catch (error) {
    console.error('Error in /pending endpoint:', error);
    ctx.status = 500;
    ctx.body = { 
      success: false, 
      message: 'Failed to fetch pending users',
      error: error.message
    };
  }
});

// Schema validation cho đăng ký người dùng
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  fullName: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]{10,11}$/).optional()
});

/**
 * @route POST /api/users/register
 * @desc Đăng ký người dùng mới
 * @access Public
 */
router.post('/register', async (ctx) => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(ctx.request.body);
    if (error) {
      ctx.status = 400;
      ctx.body = { 
        success: false, 
        message: error.details[0].message
      };
      return;
    }

    const { email, password, fullName, phone } = value;

    // Kiểm tra xem email đã tồn tại chưa
    try {
      const userRecord = await admin.auth().getUserByEmail(email);
      if (userRecord) {
        ctx.status = 400;
        ctx.body = { 
          success: false, 
          message: 'Email already in use'
        };
        return;
      }
    } catch (error) {
      // Nếu getUserByEmail báo lỗi "user not found", điều này là bình thường 
      // và chúng ta có thể tiếp tục
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Tạo user trong Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: fullName,
      disabled: false
    });

    // Tạo hồ sơ user trong Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName: fullName,
      phone: phone || '',
      authProvider: 'Email',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isVerified: false,
      status: 'pending',
      role: 'user'
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: 'Registration successful. Your account is pending verification.',
      user: {
        id: userRecord.uid,
        email,
        fullName,
        status: 'pending'
      }
    };
  } catch (error) {
    console.error('Registration error:', error);
    ctx.status = 500;
    ctx.body = { 
      success: false, 
      message: 'Registration failed',
      error: error.message
    };
  }
});

/**
 * @route POST /api/users/register-google
 * @desc Đăng ký user bằng Google
 * @access Public
 */
router.post('/register-google', async (ctx) => {
  try {
    const { idToken, profile } = ctx.request.body;
    
    if (!idToken || !profile || !profile.email) {
      ctx.status = 400;
      ctx.body = { 
        success: false, 
        message: 'Invalid Google profile data or ID token'
      };
      return;
    }
    
    // Xác thực ID token từ Google
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: 'Invalid Google ID token'
      };
      return;
    }
    
    // Kiểm tra xem email đã được xác thực không
    if (!decodedToken.email_verified) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Email not verified by Google'
      };
      return;
    }
    
    // Kiểm tra xem user đã tồn tại trong Firestore chưa
    const userSnapshot = await admin.firestore()
      .collection('users')
      .where('email', '==', profile.email)
      .limit(1)
      .get();
    
    let userId = decodedToken.uid;
    
    if (!userSnapshot.empty) {
      // User đã tồn tại, cập nhật thông tin
      const existingUser = userSnapshot.docs[0];
      userId = existingUser.id;
      
      await admin.firestore().collection('users').doc(userId).update({
        lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        photoURL: profile.photoURL || ''
      });
      
      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Google login successful. Your account is already registered.',
        user: {
          id: userId,
          email: profile.email,
          fullName: profile.displayName,
          status: existingUser.data().isVerified ? 'approved' : 'pending'
        }
      };
      return;
    }
    
    // Tạo mới hồ sơ user trong Firestore
    await admin.firestore().collection('users').doc(userId).set({
      email: profile.email,
      displayName: profile.displayName || '',
      photoURL: profile.photoURL || '',
      authProvider: 'Google',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isVerified: false,
      status: 'pending',
      role: 'user'
    });
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: 'Google registration successful. Your account is pending verification.',
      user: {
        id: userId,
        email: profile.email,
        fullName: profile.displayName,
        status: 'pending'
      }
    };
  } catch (error) {
    console.error('Google registration error:', error);
    ctx.status = 500;
    ctx.body = { 
      success: false, 
      message: 'Google registration failed',
      error: error.message
    };
  }
});

/**
 * @route GET /api/users/:id
 * @desc Lấy thông tin một user
 * @access Public (trong thực tế nên được bảo vệ)
 */
router.get('/:id', async (ctx) => {
  try {
    const { id } = ctx.params;
    
    // Tìm user trong danh sách mockPendingUsers
    const user = mockPendingUsers.find(u => u.id.toString() === id);
    
    if (!user) {
      ctx.status = 404;
      ctx.body = { 
        success: false, 
        message: 'User not found'
      };
      return;
    }
    
    ctx.body = {
      success: true,
      user
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { 
      success: false, 
      message: 'Failed to fetch user',
      error: error.message
    };
  }
});

/**
 * @route PUT /api/users/:id/verify
 * @desc Xác thực một user
 * @access Admin only (trong thực tế)
 */
router.put('/:id/verify', async (ctx) => {
  try {
    const { id } = ctx.params;
    const { approve, rejectionReason } = ctx.request.body;
    
    // Kiểm tra xem user có tồn tại trong Firestore không
    const userRef = admin.firestore().collection('users').doc(id);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      ctx.status = 404;
      ctx.body = { 
        success: false, 
        message: 'User not found'
      };
      return;
    }
    
    // Lấy user data
    const userData = userDoc.data();
    
    // Cập nhật trạng thái
    if (approve) {
      // Phê duyệt user
      await userRef.update({
        isVerified: true,
        status: 'approved',
        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Cập nhật custom claims trong Firebase Auth để thay đổi quyền
      try {
        await admin.auth().setCustomUserClaims(id, { 
          verified: true,
          role: userData.role || 'user'
        });
      } catch (authError) {
        console.error('Error setting custom claims:', authError);
      }
      
    } else {
      // Từ chối user
      await userRef.update({
        isVerified: false,
        status: 'rejected',
        rejectionReason: rejectionReason || 'No reason provided',
        rejectedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Lấy dữ liệu user đã cập nhật
    const updatedUserDoc = await userRef.get();
    const updatedUser = {
      id: updatedUserDoc.id,
      ...updatedUserDoc.data()
    };
    
    ctx.body = {
      success: true,
      message: approve ? 'User approved successfully' : 'User rejected successfully',
      user: updatedUser
    };
  } catch (error) {
    console.error('Error verifying user:', error);
    ctx.status = 500;
    ctx.body = { 
      success: false, 
      message: 'Failed to verify user',
      error: error.message
    };
  }
});

export default router; 