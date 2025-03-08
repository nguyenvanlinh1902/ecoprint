import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Divider,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Pagination,
  Snackbar,
  Alert,
  Stack,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  DateRange as DateIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  Payment as PaymentIcon,
  CheckCircle as CompletedIcon,
  Cancel as CancelledIcon,
  ShoppingBag as BagIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';

// Mock data for orders
const MOCK_ORDERS = [
  {
    id: 'ECO-10534',
    date: '2023-10-25',
    total: 127.95,
    paymentMethod: 'Credit Card',
    status: 'Completed',
    trackingNumber: 'TRK837465921',
    items: [
      { id: 1, name: 'Recycled A4 Paper (500 sheets)', quantity: 2, price: 5.99 },
      { id: 3, name: 'Bamboo Notebooks', quantity: 3, price: 7.99 },
      { id: 5, name: 'Eco-Friendly Gloss Paper', quantity: 10, price: 8.99 }
    ]
  },
  {
    id: 'ECO-10535',
    date: '2023-11-02',
    total: 49.88,
    paymentMethod: 'PayPal',
    status: 'Processing',
    items: [
      { id: 2, name: 'Premium Kraft Paper Bags', quantity: 10, price: 3.49 },
      { id: 4, name: 'Recycled Cardboard Boxes (Pack of 10)', quantity: 1, price: 12.99 }
    ]
  },
  {
    id: 'ECO-10536',
    date: '2023-11-10',
    total: 89.95,
    paymentMethod: 'Credit Card',
    status: 'Shipped',
    trackingNumber: 'TRK837465922',
    items: [
      { id: 1, name: 'Recycled A4 Paper (500 sheets)', quantity: 5, price: 5.99 },
      { id: 3, name: 'Bamboo Notebooks', quantity: 5, price: 7.99 }
    ]
  },
  {
    id: 'ECO-10537',
    date: '2023-11-15',
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
    id: 'ECO-10538',
    date: '2023-11-18',
    total: 64.90,
    paymentMethod: 'PayPal',
    status: 'Cancelled',
    items: [
      { id: 1, name: 'Recycled A4 Paper (500 sheets)', quantity: 3, price: 5.99 },
      { id: 2, name: 'Premium Kraft Paper Bags', quantity: 8, price: 3.49 },
      { id: 3, name: 'Bamboo Notebooks', quantity: 2, price: 7.99 }
    ]
  },
  {
    id: 'ECO-10539',
    date: '2023-11-22',
    total: 174.85,
    paymentMethod: 'Credit Card',
    status: 'Completed',
    trackingNumber: 'TRK837465923',
    items: [
      { id: 3, name: 'Bamboo Notebooks', quantity: 8, price: 7.99 },
      { id: 4, name: 'Recycled Cardboard Boxes (Pack of 10)', quantity: 3, price: 12.99 },
      { id: 5, name: 'Eco-Friendly Gloss Paper', quantity: 7, price: 8.99 }
    ]
  }
];

const UserOrders = () => {
  const theme = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });

  // Load orders
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOrders(MOCK_ORDERS);
      setLoading(false);
    }, 1000);
  }, []);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(1);
  };

  // Handle search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(1);
  };

  // Handle page change
  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View order details
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  // Handle cancellation request
  const handleCancelOrder = (orderId) => {
    // In a real app, this would send a request to the backend
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order
      )
    );

    setNotification({
      open: true,
      message: `Order ${orderId} has been cancelled`,
      severity: 'success'
    });

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: 'Cancelled' });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Filter orders based on tab and search
  const filteredOrders = orders.filter(order => {
    // Search filter
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Tab filter
    let matchesTab = true;
    if (tabValue === 1) { // Active orders
      matchesTab = ['Processing', 'Shipped', 'Pending'].includes(order.status);
    } else if (tabValue === 2) { // Completed orders
      matchesTab = order.status === 'Completed';
    } else if (tabValue === 3) { // Cancelled orders
      matchesTab = order.status === 'Cancelled';
    }

    return matchesSearch && matchesTab;
  });

  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Pagination
  const ITEMS_PER_PAGE = 5;
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
        return { color: 'warning', icon: <PaymentIcon fontSize="small" /> };
      case 'Cancelled':
        return { color: 'error', icon: <CancelledIcon fontSize="small" /> };
      default:
        return { color: 'default', icon: null };
    }
  };

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          My Orders
        </Typography>

        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="All Orders" />
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search your orders..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
            size="small"
          />
        </Box>

        {/* Orders List */}
        {loading ? (
          <LinearProgress sx={{ mb: 2 }} />
        ) : (
          <>
            {displayOrders.length > 0 ? (
              <Stack spacing={2}>
                {displayOrders.map((order) => {
                  const { color, icon } = getStatusChip(order.status);
                  return (
                    <Card key={order.id} variant="outlined">
                      <CardContent>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              Order #{order.id}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                              <DateIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                              <Typography variant="body2">
                                {order.date}
                              </Typography>
                            </Box>
                            <Chip 
                              label={order.status} 
                              color={color} 
                              size="small" 
                              icon={icon}
                              sx={{ minWidth: 100 }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' }, height: '100%', justifyContent: 'space-between' }}>
                              <Typography variant="h6">
                                ${order.total.toFixed(2)}
                              </Typography>
                              <Box>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<ViewIcon />}
                                  onClick={() => handleViewOrder(order)}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <BagIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  No orders found
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {searchTerm ? 'Try a different search term' : tabValue === 0 ? 'You have not placed any orders yet' : 'No orders in this category'}
                </Typography>
                {searchTerm && (
                  <Button
                    variant="outlined"
                    sx={{ mt: 2 }}
                    onClick={() => setSearchTerm('')}
                  >
                    Clear Search
                  </Button>
                )}
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
          </>
        )}
      </Paper>

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
                <Button 
                  startIcon={<BackIcon />} 
                  onClick={() => setIsOrderDetailOpen(false)}
                  sx={{ mr: 2 }}
                >
                  Back
                </Button>
                <Typography variant="h6">
                  Order #{selectedOrder.id}
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
                  <Typography variant="subtitle2" gutterBottom>Order Information</Typography>
                  <Typography variant="body2">Date: {selectedOrder.date}</Typography>
                  <Typography variant="body2">
                    Payment Method: {selectedOrder.paymentMethod}
                  </Typography>
                  {selectedOrder.trackingNumber && (
                    <Typography variant="body2">
                      Tracking Number: {selectedOrder.trackingNumber}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>Shipping Address</Typography>
                  <Typography variant="body2">John Doe</Typography>
                  <Typography variant="body2">123 Eco Street</Typography>
                  <Typography variant="body2">Green City, EC 12345</Typography>
                  <Typography variant="body2">United States</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
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
                
                {selectedOrder.status === 'Shipped' && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: theme.palette.background.default }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tracking Information
                      </Typography>
                      <Box sx={{ ml: 2 }}>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Package picked up" 
                              secondary="November 10, 2023 - 10:30 AM" 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Package in transit" 
                              secondary="November 12, 2023 - 2:15 PM" 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Package arrived at local facility" 
                              secondary="November 13, 2023 - 8:45 AM" 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Out for delivery" 
                              secondary="November 14, 2023 - 9:30 AM" 
                            />
                          </ListItem>
                        </List>
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              {['Pending', 'Processing'].includes(selectedOrder.status) && (
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  Cancel Order
                </Button>
              )}
              <Button 
                variant="outlined"
                startIcon={<ReceiptIcon />}
              >
                Download Invoice
              </Button>
              <Button 
                variant="contained" 
                onClick={() => setIsOrderDetailOpen(false)}
              >
                Close
              </Button>
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

export default UserOrders; 