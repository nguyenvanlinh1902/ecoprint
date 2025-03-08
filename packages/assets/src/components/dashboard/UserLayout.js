import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Avatar,
  Divider
} from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  ShoppingCart as OrdersIcon, 
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountBalance as TransactionIcon
} from '@mui/icons-material';

// Navigation menu item width
const drawerWidth = 240;

const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(() => {
    const path = location.pathname;
    if (path.includes('/profile')) return 1;
    if (path.includes('/orders')) return 2;
    if (path.includes('/settings')) return 3;
    return 0;
  });
  
  const handleLogout = () => {
    navigate('/login');
  };

  const handleSectionChange = (index, path) => {
    setActiveSection(index);
    navigate(path);
  };
  
  // Menu items configuration
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, index: 0, path: '/dashboard' },
    { text: 'My Profile', icon: <ProfileIcon />, index: 1, path: '/dashboard/profile' },
    { text: 'Transactions', icon: <TransactionIcon />, index: 2, path: '/dashboard/transactions' },
    { text: 'My Orders', icon: <OrdersIcon />, index: 3, path: '/dashboard/orders' },
    { text: 'Settings', icon: <SettingsIcon />, index: 4, path: '/dashboard/settings' }
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
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <DashboardIcon />
          </Avatar>
          <Typography variant="h6" color="primary.main" fontWeight="bold">
            User Panel
          </Typography>
        </Box>

        {/* User Info Summary */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar
              sx={{ width: 40, height: 40, mr: 1.5 }}
              src="/path/to/user/photo.jpg" // Will be replaced with actual user photo
            />
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">User Name</Typography>
              <Typography variant="caption" color="text.secondary">user@example.com</Typography>
            </Box>
          </Box>
        </Box>

        <List sx={{ mt: 1 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                selected={activeSection === item.index}
                onClick={() => handleSectionChange(item.index, item.path)}
                sx={{
                  borderRadius: '0 20px 20px 0',
                  mr: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': {
                      backgroundColor: 'primary.light',
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

        <Divider sx={{ mt: 'auto', mb: 2 }} />

        {/* Logout Button */}
        <Box sx={{ px: 2, pb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            fullWidth
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'auto' }}>
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
            zIndex: 1,
          }}
        >
          <Typography variant="h5" component="h1" color="primary.main" fontWeight="bold">
            {menuItems.find(item => item.index === activeSection)?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="text"
              color="primary"
              startIcon={<NotificationsIcon />}
            >
              Notifications
            </Button>
          </Box>
        </Paper>

        {/* Page Content - will be replaced by Outlet */}
        <Box sx={{ flexGrow: 1, bgcolor: '#f9f9f9', p: 3 }}>
          <Container maxWidth="lg">
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout; 