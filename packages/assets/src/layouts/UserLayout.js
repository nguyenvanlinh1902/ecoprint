import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Person as ProfileIcon,
  Settings as SettingsIcon,
  ShoppingCart as OrdersIcon,
  AccountBalance as TransactionIcon,
  Inventory as ProductsIcon
} from '@mui/icons-material';
import { SidebarLayout, CollapsibleSidebar, CollapsibleAppBar } from '../components/shared';
import { useAuth } from '../hooks/api';

const DRAWER_WIDTH = 240;
const DRAWER_COLLAPSED_WIDTH = 64;

/**
 * User layout with sidebar navigation and header
 */
const UserLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [activeSection, setActiveSection] = useState(() => {
    const path = location.pathname;
    if (path.includes('/user/profile')) return 1;
    if (path.includes('/user/orders')) return 2;
    if (path.includes('/user/transactions')) return 3;
    if (path.includes('/user/products')) return 4;
    if (path.includes('/user/settings')) return 5;
    return 0; // Default to dashboard
  });

  // Update active section when route changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/user/profile')) setActiveSection(1);
    else if (path.includes('/user/orders')) setActiveSection(2);
    else if (path.includes('/user/transactions')) setActiveSection(3);
    else if (path.includes('/user/products')) setActiveSection(4);
    else if (path.includes('/user/settings')) setActiveSection(5);
    else setActiveSection(0);
  }, [location.pathname]);
  
  const handleLogout = () => {
    // Implement logout logic using useAuth hook
    logout();
    navigate('/login');
  };
  
  // Menu items configuration
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, index: 0, path: '/user/dashboard' },
    { text: 'Profile', icon: <ProfileIcon />, index: 1, path: '/user/profile' },
    { text: 'My Orders', icon: <OrdersIcon />, index: 2, path: '/user/orders' },
    { text: 'Transactions', icon: <TransactionIcon />, index: 3, path: '/user/transactions' },
    { text: 'Products', icon: <ProductsIcon />, index: 4, path: '/user/products' },
    { text: 'Settings', icon: <SettingsIcon />, index: 5, path: '/user/settings' }
  ];
  
  // User data (in real app, get from context or state management)
  const userData = {
    name: "User Name",
    email: "user@ecoprint.com",
    photoURL: "",
    displayName: "User Name",
    subTitle: "Customer"
  };
  
  return (
    <SidebarLayout
      sidebar={
        <CollapsibleSidebar
          title="EcoPrint"
          logo={<DashboardIcon />}
          menuItems={menuItems}
          activeItemIndex={activeSection}
          profileInfo={userData}
          onMenuItemClick={(item) => {
            setActiveSection(item.index);
            navigate(item.path);
          }}
        />
      }
      appBar={
        <CollapsibleAppBar
          title="EcoPrint Dashboard"
          onLogout={handleLogout}
          onProfileClick={() => navigate('/user/profile')}
          userInfo={userData}
          notificationCount={2}
          onNotificationsClick={() => navigate('/user/notifications')}
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

export default UserLayout; 