import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  ShoppingCart as OrdersIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';
import { SidebarLayout, CollapsibleSidebar, CollapsibleAppBar } from '../components/shared';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED_WIDTH = 64;

/**
 * Admin dashboard layout with sidebar and top navigation
 */
const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState(() => {
    const path = location.pathname;
    if (path.includes('/admin/customers')) return 1;
    if (path.includes('/admin/transactions')) return 2;
    if (path.includes('/admin/products')) return 3;
    if (path.includes('/admin/orders')) return 4;
    if (path.includes('/admin/settings')) return 5;
    return 0; // Default to dashboard
  });

  // Update active section when route changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/admin/customers')) setActiveSection(1);
    else if (path.includes('/admin/transactions')) setActiveSection(2);
    else if (path.includes('/admin/products')) setActiveSection(3);
    else if (path.includes('/admin/orders')) setActiveSection(4);
    else if (path.includes('/admin/settings')) setActiveSection(5);
    else setActiveSection(0);
  }, [location.pathname]);
  
  const handleLogout = () => {
    // Implement logout logic
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin');
    navigate('/login');
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
  
  // Admin data (in real app, get from context or state management)
  const adminData = {
    name: "Admin User",
    email: "admin@ecoprint.com",
    photoURL: "",
    displayName: "Admin User",
    subTitle: "Administrator"
  };
  
  return (
    <SidebarLayout
      sidebar={
        <CollapsibleSidebar
          title="Admin Panel"
          logo={<DashboardIcon />}
          menuItems={menuItems}
          activeItemIndex={activeSection}
          profileInfo={adminData}
          onMenuItemClick={(item) => {
            setActiveSection(item.index);
            navigate(item.path);
          }}
        />
      }
      appBar={
        <CollapsibleAppBar
          title="Admin Panel"
          onLogout={handleLogout}
          onProfileClick={() => navigate('/admin/profile')}
          userInfo={adminData}
          notificationCount={4}
          onNotificationsClick={() => navigate('/admin/notifications')}
        />
      }
      drawerWidth={DRAWER_WIDTH}
      drawerCollapsedWidth={DRAWER_COLLAPSED_WIDTH}
    >
      <Container maxWidth="lg">
        <Box sx={{
          bgcolor: 'background.paper',
          p: 3,
          borderRadius: 2,
          boxShadow: 1,
          minHeight: 'calc(100vh - 140px)',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <Outlet />
        </Box>
      </Container>
    </SidebarLayout>
  );
};

export default AdminLayout; 