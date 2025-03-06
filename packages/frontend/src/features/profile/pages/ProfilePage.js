import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile, updateAvatar } from '../../auth/authSlice';
import { FaCamera, FaUser, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { storageService } from '../../../services';
import { useTranslation } from '../../languages/hooks';
import '../styles/profile.scss';

// Giới hạn kích thước file (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: ''
  });
  
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [isCheckingStorage, setIsCheckingStorage] = useState(false);
  
  // Cập nhật formData khi user thay đổi
  useEffect(() => {
    if (user) {
      console.log('ProfilePage - Cập nhật thông tin người dùng:', user);
      setFormData({
        displayName: user.displayName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        position: user.position || '',
        address: user.address || ''
      });
      
      if (user.photoURL) {
        setPreviewUrl(user.photoURL);
      }
    }
  }, [user]);
  
  // Kiểm tra quyền Firebase Storage khi component mount
  useEffect(() => {
    const checkStorage = async () => {
      if (user) {
        try {
          setIsCheckingStorage(true);
          const result = await storageService.checkStorageAccess();
          console.log('Kiểm tra Storage thành công:', result);
          setIsCheckingStorage(false);
        } catch (error) {
          console.error('Lỗi kiểm tra Storage:', error);
          setIsCheckingStorage(false);
          setImageError(`${t('profile.storageAccessError')}: ${error.message}`);
        }
      }
    };
    
    // Chỉ kiểm tra quyền Storage khi cần thiết
    if (user && !isCheckingStorage) {
      checkStorage();
    }
  }, [user, t]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Reset error message
    setImageError('');
    
    // Kiểm tra kích thước file
    if (file.size > MAX_FILE_SIZE) {
      setImageError(t('common.maxFileSize', { size: '5MB' }));
      return;
    }
    
    // Kiểm tra loại file
    if (!file.type.match('image.*')) {
      setImageError(t('common.invalidFileType'));
      return;
    }
    
    // Cập nhật state
    setAvatar(file);
    
    // Tạo preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setImageError('');
    
    try {
      console.log('ProfilePage - Bắt đầu cập nhật hồ sơ');
      
      // Cập nhật avatar nếu có thay đổi
      if (avatar) {
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
          console.log('ProfilePage - Bắt đầu cập nhật avatar');
          
          // Sử dụng storageService để upload ảnh với theo dõi tiến trình
          const uploadPath = `avatars/${user.uid}/${Date.now()}_${avatar.name}`;
          
          const downloadURL = await storageService.uploadImage(
            uploadPath,
            avatar,
            (progress) => {
              console.log('Upload progress:', progress);
              setUploadProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              setImageError(error.message || t('profile.uploadError'));
            }
          );
          
          if (downloadURL) {
            console.log('Avatar uploaded, updating profile with URL:', downloadURL);
            await dispatch(updateAvatar({ downloadURL })).unwrap();
            console.log('ProfilePage - Avatar đã được cập nhật');
          }
          
          setIsUploading(false);
          setUploadProgress(100);
        } catch (error) {
          console.error('ProfilePage - Lỗi cập nhật avatar:', error);
          setIsUploading(false);
          setImageError(error.message || t('profile.uploadError'));
          // Vẫn tiếp tục cập nhật thông tin khác
        }
      }
      
      // Cập nhật thông tin hồ sơ
      console.log('ProfilePage - Dữ liệu form sẽ cập nhật:', formData);
      
      const updateResult = await dispatch(updateProfile(formData)).unwrap();
      console.log('ProfilePage - Hồ sơ đã được cập nhật:', updateResult);
      
      // Hiển thị thông báo thành công
      setSuccess(true);
      
      // Reset file input
      if (avatar) {
        setAvatar(null);
        const fileInput = document.getElementById('avatar');
        if (fileInput) fileInput.value = '';
      }
    } catch (err) {
      console.error('ProfilePage - Lỗi cập nhật hồ sơ:', err);
      setSuccess(false);
      
      // Hiển thị thông báo lỗi chi tiết
      if (typeof err === 'string') {
        setImageError(err);
      } else if (err && err.message) {
        setImageError(err.message);
      } else {
        setImageError(t('profile.updateError'));
      }
    }
  };
  
  return (
    <div className="profile-page">
      <h1>{t('profile.title')}</h1>
      
      {error && (
        <div className="alert alert-danger">
          <FaExclamationTriangle /> {error}
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {t('profile.profileUpdated')}
        </div>
      )}
      
      <div className="profile-content">
        <div className="avatar-section">
          <div className="avatar-container">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt={t('profile.avatar')} 
                className="avatar-image" 
              />
            ) : user && user.displayName ? (
              <div className="avatar-placeholder avatar-text">
                {user.displayName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="avatar-placeholder">
                <FaUser />
              </div>
            )}
            
            <div className="avatar-overlay">
              <label htmlFor="avatar" className="avatar-change-btn">
                {isCheckingStorage ? (
                  <FaSpinner className="spinner-icon" />
                ) : (
                  <FaCamera />
                )}
                <span>{isCheckingStorage ? t('common.processing') : t('profile.changeAvatar')}</span>
              </label>
              <input
                type="file"
                id="avatar"
                onChange={handleAvatarChange}
                accept="image/*"
                className="avatar-input"
                disabled={isCheckingStorage}
              />
            </div>
            
            {isUploading && (
              <div className="upload-progress">
                <div className="progress-bar" style={{ width: `${uploadProgress}%` }}></div>
              </div>
            )}
          </div>
          
          {imageError && (
            <div className="avatar-error">
              <FaExclamationTriangle /> {imageError}
            </div>
          )}
          
          <div className="avatar-helper">
            <small>{t('profile.avatarHelperText')}</small>
          </div>
        </div>
        
        <div className="profile-form-container">
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="displayName">{t('profile.name')}</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">{t('common.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                disabled
                className="disabled"
              />
              <small>{t('profile.emailCannotBeChanged')}</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="phone">{t('profile.phone')}</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="company">{t('profile.company')}</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="position">{t('profile.position')}</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="address">{t('profile.address')}</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || isUploading || isCheckingStorage}
              >
                {loading || isUploading ? (
                  <>
                    <FaSpinner className="spinner-icon" /> {t('common.processing')}
                  </>
                ) : isCheckingStorage ? (
                  <>
                    <FaSpinner className="spinner-icon" /> {t('common.processing')}
                  </>
                ) : (
                  t('profile.updateProfile')
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