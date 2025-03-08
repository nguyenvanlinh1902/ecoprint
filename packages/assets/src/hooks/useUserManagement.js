import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useFetchApi, useCreateApi, useEditApi, useDeleteApi } from './api';

/**
 * Hook dùng để quản lý người dùng (dành cho Admin)
 */
export const useUserManagement = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });

  const cacheRef = useRef({
    pendingUsers: {
      data: null,
      timestamp: 0
    },
    allUsers: {
      data: null,
      timestamp: 0,
      params: null
    },
    fetchInProgress: {
      pendingUsers: false,
      allUsers: false
    },
    userDetails: new Map()
  });

  const CACHE_EXPIRY = 30 * 60 * 1000;

  const isMountedRef = useRef(false);

  const pendingUsersFetch = useFetchApi({
    url: '/users/pending',
    defaultData: [],
    initLoad: false,
    apiPrefix: '/api/admin'
  });

  const allUsersFetch = useFetchApi({
    url: '/users',
    defaultData: [],
    initLoad: false,
    apiPrefix: '/api/admin'
  });

  // Sử dụng useCreateApi thay vì useEditApi vì endpoint xác thực cần method POST
  const userVerifyApi = useCreateApi({
    url: '/users', // URL gốc, sẽ được bổ sung userId trong handleEdit
    useToast: true,
    successMsg: 'User updated successfully',
    errorMsg: 'Failed to update user',
    apiPrefix: '/api/admin'
  });

  const userDelete = useDeleteApi({
    url: '/users',
    apiPrefix: '/api/admin'
  });

  /**
   * Kiểm tra xem cache có còn hợp lệ không
   */
  const isCacheValid = useCallback((cacheType, params = null) => {
    const cache = cacheRef.current[cacheType];
    if (!cache || !cache.data) return false;
    
    const now = Date.now();
    if (now - cache.timestamp > CACHE_EXPIRY) return false;
    
    // Nếu có params, kiểm tra xem params có khớp với cache không
    if (params && cache.params) {
      const paramsKeys = Object.keys(params);
      for (const key of paramsKeys) {
        if (params[key] !== cache.params[key]) return false;
      }
    }
    
    return true;
  }, [CACHE_EXPIRY]);

  /**
   * Lấy danh sách người dùng đang chờ xác thực
   */
  const fetchPendingUsers = useCallback(async (forceRefresh = false) => {
    // Nếu đang fetch, không fetch lại
    if (cacheRef.current.fetchInProgress.pendingUsers) {
      return cacheRef.current.pendingUsers.data || [];
    }
    
    // Kiểm tra cache nếu không phải force refresh
    if (!forceRefresh && isCacheValid('pendingUsers')) {
      setPendingUsers(cacheRef.current.pendingUsers.data);
      return cacheRef.current.pendingUsers.data;
    }
    
    setLoading(true);
    setError(null);
    
    // Đánh dấu đang fetch
    cacheRef.current.fetchInProgress.pendingUsers = true;

    try {
      // Thử với đường dẫn `/users/pending`
      await pendingUsersFetch.fetchApi();
      let fetchedData = pendingUsersFetch.data;
      
      // Dữ liệu hợp lệ, lưu vào cache
      if (fetchedData) {
        let validData = [];

        if (Array.isArray(fetchedData)) {
          validData = fetchedData;
        } else if (fetchedData.pendingUsers && Array.isArray(fetchedData.pendingUsers)) {
          validData = fetchedData.pendingUsers;
        } else if (typeof fetchedData === 'object') {
          // Cố gắng tìm mảng nào trong response (nếu có)
          for (const key in fetchedData) {
            if (Array.isArray(fetchedData[key])) {
              validData = fetchedData[key];
              break;
            }
          }
        }
        
        if (validData.length === 0) {
          // Nếu không có dữ liệu, thử lấy từ endpoint chung nhưng lọc trạng thái
          await allUsersFetch.fetchApi(null, { status: 'pending' });
          const allUsersData = allUsersFetch.data;
          
          if (allUsersData) {
            if (Array.isArray(allUsersData)) {
              validData = allUsersData.filter(user => 
                user.status === 'pending' || (!user.isVerified && !user.status)
              );
            } else if (allUsersData.users && Array.isArray(allUsersData.users)) {
              validData = allUsersData.users.filter(user => 
                user.status === 'pending' || (!user.isVerified && !user.status)
              );
            }
          }
        }
        
        // Cập nhật state và cache
        setPendingUsers(validData);
        cacheRef.current.pendingUsers = {
          data: validData,
          timestamp: Date.now()
        };
        return validData;
      } else {
        setPendingUsers([]);
        return [];
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch pending users');
      setPendingUsers([]);
      return [];
    } finally {
      setLoading(false);
      // Bỏ đánh dấu fetch
      cacheRef.current.fetchInProgress.pendingUsers = false;
    }
  }, [pendingUsersFetch, allUsersFetch, isCacheValid]);

  /**
   * Lấy tất cả người dùng trong hệ thống với các tùy chọn tìm kiếm và phân trang
   * @param {Object} options - Các tùy chọn tìm kiếm và phân trang
   * @param {number} options.page - Trang hiện tại
   * @param {number} options.limit - Số lượng kết quả mỗi trang
   * @param {string} options.searchTerm - Từ khóa tìm kiếm
   * @param {string} options.status - Trạng thái người dùng (pending, verified, all)
   * @param {boolean} options.sortByApproval - Sắp xếp theo trạng thái duyệt (chưa duyệt lên trên)
   */
  const fetchAllUsers = useCallback(async (options = {}, forceRefresh = false) => {
    const { 
      page = 1, 
      limit = 10, 
      searchTerm = '', 
      status = 'all',
      sortByApproval = true 
    } = options;
    
    // Tạo key duy nhất để kiểm tra xem có đang fetch với params này không
    const requestKey = `${page}-${limit}-${searchTerm}-${status}-${sortByApproval}`;
    
    // Nếu đang fetch cùng request, trả về ngay
    if (cacheRef.current.fetchInProgress.allUsers === requestKey) {
      return {
        users: cacheRef.current.allUsers.data || [],
        pagination: cacheRef.current.allUsers.pagination || pagination
      };
    }
    
    // Kiểm tra cache nếu không phải force refresh
    if (!forceRefresh && isCacheValid('allUsers', options)) {
      setAllUsers(cacheRef.current.allUsers.data);
      setPagination(cacheRef.current.allUsers.pagination || pagination);
      return {
        users: cacheRef.current.allUsers.data,
        pagination: cacheRef.current.allUsers.pagination
      };
    }
    
    setLoading(true);
    setError(null);
    
    // Đánh dấu đang fetch với requestKey cụ thể
    cacheRef.current.fetchInProgress.allUsers = requestKey;

    try {
      // Xây dựng query params
      const queryParams = {
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(status !== 'all' && { status }),
        ...(sortByApproval && { sortByApproval: 'true' })
      };
      
      // Call the API with the correct endpoint
      await allUsersFetch.fetchApi('/users', queryParams);
      const fetchedData = allUsersFetch.data;
      
      let validData = [];
      let paginationData = { ...pagination };
      
      if (fetchedData) {
        // Extract user data from response
        if (Array.isArray(fetchedData)) {
          validData = fetchedData;
        } else if (fetchedData.users && Array.isArray(fetchedData.users)) {
          validData = fetchedData.users;
        } else if (fetchedData.data && Array.isArray(fetchedData.data)) {
          validData = fetchedData.data;
        } else if (typeof fetchedData === 'object') {
          for (const key in fetchedData) {
            if (Array.isArray(fetchedData[key])) {
              validData = fetchedData[key];
              break;
            }
          }
        }
        
        // Extract pagination information
        if (fetchedData.pagination) {
          paginationData = fetchedData.pagination;
        } else if (fetchedData.meta && fetchedData.meta.pagination) {
          paginationData = fetchedData.meta.pagination;
        } else if (allUsersFetch.pageInfo) {
          paginationData = {
            total: allUsersFetch.pageInfo.total || validData.length,
            page: allUsersFetch.pageInfo.page || page,
            limit: allUsersFetch.pageInfo.limit || limit,
            totalPages: allUsersFetch.pageInfo.totalPages || Math.ceil(validData.length / limit)
          };
        } else {
          // Default pagination if none provided
          paginationData = {
            total: validData.length,
            page,
            limit,
            totalPages: Math.ceil(validData.length / limit)
          };
        }
        
        // Sort users by approval status if requested
        if (sortByApproval) {
          validData.sort((a, b) => {
            const aIsPending = a.status === 'pending' || (!a.status && !a.isVerified);
            const bIsPending = b.status === 'pending' || (!b.status && !b.isVerified);
            
            if (aIsPending && !bIsPending) return -1;
            if (!aIsPending && bIsPending) return 1;
            return 0;
          });
        }
        
        // Update state
        setAllUsers(validData);
        setPagination(paginationData);
        
        // Update cache
        cacheRef.current.allUsers = {
          data: validData,
          pagination: paginationData,
          timestamp: Date.now(),
          params: options
        };
        
        return {
          users: validData,
          pagination: paginationData
        };
      } else {
        // Handle empty response
        const emptyPagination = {
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 1
        };
        
        setAllUsers([]);
        setPagination(emptyPagination);
        
        return {
          users: [],
          pagination: emptyPagination
        };
      }
    } catch (err) {
      setError(err?.message || 'Failed to fetch users');
      setAllUsers([]);
      
      const emptyPagination = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1
      };
      
      return {
        users: [],
        pagination: emptyPagination
      };
    } finally {
      setLoading(false);
      // Bỏ đánh dấu fetch
      cacheRef.current.fetchInProgress.allUsers = false;
    }
  }, [allUsersFetch, pagination, isCacheValid]);

  /**
   * Lấy thông tin chi tiết một người dùng
   * @param {string} userId - ID của người dùng
   */
  const getUserDetails = useCallback(async (userId) => {
    if (!userId) {
      setError('User ID is required');
      return null;
    }
    
    // Kiểm tra cache cho user details
    if (cacheRef.current.userDetails.has(userId)) {
      const cachedData = cacheRef.current.userDetails.get(userId);
      const now = Date.now();
      if (now - cachedData.timestamp < CACHE_EXPIRY) {
        return cachedData.data;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Tạo instance fetchApi mới - không dùng hook trong callback để tuân thủ Rules of Hooks
      const fetchApi = async (url) => {
        const response = await fetch(url);
        return response.json();
      };
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api';
      const url = `${API_BASE_URL}${API_PREFIX}/users/${userId}`;
      
      const data = await fetchApi(url);
      const userData = data?.user || data;
      
      // Lưu vào cache
      if (userData) {
        cacheRef.current.userDetails.set(userId, {
          data: userData,
          timestamp: Date.now()
        });
      }
      
      return userData;
    } catch (err) {
      setError(err?.message || 'Failed to fetch user details');
      return null;
    } finally {
      setLoading(false);
    }
  }, [CACHE_EXPIRY]);

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
      // Gọi API endpoint đúng cho chức năng verify user
      // POST /users/:userId/verify
      const result = await userVerifyApi.handleCreate({
        approve: true
      }, `${userId}/verify`); // Bổ sung userId vào URL và thêm /verify
      
      if (result) {
        // Hàm cập nhật trạng thái
        const updateUserStatus = user => 
          user.id === userId ? { ...user, status: 'approved', isVerified: true } : user;
        
        // Cập nhật state
        setPendingUsers(prev => prev.map(updateUserStatus));
        setAllUsers(prev => prev.map(updateUserStatus));
        
        // Cập nhật cache
        if (cacheRef.current.pendingUsers.data) {
          cacheRef.current.pendingUsers.data = cacheRef.current.pendingUsers.data.map(updateUserStatus);
        }
        
        if (cacheRef.current.allUsers.data) {
          cacheRef.current.allUsers.data = cacheRef.current.allUsers.data.map(updateUserStatus);
        }
        
        // Xóa cache user details nếu có
        cacheRef.current.userDetails.delete(userId);
        
        return { success: true };
      } else {
        throw new Error('Failed to approve user');
      }
    } catch (err) {
      setError(err?.message || 'Failed to approve user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userVerifyApi]);

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
      // Gọi API endpoint đúng cho chức năng reject user
      // POST /users/:userId/verify
      const result = await userVerifyApi.handleCreate({
        approve: false,
        rejectionReason
      }, `${userId}/verify`); // Bổ sung userId vào URL và thêm /verify
      
      if (result) {
        // Hàm cập nhật trạng thái
        const updateUserStatus = user => 
          user.id === userId ? { ...user, status: 'rejected', rejectionReason } : user;
        
        // Cập nhật state
        setPendingUsers(prev => prev.map(updateUserStatus));
        setAllUsers(prev => prev.map(updateUserStatus));
        
        // Cập nhật cache
        if (cacheRef.current.pendingUsers.data) {
          cacheRef.current.pendingUsers.data = cacheRef.current.pendingUsers.data.map(updateUserStatus);
        }
        
        if (cacheRef.current.allUsers.data) {
          cacheRef.current.allUsers.data = cacheRef.current.allUsers.data.map(updateUserStatus);
        }
        
        // Xóa cache user details nếu có
        cacheRef.current.userDetails.delete(userId);
        
        return { success: true };
      } else {
        throw new Error('Failed to reject user');
      }
    } catch (err) {
      setError(err?.message || 'Failed to reject user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userVerifyApi]);

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
      const result = await userDelete.handleDelete(userId);
      
      if (result) {
        // Hàm lọc người dùng
        const filterUser = user => user.id !== userId;
        
        // Cập nhật state
        setPendingUsers(prev => prev.filter(filterUser));
        setAllUsers(prev => prev.filter(filterUser));
        
        // Cập nhật cache
        if (cacheRef.current.pendingUsers.data) {
          cacheRef.current.pendingUsers.data = cacheRef.current.pendingUsers.data.filter(filterUser);
        }
        
        if (cacheRef.current.allUsers.data) {
          cacheRef.current.allUsers.data = cacheRef.current.allUsers.data.filter(filterUser);
        }
        
        // Xóa cache user details nếu có
        cacheRef.current.userDetails.delete(userId);
        
        return { success: true };
      } else {
        throw new Error('Failed to delete user');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userDelete]);

  // Effect để chỉ fetch data một lần khi component mount
  useEffect(() => {
    // Chỉ fetch dữ liệu nếu component mới được mount
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      
      // Có thể bật comment dòng dưới nếu muốn tự động fetch khi component mount
      // fetchAllUsers();
    }
  }, [fetchAllUsers]);

  // Memoize kết quả trả về để tránh tạo mới object mỗi lần re-render  
  const memoizedReturn = useMemo(() => ({
    pendingUsers,
    allUsers,
    loading,
    error,
    pagination,
    fetchPendingUsers,
    fetchAllUsers,
    getUserDetails,
    approveUser,
    rejectUser,
    deleteUser
  }), [
    pendingUsers,
    allUsers,
    loading,
    error,
    pagination,
    fetchPendingUsers,
    fetchAllUsers,
    getUserDetails,
    approveUser,
    rejectUser,
    deleteUser
  ]);
  
  return memoizedReturn;
};

export default useUserManagement;