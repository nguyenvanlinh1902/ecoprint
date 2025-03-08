import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useUserManagement } from '../../hooks';

const UserVerification = () => {
  // Sử dụng custom hook
  const { 
    pendingUsers, 
    loading, 
    error, 
    fetchPendingUsers, 
    approveUser, 
    rejectUser
  } = useUserManagement();

  const [selectedUser, setSelectedUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setActionType('view');
  };

  const handleApprove = (user) => {
    setSelectedUser(user);
    setDialogOpen(true);
    setActionType('approve');
  };

  const handleReject = (user) => {
    setSelectedUser(user);
    setRejectionReason('');
    setDialogOpen(true);
    setActionType('reject');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setActionType('');
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    try {
      if (!selectedUser) return;

      if (actionType === 'approve') {
        await approveUser(selectedUser.id);
        setSnackbar({
          open: true,
          message: `${selectedUser.name || selectedUser.fullName}'s account has been approved`,
          severity: 'success'
        });
      } else if (actionType === 'reject') {
        if (!rejectionReason) {
          setSnackbar({
            open: true,
            message: 'Please provide a reason for rejection',
            severity: 'error'
          });
          return;
        }
        
        await rejectUser(selectedUser.id, rejectionReason);
        setSnackbar({
          open: true,
          message: `${selectedUser.name || selectedUser.fullName}'s account has been rejected`,
          severity: 'error'
        });
      }
      
      handleCloseDialog();
    } catch (error) {
      console.error('Error updating user status:', error);
      setSnackbar({
        open: true,
        message: `Failed to update status: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const handleRefresh = () => {
    fetchPendingUsers();
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading user data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h2">
          User Verification Management
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          You have {pendingUsers.filter(u => u.status === 'pending').length} account(s) awaiting verification
        </Alert>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Registration</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.registrationMethod}</TableCell>
                    <TableCell>{user.registeredAt}</TableCell>
                    <TableCell>
                      {user.status === 'pending' && (
                        <Chip label="Pending" color="warning" size="small" />
                      )}
                      {user.status === 'approved' && (
                        <Chip label="Approved" color="success" size="small" />
                      )}
                      {user.status === 'rejected' && (
                        <Chip label="Rejected" color="error" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={() => handleViewDetails(user)}
                        title="View details"
                      >
                        <InfoIcon fontSize="small" />
                      </IconButton>
                      {user.status === 'pending' && (
                        <>
                          <IconButton 
                            size="small" 
                            color="success" 
                            onClick={() => handleApprove(user)}
                            title="Approve"
                          >
                            <ApproveIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleReject(user)}
                            title="Reject"
                          >
                            <RejectIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      
      {/* Dialogs for account actions */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        {actionType === 'view' && (
          <>
            <DialogTitle>User Details</DialogTitle>
            <DialogContent>
              {selectedUser && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Name:</strong> {selectedUser.name || selectedUser.fullName}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Email:</strong> {selectedUser.email}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Registration Method:</strong> {selectedUser.registrationMethod}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Date Registered:</strong> {selectedUser.registeredAt}
                  </Typography>
                  <Typography variant="subtitle1" gutterBottom>
                    <strong>Status:</strong> {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                  </Typography>
                  {selectedUser.status === 'rejected' && selectedUser.rejectionReason && (
                    <Typography variant="subtitle1" gutterBottom>
                      <strong>Rejection Reason:</strong> {selectedUser.rejectionReason}
                    </Typography>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
        
        {actionType === 'approve' && (
          <>
            <DialogTitle>Approve User Account</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to approve {selectedUser?.name || selectedUser?.fullName}'s account?
                This will grant them access to the system.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button onClick={handleConfirmAction} color="success" variant="contained">
                Approve
              </Button>
            </DialogActions>
          </>
        )}
        
        {actionType === 'reject' && (
          <>
            <DialogTitle>Reject User Account</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to reject {selectedUser?.name || selectedUser?.fullName}'s account?
                Please provide a reason for the rejection:
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="rejectionReason"
                label="Reason for rejection"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button 
                onClick={handleConfirmAction} 
                color="error" 
                variant="contained"
                disabled={!rejectionReason}
              >
                Reject
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserVerification; 