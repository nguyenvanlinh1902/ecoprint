import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import cmsService from '../../../services/cmsService';
import vi from '../i18n/vi';
import en from '../i18n/en';

// Danh sách ngôn ngữ hỗ trợ
export const LANGUAGES = {
  VI: 'vi',
  EN: 'en'
};

// Tạo context cho ngôn ngữ
const LanguageContext = createContext();

// Custom hook để sử dụng language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Provider component
export const LanguageProvider = ({ children }) => {
  // Lấy ngôn ngữ từ localStorage hoặc mặc định là tiếng Việt
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('b2b_language');
    return savedLanguage || LANGUAGES.VI;
  });

  // Lưu trữ dữ liệu dịch cho mỗi ngôn ngữ, khởi tạo với dữ liệu tĩnh
  const [translations, setTranslations] = useState({
    [LANGUAGES.VI]: vi,
    [LANGUAGES.EN]: en
  });

  // Trạng thái tải dữ liệu từ CMS
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy dữ liệu dịch từ CMS khi khởi động
  useEffect(() => {
    const fetchTranslations = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Tải dữ liệu dịch cho tất cả các ngôn ngữ được hỗ trợ
        const results = {};
        for (const lang of Object.values(LANGUAGES)) {
          try {
            const cmsTranslations = await cmsService.getAllTranslations(lang);
            // Gộp dữ liệu từ CMS với dữ liệu tĩnh có sẵn (CMS ưu tiên)
            results[lang] = {
              ...translations[lang],
              ...cmsTranslations
            };
          } catch (err) {
            console.warn(`Không thể tải dữ liệu dịch từ CMS cho ngôn ngữ ${lang}. Sử dụng dữ liệu tĩnh.`);
          }
        }
        
        // Cập nhật state với dữ liệu mới
        setTranslations(prevTranslations => ({
          ...prevTranslations,
          ...results
        }));
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu dịch từ CMS:', err);
        setError('Không thể tải dữ liệu dịch từ CMS. Đang sử dụng dữ liệu tĩnh.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTranslations();
  }, []); // chỉ chạy một lần khi khởi động

  // Lưu ngôn ngữ vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('b2b_language', language);
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  // Hàm thay đổi ngôn ngữ
  const changeLanguage = (lang) => {
    if (Object.values(LANGUAGES).includes(lang)) {
      setLanguage(lang);
    }
  };

  // Hàm lấy giá trị dịch từ translations theo key
  const getTranslation = (key, params = {}) => {
    // Phân tích key thành các phần (ví dụ: 'auth.login' -> ['auth', 'login'])
    const keys = key.split('.');
    
    // Lấy giá trị từ đối tượng dịch của ngôn ngữ hiện tại
    let value = translations[language];
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }

    // Thay thế các tham số trong chuỗi dịch
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return Object.entries(params).reduce((str, [paramKey, paramValue]) => {
        return str.replace(new RegExp(`{${paramKey}}`, 'g'), paramValue);
      }, value);
    }

    return value;
  };

  // Hàm cập nhật giá trị dịch (cho admin/editor)
  const updateTranslation = async (key, value, targetLanguage = language) => {
    try {
      // Xác định namespace từ key (phần đầu tiên của key)
      const [namespace, ...rest] = key.split('.');
      const actualKey = rest.join('.');

      // Cập nhật dữ liệu dịch lên CMS
      await cmsService.updateTranslation(targetLanguage, namespace, actualKey, value);

      // Cập nhật state local
      setTranslations(prevTranslations => {
        const currentLangTranslations = { ...prevTranslations[targetLanguage] };
        
        // Tìm và cập nhật giá trị trong đối tượng dịch
        let target = currentLangTranslations;
        const parts = key.split('.');
        const lastKey = parts.pop();
        
        for (const part of parts) {
          if (!target[part]) target[part] = {};
          target = target[part];
        }
        
        target[lastKey] = value;
        
        return {
          ...prevTranslations,
          [targetLanguage]: currentLangTranslations
        };
      });

      return true;
    } catch (error) {
      console.error('Failed to update translation:', error);
      throw error;
    }
  };

  // Giá trị context
  const value = {
    language,
    changeLanguage,
    isVietnamese: language === LANGUAGES.VI,
    isEnglish: language === LANGUAGES.EN,
    translations,
    getTranslation,
    updateTranslation,
    isLoading,
    error
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

LanguageProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default LanguageContext; 