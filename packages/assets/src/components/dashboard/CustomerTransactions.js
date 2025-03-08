import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Card,
  CardContent,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  ContentCopy as CopyIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { useAuth } from '../../hooks/api';
import { useApi } from '../../hooks/api';

// Custom TabPanel component
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transaction-tabpanel-${index}`}
      aria-labelledby={`transaction-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const CustomerTransactions = () => {
  const { user } = useAuth() || {};
  const [tabValue, setTabValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  
  // API hooks for data loading and submission
  const fetchApi = useApi({
    url: '/transactions',
    method: 'GET'
  });
  
  const fetchPaymentMethods = useApi({
    url: '/payment-methods',
    method: 'GET'
  });
  
  const submitTransaction = useApi({
    url: '/transactions',
    method: 'POST'
  });
  
  // Load transactions and payment methods on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const transactionData = await fetchApi.callApi();
        setTransactions(transactionData.data || []);
        
        const methodsData = await fetchPaymentMethods.callApi();
        setPaymentMethods(methodsData.data || []);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [fetchApi, fetchPaymentMethods]);
  
  // Handle file selection
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);
  
  // Handle form submission
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    
    if (!selectedFile || !amount || !reference || !selectedMethod) {
      setError('Please fill all required fields and upload a transaction screenshot');
      return;
    }
    
    setLoading(true);
    
    try {
      // FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('amount', amount);
      formData.append('reference', reference);
      formData.append('paymentMethodId', selectedMethod.id);
      
      await submitTransaction.callApi(formData);
      
      // Reset form after successful submission
      setSelectedFile(null);
      setPreviewUrl('');
      setAmount('');
      setReference('');
      setSelectedMethod(null);
      setSuccessMessage('Transaction submitted successfully! It will be reviewed shortly.');
      
      // Refresh transactions list
      const transactionData = await fetchApi.callApi();
      setTransactions(transactionData.data || []);
      
      // Switch to transactions tab
      setTabValue(1);
    } catch (err) {
      setError('Failed to submit transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, amount, reference, selectedMethod, submitTransaction, fetchApi]);
  
  // Handle payment method selection
  const handleOpenDialog = useCallback(() => {
    setOpenDialog(true);
  }, []);
  
  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false);
  }, []);
  
  const handleSelectMethod = useCallback((method) => {
    setSelectedMethod(method);
    setOpenDialog(false);
  }, []);
  
  // Handle copy to clipboard
  const handleCopy = useCallback((value, field) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    });
  }, []);
  
  // Handle tab change
  const handleTabChange = useCallback((event, newValue) => {
    setTabValue(newValue);
  }, []);
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Account Transactions
        </Typography>
        
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab icon={<AddIcon />} label="Add Credit" />
          <Tab icon={<HistoryIcon />} label="Transaction History" />
        </Tabs>
        
        {/* Add Credit Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {/* Instructions */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  How to Add Credit to Your Account
                </Typography>
                <Typography variant="body1" paragraph>
                  Follow these steps to add credit to your account:
                </Typography>
                <List sx={{ listStyleType: 'decimal', pl: 4 }}>
                  <ListItem sx={{ display: 'list-item' }}>
                    <ListItemText primary="Select a payment method and view the payment details" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item' }}>
                    <ListItemText primary="Make a payment using your banking app or preferred method" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item' }}>
                    <ListItemText primary="Take a screenshot of your payment confirmation" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item' }}>
                    <ListItemText primary="Upload the screenshot and enter the payment details" />
                  </ListItem>
                  <ListItem sx={{ display: 'list-item' }}>
                    <ListItemText primary="Submit for verification - your account will be credited after confirmation" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
            
            {/* Payment Method Selection */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Payment Method
                </Typography>
                
                {selectedMethod ? (
                  <Box>
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle1" color="primary">
                          {selectedMethod.name}
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        
                        <List disablePadding>
                          {selectedMethod.accountNumber && (
                            <ListItem disablePadding sx={{ py: 1 }}>
                              <ListItemText 
                                primary="Account Number" 
                                secondary={selectedMethod.accountNumber} 
                              />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleCopy(selectedMethod.accountNumber, 'accountNumber')}
                                >
                                  <CopyIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          )}
                          
                          {selectedMethod.accountName && (
                            <ListItem disablePadding sx={{ py: 1 }}>
                              <ListItemText 
                                primary="Account Name" 
                                secondary={selectedMethod.accountName} 
                              />
                              <ListItemSecondaryAction>
                                <IconButton 
                                  edge="end" 
                                  onClick={() => handleCopy(selectedMethod.accountName, 'accountName')}
                                >
                                  <CopyIcon />
                                </IconButton>
                              </ListItemSecondaryAction>
                            </ListItem>
                          )}
                          
                          {selectedMethod.bankName && (
                            <ListItem disablePadding sx={{ py: 1 }}>
                              <ListItemText 
                                primary="Bank Name" 
                                secondary={selectedMethod.bankName} 
                              />
                            </ListItem>
                          )}
                          
                          {selectedMethod.instructions && (
                            <ListItem disablePadding sx={{ py: 1 }}>
                              <ListItemText 
                                primary="Instructions" 
                                secondary={selectedMethod.instructions} 
                              />
                            </ListItem>
                          )}
                        </List>
                      </CardContent>
                    </Card>
                    
                    <Button 
                      variant="outlined" 
                      color="primary" 
                      onClick={handleOpenDialog}
                    >
                      Change Payment Method
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" paragraph>
                      Select a payment method to continue
                    </Typography>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={handleOpenDialog}
                      startIcon={<ReceiptIcon />}
                    >
                      Select Payment Method
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>
            
            {/* Transaction Submission */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Upload Payment Proof
                </Typography>
                
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        label="Amount"
                        variant="outlined"
                        fullWidth
                        required
                        type="number"
                        inputProps={{ min: 0, step: "0.01" }}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        label="Reference/Transaction ID"
                        variant="outlined"
                        fullWidth
                        required
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ mb: 2 }}>
                        {previewUrl ? (
                          <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <img 
                              src={previewUrl} 
                              alt="Transaction Preview" 
                              style={{ 
                                maxWidth: '100%', 
                                maxHeight: '200px', 
                                border: '1px solid #ddd' 
                              }} 
                            />
                            <Box sx={{ mt: 1 }}>
                              <Button 
                                size="small" 
                                color="error" 
                                startIcon={<CloseIcon />}
                                onClick={() => {
                                  setSelectedFile(null);
                                  setPreviewUrl('');
                                }}
                              >
                                Remove
                              </Button>
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                            startIcon={<UploadIcon />}
                            sx={{ py: 2, border: '1px dashed #ccc' }}
                          >
                            Upload Screenshot
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </Button>
                        )}
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                        disabled={loading || !selectedFile || !amount || !reference || !selectedMethod}
                        sx={{ py: 1.5 }}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Submit Transaction'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Transaction History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : transactions.length > 0 ? (
              <List>
                {transactions.map((transaction) => (
                  <ListItem 
                    key={transaction.id} 
                    divider 
                    sx={{ py: 2 }}
                  >
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2} md={1}>
                        {transaction.receiptUrl ? (
                          <img 
                            src={transaction.receiptUrl} 
                            alt="Receipt" 
                            style={{ width: '50px', height: '50px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              width: '50px', 
                              height: '50px', 
                              bgcolor: 'primary.light',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <ReceiptIcon />
                          </Box>
                        )}
                      </Grid>
                      
                      <Grid item xs={12} sm={10} md={7}>
                        <Typography variant="body1">
                          {transaction.amount ? `$${parseFloat(transaction.amount).toFixed(2)}` : 'N/A'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          Ref: {transaction.reference || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : 'N/A'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={12} md={4} sx={{ textAlign: { md: 'right' } }}>
                        <Chip 
                          label={transaction.status || 'Pending'} 
                          color={
                            transaction.status === 'approved' ? 'success' :
                            transaction.status === 'rejected' ? 'error' : 'warning'
                          }
                          size="small"
                        />
                        {transaction.comment && (
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            {transaction.comment}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="textSecondary">
                  No transactions found. Add credit to get started!
                </Typography>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => setTabValue(0)}
                  sx={{ mt: 2 }}
                >
                  Add Credit
                </Button>
              </Box>
            )}
          </Paper>
        </TabPanel>
      </Box>
      
      {/* Payment Methods Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Select Payment Method
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'grey.500',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {paymentMethods.length > 0 ? (
            <List>
              {paymentMethods.map((method) => (
                <ListItem 
                  key={method.id} 
                  button 
                  onClick={() => handleSelectMethod(method)}
                  divider
                >
                  <ListItemText 
                    primary={method.name} 
                    secondary={method.description || `${method.bankName || ''} ${method.accountNumber ? '- ' + method.accountNumber : ''}`} 
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ py: 2, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No payment methods available.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success and Error Messages */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!successMessage} 
        autoHideDuration={6000} 
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success">
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!copiedField} 
        autoHideDuration={2000} 
        onClose={() => setCopiedField('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopiedField('')} severity="success">
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CustomerTransactions; 