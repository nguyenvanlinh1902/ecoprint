import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardHeader,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  Paid as PaidIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  CheckCircle as SuccessIcon,
  ThumbUp as LoyaltyIcon
} from '@mui/icons-material';

const Dashboard = () => {
  // Mock data
  const userStats = [
    { title: 'Active Orders', value: '3', icon: <CartIcon />, color: '#3f51b5' },
    { title: 'Points Balance', value: '1,254', icon: <LoyaltyIcon />, color: '#4caf50' },
    { title: 'Total Spent', value: '$1,350', icon: <PaidIcon />, color: '#ff9800' }
  ];

  const recentOrders = [
    { 
      id: 'ORD-001', 
      date: '2023-05-01', 
      items: 3, 
      amount: '$120', 
      status: 'Completed',
      delivery: 'Delivered (May 5, 2023)'
    },
    { 
      id: 'ORD-002', 
      date: '2023-05-15', 
      items: 1, 
      amount: '$85', 
      status: 'Processing',
      delivery: 'Expected delivery: May 20, 2023'
    },
    { 
      id: 'ORD-003', 
      date: '2023-05-28', 
      items: 2, 
      amount: '$220', 
      status: 'Shipped',
      delivery: 'In transit, expected: June 1, 2023'
    }
  ];

  return (
    <Box>
      <Grid container spacing={3} mb={4}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Card 
            sx={{ 
              p: 3, 
              backgroundImage: 'linear-gradient(to right, #3f51b5, #2196f3)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Welcome back, John!
              </Typography>
              <Typography variant="body1" paragraph>
                Track your orders, manage your profile, and browse our latest products.
              </Typography>
              <Button 
                variant="contained" 
                color="secondary" 
                sx={{ mt: 1, fontWeight: 'bold' }}
              >
                Browse Products
              </Button>
            </Box>
            {/* Decorative element */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 150,
                height: 150,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                right: 60,
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}
            />
          </Card>
        </Grid>
        
        {/* Stats Cards */}
        {userStats.map((stat, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                p: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      height: 40,
                      width: 40,
                      mr: 2
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h6" color="textPrimary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Orders */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardHeader 
              title="Recent Orders" 
              titleTypographyProps={{ variant: 'h6' }}
              action={
                <Button color="primary" size="small">
                  View All
                </Button>
              }
            />
            <Divider />
            <List>
              {recentOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {order.id}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: order.status === 'Completed' ? 'success.main' : 
                                  order.status === 'Processing' ? 'info.main' : 'warning.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {order.status}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={8}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Order Date: {order.date} • Items: {order.items} • Amount: {order.amount}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {order.delivery}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            sx={{ mr: 1 }}
                          >
                            Track
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                          >
                            Details
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 