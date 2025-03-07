import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSelector, useDispatch } from 'react-redux';
import { FaCamera, FaSpinner, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from '../../../hooks';
import { updateAvatar, updateProfile } from '@features/auth/authSlice';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    position: '',
  });
  
  // Avatar state
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        company: user.company || '',
        position: user.position || '',
      });
      
      if (user.avatarUrl) {
        setAvatarPreview(user.avatarUrl);
      }
    }
  }, [user]);
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle avatar selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setUploadError('Only image files are allowed');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('File size exceeds 5MB limit');
        return;
      }
      
      setAvatar(file);
      setUploadError('');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle avatar upload
  const handleAvatarUpload = async () => {
    if (!avatar) {
      setUploadError('Please select an image first');
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('avatar', avatar);
      
      // Define upload progress handler
      const progressHandler = (event) => {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      };
      
      // Dispatch update avatar action
      await dispatch(updateAvatar({ formData, progressHandler })).unwrap();
      
      // Reset avatar state
      setAvatar(null);
      setIsUploading(false);
      setUploadProgress(0);
      
      // Show success message
      setFormSuccess('Avatar updated successfully');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      console.error('Avatar upload failed:', error);
      setUploadError(error.message || 'Failed to upload avatar');
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.fullName.trim()) {
      setFormError('Name is required');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    setFormSuccess('');
    
    try {
      // Dispatch update profile action
      await dispatch(updateProfile(formData)).unwrap();
      
      // Show success message
      setFormSuccess('Profile updated successfully');
      setTimeout(() => setFormSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
      setFormError(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="profile-page">
      <Helmet>
        <title>Profile | EcoPrint B2B</title>
      </Helmet>
      
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
        <p className="profile-subtitle">
          Manage your account information
        </p>
      </div>
      
      {error && (
        <div className="profile-alert profile-alert--error">
          <FaExclamationTriangle />
          <span>{error}</span>
        </div>
      )}
      
      {formSuccess && (
        <div className="profile-alert profile-alert--success">
          <span>{formSuccess}</span>
        </div>
      )}
      
      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {avatarPreview ? (
              <img src={avatarPreview} alt="User avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <label className="profile-avatar-upload-btn">
              <FaCamera />
              <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploading}
              />
            </label>
          </div>
          
          {avatar && (
            <div className="profile-avatar-actions">
              <button 
                className="btn btn-primary btn-sm"
                onClick={handleAvatarUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <FaSpinner className="spinner" />
                    {uploadProgress}%
                  </>
                ) : (
                  'Upload Avatar'
                )}
              </button>
              {uploadError && <div className="upload-error">{uploadError}</div>}
            </div>
          )}
          
          <div className="profile-user-info">
            <h3>{user?.fullName || 'User'}</h3>
            <p>{user?.email || 'No email'}</p>
          </div>
        </div>
        
        <div className="profile-form-section">
          <h2 className="section-title">Personal Information</h2>
          
          {formError && (
            <div className="profile-form-error">
              <FaExclamationTriangle />
              <span>{formError}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled
              />
              <small className="form-text">Email cannot be changed</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
              ></textarea>
            </div>
            
            <h2 className="section-title">Business Information</h2>
            
            <div className="form-group">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Enter your company name"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                id="position"
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Enter your position"
              />
            </div>
            
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinner" />
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 