import React from 'react';
import { Chip } from '@mui/material';

/**
 * Component hiển thị trạng thái dưới dạng chip với màu tương ứng
 * @param {Object} props
 * @param {string} props.status - Trạng thái của user (approved, rejected, pending)
 * @param {boolean} props.isVerified - Trạng thái xác thực user
 */
const StatusChip = React.memo(({ status, isVerified }) => {
  const statusText = status || (isVerified ? 'Verified' : 'Pending');
  const chipColor = status === 'rejected' ? 'error' :
                    status === 'approved' || isVerified ? 'success' : 'warning';
  
  return (
    <Chip
      label={statusText}
      color={chipColor}
      size="small"
    />
  );
});

export default StatusChip; 