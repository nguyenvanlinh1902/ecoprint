import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaSearch, FaEdit, FaSave } from 'react-icons/fa';
import { useTranslation } from '../hooks';
import { LANGUAGES } from '../contexts/LanguageProvider';
import cmsService from '../../../services/cmsService';
import '../styles/translation-manager.scss';

/**
 * Component quản lý và cập nhật dữ liệu dịch dành cho Admin
 * Cho phép hiển thị, tìm kiếm và chỉnh sửa các bản dịch
 */
const TranslationManager = ({ onlyShowEditableItems = false }) => {
  const { t, language, isLoading: isTranslationLoading } = useTranslation();
  const [translations, setTranslations] = useState({
    vi: {},
    en: {}
  });
  const [editingItems, setEditingItems] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successKeys, setSuccessKeys] = useState([]);
  const [failedKeys, setFailedKeys] = useState([]);
  
  // Lấy tất cả dữ liệu dịch từ CMS khi component được mount
  useEffect(() => {
    const fetchAllTranslations = async () => {
      setIsLoading(true);
      try {
        // Lấy dữ liệu cho tiếng Việt
        const viData = await cmsService.getAllTranslations('vi');
        // Lấy dữ liệu cho tiếng Anh
        const enData = await cmsService.getAllTranslations('en');
        
        setTranslations({
          vi: viData || {},
          en: enData || {}
        });
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu dịch:', error);
        setErrorMessage('Không thể tải dữ liệu dịch từ CMS. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAllTranslations();
  }, []);
  
  // Lọc và phân loại dữ liệu dịch theo searchTerm
  const filteredTranslations = useMemo(() => {
    const result = {};
    
    // Tạo danh sách các keys
    const processKeys = (data, langCode, prefix = '') => {
      Object.entries(data).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null) {
          // Nếu giá trị là object, đệ quy với prefix mới
          processKeys(value, langCode, fullKey);
        } else {
          // Nếu giá trị là string, thêm vào kết quả
          if (!result[fullKey]) {
            result[fullKey] = {
              key: fullKey,
              values: { vi: null, en: null }
            };
          }
          result[fullKey].values[langCode] = value;
        }
      });
    };
    
    // Xử lý dữ liệu cho từng ngôn ngữ
    processKeys(translations.vi, 'vi');
    processKeys(translations.en, 'en');
    
    // Lọc kết quả theo từ khóa tìm kiếm
    return Object.values(result)
      .filter(item => {
        if (!searchTerm) return true;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
          item.key.toLowerCase().includes(lowerSearchTerm) ||
          (item.values.vi && item.values.vi.toLowerCase().includes(lowerSearchTerm)) ||
          (item.values.en && item.values.en.toLowerCase().includes(lowerSearchTerm))
        );
      })
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [translations, searchTerm]);
  
  // Bắt đầu chỉnh sửa một mục
  const handleStartEditing = (key) => {
    setEditingItems(prev => ({
      ...prev,
      [key]: {
        vi: translations.vi[key] || '',
        en: translations.en[key] || ''
      }
    }));
  };
  
  // Cập nhật giá trị chỉnh sửa
  const handleEditChange = (key, lang, value) => {
    setEditingItems(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [lang]: value
      }
    }));
  };
  
  // Lưu thay đổi vào CMS
  const handleSave = async (key) => {
    if (!editingItems[key]) return;
    
    setIsLoading(true);
    setSuccessKeys(prev => prev.filter(k => k !== key));
    setFailedKeys(prev => prev.filter(k => k !== key));
    
    const [namespace, ...keyParts] = key.split('.');
    const actualKey = keyParts.join('.');
    
    try {
      // Cập nhật dữ liệu tiếng Việt
      if (editingItems[key].vi !== undefined) {
        await cmsService.updateTranslation('vi', namespace, actualKey, editingItems[key].vi);
      }
      
      // Cập nhật dữ liệu tiếng Anh
      if (editingItems[key].en !== undefined) {
        await cmsService.updateTranslation('en', namespace, actualKey, editingItems[key].en);
      }
      
      // Cập nhật state local
      setTranslations(prev => ({
        vi: {
          ...prev.vi,
          [key]: editingItems[key].vi
        },
        en: {
          ...prev.en,
          [key]: editingItems[key].en
        }
      }));
      
      // Đánh dấu thành công
      setSuccessKeys(prev => [...prev, key]);
      setTimeout(() => {
        setSuccessKeys(prev => prev.filter(k => k !== key));
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi cập nhật dữ liệu dịch:', error);
      setFailedKeys(prev => [...prev, key]);
      setTimeout(() => {
        setFailedKeys(prev => prev.filter(k => k !== key));
      }, 5000);
    } finally {
      setIsLoading(false);
      // Xóa khỏi danh sách đang chỉnh sửa
      setEditingItems(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };
  
  // Hủy chỉnh sửa
  const handleCancelEdit = (key) => {
    setEditingItems(prev => {
      const newState = { ...prev };
      delete newState[key];
      return newState;
    });
  };
  
  if (isLoading || isTranslationLoading) {
    return (
      <div className="translation-manager">
        <div className="translation-manager__loading">
          <FaSpinner className="spinner" />
          <span>Đang tải dữ liệu dịch...</span>
        </div>
      </div>
    );
  }
  
  if (errorMessage) {
    return (
      <div className="translation-manager">
        <div className="translation-manager__error">
          <FaTimesCircle />
          <p>{errorMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="translation-manager">
      <h2 className="translation-manager__title">
        {t('admin.translationManager.title')}
      </h2>
      
      <div className="translation-manager__search">
        <FaSearch />
        <input
          type="text"
          placeholder={t('admin.translationManager.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="translation-manager__table-container">
        <table className="translation-manager__table">
          <thead>
            <tr>
              <th className="translation-key-column">{t('admin.translationManager.key')}</th>
              <th>{t('admin.translationManager.vietnamese')}</th>
              <th>{t('admin.translationManager.english')}</th>
              <th className="translation-actions-column">{t('admin.translationManager.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTranslations.length === 0 ? (
              <tr>
                <td colSpan="4" className="translation-manager__empty">
                  {searchTerm 
                    ? t('admin.translationManager.noSearchResults') 
                    : t('admin.translationManager.noTranslations')}
                </td>
              </tr>
            ) : (
              filteredTranslations.map((item) => (
                <tr key={item.key} className={`
                  ${successKeys.includes(item.key) ? 'translation-success' : ''}
                  ${failedKeys.includes(item.key) ? 'translation-error' : ''}
                  ${editingItems[item.key] ? 'translation-editing' : ''}
                `}>
                  <td className="translation-key">{item.key}</td>
                  
                  <td>
                    {editingItems[item.key] ? (
                      <textarea
                        value={editingItems[item.key].vi || ''}
                        onChange={(e) => handleEditChange(item.key, 'vi', e.target.value)}
                      />
                    ) : (
                      <div className="translation-value">{item.values.vi}</div>
                    )}
                  </td>
                  
                  <td>
                    {editingItems[item.key] ? (
                      <textarea
                        value={editingItems[item.key].en || ''}
                        onChange={(e) => handleEditChange(item.key, 'en', e.target.value)}
                      />
                    ) : (
                      <div className="translation-value">{item.values.en}</div>
                    )}
                  </td>
                  
                  <td className="translation-actions">
                    {editingItems[item.key] ? (
                      <>
                        <button 
                          title={t('admin.translationManager.save')}
                          onClick={() => handleSave(item.key)}
                          className="btn-save"
                        >
                          <FaSave />
                        </button>
                        <button 
                          title={t('admin.translationManager.cancel')}
                          onClick={() => handleCancelEdit(item.key)}
                          className="btn-cancel"
                        >
                          <FaTimesCircle />
                        </button>
                      </>
                    ) : (
                      <button 
                        title={t('admin.translationManager.edit')}
                        onClick={() => handleStartEditing(item.key)}
                        className="btn-edit"
                      >
                        <FaEdit />
                      </button>
                    )}
                    
                    {successKeys.includes(item.key) && (
                      <span className="status-icon success">
                        <FaCheckCircle />
                      </span>
                    )}
                    
                    {failedKeys.includes(item.key) && (
                      <span className="status-icon error">
                        <FaTimesCircle />
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TranslationManager.propTypes = {
  onlyShowEditableItems: PropTypes.bool
};

export default TranslationManager; 