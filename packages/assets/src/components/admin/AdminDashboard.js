import React, { useState } from 'react';
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
  Avatar,
  Tab,
  Tabs
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  VerifiedUser as VerifiedUserIcon
} from '@mui/icons-material';
import UserVerification from './UserVerification';

// TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  
  const handleLogout = () => {
    navigate('/admin/login');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <Paper 
        elevation={2}
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'row', 
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: '#f5f5f5',
          borderRadius: 0,
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

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="admin dashboard tabs"
          sx={{ px: 2 }}
        >
          <Tab 
            icon={<DashboardIcon fontSize="small" />} 
            iconPosition="start" 
            label="Dashboard" 
          />
          <Tab 
            icon={<VerifiedUserIcon fontSize="small" />} 
            iconPosition="start" 
            label="User Verification" 
          />
          <Tab 
            icon={<PeopleIcon fontSize="small" />} 
            iconPosition="start" 
            label="Users" 
          />
          <Tab 
            icon={<InventoryIcon fontSize="small" />} 
            iconPosition="start" 
            label="Products" 
          />
          <Tab 
            icon={<SettingsIcon fontSize="small" />} 
            iconPosition="start" 
            label="Settings" 
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <Box sx={{ flexGrow: 1, bgcolor: '#f9f9f9' }}>
        <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
          {/* Dashboard Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
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
          </TabPanel>

          {/* User Verification Tab */}
          <TabPanel value={tabValue} index={1}>
            <UserVerification />
          </TabPanel>

          {/* Other Tabs - Placeholders */}
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">User Management</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                User management functionality will be implemented here.
              </Typography>
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">Product Management</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                Product management functionality will be implemented here.
              </Typography>
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h5">System Settings</Typography>
              <Typography variant="body1" sx={{ mt: 2 }}>
                System settings functionality will be implemented here.
              </Typography>
            </Paper>
          </TabPanel>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
