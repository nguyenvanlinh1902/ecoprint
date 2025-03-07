import React, { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';

// Khởi tạo context
const LanguageContext = createContext();

// Danh sách ngôn ngữ hỗ trợ
export const LANGUAGES = {
  VI: 'vi',
  EN: 'en'
};

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

  // Giá trị context
  const value = {
    language,
    changeLanguage,
    isVietnamese: language === LANGUAGES.VI,
    isEnglish: language === LANGUAGES.EN
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