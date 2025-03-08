import React from 'react';
import { IconButton } from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon
} from '@mui/icons-material';

/**
 * Component hiển thị các action có thể thực hiện với một user
 * @param {Object} props
 * @param {Object} props.user - Thông tin user
 * @param {Function} props.onViewDetails - Callback khi click vào nút xem chi tiết
 * @param {Function} props.onApprove - Callback khi click vào nút phê duyệt
 * @param {Function} props.onReject - Callback khi click vào nút từ chối
 */
const UserActions = React.memo(({ user, onViewDetails, onApprove, onReject }) => {
  const isPending = user.status === 'pending' || (!user.status && !user.isVerified);
  
  return (
    <>
      <IconButton onClick={() => onViewDetails(user)} title="View Details">
        <InfoIcon />
      </IconButton>
      
      {isPending && (
        <>
          <IconButton 
            onClick={() => onApprove(user)} 
            color="success"
            title="Approve User"
          >
            <ApproveIcon />
          </IconButton>
          <IconButton 
            onClick={() => onReject(user)} 
            color="error"
            title="Reject User"
          >
            <RejectIcon />
          </IconButton>
        </>
      )}
    </>
  );
});

export default UserActions; 