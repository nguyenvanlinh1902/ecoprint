import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Typography,
  Badge,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as CollapseIcon,
  ChevronRight as ExpandIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * CollapsibleAppBar - AppBar phối hợp với CollapsibleSidebar
 * 
 * @param {Object} props - Component props
 * @param {number} props.drawerWidth - Chiều rộng drawer
 * @param {Function} props.handleDrawerToggle - Hàm xử lý khi toggle drawer
 * @param {boolean} props.isCollapsed - Trạng thái hiện tại của sidebar
 * @param {Function} props.toggleCollapse - Hàm xử lý khi thu nhỏ/mở rộng sidebar
 * @param {string} props.title - Tiêu đề trên AppBar
 * @param {Function} props.onLogout - Hàm xử lý khi đăng xuất
 * @param {Function} props.onProfileClick - Hàm xử lý khi click vào profile
 * @param {Object} props.userInfo - Thông tin người dùng hiện tại
 * @param {number} props.notificationCount - Số thông báo chưa đọc
 * @param {Function} props.onNotificationsClick - Hàm xử lý khi click vào thông báo
 * @returns {JSX.Element} CollapsibleAppBar component
 */
const CollapsibleAppBar = ({
  drawerWidth = 240,
  handleDrawerToggle,
  isCollapsed = false,
  toggleCollapse,
  title = 'Application',
  onLogout,
  onProfileClick,
  userInfo = null,
  notificationCount = 0,
  onNotificationsClick
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleProfileClick = () => {
    if (onProfileClick) onProfileClick();
    handleProfileMenuClose();
  };
  
  const handleLogout = () => {
    if (onLogout) onLogout();
    handleProfileMenuClose();
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          boxShadow: 1,
          transition: (theme) => theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <IconButton
            color="inherit"
            aria-label={isCollapsed ? "expand sidebar" : "collapse sidebar"}
            edge="start"
            onClick={toggleCollapse}
            sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
          >
            {isCollapsed ? <ExpandIcon /> : <CollapseIcon />}
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              <IconButton color="inherit" onClick={toggleDarkMode} sx={{ ml: 1 }}>
                {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            
            {onNotificationsClick && (
              <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={onNotificationsClick} sx={{ ml: 1 }}>
                  <Badge badgeContent={notificationCount} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
            )}
            
            <Tooltip title="Account settings">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ ml: 1 }}
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                {userInfo?.photoURL ? (
                  <Avatar 
                    sx={{ width: 32, height: 32 }}
                    src={userInfo.photoURL}
                    alt={userInfo.displayName || 'User'}
                  />
                ) : (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                    {userInfo?.displayName?.charAt(0) || <PersonIcon />}
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleProfileMenuClose}
        onClick={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          elevation: 2,
          sx: {
            minWidth: 200,
            overflow: 'visible',
            mt: 1.5,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
      >
        {userInfo && (
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {userInfo.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userInfo.email}
            </Typography>
          </Box>
        )}
        
        <Divider />
        
        <MenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Profile
        </MenuItem>
        
        <MenuItem onClick={toggleDarkMode}>
          <ListItemIcon>
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </MenuItem>
        
        <MenuItem onClick={handleProfileMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
};

export default CollapsibleAppBar; 