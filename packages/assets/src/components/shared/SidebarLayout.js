import React, { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * SidebarLayout - Component layout có khả năng thu nhỏ và mở rộng sidebar
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.sidebar - Component sidebar
 * @param {React.ReactNode} props.appBar - Component appBar
 * @param {React.ReactNode} props.children - Nội dung chính
 * @param {number} props.drawerWidth - Chiều rộng drawer khi mở rộng
 * @param {number} props.drawerCollapsedWidth - Chiều rộng drawer khi thu nhỏ
 * @param {boolean} props.defaultCollapsed - Trạng thái mặc định (thu nhỏ hay mở rộng)
 * @returns {JSX.Element} SidebarLayout component
 */
const SidebarLayout = ({
  sidebar,
  appBar,
  children,
  drawerWidth = 240,
  drawerCollapsedWidth = 64,
  defaultCollapsed = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  const currentDrawerWidth = !isMobile && isCollapsed 
    ? drawerCollapsedWidth 
    : drawerWidth;

  // Clone children và truyền props cần thiết
  const sidebarWithProps = React.cloneElement(sidebar, {
    drawerWidth,
    drawerCollapsedWidth,
    isCollapsed,
    mobileOpen,
    handleDrawerToggle,
    isMobile
  });

  const appBarWithProps = React.cloneElement(appBar, {
    drawerWidth: currentDrawerWidth,
    handleDrawerToggle,
    isCollapsed,
    toggleCollapse: () => setIsCollapsed(!isCollapsed)
  });

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {appBarWithProps}
      
      {sidebarWithProps}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { 
            xs: '100%', 
            md: `calc(100% - ${currentDrawerWidth}px)` 
          },
          ml: { 
            xs: 0, 
            md: `${currentDrawerWidth}px` 
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          mt: 8
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default SidebarLayout; 