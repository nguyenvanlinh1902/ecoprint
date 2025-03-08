import userRepository from '../repositories/userRepository.js';
import admin from 'firebase-admin';

/**
 * Service xử lý business logic liên quan đến quản lý người dùng
 */
const userService = {
  /**
   * Tạo người dùng mới
   * @param {Object} userData - Dữ liệu người dùng
   * @returns {Promise<Object>} Người dùng đã tạo
   */
  createUser: async (userData) => {
    try {
      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: userData.email,
        password: userData.password,
        displayName: userData.fullName
      });
      
      // Set custom claims if role is admin
      if (userData.role === 'admin') {
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'admin' });
      }
      
      // Add additional user data in Firestore
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email: userData.email,
        fullName: userData.fullName,
        phone: userData.phone || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isVerified: userData.isVerified || true,
        role: userData.role || 'user',
        authProvider: 'email',
        createdBy: 'admin'
      });
      
      // Return user data
      return {
        uid: userRecord.uid,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role || 'user',
        isVerified: userData.isVerified || true
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách tất cả người dùng với phân trang, tìm kiếm và lọc
   * @param {Object} options - Các tùy chọn
   */
  getAllUsers: async (options) => {
    try {
      // Create base query
      let usersRef = admin.firestore().collection('users');
      
      // Apply filters
      if (options.status === 'pending') {
        usersRef = usersRef.where('isVerified', '==', false);
      } else if (options.status === 'verified') {
        usersRef = usersRef.where('isVerified', '==', true);
      }
      
      // Apply sorting
      usersRef = usersRef.orderBy(options.sortBy || 'createdAt', options.sortOrder || 'desc');
      
      // Get total count for pagination
      const countSnapshot = await usersRef.get();
      const total = countSnapshot.size;
      
      // Apply pagination
      const offset = (options.page - 1) * options.limit;
      usersRef = usersRef.limit(options.limit).offset(offset);
      
      // Execute the query
      const snapshot = await usersRef.get();
      
      // Map to response format
      let users = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          fullName: data.displayName || data.fullName,
          photoURL: data.photoURL || null,
          phone: data.phone || null,
          isVerified: data.isVerified || false,
          role: data.role || 'user',
          authProvider: data.authProvider || 'email',
          createdAt: data.createdAt ? data.createdAt.toDate() : null
        };
      });
      
      // Apply search in memory if needed
      if (options.search) {
        const searchLower = options.search.toLowerCase();
        users = users.filter(user => 
          (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
          (user.email && user.email.toLowerCase().includes(searchLower)) ||
          (user.phone && user.phone.toLowerCase().includes(searchLower))
        );
      }
      
      return { 
        users, 
        pagination: {
          total,
          page: options.page,
          limit: options.limit,
          totalPages: Math.ceil(total / options.limit)
        }
      };
    } catch (error) {
      console.error('Error in userService.getAllUsers:', error);
      throw error;
    }
  },
  
  /**
   * Lấy danh sách người dùng đang chờ xác thực
   */
  getPendingUsers: async () => {
    try {
      const snapshot = await admin.firestore()
        .collection('users')
        .where('isVerified', '==', false)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          fullName: data.displayName || data.fullName,
          photoURL: data.photoURL || null,
          phone: data.phone || null,
          registrationMethod: data.authProvider,
          registeredAt: data.createdAt ? data.createdAt.toDate() : null,
          status: 'pending'
        };
      });
    } catch (error) {
      console.error('Error in userService.getPendingUsers:', error);
      
      // Return empty array on error to prevent crashes
      return [];
    }
  },
  
  /**
   * Lấy thông tin chi tiết người dùng theo ID
   * @param {string} userId - ID của người dùng
   */
  getUserById: async (userId) => {
    try {
      const doc = await admin.firestore().collection('users').doc(userId).get();
      
      if (!doc.exists) {
        return null;
      }
      
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        fullName: data.displayName || data.fullName,
        photoURL: data.photoURL || null,
        phone: data.phone || null,
        isVerified: data.isVerified,
        role: data.role,
        authProvider: data.authProvider,
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
        ...(data.rejectionReason && { rejectionReason: data.rejectionReason })
      };
    } catch (error) {
      console.error('Error in userService.getUserById:', error);
      return null;
    }
  },
  
  /**
   * Kiểm tra người dùng tồn tại
   * @param {string} userId - ID của người dùng
   */
  checkUserExists: async (userId) => {
    try {
      const doc = await admin.firestore().collection('users').doc(userId).get();
      return doc.exists;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  },
  
  /**
   * Phê duyệt xác thực người dùng
   * @param {string} userId - ID của người dùng
   * @param {string} approvedBy - Email của người phê duyệt
   */
  approveUser: async (userId, approvedBy) => {
    try {
      const userData = {
        isVerified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
        verifiedBy: approvedBy,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await admin.firestore().collection('users').doc(userId).update(userData);
      return true;
    } catch (error) {
      console.error('Error approving user:', error);
      throw error;
    }
  },
  
  /**
   * Từ chối xác thực người dùng
   * @param {string} userId - ID của người dùng
   * @param {string} rejectionReason - Lý do từ chối
   * @param {string} rejectedBy - Email của người từ chối
   */
  rejectUser: async (userId, rejectionReason, rejectedBy) => {
    try {
      const userData = {
        rejectionReason,
        rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
        rejectedBy,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await admin.firestore().collection('users').doc(userId).update(userData);
      return true;
    } catch (error) {
      console.error('Error rejecting user:', error);
      throw error;
    }
  },
  
  /**
   * Xóa người dùng
   * @param {string} userId - ID của người dùng
   */
  deleteUser: async (userId) => {
    try {
      await admin.firestore().collection('users').doc(userId).delete();
      
      // Thêm logic xóa user trong Firebase Auth nếu cần
      try {
        await admin.auth().deleteUser(userId);
      } catch (authError) {
        console.error('Error deleting user from Auth:', authError);
        // Tiếp tục ngay cả khi xóa Auth thất bại
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

export default userService; 