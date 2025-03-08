import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import StatusChip from './StatusChip';

/**
 * Component hiển thị chi tiết thông tin của một khách hàng
 * @param {Object} props
 * @param {Object} props.customer - Thông tin chi tiết của khách hàng
 */
const CustomerDetails = React.memo(({ customer }) => {
  return (
    <Box>
      <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ 
              borderRadius: '50%', 
              bgcolor: 'primary.light', 
              color: 'primary.contrastText',
              width: 100, 
              height: 100, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: '2rem',
              mb: 2,
              mx: 'auto'
            }}>
              {(customer.name || customer.fullName || 'U').charAt(0).toUpperCase()}
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" component="div" gutterBottom>
              {customer.name || customer.fullName || 'N/A'}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body1" gutterBottom>{customer.email || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1" gutterBottom>{customer.phone || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Status</Typography>
                <StatusChip status={customer.status} isVerified={customer.isVerified} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Registered On</Typography>
                <Typography variant="body1" gutterBottom>
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>
              </Grid>
            </Grid>
            {customer.rejectionReason && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="error.dark">
                  Rejection Reason:
                </Typography>
                <Typography variant="body2">
                  {customer.rejectionReason}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
      
      <Box sx={{ width: '100%', mt: 3 }}>
        <Tabs 
          value={0} 
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Overview" />
          <Tab label="Transaction History" />
          <Tab label="Orders" />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Account Information</Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>Account Balance</Typography>
                <Typography variant="h4" color="primary.main">
                  {customer.balance ? `$${customer.balance.toFixed(2)}` : '$0.00'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Last updated: {new Date().toLocaleDateString()} 
                </Typography>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <Typography variant="subtitle1" gutterBottom>Account Summary</Typography>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={1}>
                    <Grid item xs={8}>
                      <Typography variant="body2">Total Orders:</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" align="right">0</Typography>
                    </Grid>
                    
                    <Grid item xs={8}>
                      <Typography variant="body2">Total Spent:</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" align="right">$0.00</Typography>
                    </Grid>
                    
                    <Grid item xs={8}>
                      <Typography variant="body2">Account Type:</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" align="right">Standard</Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Customer Notes
            </Typography>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No notes available for this customer.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});

export default CustomerDetails; 