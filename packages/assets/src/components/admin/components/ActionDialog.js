import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Typography
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import CustomerDetails from './CustomerDetails';

/**
 * Dialog hiển thị chi tiết và hành động với người dùng
 * @param {Object} props
 * @param {boolean} props.open - Trạng thái hiển thị của dialog
 * @param {string} props.actionType - Loại hành động (view, approve, reject)
 * @param {Object} props.selectedUser - Người dùng được chọn
 * @param {string} props.rejectionReason - Lý do từ chối
 * @param {Function} props.onClose - Callback khi đóng dialog
 * @param {Function} props.onConfirm - Callback khi xác nhận hành động
 * @param {Function} props.onReasonChange - Callback khi thay đổi lý do từ chối
 * @param {boolean} props.loading - Trạng thái loading
 */
const ActionDialog = React.memo(({ 
  open, 
  actionType, 
  selectedUser, 
  rejectionReason, 
  onClose, 
  onConfirm, 
  onReasonChange, 
  loading 
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={actionType === 'view' ? 'md' : 'sm'} 
      fullWidth
    >
      <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
        {actionType === 'view' ? 
          <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <InfoIcon sx={{ mr: 1, color: 'primary.main' }} /> 
            Customer Details
          </Typography> : 
          actionType === 'approve' ? 'Approve Customer' : 'Reject Customer'
        }
      </DialogTitle>
      <DialogContent sx={{ p: actionType === 'view' ? 0 : 2, mt: actionType === 'view' ? 0 : 2 }}>
        {selectedUser && (
          <>
            {actionType === 'view' && <CustomerDetails customer={selectedUser} />}
            
            {actionType === 'approve' && (
              <DialogContentText>
                Are you sure you want to approve {selectedUser.name || selectedUser.fullName || 'this user'}'s account?
              </DialogContentText>
            )}
            
            {actionType === 'reject' && (
              <>
                <DialogContentText>
                  Please provide a reason for rejecting {selectedUser.name || selectedUser.fullName || 'this user'}'s account:
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="reason"
                  label="Rejection Reason"
                  fullWidth
                  variant="outlined"
                  value={rejectionReason}
                  onChange={(e) => onReasonChange(e.target.value)}
                />
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button onClick={onClose} color="primary">
          {actionType === 'view' ? 'Close' : 'Cancel'}
        </Button>
        {actionType !== 'view' && (
          <Button 
            onClick={onConfirm} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
});

export default ActionDialog; 