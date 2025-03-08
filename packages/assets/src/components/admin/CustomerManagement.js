import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Tab,
  Grid,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useUserManagement } from '../../hooks/api';
import {
  ActionDialog,
  CustomerDetails,
  ErrorBoundary,
  SearchAndFilter,
  UserTable
} from './components';
import { useSearchFilters, useCustomerDialogs } from './hooks';


/**
 * CustomerManagement component - Quản lý danh sách khách hàng
 */
const CustomerManagement = () => {
  // Lấy dữ liệu từ hook quản lý người dùng
  const {
    allUsers = [],
    loading: hookLoading = false, 
    error, 
    pagination = { total: 0, page: 1, limit: 10, totalPages: 1 },
    fetchAllUsers, 
    approveUser, 
    rejectUser
  } = useUserManagement() || {};
  
  // Loading state quản lý riêng ở component này
  const [loading, setLoading] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Refs for managing data loading
  const initialLoadRef = useRef(true);
  const isComponentMountedRef = useRef(true);
  const dataLoadedRef = useRef({ allUsers: false });

  // Custom hook cho search và filter
  const {
    page,
    rowsPerPage,
    searchTerm,
    filterStatus,
    isSearching,
    searchParams,
    handleSearchChange,
    handleFilterChange,
    handlePageChange,
    handleRowsPerPageChange,
    handleRefresh,
    performSearch
  } = useSearchFilters({
    fetchData: fetchAllUsers,
    defaultRowsPerPage: 10,
    defaultFilterStatus: 'all'
  });

  // Custom hook cho dialogs
  const {
    dialogState,
    handleViewDetails,
    handleApprove,
    handleReject,
    handleCloseDialog,
    handleReasonChange,
    handleConfirmAction
  } = useCustomerDialogs({
    approveUser,
    rejectUser,
    fetchAllUsers,
    searchParams,
    setSnackbar,
    setLoading
  });

  // Load initial data khi component mount
  const loadInitialData = useCallback(async () => {
    if (initialLoadRef.current && fetchAllUsers) {
      initialLoadRef.current = false;
      try {
        setLoading(true);
        
        // Fetch all customers với force refresh
        await fetchAllUsers(searchParams, true);
        
        // Mark data as loaded
        dataLoadedRef.current.allUsers = true;
      } catch (error) {
        // Handle error silently, error state is managed by hook
      } finally {
        if (isComponentMountedRef.current) {
          setLoading(false);
        }
      }
    }
  }, [fetchAllUsers, searchParams]);

  // Component mount effect
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    if (fetchAllUsers) {
      loadInitialData();
    }
    
    return () => {
      isComponentMountedRef.current = false;
    };
  }, [loadInitialData, fetchAllUsers]);

  // Snackbar handler
  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Customer Management
        <IconButton 
          color="primary" 
          onClick={handleRefresh} 
          sx={{ ml: 2 }} 
          title="Refresh"
          disabled={loading || isSearching}
        >
          <RefreshIcon />
        </IconButton>
      </Typography>

      <Typography variant="h6" gutterBottom>
        All Customers
        <Typography component="span" variant="body2" color="textSecondary" sx={{ ml: 2 }}>
          (Pending approval customers are shown first)
        </Typography>
      </Typography>

      {/* Search and Filters */}
      <SearchAndFilter 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        filterStatus={filterStatus}
        onFilterChange={handleFilterChange}
      />

      {/* Main loading indicator */}
      {(loading || hookLoading) && !isSearching && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading customers...
          </Typography>
        </Box>
      )}

      {/* Error message if API failed */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
          <Button 
            variant="outlined" 
            size="small" 
            color="error" 
            onClick={handleRefresh} 
            sx={{ ml: 2 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Only render table when not initially loading */}
      {((!loading && !hookLoading) || isSearching) && (
        <>
          <UserTable 
            users={allUsers} 
            onViewDetails={handleViewDetails}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={isSearching}
          />
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination 
              count={pagination.totalPages || 1} 
              page={page}
              onChange={handlePageChange}
              color="primary" 
            />
          </Box>
        </>
      )}

      {/* User Action Dialog */}
      <ActionDialog
        open={dialogState.open}
        actionType={dialogState.actionType}
        selectedUser={dialogState.selectedUser}
        rejectionReason={dialogState.rejectionReason}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        onReasonChange={handleReasonChange}
        loading={loading}
      />

      {/* Snackbar for notifications */}
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

/**
 * Wrap CustomerManagement với ErrorBoundary
 */
const CustomerManagementWithErrorBoundary = () => {
  return (
    <ErrorBoundary>
      <CustomerManagement />
    </ErrorBoundary>
  );
};

export default CustomerManagementWithErrorBoundary; 