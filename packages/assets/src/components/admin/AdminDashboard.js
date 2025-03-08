import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Avatar
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon 
} from '@mui/icons-material';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate('/admin/login');
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: 2, 
              display: 'flex', 
              flexDirection: 'row', 
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: '#f5f5f5'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
                <DashboardIcon />
              </Avatar>
              <Typography variant="h5" component="h1" color="error.main" fontWeight="bold">
                Admin Dashboard
              </Typography>
            </Box>
            <Button 
              variant="outlined" 
              color="error" 
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Paper>
        </Grid>
        
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Users</Typography>
              <Typography variant="h3">1,234</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Products</Typography>
              <Typography variant="h3">567</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Orders</Typography>
              <Typography variant="h3">89</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'error.light', color: 'error.contrastText' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Revenue</Typography>
              <Typography variant="h3">$12.4k</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Main Content */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Admin Control Panel
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to the admin dashboard. Here you can manage users, products, orders, and system settings.
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardHeader 
                    avatar={
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PeopleIcon />
                      </Avatar>
                    }
                    title="User Management" 
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Manage users, permissions and roles
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardHeader 
                    avatar={
                      <Avatar sx={{ bgcolor: 'success.main' }}>
                        <InventoryIcon />
                      </Avatar>
                    }
                    title="Product Management" 
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Add, edit and delete products
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardHeader 
                    avatar={
                      <Avatar sx={{ bgcolor: 'warning.main' }}>
                        <DashboardIcon />
                      </Avatar>
                    }
                    title="Order Management" 
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Process and track customer orders
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardHeader 
                    avatar={
                      <Avatar sx={{ bgcolor: 'error.main' }}>
                        <SettingsIcon />
                      </Avatar>
                    }
                    title="System Settings" 
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Configure application settings
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
