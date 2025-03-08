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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Drawer
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  People as PeopleIcon, 
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  VerifiedUser as VerifiedUserIcon,
  ShoppingCart as OrdersIcon,
  AccountBalance as TransactionIcon
} from '@mui/icons-material';
import CustomerManagement from './CustomerManagement';
import TransactionManagement from './TransactionManagement';

// TabPanel component for content
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

// Navigation menu item width
const drawerWidth = 240;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  
  const handleLogout = () => {
    navigate('/admin/login');
  };

  const handleSectionChange = (index) => {
    setActiveSection(index);
  };
  
  // Menu items configuration
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, index: 0 },
    { text: 'Customer Management', icon: <PeopleIcon />, index: 1 },
    { text: 'Transaction Management', icon: <TransactionIcon />, index: 2 },
    { text: 'Products', icon: <InventoryIcon />, index: 3 },
    { text: 'Orders', icon: <OrdersIcon />, index: 4 },
    { text: 'Settings', icon: <SettingsIcon />, index: 5 }
  ];
  
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Left Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5',
            borderRight: '1px solid #e0e0e0'
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Avatar sx={{ bgcolor: 'error.main', mr: 2 }}>
            <DashboardIcon />
          </Avatar>
          <Typography variant="h6" color="error.main" fontWeight="bold">
            Admin Panel
          </Typography>
        </Box>
        <List sx={{ mt: 2 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={activeSection === item.index}
                onClick={() => handleSectionChange(item.index)}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mr: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'error.light',
                    '&:hover': {
                      backgroundColor: 'error.light',
                    }
                  }
                }}
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
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
            zIndex: 1,
          }}
        >
          <Typography variant="h5" component="h1" color="error.main" fontWeight="bold">
            {menuItems.find(item => item.index === activeSection)?.text || 'Admin Dashboard'}
          </Typography>
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Paper>

        <Box sx={{ flexGrow: 1, bgcolor: '#f9f9f9', overflow: 'auto' }}>
          <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
            {/* Dashboard Content */}
            <TabPanel value={activeSection} index={0}>
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

            {/* Customer Management Tab (moved from User Verification) */}
            <TabPanel value={activeSection} index={1}>
              <CustomerManagement />
            </TabPanel>

            {/* Transaction Management Tab */}
            <TabPanel value={activeSection} index={2}>
              <TransactionManagement />
            </TabPanel>

            {/* Products Tab */}
            <TabPanel value={activeSection} index={3}>
              <Typography variant="h5" gutterBottom>
                Product Management
              </Typography>
              <Paper sx={{ p: 3 }}>
                <Typography>Products management content will be displayed here</Typography>
              </Paper>
            </TabPanel>

            {/* Orders Tab */}
            <TabPanel value={activeSection} index={4}>
              <Typography variant="h5" gutterBottom>
                Order Management
              </Typography>
              <Paper sx={{ p: 3 }}>
                <Typography>Orders management content will be displayed here</Typography>
              </Paper>
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={activeSection} index={5}>
              <Typography variant="h5" gutterBottom>
                System Settings
              </Typography>
              <Paper sx={{ p: 3 }}>
                <Typography>System settings content will be displayed here</Typography>
              </Paper>
            </TabPanel>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
