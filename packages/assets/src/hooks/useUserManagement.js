import { useState, useCallback } from 'react';
import useApi from './useApi';

/**
 * Hook dùng để quản lý người dùng (dành cho Admin)
 */
export const useUserManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { get, put, post, del } = useApi();

  /**
   * Lấy danh sách người dùng đang chờ xác thực
   */
  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await get('/users/pending');
      
      if (response.success) {
        setPendingUsers(response.pendingUsers || []);
        return response.pendingUsers;
      } else {
        throw new Error(response.message || 'Failed to fetch pending users');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch pending users');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [get]);

  /**
   * Lấy tất cả người dùng trong hệ thống
   */
  const fetchAllUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await get('/users');
      
      if (response.success) {
        setAllUsers(response.users || []);
        return response.users;
      } else {
        throw new Error(response.message || 'Failed to fetch users');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch users');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [get]);

  /**
   * Lấy thông tin chi tiết một người dùng
   * @param {string} userId - ID của người dùng
   */
  const getUserDetails = useCallback(async (userId) => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await get(`/users/${userId}`);
      
      if (response.success) {
        return response.user;
      } else {
        throw new Error(response.message || 'Failed to fetch user details');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch user details');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [get]);

  /**
   * Phê duyệt người dùng
   * @param {string} userId - ID của người dùng
   */
  const approveUser = useCallback(async (userId) => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await put(`/users/${userId}/verify`, { 
        approve: true 
      });
      
      if (response.success) {
        // Cập nhật danh sách người dùng
        setPendingUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, status: 'approved' } : user
          )
        );
        return response;
      } else {
        throw new Error(response.message || 'Failed to approve user');
      }
    } catch (error) {
      setError(error.message || 'Failed to approve user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [put]);

  /**
   * Từ chối người dùng
   * @param {string} userId - ID của người dùng
   * @param {string} rejectionReason - Lý do từ chối
   */
  const rejectUser = useCallback(async (userId, rejectionReason) => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    if (!rejectionReason) {
      setError('Rejection reason is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await put(`/users/${userId}/verify`, { 
        approve: false,
        rejectionReason
      });
      
      if (response.success) {
        // Cập nhật danh sách người dùng
        setPendingUsers(prev => 
          prev.map(user => 
            user.id === userId ? { ...user, status: 'rejected', rejectionReason } : user
          )
        );
        return response;
      } else {
        throw new Error(response.message || 'Failed to reject user');
      }
    } catch (error) {
      setError(error.message || 'Failed to reject user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [put]);

  /**
   * Xóa người dùng
   * @param {string} userId - ID của người dùng
   */
  const deleteUser = useCallback(async (userId) => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await del(`/users/${userId}`);
      
      if (response.success) {
        // Cập nhật danh sách người dùng
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        setAllUsers(prev => prev.filter(user => user.id !== userId));
        return response;
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error) {
      setError(error.message || 'Failed to delete user');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [del]);

  return {
    pendingUsers,
    allUsers,
    loading,
    error,
    fetchPendingUsers,
    fetchAllUsers,
    getUserDetails,
    approveUser,
    rejectUser,
    deleteUser
  };
};

export default useUserManagement; 