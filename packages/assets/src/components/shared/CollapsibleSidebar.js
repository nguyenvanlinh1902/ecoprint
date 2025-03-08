import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Avatar,
  Typography,
  Divider,
  Tooltip
} from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

/**
 * CollapsibleSidebar - Sidebar có khả năng thu nhỏ và mở rộng
 * 
 * @param {Object} props - Component props
 * @param {number} props.drawerWidth - Chiều rộng drawer khi mở rộng
 * @param {number} props.drawerCollapsedWidth - Chiều rộng drawer khi thu nhỏ
 * @param {boolean} props.isCollapsed - Trạng thái hiện tại của sidebar
 * @param {boolean} props.mobileOpen - Trạng thái mở trên mobile
 * @param {Function} props.handleDrawerToggle - Hàm xử lý khi toggle drawer
 * @param {boolean} props.isMobile - Có phải là thiết bị di động không
 * @param {string} props.title - Tiêu đề sidebar
 * @param {Object} props.logo - Logo cho sidebar
 * @param {Array} props.menuItems - Các mục menu
 * @param {number} props.activeItemIndex - Index mục đang active
 * @param {Object} props.profileInfo - Thông tin profile (nếu có)
 * @param {Function} props.onMenuItemClick - Hàm xử lý khi click vào menu item
 * @returns {JSX.Element} CollapsibleSidebar component
 */
const CollapsibleSidebar = ({
  drawerWidth = 240,
  drawerCollapsedWidth = 64,
  isCollapsed = false,
  mobileOpen = false,
  handleDrawerToggle,
  isMobile = false,
  title = 'Sidebar',
  logo = null, // Icon component
  menuItems = [],
  activeItemIndex = 0,
  profileInfo = null,
  onMenuItemClick
}) => {
  const navigate = useNavigate();
  const [openSubMenu, setOpenSubMenu] = React.useState({});
  
  const handleItemClick = (item, index) => {
    if (item.subItems && item.subItems.length > 0) {
      setOpenSubMenu((prev) => ({
        ...prev,
        [index]: !prev[index]
      }));
      return;
    }
    
    if (item.path) {
      navigate(item.path);
    }
    
    if (onMenuItemClick) {
      onMenuItemClick(item, index);
    }
    
    if (isMobile && mobileOpen) {
      handleDrawerToggle();
    }
  };
  
  const renderMenuItem = (item, index) => {
    const isActive = activeItemIndex === index;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isOpen = openSubMenu[index];
    
    return (
      <React.Fragment key={`menu-item-${index}`}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => handleItemClick(item, index)}
            selected={isActive && !hasSubItems}
            sx={{
              minHeight: 48,
              px: 2.5,
              justifyContent: isCollapsed ? 'center' : 'initial',
              borderRadius: '4px',
              mx: 1,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }
            }}
          >
            <Tooltip title={isCollapsed ? item.text : ''} placement="right" arrow={true}>
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: isCollapsed ? 0 : 2,
                  justifyContent: 'center',
                  color: isActive ? 'primary.main' : 'inherit'
                }}
              >
                {item.icon}
              </ListItemIcon>
            </Tooltip>
            
            {!isCollapsed && (
              <>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{
                    fontSize: 14,
                    fontWeight: isActive ? 'bold' : 'medium'
                  }}
                />
                {hasSubItems && (isOpen ? <ExpandLess /> : <ExpandMore />)}
              </>
            )}
          </ListItemButton>
        </ListItem>
        
        {hasSubItems && !isCollapsed && (
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem, subIndex) => {
                const isSubItemActive = subItem.path && 
                  window.location.pathname === subItem.path;
                  
                return (
                  <ListItemButton
                    key={`submenu-${index}-${subIndex}`}
                    onClick={() => {
                      if (subItem.path) navigate(subItem.path);
                      if (onMenuItemClick) onMenuItemClick(subItem, `${index}-${subIndex}`);
                    }}
                    selected={isSubItemActive}
                    sx={{ 
                      pl: 6,
                      borderRadius: '4px',
                      mx: 1,
                      mb: 0.5,
                      minHeight: 36,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.light',
                      }
                    }}
                  >
                    {subItem.icon && (
                      <ListItemIcon sx={{ minWidth: 24, mr: 1 }}>
                        {subItem.icon}
                      </ListItemIcon>
                    )}
                    <ListItemText 
                      primary={subItem.text} 
                      primaryTypographyProps={{
                        fontSize: 13,
                        fontWeight: isSubItemActive ? 'medium' : 'normal'
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };
  
  const drawerContent = (
    <>
      <Toolbar
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'flex-start',
          px: isCollapsed ? 1 : 2
        }}
      >
        {logo && (
          <Avatar
            sx={{ 
              bgcolor: 'primary.main', 
              width: 40, 
              height: 40,
              mr: isCollapsed ? 0 : 2 
            }}
          >
            {logo}
          </Avatar>
        )}
        
        {!isCollapsed && (
          <Typography variant="h6" color="primary.main" fontWeight="bold" noWrap>
            {title}
          </Typography>
        )}
      </Toolbar>
      
      <Divider />
      
      <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
        <List component="nav" sx={{ px: isCollapsed ? 0 : 1, pt: 2 }}>
          {menuItems.map(renderMenuItem)}
        </List>
      </Box>
      
      {profileInfo && !isCollapsed && (
        <Box 
          sx={{ 
            p: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {profileInfo.avatar && (
            <Avatar 
              src={profileInfo.avatar} 
              alt={profileInfo.name || 'User'}
              sx={{ width: 40, height: 40, mr: 1.5 }}
            />
          )}
          
          <Box>
            <Typography variant="subtitle2" fontWeight="bold">
              {profileInfo.name}
            </Typography>
            {profileInfo.subTitle && (
              <Typography variant="caption" color="text.secondary">
                {profileInfo.subTitle}
              </Typography>
            )}
          </Box>
        </Box>
      )}
      
      {profileInfo && isCollapsed && (
        <Box 
          sx={{ 
            py: 2, 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderTop: '1px solid', 
            borderColor: 'divider',
          }}
        >
          <Tooltip title={profileInfo.name} placement="right">
            <Avatar 
              src={profileInfo.avatar} 
              alt={profileInfo.name || 'User'}
              sx={{ width: 40, height: 40 }}
            />
          </Tooltip>
        </Box>
      )}
    </>
  );
  
  return (
    <Box
      component="nav"
      sx={{ 
        width: { 
          xs: drawerWidth, 
          md: isCollapsed ? drawerCollapsedWidth : drawerWidth 
        }, 
        flexShrink: { sm: 0 } 
      }}
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
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
      >
        {drawerContent}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open={!isCollapsed}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: isCollapsed ? drawerCollapsedWidth : drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: (theme) => theme.transitions.create(['width'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden'
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default CollapsibleSidebar; 