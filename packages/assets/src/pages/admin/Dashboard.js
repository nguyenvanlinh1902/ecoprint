import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  ShoppingCart as OrderIcon,
  Paid as RevenueIcon,
  Inventory as ProductIcon
} from '@mui/icons-material';

const Dashboard = () => {
  // Mock data - would come from API in real app
  const stats = [
    { title: 'Total Customers', value: '1,254', icon: <PeopleIcon />, color: '#3f51b5' },
    { title: 'Today Orders', value: '12', icon: <OrderIcon />, color: '#f44336' },
    { title: 'Revenue (Month)', value: '$8,350', icon: <RevenueIcon />, color: '#4caf50' },
    { title: 'Products', value: '145', icon: <ProductIcon />, color: '#ff9800' }
  ];

  const recentUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active', time: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Pending', time: '3 hours ago' },
    { id: 3, name: 'Robert Johnson', email: 'robert@example.com', status: 'Active', time: '5 hours ago' }
  ];

  const recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: '$120', status: 'Completed', time: '2 hours ago' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: '$85', status: 'Pending', time: '3 hours ago' },
    { id: 'ORD-003', customer: 'Robert Johnson', amount: '$220', status: 'Processing', time: '4 hours ago' }
  ];

  return (
    <Box>
      <Grid container spacing={3} mb={4}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 3
              }}>
                <Avatar
                  sx={{
                    backgroundColor: stat.color,
                    height: 56,
                    width: 56,
                    mb: 2
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography color="textSecondary" gutterBottom variant="overline">
                  {stat.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity and Orders */}
      <Grid container spacing={3}>
        {/* Recent Users */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Users" 
              subheader="Newly registered users"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {recentUsers.map((user) => (
                <React.Fragment key={user.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar>{user.name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={user.name}
                      secondary={
                        <React.Fragment>
                          <Typography component="span" variant="body2" color="text.primary">
                            {user.email}
                          </Typography>
                          {" — "}
                          <Typography component="span" variant="body2" color="text.secondary">
                            {user.status} • {user.time}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ))}
            </List>
          </Card>
        </Grid>

        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader 
              title="Recent Orders" 
              subheader="Latest customer orders"
              titleTypographyProps={{ variant: 'h6' }}
            />
            <Divider />
            <List sx={{ p: 0 }}>
              {recentOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <ListItem alignItems="flex-start" sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2" component="div">
                          {order.id} - {order.customer}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              Amount: {order.amount}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: order.status === 'Completed' ? 'success.main' : 
                                      order.status === 'Pending' ? 'warning.main' : 'info.main'
                              }}
                            >
                              {order.status}
                            </Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {order.time}
                          </Typography>
                        </Box>
                      }
                    />
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