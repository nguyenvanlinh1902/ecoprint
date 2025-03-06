import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useTranslation } from '../hooks';
import '../styles/language-switcher.scss';

/**
 * Component cho phép người dùng chuyển đổi ngôn ngữ và hiển thị trạng thái tải CMS
 * @returns {JSX.Element} Language switcher component
 */
const LanguageSwitcher = () => {
  const { t, language, changeLanguage, isLoading, error } = useTranslation();
  
  const handleLanguageChange = (e) => {
    changeLanguage(e.target.value);
  };
  
  return (
    <div className="language-switcher">
      {isLoading && (
        <span className="language-switcher__loading" title={t('common.loading')}>
          <FaSpinner className="spinner" />
        </span>
      )}
      
      {error && (
        <span className="language-switcher__error" title={error}>
          ⚠️
        </span>
      )}
      
      <select 
        value={language} 
        onChange={handleLanguageChange}
        className="language-select"
        aria-label={t('common.language')}
        disabled={isLoading}
      >
        <option value="vi">
          🇻🇳 {t('common.vietnamese')}
        </option>
        <option value="en">
          🇬🇧 {t('common.english')}
        </option>
      </select>
    </div>
  );
};

export default LanguageSwitcher; 