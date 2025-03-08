import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  LinearProgress,
  Divider,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip,
  InputAdornment,
  Stack
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Search as SearchIcon,
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Email as EmailIcon,
  CallReceived as ReturnIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  Money as CashIcon,
  Schedule as PendingIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

// Mock data for orders
const MOCK_ORDERS = [
  {
    id: 'ECO-10234',
    customerName: 'John Doe',
    customerEmail: 'john.doe@example.com',
    date: '2023-10-15',
    total: 127.95,
    paymentMethod: 'Credit Card',
    status: 'Completed',
    items: [
      { id: 1, name: 'Recycled A4 Paper (500 sheets)', quantity: 2, price: 5.99 },
      { id: 3, name: 'Bamboo Notebooks', quantity: 3, price: 7.99 },
      { id: 5, name: 'Eco-Friendly Gloss Paper', quantity: 10, price: 8.99 }
    ]
  },
  {
    id: 'ECO-10235',
    customerName: 'Jane Smith',
    customerEmail: 'jane.smith@example.com',
    date: '2023-10-16',
    total: 49.88,
    paymentMethod: 'Bank Transfer',
    status: 'Processing',
    items: [
      { id: 2, name: 'Premium Kraft Paper Bags', quantity: 10, price: 3.49 },
      { id: 4, name: 'Recycled Cardboard Boxes (Pack of 10)', quantity: 1, price: 12.99 }
    ]
  },
  {
    id: 'ECO-10236',
    customerName: 'Robert Johnson',
    customerEmail: 'robert.j@example.com',
    date: '2023-10-17',
    total: 89.95,
    paymentMethod: 'Cash on Delivery',
    status: 'Shipped',
    items: [
      { id: 1, name: 'Recycled A4 Paper (500 sheets)', quantity: 5, price: 5.99 },
      { id: 3, name: 'Bamboo Notebooks', quantity: 5, price: 7.99 }
    ]
  },
  {
    id: 'ECO-10237',
    customerName: 'Emily Parker',
    customerEmail: 'emily.p@example.com',
    date: '2023-10-18',
    total: 209.87,
    paymentMethod: 'Credit Card',
    status: 'Pending',
    items: [
      { id: 3, name: 'Bamboo Notebooks', quantity: 10, price: 7.99 },
      { id: 4, name: 'Recycled Cardboard Boxes (Pack of 10)', quantity: 5, price: 12.99 },
      { id: 5, name: 'Eco-Friendly Gloss Paper', quantity: 5, price: 8.99 }
    ]
  },
  {
    id: 'ECO-10238',
    customerName: 'Michael Brown',
    customerEmail: 'michael.b@example.com',
    date: '2023-10-19',
    total: 64.90,
    paymentMethod: 'Bank Transfer',
    status: 'Cancelled',
    items: [
      { id: 1, name: 'Recycled A4 Paper (500 sheets)', quantity: 3, price: 5.99 },
      { id: 2, name: 'Premium Kraft Paper Bags', quantity: 8, price: 3.49 },
      { id: 3, name: 'Bamboo Notebooks', quantity: 2, price: 7.99 }
    ]
  },
  {
    id: 'ECO-10239',
    customerName: 'Sarah Wilson',
    customerEmail: 'sarah.w@example.com',
    date: '2023-10-20',
    total: 174.85,
    paymentMethod: 'Credit Card',
    status: 'Completed',
    items: [
      { id: 3, name: 'Bamboo Notebooks', quantity: 8, price: 7.99 },
      { id: 4, name: 'Recycled Cardboard Boxes (Pack of 10)', quantity: 3, price: 12.99 },
      { id: 5, name: 'Eco-Friendly Gloss Paper', quantity: 7, price: 8.99 }
    ]
  }
];

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    paymentMethod: 'all',
    sortBy: 'newest'
  });
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeOrderId, setActiveOrderId] = useState(null);
  
  // Load orders
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    }, 1000);
  }, []);
  
  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };
  
  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterType]: value
    }));
    setPage(1);
  };
  
  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Open order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
    handleCloseMenu();
  };
  
  // Update order status
  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    
    setNotification({
      open: true,
      message: `Order ${orderId} status updated to ${newStatus}`,
      severity: 'success'
    });
    
    handleCloseMenu();
  };
  
  // Handle menu open
  const handleMenuOpen = (event, orderId) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveOrderId(orderId);
  };
  
  // Handle menu close
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveOrderId(null);
  };
  
  // Handle notification close
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Search term filter
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = filters.status === 'all' || order.status === filters.status;
    
    // Payment method filter
    const matchesPayment = filters.paymentMethod === 'all' || order.paymentMethod === filters.paymentMethod;
    
    // Date range filter
    let matchesDate = true;
    const orderDate = new Date(order.date);
    const today = new Date();
    
    if (filters.dateRange === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      matchesDate = order.date === todayStr;
    } else if (filters.dateRange === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      matchesDate = orderDate >= weekAgo;
    } else if (filters.dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDate = orderDate >= monthAgo;
    }
    
    return matchesSearch && matchesStatus && matchesPayment && matchesDate;
  });
  
  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (filters.sortBy === 'oldest') {
      return new Date(a.date) - new Date(b.date);
    } else if (filters.sortBy === 'total-high') {
      return b.total - a.total;
    } else if (filters.sortBy === 'total-low') {
      return a.total - b.total;
    } else {
      // Default: newest
      return new Date(b.date) - new Date(a.date);
    }
  });
  
  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(sortedOrders.length / ITEMS_PER_PAGE);
  const displayOrders = sortedOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
  
  // Get status chip color and icon
  const getStatusChip = (status) => {
    switch (status) {
      case 'Completed':
        return { color: 'success', icon: <CompletedIcon fontSize="small" /> };
      case 'Processing':
        return { color: 'info', icon: <InventoryIcon fontSize="small" /> };
      case 'Shipped':
        return { color: 'primary', icon: <ShippingIcon fontSize="small" /> };
      case 'Pending':
        return { color: 'warning', icon: <PendingIcon fontSize="small" /> };
      case 'Cancelled':
        return { color: 'error', icon: <CancelledIcon fontSize="small" /> };
      default:
        return { color: 'default', icon: null };
    }
  };
  
  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Credit Card':
        return <CardIcon fontSize="small" />;
      case 'Bank Transfer':
        return <BankIcon fontSize="small" />;
      case 'Cash on Delivery':
        return <CashIcon fontSize="small" />;
      default:
        return <PaymentIcon fontSize="small" />;
    }
  };
  
  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Orders Management
        </Typography>
        
        {/* Search and Filters */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by order ID, customer name, or email..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Statuses</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Processing">Processing</MenuItem>
                  <MenuItem value="Shipped">Shipped</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  label="Date Range"
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Payment</InputLabel>
                <Select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  label="Payment"
                >
                  <MenuItem value="all">All Methods</MenuItem>
                  <MenuItem value="Credit Card">Credit Card</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Cash on Delivery">Cash on Delivery</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="total-high">Total: High to Low</MenuItem>
                  <MenuItem value="total-low">Total: Low to High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {/* Orders Table */}
        {loading ? (
          <LinearProgress sx={{ mb: 2 }} />
        ) : (
          <>
            {displayOrders.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Payment Method</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayOrders.map((order) => {
                      const { color, icon } = getStatusChip(order.status);
                      return (
                        <TableRow hover key={order.id}>
                          <TableCell>{order.id}</TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <Typography variant="body2">{order.customerName}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {order.customerEmail}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              {getPaymentIcon(order.paymentMethod)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {order.paymentMethod}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={order.status} 
                              color={color} 
                              size="small" 
                              icon={icon}
                              sx={{ minWidth: 100 }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="More Actions">
                              <IconButton
                                size="small"
                                onClick={(e) => handleMenuOpen(e, order.id)}
                              >
                                <MoreIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">
                  No orders found
                </Typography>
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({
                      status: 'all',
                      dateRange: 'all',
                      paymentMethod: 'all',
                      sortBy: 'newest'
                    });
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
            
            {/* Results summary */}
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {displayOrders.length} of {filteredOrders.length} orders
              </Typography>
              
              {orders.length > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => {
                      setOrders(MOCK_ORDERS);
                      setLoading(false);
                      setNotification({
                        open: true,
                        message: 'Orders refreshed',
                        severity: 'success'
                      });
                    }, 800);
                  }}
                >
                  Refresh
                </Button>
              )}
            </Box>
          </>
        )}
      </Paper>
      
      {/* Order Actions Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => {
          const order = orders.find(order => order.id === activeOrderId);
          if (order) handleViewOrder(order);
        }}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(activeOrderId, 'Processing')}>
          <InventoryIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Processing
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(activeOrderId, 'Shipped')}>
          <ShippingIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Shipped
        </MenuItem>
        <MenuItem onClick={() => handleUpdateStatus(activeOrderId, 'Completed')}>
          <CompletedIcon fontSize="small" sx={{ mr: 1 }} />
          Mark as Completed
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleUpdateStatus(activeOrderId, 'Cancelled')}>
          <CancelledIcon fontSize="small" sx={{ mr: 1 }} />
          Cancel Order
        </MenuItem>
        <Divider />
        <MenuItem>
          <PrintIcon fontSize="small" sx={{ mr: 1 }} />
          Print Invoice
        </MenuItem>
        <MenuItem>
          <EmailIcon fontSize="small" sx={{ mr: 1 }} />
          Email Customer
        </MenuItem>
      </Menu>
      
      {/* Order Detail Dialog */}
      <Dialog
        open={isOrderDetailOpen}
        onClose={() => setIsOrderDetailOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedOrder && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Order Details: {selectedOrder.id}
                </Typography>
                <Chip 
                  label={selectedOrder.status} 
                  color={getStatusChip(selectedOrder.status).color} 
                  size="small"
                  icon={getStatusChip(selectedOrder.status).icon}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Customer Information</Typography>
                  <Typography variant="body2">{selectedOrder.customerName}</Typography>
                  <Typography variant="body2">{selectedOrder.customerEmail}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Order Information</Typography>
                  <Typography variant="body2">Date: {selectedOrder.date}</Typography>
                  <Typography variant="body2">
                    Payment Method: {selectedOrder.paymentMethod}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Order Items</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Total</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedOrder.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">${item.price.toFixed(2)}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">
                              ${(item.price * item.quantity).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                            Order Total:
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            ${selectedOrder.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>Order Status</Typography>
                  <Stack direction="row" spacing={1}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<InventoryIcon />}
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'Processing');
                        setSelectedOrder({...selectedOrder, status: 'Processing'});
                      }}
                    >
                      Processing
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      startIcon={<ShippingIcon />}
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'Shipped');
                        setSelectedOrder({...selectedOrder, status: 'Shipped'});
                      }}
                    >
                      Shipped
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="success"
                      startIcon={<CompletedIcon />}
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'Completed');
                        setSelectedOrder({...selectedOrder, status: 'Completed'});
                      }}
                    >
                      Completed
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="error"
                      startIcon={<CancelledIcon />}
                      onClick={() => {
                        handleUpdateStatus(selectedOrder.id, 'Cancelled');
                        setSelectedOrder({...selectedOrder, status: 'Cancelled'});
                      }}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button 
                startIcon={<PrintIcon />}
                onClick={() => alert('Printing invoice...')}
              >
                Print Invoice
              </Button>
              <Button 
                startIcon={<EmailIcon />}
                onClick={() => alert('Opening email dialog...')}
              >
                Email Customer
              </Button>
              <Button onClick={() => setIsOrderDetailOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Notifications */}
      <Snackbar
        open={notification.open}
        autoHideDuration={5000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagement; 