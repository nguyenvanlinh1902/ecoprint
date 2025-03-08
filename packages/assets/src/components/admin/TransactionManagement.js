import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  InputAdornment,
  Card,
  CardContent,
  Divider,
  Tooltip
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useApi } from '../../hooks/api';

// Error boundary for handling errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error in TransactionManagement:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {this.state.error?.message || 'An error occurred while loading Transaction Management'}
          </Alert>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Transaction Table Component
const TransactionTable = React.memo(({ 
  transactions = [], 
  onView, 
  onApprove, 
  onReject, 
  loading = false
}) => {
  // Ensure transactions is an array
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  
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
            <TableCell>Customer</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {safeTransactions.length > 0 ? (
            safeTransactions.map((transaction) => {
              const isPending = transaction.status === 'pending' || !transaction.status;
              
              return (
                <TableRow 
                  key={transaction.id}
                  sx={{ 
                    bgcolor: isPending ? 'rgba(255, 244, 229, 0.7)' : 'inherit'
                  }}
                >
                  <TableCell>
                    {transaction.customer?.name || transaction.customer?.fullName || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold', 
                        color: 'success.main' 
                      }}
                    >
                      ${transaction.amount?.toFixed(2) || '0.00'}
                    </Typography>
                  </TableCell>
                  <TableCell>{transaction.reference || 'N/A'}</TableCell>
                  <TableCell>
                    {transaction.createdAt 
                      ? new Date(transaction.createdAt).toLocaleString() 
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.status || 'Pending'}
                      color={
                        transaction.status === 'rejected' ? 'error' :
                        transaction.status === 'approved' ? 'success' : 'warning'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton onClick={() => onView(transaction)}>
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {isPending && (
                      <>
                        <Tooltip title="Approve Transaction">
                          <IconButton 
                            onClick={() => onApprove(transaction)} 
                            color="success"
                          >
                            <ApproveIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Reject Transaction">
                          <IconButton 
                            onClick={() => onReject(transaction)} 
                            color="error"
                          >
                            <RejectIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

// Main Transaction Management Component
const TransactionManagement = () => {
  // State for transactions
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Filters and pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  });
  
  // API hooks
  const fetchApi = useApi({
    url: '/admin/transactions',
    method: 'GET'
  });
  
  const updateTransactionApi = useApi({
    url: '/admin/transactions',
    method: 'PUT'
  });
  
  // Load transactions on mount and when filters change
  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: rowsPerPage,
          status: filterStatus === 'all' ? undefined : filterStatus,
          searchTerm: searchTerm || undefined
        };
        
        const queryString = new URLSearchParams(
          Object.entries(params).filter(([_, value]) => value !== undefined)
        ).toString();
        
        const response = await fetchApi.callApi(`?${queryString}`);
        
        setTransactions(response.data || []);
        setPagination(response.pagination || {
          total: (response.data || []).length,
          page: 1,
          limit: rowsPerPage,
          totalPages: Math.ceil((response.data || []).length / rowsPerPage)
        });
      } catch (err) {
        setError('Failed to load transactions');
        console.error('Error loading transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTransactions();
  }, [page, rowsPerPage, filterStatus, searchTerm, fetchApi]);
  
  // Handlers
  const handleViewTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
    setActionType('view');
  }, []);
  
  const handleApproveTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
    setActionType('approve');
  }, []);
  
  const handleRejectTransaction = useCallback((transaction) => {
    setSelectedTransaction(transaction);
    setRejectionReason('');
    setDialogOpen(true);
    setActionType('reject');
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedTransaction(null);
    setActionType('');
    setRejectionReason('');
  }, []);
  
  const handleConfirmAction = useCallback(async () => {
    if (!selectedTransaction) return;
    
    setLoading(true);
    
    try {
      if (actionType === 'approve') {
        await updateTransactionApi.callApi(`/${selectedTransaction.id}/approve`);
        setSnackbar({
          open: true,
          message: 'Transaction approved successfully',
          severity: 'success'
        });
      } else if (actionType === 'reject') {
        if (!rejectionReason.trim()) {
          setSnackbar({
            open: true,
            message: 'Please provide a reason for rejection',
            severity: 'error'
          });
          setLoading(false);
          return;
        }
        
        await updateTransactionApi.callApi(`/${selectedTransaction.id}/reject`, {
          rejectionReason
        });
        
        setSnackbar({
          open: true,
          message: 'Transaction rejected successfully',
          severity: 'success'
        });
      }
      
      // Refresh transaction list
      const params = {
        page,
        limit: rowsPerPage,
        status: filterStatus === 'all' ? undefined : filterStatus,
        searchTerm: searchTerm || undefined
      };
      
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      ).toString();
      
      const response = await fetchApi.callApi(`?${queryString}`);
      setTransactions(response.data || []);
      
      handleCloseDialog();
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to ${actionType} transaction: ${err.message || 'Unknown error'}`,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedTransaction, actionType, rejectionReason, updateTransactionApi, fetchApi, page, rowsPerPage, filterStatus, searchTerm, handleCloseDialog]);
  
  const handleSnackbarClose = useCallback(() => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  }, [snackbar]);
  
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    
    try {
      const params = {
        page,
        limit: rowsPerPage,
        status: filterStatus === 'all' ? undefined : filterStatus,
        searchTerm: searchTerm || undefined
      };
      
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      ).toString();
      
      const response = await fetchApi.callApi(`?${queryString}`);
      setTransactions(response.data || []);
      setPagination(response.pagination || {
        total: (response.data || []).length,
        page: 1,
        limit: rowsPerPage,
        totalPages: Math.ceil((response.data || []).length / rowsPerPage)
      });
      
      setSnackbar({
        open: true,
        message: 'Transactions refreshed',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to refresh transactions',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [fetchApi, page, rowsPerPage, filterStatus, searchTerm]);
  
  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);
  
  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  }, []);
  
  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  }, []);
  
  const handleFilterChange = useCallback((event) => {
    setFilterStatus(event.target.value);
    setPage(1);
  }, []);
  
  // Dialog content
  const transactionDialog = useMemo(() => (
    <Dialog 
      open={dialogOpen} 
      onClose={handleCloseDialog} 
      maxWidth={actionType === 'view' ? 'md' : 'sm'} 
      fullWidth
    >
      <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
        {actionType === 'view' ? 
          <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} /> 
            Transaction Details
          </Typography> : 
          actionType === 'approve' ? 'Approve Transaction' : 'Reject Transaction'
        }
      </DialogTitle>
      <DialogContent sx={{ p: actionType === 'view' ? 0 : 2, mt: actionType === 'view' ? 0 : 2 }}>
        {selectedTransaction && (
          <>
            {actionType === 'view' && (
              <Box>
                <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Transaction Information
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Grid container spacing={2}>
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Transaction ID:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedTransaction.id}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Amount:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2" fontWeight="bold" color="success.main">
                                ${selectedTransaction.amount?.toFixed(2) || '0.00'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Reference:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2">
                                {selectedTransaction.reference || 'N/A'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Date:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2">
                                {selectedTransaction.createdAt 
                                  ? new Date(selectedTransaction.createdAt).toLocaleString() 
                                  : 'N/A'
                                }
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Status:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Chip
                                label={selectedTransaction.status || 'Pending'}
                                color={
                                  selectedTransaction.status === 'rejected' ? 'error' :
                                  selectedTransaction.status === 'approved' ? 'success' : 'warning'
                                }
                                size="small"
                              />
                            </Grid>
                            
                            {selectedTransaction.rejectionReason && (
                              <>
                                <Grid item xs={5}>
                                  <Typography variant="body2" color="text.secondary">
                                    Rejection Reason:
                                  </Typography>
                                </Grid>
                                <Grid item xs={7}>
                                  <Typography variant="body2" color="error.main">
                                    {selectedTransaction.rejectionReason}
                                  </Typography>
                                </Grid>
                              </>
                            )}
                            
                            {selectedTransaction.approvedBy && (
                              <>
                                <Grid item xs={5}>
                                  <Typography variant="body2" color="text.secondary">
                                    Approved By:
                                  </Typography>
                                </Grid>
                                <Grid item xs={7}>
                                  <Typography variant="body2">
                                    {selectedTransaction.approvedBy}
                                  </Typography>
                                </Grid>
                              </>
                            )}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Customer Information
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          <Grid container spacing={2}>
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Name:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2" fontWeight="medium">
                                {selectedTransaction.customer?.name || 
                                 selectedTransaction.customer?.fullName || 'N/A'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Email:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2">
                                {selectedTransaction.customer?.email || 'N/A'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Phone:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2">
                                {selectedTransaction.customer?.phone || 'N/A'}
                              </Typography>
                            </Grid>
                            
                            <Grid item xs={5}>
                              <Typography variant="body2" color="text.secondary">
                                Customer ID:
                              </Typography>
                            </Grid>
                            <Grid item xs={7}>
                              <Typography variant="body2">
                                {selectedTransaction.customer?.id || 'N/A'}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Payment Proof
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          
                          {selectedTransaction.receiptUrl ? (
                            <Box sx={{ textAlign: 'center' }}>
                              <img 
                                src={selectedTransaction.receiptUrl} 
                                alt="Payment Receipt" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '300px', 
                                  border: '1px solid #eee' 
                                }} 
                              />
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                              No receipt image available
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
            
            {actionType === 'approve' && (
              <DialogContentText>
                Are you sure you want to approve this transaction of ${selectedTransaction.amount?.toFixed(2) || '0.00'} for {selectedTransaction.customer?.name || selectedTransaction.customer?.fullName || 'this customer'}?
              </DialogContentText>
            )}
            
            {actionType === 'reject' && (
              <>
                <DialogContentText>
                  Please provide a reason for rejecting this transaction of ${selectedTransaction.amount?.toFixed(2) || '0.00'} for {selectedTransaction.customer?.name || selectedTransaction.customer?.fullName || 'this customer'}:
                </DialogContentText>
                <TextField
                  autoFocus
                  margin="dense"
                  id="rejectionReason"
                  label="Rejection Reason"
                  fullWidth
                  variant="outlined"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  sx={{ mt: 2 }}
                />
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
        <Button onClick={handleCloseDialog} color="primary">
          {actionType === 'view' ? 'Close' : 'Cancel'}
        </Button>
        {actionType !== 'view' && (
          <Button 
            onClick={handleConfirmAction} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  ), [dialogOpen, actionType, selectedTransaction, rejectionReason, loading, handleCloseDialog, handleConfirmAction]);
  
  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <MoneyIcon sx={{ mr: 1 }} />
        Transaction Management
        <IconButton color="primary" onClick={handleRefresh} sx={{ ml: 2 }} title="Refresh">
          <RefreshIcon />
        </IconButton>
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by reference or customer name"
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={filterStatus}
                onChange={handleFilterChange}
                label="Status"
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={5}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary" sx={{ my: 1, mr: 2 }}>
                {pagination.total} transactions found
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <TransactionTable 
        transactions={transactions}
        onView={handleViewTransaction}
        onApprove={handleApproveTransaction}
        onReject={handleRejectTransaction}
        loading={loading}
      />
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination 
          count={pagination.totalPages || 1} 
          page={page}
          onChange={handlePageChange}
          color="primary" 
        />
      </Box>
      
      {/* Transaction Dialog */}
      {transactionDialog}
      
      {/* Snackbar */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
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

const TransactionManagementWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <TransactionManagement />
    </ErrorBoundary>
  );
};

export default TransactionManagementWithErrorBoundary; 