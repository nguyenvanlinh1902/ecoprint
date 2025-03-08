import admin from 'firebase-admin';

/**
 * Repository để tương tác với collection users trong Firestore
 */
const userRepository = {
  /**
   * Tìm người dùng theo các điều kiện lọc và phân trang
   * @param {Object} options - Các tùy chọn
   */
  findUsers: async (options) => {
    const { 
      status = 'all', 
      limit = 10, 
      page = 1, 
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;

    // Tính toán offset
    const offset = (page - 1) * limit;
    
    // Tạo truy vấn cơ bản
    let query = admin.firestore().collection('users');
    
    // Áp dụng bộ lọc status
    if (status === 'pending') {
      query = query.where('isVerified', '==', false);
    } else if (status === 'verified') {
      query = query.where('isVerified', '==', true);
    }
    
    // Sắp xếp kết quả
    query = query.orderBy(sortBy, sortOrder);
    
    // Tạo truy vấn đếm
    const countQuery = query;
    
    // Áp dụng phân trang
    query = query.limit(limit).offset(offset);
    
    // Thực thi truy vấn
    const snapshot = await query.get();
    
    // Lấy tổng số bản ghi (có thể tối ưu hơn cho bộ sưu tập lớn)
    const countSnapshot = await countQuery.get();
    const total = countSnapshot.size;
    
    // Chuyển đổi kết quả
    let users = snapshot.docs.map(doc => {
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
        ...(data.companyName && { companyName: data.companyName }),
        ...(data.rejectionReason && { rejectionReason: data.rejectionReason })
      };
    });
    
    // Áp dụng tìm kiếm trong bộ nhớ nếu có
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        (user.fullName && user.fullName.toLowerCase().includes(searchLower)) ||
        (user.email && user.email.toLowerCase().includes(searchLower)) ||
        (user.phone && user.phone.toLowerCase().includes(searchLower))
      );
    }
    
    return { users, total };
  },
  
  /**
   * Tìm người dùng đang chờ xác thực
   */
  findPendingUsers: async () => {
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
        fullName: data.fullName,
        photoURL: data.photoURL || null,
        phone: data.phone || null,
        registrationMethod: data.authProvider,
        registeredAt: data.createdAt?.toDate(),
        status: 'pending'
      };
    });
  },
  
  /**
   * Tìm người dùng theo ID
   * @param {string} userId - ID của người dùng
   */
  findUserById: async (userId) => {
    const doc = await admin.firestore().collection('users').doc(userId).get();
    
    if (!doc.exists) {
      return null;
    }
    
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
      ...(data.companyName && { companyName: data.companyName }),
      ...(data.rejectionReason && { rejectionReason: data.rejectionReason })
    };
  },
  
  /**
   * Cập nhật thông tin người dùng
   * @param {string} userId - ID của người dùng
   * @param {Object} data - Dữ liệu cập nhật
   */
  updateUser: async (userId, data) => {
    // Thêm thời gian cập nhật
    const updateData = {
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('users').doc(userId).update(updateData);
    return true;
  },
  
  /**
   * Xóa người dùng
   * @param {string} userId - ID của người dùng
   */
  deleteUser: async (userId) => {
    await admin.firestore().collection('users').doc(userId).delete();
    return true;
  }
};

export default userRepository; 