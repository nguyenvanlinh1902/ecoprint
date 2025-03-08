import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  InputAdornment
} from '@mui/material';
import { 
  Email as EmailIcon,
  Save as SaveIcon,
  Settings as SettingsIcon,
  Storage as StorageIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

/**
 * Admin settings page for system configuration
 */
const Settings = () => {
  // Email configuration state
  const [emailConfig, setEmailConfig] = useState({
    smtpServer: 'smtp.ecoprint.com',
    smtpPort: '587',
    emailUsername: 'notifications@ecoprint.com',
    emailPassword: '••••••••••••',
    senderName: 'EcoPrint Notifications',
    enableSsl: true
  });
  
  // System configuration state
  const [systemConfig, setSystemConfig] = useState({
    maxFileSize: '10',
    maxUploadFiles: '5',
    enableUserRegistration: true,
    adminApprovalRequired: true,
    maintenanceMode: false
  });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleEmailConfigChange = (e) => {
    const { name, value } = e.target;
    setEmailConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSystemConfigChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSystemConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleToggleChange = (name) => (event) => {
    const { checked } = event.target;
    if (name.startsWith('email')) {
      setEmailConfig(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setSystemConfig(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };
  
  const handleSaveEmailConfig = () => {
    // Save email configuration logic would go here
    console.log('Email configuration saved:', emailConfig);
    
    setSnackbar({
      open: true,
      message: 'Email settings saved successfully!',
      severity: 'success'
    });
  };
  
  const handleSaveSystemConfig = () => {
    // Save system configuration logic would go here
    console.log('System configuration saved:', systemConfig);
    
    setSnackbar({
      open: true,
      message: 'System settings saved successfully!',
      severity: 'success'
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
        System Settings
      </Typography>
      
      <Grid container spacing={3}>
        {/* Email Configuration */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">Email Configuration</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="SMTP Server"
                    name="smtpServer"
                    value={emailConfig.smtpServer}
                    onChange={handleEmailConfigChange}
                    margin="normal"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="SMTP Port"
                    name="smtpPort"
                    value={emailConfig.smtpPort}
                    onChange={handleEmailConfigChange}
                    margin="normal"
                    size="small"
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={emailConfig.enableSsl}
                        onChange={handleToggleChange('enableSsl')}
                        name="enableSsl"
                        color="primary"
                      />
                    }
                    label="Enable SSL/TLS"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Username"
                    name="emailUsername"
                    value={emailConfig.emailUsername}
                    onChange={handleEmailConfigChange}
                    margin="normal"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Password"
                    name="emailPassword"
                    value={emailConfig.emailPassword}
                    onChange={handleEmailConfigChange}
                    margin="normal"
                    size="small"
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Sender Name"
                    name="senderName"
                    value={emailConfig.senderName}
                    onChange={handleEmailConfigChange}
                    margin="normal"
                    size="small"
                    helperText="Name displayed in the 'From' field"
                  />
                </Grid>
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveEmailConfig}
                >
                  Save Email Settings
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* System Configuration */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SettingsIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">System Configuration</Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom display="flex" alignItems="center">
                  <StorageIcon fontSize="small" sx={{ mr: 1 }} /> Storage Settings
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Max File Size"
                      name="maxFileSize"
                      value={systemConfig.maxFileSize}
                      onChange={handleSystemConfigChange}
                      margin="normal"
                      size="small"
                      type="number"
                      InputProps={{
                        endAdornment: <InputAdornment position="end">MB</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Max Upload Files"
                      name="maxUploadFiles"
                      value={systemConfig.maxUploadFiles}
                      onChange={handleSystemConfigChange}
                      margin="normal"
                      size="small"
                      type="number"
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom display="flex" alignItems="center">
                  <SecurityIcon fontSize="small" sx={{ mr: 1 }} /> Security Settings
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemConfig.enableUserRegistration}
                          onChange={handleToggleChange('enableUserRegistration')}
                          name="enableUserRegistration"
                          color="primary"
                        />
                      }
                      label="Enable User Registration"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemConfig.adminApprovalRequired}
                          onChange={handleToggleChange('adminApprovalRequired')}
                          name="adminApprovalRequired"
                          color="primary"
                        />
                      }
                      label="Require Admin Approval for New Accounts"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={systemConfig.maintenanceMode}
                          onChange={handleToggleChange('maintenanceMode')}
                          name="maintenanceMode"
                          color="error"
                        />
                      }
                      label="Maintenance Mode"
                    />
                    {systemConfig.maintenanceMode && (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        When enabled, only admins can access the system.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveSystemConfig}
                >
                  Save System Settings
                </Button>
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

export default Settings; 