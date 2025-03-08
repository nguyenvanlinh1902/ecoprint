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
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useUserManagement } from '../../hooks/api';

// TabPanel component for customer management tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`customer-tabpanel-${index}`}
      aria-labelledby={`customer-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const CustomerManagement = () => {
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
  const [tabValue, setTabValue] = useState(0);

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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
          Customer Management
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>
      
      {/* Customer Management Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="customer management tabs"
        >
          <Tab label="User Verification" />
          <Tab label="All Customers" />
          <Tab label="Customer Stats" />
        </Tabs>
      </Box>

      {/* User Verification Tab */}
      <TabPanel value={tabValue} index={0}>
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
      </TabPanel>

      {/* All Customers Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>All Customers</Typography>
          <Typography>This section will display all registered customers.</Typography>
        </Paper>
      </TabPanel>

      {/* Customer Stats Tab */}
      <TabPanel value={tabValue} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Customer Statistics</Typography>
          <Typography>This section will display customer statistics and analytics.</Typography>
        </Paper>
      </TabPanel>

      {/* View User Details Dialog */}
      <Dialog open={dialogOpen && actionType === 'view'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {selectedUser.name || selectedUser.fullName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Registration Method:</strong> {selectedUser.registrationMethod}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Registered At:</strong> {selectedUser.registeredAt}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> {selectedUser.status}
              </Typography>
              {selectedUser.rejectReason && (
                <Typography variant="body1" gutterBottom>
                  <strong>Rejection Reason:</strong> {selectedUser.rejectReason}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Approve User Dialog */}
      <Dialog open={dialogOpen && actionType === 'approve'} onClose={handleCloseDialog}>
        <DialogTitle>Approve User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to approve {selectedUser?.name || selectedUser?.fullName}'s account?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            color="success" 
            variant="contained"
            autoFocus
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject User Dialog */}
      <Dialog open={dialogOpen && actionType === 'reject'} onClose={handleCloseDialog}>
        <DialogTitle>Reject User</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject {selectedUser?.name || selectedUser?.fullName}'s account?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reason"
            label="Reason for rejection"
            fullWidth
            variant="outlined"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleConfirmAction} 
            color="error" 
            variant="contained"
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default CustomerManagement; 