import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Drawer,
  Toolbar,
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
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  ShoppingCart as OrdersIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

/**
 * Admin sidebar navigation menu
 */
const AdminSidebar = ({ 
  drawerWidth, 
  mobileOpen, 
  handleDrawerToggle, 
  currentPath,
  activeSection: externalActiveSection,
  isMobile 
}) => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(externalActiveSection || 0);

  // Sync with external activeSection when provided
  useEffect(() => {
    if (typeof externalActiveSection !== 'undefined') {
      setActiveSection(externalActiveSection);
    }
  }, [externalActiveSection]);

  // Admin data (in real app, get from context or state management)
  const adminData = {
    fullName: "Admin User",
    email: "admin@ecoprint.com",
    photoURL: ""
  };

  // Menu items configuration
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, index: 0, path: '/admin/dashboard' },
    { text: 'Customers', icon: <PeopleIcon />, index: 1, path: '/admin/customers' },
    { text: 'Transactions', icon: <PaymentIcon />, index: 2, path: '/admin/transactions' },
    { text: 'Products', icon: <InventoryIcon />, index: 3, path: '/admin/products' },
    { text: 'Orders', icon: <OrdersIcon />, index: 4, path: '/admin/orders' },
    { text: 'Settings', icon: <SettingsIcon />, index: 5, path: '/admin/settings' }
  ];

  // Update active section based on current path if not controlled externally
  useEffect(() => {
    if (typeof externalActiveSection === 'undefined') {
      if (currentPath.includes('/admin/customers')) setActiveSection(1);
      else if (currentPath.includes('/admin/transactions')) setActiveSection(2);
      else if (currentPath.includes('/admin/products')) setActiveSection(3);
      else if (currentPath.includes('/admin/orders')) setActiveSection(4);
      else if (currentPath.includes('/admin/settings')) setActiveSection(5);
      else setActiveSection(0);
    }
  }, [currentPath, externalActiveSection]);

  const handleSectionChange = (index, path) => {
    setActiveSection(index);
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const drawerContent = (
    <>
      <Toolbar /> {/* Spacer for AppBar */}
      <Box sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
          <DashboardIcon />
        </Avatar>
        <Typography variant="h6" color="primary.main" fontWeight="bold">
          Admin Panel
        </Typography>
      </Box>
      
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List sx={{ mt: 2, width: '100%' }}>
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
                <ListItemIcon sx={{ color: activeSection === item.index ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mt: 'auto', mb: 2 }} />

        {/* Profile Info - only show in desktop mode */}
        {!isMobile && (
          <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{ width: 40, height: 40, mr: 1.5 }}
                src={adminData?.photoURL || ""}
              />
              <Box>
                <Typography variant="subtitle2" fontWeight="bold">
                  {adminData?.fullName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {adminData?.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: 'background.default'
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            backgroundColor: 'background.default',
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default AdminSidebar; 