import { useState, useCallback } from 'react';

/**
 * Custom hook quản lý các dialogs trong CustomerManagement
 * @param {Object} options
 * @param {Function} options.approveUser - Hàm gọi API để phê duyệt người dùng
 * @param {Function} options.rejectUser - Hàm gọi API để từ chối người dùng
 * @param {Function} options.fetchAllUsers - Hàm gọi API để cập nhật danh sách người dùng sau hành động
 * @param {Object} options.searchParams - Thông số tìm kiếm hiện tại
 * @param {Function} options.setSnackbar - Hàm cập nhật trạng thái snackbar
 * @param {Function} options.setLoading - Hàm cập nhật trạng thái loading
 * @returns {Object} Các state và handlers cho dialog
 */
const useCustomerDialogs = ({
  approveUser,
  rejectUser,
  fetchAllUsers,
  searchParams,
  setSnackbar,
  setLoading
}) => {
  // Dialog state
  const [dialogState, setDialogState] = useState({
    open: false,
    actionType: '',
    selectedUser: null,
    rejectionReason: ''
  });

  // Destructuring for easier access
  const { open, actionType, selectedUser, rejectionReason } = dialogState;

  // Dialog handlers
  const handleViewDetails = useCallback((user) => {
    setDialogState({
      open: true,
      actionType: 'view',
      selectedUser: user,
      rejectionReason: ''
    });
  }, []);

  const handleApprove = useCallback((user) => {
    setDialogState({
      open: true,
      actionType: 'approve',
      selectedUser: user,
      rejectionReason: ''
    });
  }, []);

  const handleReject = useCallback((user) => {
    setDialogState({
      open: true,
      actionType: 'reject',
      selectedUser: user,
      rejectionReason: ''
    });
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogState({
      open: false,
      actionType: '',
      selectedUser: null,
      rejectionReason: ''
    });
  }, []);

  const handleReasonChange = useCallback((reason) => {
    setDialogState(prev => ({
      ...prev,
      rejectionReason: reason
    }));
  }, []);

  // Action confirmation handler
  const handleConfirmAction = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);

      if (actionType === 'approve' && approveUser) {
        await approveUser(selectedUser.id);
        setSnackbar({
          open: true,
          message: `${selectedUser.name || selectedUser.fullName || 'this user'}'s account has been approved`,
          severity: 'success'
        });
        
        // Đóng dialog sau khi hoàn thành
        handleCloseDialog();
        
        // Cập nhật lại danh sách người dùng
        await fetchAllUsers(searchParams, true);
      } else if (actionType === 'reject' && rejectUser) {
        if (!rejectionReason) {
          setSnackbar({
            open: true,
            message: 'Please provide a reason for rejection',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
        
        await rejectUser(selectedUser.id, rejectionReason);
        setSnackbar({
          open: true,
          message: `${selectedUser.name || selectedUser.fullName || 'this user'}'s account has been rejected`,
          severity: 'error'
        });
        
        // Đóng dialog sau khi hoàn thành
        handleCloseDialog();
        
        // Cập nhật lại danh sách người dùng
        await fetchAllUsers(searchParams, true);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to update status: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedUser,
    actionType,
    rejectionReason,
    approveUser,
    rejectUser,
    handleCloseDialog,
    fetchAllUsers,
    searchParams,
    setSnackbar,
    setLoading
  ]);

  return {
    dialogState: {
      open,
      actionType,
      selectedUser,
      rejectionReason
    },
    handleViewDetails,
    handleApprove,
    handleReject,
    handleCloseDialog,
    handleReasonChange,
    handleConfirmAction
  };
};

export default useCustomerDialogs; 