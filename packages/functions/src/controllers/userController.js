import userService from '../services/userService.js';

/**
 * Controller xử lý các request liên quan đến quản lý người dùng
 */
const userController = {
  /**
   * Tạo người dùng mới (dành cho Admin)
   */
  createUser: async (ctx) => {
    try {
      const userData = ctx.request.body;
      
      if (!userData.email || !userData.password || !userData.fullName) {
        ctx.status = 400;
        ctx.body = { 
          success: false, 
          message: 'Email, password, and fullName are required' 
        };
        return;
      }
      
      // Check if role is valid if provided
      if (userData.role && !['user', 'admin'].includes(userData.role)) {
        ctx.status = 400;
        ctx.body = { 
          success: false, 
          message: 'Invalid role. Must be either "user" or "admin"' 
        };
        return;
      }
      
      // Create the user
      const result = await userService.createUser({
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName,
        phone: userData.phone || '',
        role: userData.role || 'user',
        isVerified: userData.isVerified !== undefined ? userData.isVerified : true
      });
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'User created successfully',
        user: {
          id: result.uid,
          email: result.email,
          fullName: result.fullName,
          role: result.role,
          isVerified: result.isVerified
        }
      };
    } catch (error) {
      console.error('Error in createUser controller:', error);
      
      if (error.code === 'auth/email-already-exists') {
        ctx.status = 409;
        ctx.body = { success: false, message: 'Email already exists' };
      } else {
        ctx.status = 500;
        ctx.body = { success: false, message: 'Failed to create user' };
      }
    }
  },

  /**
   * Lấy danh sách người dùng với phân trang, tìm kiếm và lọc
   */
  getAllUsers: async (ctx) => {
    try {
      // Use validated data from middleware
      const options = ctx.state.validatedData || {
        status: 'all', 
        limit: 10, 
        page: 1, 
        search: '',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      // Get users with pagination
      const result = await userService.getAllUsers(options);
      
      ctx.body = {
        success: true,
        users: result.users,
        pagination: result.pagination
      };
    } catch (error) {
      console.error('Error in getAllUsers controller:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to fetch users' };
    }
  },
  
  /**
   * Lấy danh sách người dùng đang chờ xác thực
   */
  getPendingUsers: async (ctx) => {
    try {
      const pendingUsers = await userService.getPendingUsers();
      
      ctx.body = {
        success: true,
        pendingUsers,
        count: pendingUsers.length
      };
    } catch (error) {
      console.error('Error in getPendingUsers controller:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to fetch pending users' };
    }
  },
  
  /**
   * Lấy thông tin chi tiết của một người dùng
   */
  getUserDetails: async (ctx) => {
    try {
      const { userId } = ctx.params;
      
      const user = await userService.getUserById(userId);
      
      if (!user) {
        ctx.status = 404;
        ctx.body = { success: false, message: 'User not found' };
        return;
      }

      ctx.body = {
        success: true,
        user
      };
    } catch (error) {
      console.error('Error in getUserDetails controller:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to fetch user' };
    }
  },

  /**
   * |
   * @param ctx
   * @returns {Promise<void>}
   */
  verifyUser: async (ctx) => {
    try {
      const { userId } = ctx.params;
      const { approve, rejectionReason } = ctx.state.validatedData;
      console.log( ctx);
      
      // Check if user exists
      const userExists = await userService.checkUserExists(userId);
      if (!userExists) {
        ctx.status = 404;
        ctx.body = { success: false, message: 'User not found' };
        return;
      }

      // Verify or reject user
      if (approve) {
        await userService.approveUser(userId, ctx.state.user?.email || 'system');
        ctx.body = {
          success: true,
          message: 'User verification approved'
        };
      } else {
        await userService.rejectUser(userId, rejectionReason, ctx.state.user?.email || 'system');
        ctx.body = {
          success: true,
          message: 'User verification rejected'
        };
      }
    } catch (error) {
      console.error('Error in verifyUser controller:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to update verification status' };
    }
  },
  
  /**
   * Xóa người dùng
   */
  deleteUser: async (ctx) => {
    try {
      const { userId } = ctx.params;
      
      // Check if user exists
      const userExists = await userService.checkUserExists(userId);
      if (!userExists) {
        ctx.status = 404;
        ctx.body = { success: false, message: 'User not found' };
        return;
      }

      // Delete user
      await userService.deleteUser(userId);
      
      ctx.body = {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteUser controller:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: 'Failed to delete user' };
    }
  }
};

export default userController; 