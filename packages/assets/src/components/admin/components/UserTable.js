import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress
} from '@mui/material';
import StatusChip from './StatusChip';
import UserActions from './UserActions';

/**
 * Component hiển thị bảng danh sách người dùng
 * @param {Object} props
 * @param {Array} props.users - Danh sách người dùng
 * @param {Function} props.onViewDetails - Callback khi click vào nút xem chi tiết
 * @param {Function} props.onApprove - Callback khi click vào nút phê duyệt
 * @param {Function} props.onReject - Callback khi click vào nút từ chối
 * @param {boolean} props.loading - Trạng thái loading
 */
const UserTable = React.memo(({
  users = [], 
  onViewDetails, 
  onApprove, 
  onReject, 
  loading = false
}) => {
  const safeUsers = Array.isArray(users) ? users : [];
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeUsers.length > 0 ? (
            safeUsers.map((user) => {
              const isPending = user.status === 'pending' || (!user.status && !user.isVerified);
              
              return (
                <TableRow 
                  key={user.id}
                  sx={{ 
                    bgcolor: isPending ? 'rgba(255, 244, 229, 0.7)' : 'inherit'
                  }}
                >
                  <TableCell>{user.name || user.fullName || 'N/A'}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <StatusChip status={user.status} isVerified={user.isVerified} />
                  </TableCell>
                  <TableCell>
                    <UserActions 
                      user={user} 
                      onViewDetails={onViewDetails}
                      onApprove={onApprove}
                      onReject={onReject}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No users found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

export default UserTable; 