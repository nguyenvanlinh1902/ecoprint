import { useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageProvider';

/**
 * Hook để sử dụng bản dịch dựa trên ngôn ngữ hiện tại
 * @returns {Object} Object chứa hàm translate (t), ngôn ngữ hiện tại, và các chức năng dịch thuật
 */
const useTranslation = () => {
  const { 
    language, 
    changeLanguage, 
    isLoading, 
    error, 
    getTranslation, 
    updateTranslation 
  } = useLanguage();

  /**
   * Hàm dịch key thành text theo ngôn ngữ hiện tại
   * @param {string} key - Key định danh trong file dịch (ví dụ: 'auth.login')
   * @param {Object} [params] - Tham số để thay thế trong chuỗi dịch
   * @returns {string} Văn bản đã dịch
   */
  const t = useMemo(() => {
    return (key, params = {}) => {
      if (!key) return '';
      return getTranslation(key, params);
    };
  }, [getTranslation]);

  /**
   * Hàm cập nhật dữ liệu dịch (dành cho admin)
   * @param {string} key - Key cần cập nhật
   * @param {string} value - Giá trị mới
   * @param {string} [targetLanguage] - Ngôn ngữ cần cập nhật (mặc định là ngôn ngữ hiện tại)
   * @returns {Promise<boolean>} Kết quả cập nhật
   */
  const updateTranslationValue = useMemo(() => {
    return async (key, value, targetLanguage) => {
      return await updateTranslation(key, value, targetLanguage);
    };
  }, [updateTranslation]);

  return { 
    t, 
    language, 
    changeLanguage, 
    isLoading, 
    error,
    updateTranslation: updateTranslationValue
  };
};

export default useTranslation; 