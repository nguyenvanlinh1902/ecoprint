import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Paper
} from '@mui/material';
import { 
  ColorLens as ColorLensIcon,
  Brightness4 as DarkModeIcon,
  Refresh as ResetIcon,
  Save as SaveIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTheme } from '../../contexts/ThemeContext';
import ColorPicker from '../../components/dashboard/settings/ColorPicker';

/**
 * User settings page with theme customization
 */
const UserSettings = () => {
  const { isDarkMode, customColors, toggleDarkMode, updateColors, resetTheme } = useTheme();
  
  // Local state for color values
  const [colors, setColors] = useState({
    primary: customColors.primary || '',
    secondary: customColors.secondary || ''
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleColorChange = (type, color) => {
    setColors(prevColors => ({
      ...prevColors,
      [type]: color
    }));
  };
  
  const handleSaveChanges = () => {
    // Only save valid colors
    const validColors = {};
    if (colors.primary && /^#([0-9A-F]{3}){1,2}$/i.test(colors.primary)) {
      validColors.primary = colors.primary;
    }
    if (colors.secondary && /^#([0-9A-F]{3}){1,2}$/i.test(colors.secondary)) {
      validColors.secondary = colors.secondary;
    }
    
    updateColors(validColors);
    
    setSnackbar({
      open: true,
      message: 'Your theme settings have been saved!',
      severity: 'success'
    });
  };
  
  const handleResetTheme = () => {
    resetTheme();
    setColors({
      primary: '',
      secondary: ''
    });
    
    setSnackbar({
      open: true,
      message: 'Theme reset to default settings',
      severity: 'info'
    });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };
  
  return (
    <>
      <Typography variant="h4" component="h1" gutterBottom color="primary" fontWeight="bold">
        User Settings
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <PersonIcon sx={{ mr: 1 }} /> User Profile Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Profile settings will be available soon.
        </Typography>
      </Paper>
      
      <Grid container spacing={3}>
        {/* Theme Settings */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ColorLensIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Appearance Settings</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={isDarkMode}
                      onChange={toggleDarkMode} 
                      color="primary"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DarkModeIcon sx={{ mr: 1 }} />
                      <Typography>Dark Mode</Typography>
                    </Box>
                  }
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Switch between light and dark theme for better reading comfort.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Primary Color
                </Typography>
                <ColorPicker
                  color={colors.primary || (isDarkMode ? '#90caf9' : '#1976d2')}
                  onChange={(color) => handleColorChange('primary', color)}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Main color for buttons, links, and headers.
                </Typography>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Secondary Color
                </Typography>
                <ColorPicker
                  color={colors.secondary || (isDarkMode ? '#f48fb1' : '#dc004e')}
                  onChange={(color) => handleColorChange('secondary', color)}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Accent color for highlights and secondary elements.
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button 
                  variant="outlined" 
                  color="inherit" 
                  startIcon={<ResetIcon />}
                  onClick={handleResetTheme}
                >
                  Reset Theme
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<SaveIcon />}
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Preview */}
        <Grid item xs={12} md={6}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ 
                p: 3, 
                borderRadius: 1, 
                bgcolor: 'background.paper',
                border: '1px dashed',
                borderColor: 'divider'
              }}>
                <Typography variant="h6" color="primary" gutterBottom>Sample Header</Typography>
                <Typography variant="body1" paragraph>
                  This is how content will appear with your current theme settings.
                  The colors and contrast will adjust based on your preferences.
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="primary">Primary</Button>
                  <Button variant="contained" color="secondary">Secondary</Button>
                  <Button variant="outlined" color="primary">Outlined</Button>
                </Box>
                
                <Alert severity="info" sx={{ mt: 3 }}>
                  Information alerts will look like this.
                </Alert>
                
                <Alert severity="success" sx={{ mt: 2 }}>
                  Success messages will look like this.
                </Alert>
                
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                  Secondary text appears like this in your chosen theme.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={4000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserSettings; 