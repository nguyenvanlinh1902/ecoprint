import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Avatar,
  Grid,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Switch,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  PhotoCamera as CameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [userType, setUserType] = useState('individual'); // 'individual' hoặc 'business'
  const [isCompany, setIsCompany] = useState(false);
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    photoURL: '',
    // Thông tin doanh nghiệp
    companyName: '',
    businessType: '',
    taxID: '',
    businessAddress: '',
    contactPerson: ''
  });
  
  const [originalData, setOriginalData] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Giả lập việc lấy thông tin người dùng từ API
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      
      try {
        // Mô phỏng API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dữ liệu mẫu
        const userData = {
          fullName: 'Nguyễn Văn A',
          email: 'nguyenvana@example.com',
          phone: '0987654321',
          address: '123 Đường Lê Lợi',
          city: 'Hồ Chí Minh',
          country: 'Việt Nam',
          photoURL: 'https://randomuser.me/api/portraits/men/32.jpg',
          // Có thể có hoặc không có thông tin doanh nghiệp
          companyName: '',
          businessType: '',
          taxID: '',
          businessAddress: '',
          contactPerson: ''
        };
        
        setProfileData(userData);
        setOriginalData(userData);
        setUserType(userData.companyName ? 'business' : 'individual');
        setIsCompany(!!userData.companyName);
        
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setErrorMessage('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);
  
  // Check if there are unsaved changes
  useEffect(() => {
    const checkChanges = () => {
      for (const key in profileData) {
        if (profileData[key] !== originalData[key]) {
          setHasChanges(true);
          return;
        }
      }
      setHasChanges(false);
    };
    
    checkChanges();
  }, [profileData, originalData]);
  
  // Xử lý thay đổi input
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Xử lý thay đổi loại tài khoản
  const handleUserTypeChange = (event) => {
    const newType = event.target.value;
    setUserType(newType);
    setIsCompany(newType === 'business');
  };
  
  // Xử lý tải ảnh lên
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Mô phỏng upload ảnh - trong ứng dụng thực tế sẽ gửi lên server
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({
        ...prev,
        photoURL: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };
  
  // Xử lý lưu thay đổi
  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      // Mô phỏng API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Cập nhật originalData để phản ánh thay đổi đã lưu
      setOriginalData({...profileData});
      setSuccessMessage('Profile updated successfully!');
      setHasChanges(false);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý hủy thay đổi
  const handleCancelChanges = () => {
    setProfileData({...originalData});
  };
  
  // Xử lý đóng thông báo
  const handleCloseAlert = (type) => {
    if (type === 'success') {
      setSuccessMessage('');
    } else {
      setErrorMessage('');
    }
  };
  
  if (loading && !profileData.email) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          My Profile
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Manage your personal information and account settings
        </Typography>
        
        <Grid container spacing={3}>
          {/* Profile Photo */}
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={profileData.photoURL}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<CameraIcon />}
              sx={{ mb: 1 }}
            >
              Change Photo
              <input 
                hidden 
                accept="image/*" 
                type="file" 
                onChange={handleImageUpload} 
              />
            </Button>
          </Grid>
          
          {/* Basic Info */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>Basic Information</Typography>
            
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <FormLabel component="legend">Account Type</FormLabel>
              <RadioGroup
                row
                name="userType"
                value={userType}
                onChange={handleUserTypeChange}
              >
                <FormControlLabel value="individual" control={<Radio />} label="Individual" />
                <FormControlLabel value="business" control={<Radio />} label="Business/Company" />
              </RadioGroup>
            </FormControl>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  name="city"
                  value={profileData.city}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Country"
                  name="country"
                  value={profileData.country}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Company Information */}
          {isCompany && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Business Information</Typography>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company Name"
                      name="companyName"
                      value={profileData.companyName}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Business Type"
                      name="businessType"
                      value={profileData.businessType}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Tax ID"
                      name="taxID"
                      value={profileData.taxID}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Contact Person"
                      name="contactPerson"
                      value={profileData.contactPerson}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Business Address"
                      name="businessAddress"
                      value={profileData.businessAddress}
                      onChange={handleInputChange}
                      margin="normal"
                    />
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
          
          {/* Action Buttons */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              variant="outlined" 
              color="inherit"
              startIcon={<CancelIcon />}
              sx={{ mr: 2 }}
              onClick={handleCancelChanges}
              disabled={!hasChanges || loading}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSaveProfile}
              disabled={!hasChanges || loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Notifications */}
      <Snackbar open={!!successMessage} autoHideDuration={6000} onClose={() => handleCloseAlert('success')}>
        <Alert onClose={() => handleCloseAlert('success')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={() => handleCloseAlert('error')}>
        <Alert onClose={() => handleCloseAlert('error')} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserProfile; 